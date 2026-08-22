import json
import logging
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from uuid import UUID
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.insiden import Insiden, JenisInsiden
from app.models.tenant import TenantSettings

logger = logging.getLogger("whatsapp_service")

WITA_TZ = timezone(timedelta(hours=8))


def format_wita_time(dt: Optional[datetime] = None) -> str:
    """Konversi waktu ke format zona waktu WITA (UTC+8)."""
    if dt is None:
        dt = datetime.now(timezone.utc)
    elif dt.tzinfo is None:
        # Default stored timestamps in UTC
        dt = dt.replace(tzinfo=timezone.utc)
    
    dt_wita = dt.astimezone(WITA_TZ)
    return dt_wita.strftime("%d/%m/%Y %H:%M WITA")


def format_incident_message(insiden: Insiden) -> str:
    """
    Format data insiden terverifikasi menjadi teks notifikasi WhatsApp darurat yang terstruktur.
    """
    is_fire = (insiden.jenis_insiden == JenisInsiden.pemadaman) if hasattr(insiden, "jenis_insiden") else True
    jenis_str = "KEBAKARAN (PEMADAMAN)" if is_fire else "PENYELAMATAN (RESCUE)"
    waktu_str = format_wita_time(insiden.waktu_lapor)
    
    maps_link = f"https://maps.google.com/?q={insiden.latitude},{insiden.longitude}" if (insiden.latitude and insiden.longitude) else "-"

    lines = [
        "🚨 *SIAGA DAMKAR - LAPORAN TERVERIFIKASI* 🚨",
        "━━━━━━━━━━━━━━━━━━━━━━",
        f"🔥 *Jenis Insiden* : {jenis_str}",
        f"🏷️ *Kategori*      : {insiden.kategori or '-'}",
        f"🏢 *Objek Kejadian* : {insiden.objek or '-'}",
        f"📍 *Alamat Lokasi* : {insiden.alamat or '-'}",
        f"🗺️ *Titik Peta*    : {maps_link}",
        f"⏰ *Waktu Laporan* : {waktu_str}",
        "",
        "👤 *Data Pelapor (Sesuai KTP)*:",
        f"• *Nama*   : {insiden.pelapor_nama or '-'}",
        f"• *Kontak* : {insiden.pelapor_kontak or '-'}",
        f"• *Alamat* : {insiden.pelapor_alamat or '-'}",
        "",
        "⚠️ *Status Operasional*: *TERVERIFIKASI & SIAP DISPATCH ARMADA*",
        "━━━━━━━━━━━━━━━━━━━━━━",
        "_Sistem Informasi Manajemen Armada (PYROFAR)_"
    ]
    return "\n".join(lines)


def get_whatsapp_config(db: Optional[Session] = None, tenant_id: Optional[UUID] = None) -> Dict[str, Any]:
    """
    Mengambil konfigurasi WhatsApp dari Database TenantSettings, atau fallback ke .env/Settings.
    """
    config = {
        "enabled": settings.wa_enabled,
        "provider": settings.wa_provider or "fonnte",
        "api_token": settings.wa_api_token or "",
        "api_url": settings.wa_api_url or "https://api.fonnte.com/send",
        "siaga_target": settings.wa_siaga_target or "",
        "instance_name": settings.wa_instance_name or "sim-armada",
    }

    if db and tenant_id:
        try:
            ts = db.query(TenantSettings).filter(TenantSettings.tenant_id == tenant_id).first()
            if ts:
                if ts.wa_enabled is not None:
                    config["enabled"] = ts.wa_enabled
                if ts.wa_provider:
                    config["provider"] = ts.wa_provider
                if ts.wa_api_token:
                    config["api_token"] = ts.wa_api_token
                if ts.wa_api_url:
                    config["api_url"] = ts.wa_api_url
                if ts.wa_siaga_target:
                    config["siaga_target"] = ts.wa_siaga_target
                if ts.wa_instance_name:
                    config["instance_name"] = ts.wa_instance_name
        except Exception as e:
            logger.warning(f"[WhatsApp] Gagal membaca TenantSettings dari DB: {e}")

    return config


def clean_target_recipient(t: str) -> str:
    """
    Bersihkan format target nomor atau grup WhatsApp.
    """
    t = t.strip()
    if "@g.us" in t or "@s.whatsapp.net" in t:
        return t
    
    cleaned = "".join(c for c in t if c.isdigit() or c == "+")
    if cleaned.startswith("+"):
        cleaned = cleaned[1:]
    return cleaned


def translate_gateway_reason(reason: str) -> str:
    """
    Menerjemahkan pesan error umum dari Fonnte / Gateway ke bahasa yang mudah dipahami operator.
    """
    r_lower = (reason or "").lower()
    if "device disconnected" in r_lower or "device not connected" in r_lower or "device not ready" in r_lower:
        return "Device WhatsApp di Fonnte tidak terhubung (Status Disconnected). Silakan buka fonnte.com dan scan ulang QR Code WhatsApp pada perangkat Anda."
    if "invalid token" in r_lower or "token not found" in r_lower or "unauthorized" in r_lower or "device not found" in r_lower:
        return "API Token tidak valid atau salah. Silakan pastikan Anda menyalin Device Token dari tombol hitam [Token] di tabel Devices Fonnte."
    if "target not registered" in r_lower or "number not registered" in r_lower:
        return "Nomor target tidak terdaftar di WhatsApp."
    if "country code" in r_lower:
        return "Format nomor negara tidak sesuai (gunakan format 08... atau 628...)."
    if "quota" in r_lower or "limit" in r_lower or "balance" in r_lower:
        return "Kuota pesan pada akun WhatsApp Gateway Anda sudah habis atau mencapai limit harian."
    return reason


def resolve_fonnte_device_token(token: str) -> str:
    """
    Jika user memasukkan Account Token (bukan Device Token), kita bantu otomatis
    mengambil Device Token dari device aktif di Fonnte.
    """
    if not token or len(token) <= 25:
        return token
    try:
        with httpx.Client(timeout=6.0) as client:
            r = client.post('https://api.fonnte.com/get-devices', headers={'Authorization': token})
            if r.status_code == 200:
                res_json = r.json()
                if res_json.get("status") and res_json.get("data"):
                    devices = res_json["data"]
                    # Prioritaskan device yang statusnya connect
                    for d in devices:
                        if d.get("status") == "connect" and d.get("token"):
                            logger.info(f"[WhatsApp] Berhasil mendeteksi device token Fonnte dari akun: {d.get('name')}")
                            return d.get("token")
                    # Fallback ke token device pertama
                    if devices[0].get("token"):
                        return devices[0].get("token")
    except Exception as e:
        logger.warning(f"[WhatsApp] Gagal auto-resolve device token dari account token: {e}")
    return token


def send_single_target(
    target_raw: str,
    message: str,
    provider: str,
    token: str,
    url: str,
    instance_name: str = "sim-armada"
) -> Dict[str, Any]:
    """
    Kirim ke 1 nomor/grup WA spesifik dengan httpx dan validasi respon mendalam.
    """
    target_clean = clean_target_recipient(target_raw)
    if not target_clean:
        return {"status": False, "target": target_raw, "message": "Target nomor / ID grup kosong"}

    token_clean = (token or "").strip()
    if not token_clean:
        return {"status": False, "target": target_clean, "message": "API Token belum diisi di Pengaturan"}

    prov = (provider or "fonnte").lower().strip()

    try:
        with httpx.Client(timeout=15.0, follow_redirects=True) as client:
            if prov == "fonnte":
                post_url = url or "https://api.fonnte.com/send"
                # Auto-resolve jika user memasukkan Account Token
                active_token = resolve_fonnte_device_token(token_clean)

                headers = {
                    "Authorization": active_token,
                }
                data = {
                    "target": target_clean,
                    "message": message,
                    "countryCode": "62",
                }
                response = client.post(post_url, data=data, headers=headers)

            elif prov == "evolution":
                inst = instance_name or "sim-armada"
                base_url = (url or "http://localhost:8080").rstrip("/")
                post_url = f"{base_url}/message/sendText/{inst}"
                headers = {
                    "apikey": token_clean,
                }
                json_payload = {
                    "number": target_clean,
                    "text": message
                }
                response = client.post(post_url, json=json_payload, headers=headers)

            else:
                # Generic webhook
                post_url = url or "http://localhost:8080/webhook"
                headers = {
                    "Authorization": f"Bearer {token_clean}" if token_clean else "",
                }
                json_payload = {
                    "target": target_clean,
                    "message": message,
                    "timestamp": datetime.utcnow().isoformat()
                }
                response = client.post(post_url, json=json_payload, headers=headers)

            try:
                resp_json = response.json()
            except Exception:
                resp_json = None

            # Pemeriksaan status payload Fonnte / Gateway
            if isinstance(resp_json, dict):
                # Kasus 1: Gateway merespon status=false
                if resp_json.get("status") is False:
                    raw_reason = resp_json.get("reason") or resp_json.get("message") or resp_json.get("detail") or "Gateway menolak pengiriman pesan"
                    friendly_reason = translate_gateway_reason(raw_reason)
                    logger.warning(f"[WhatsApp] Gateway {prov} merespon gagal untuk target {target_clean}: {raw_reason}")
                    return {
                        "status": False,
                        "target": target_clean,
                        "message": friendly_reason,
                        "raw_reason": raw_reason,
                        "response": resp_json
                    }
                
                # Kasus 2: Gateway merespon status=true
                if resp_json.get("status") is True:
                    return {
                        "status": True,
                        "target": target_clean,
                        "message": "Pesan berhasil dikirim",
                        "response": resp_json
                    }

            if response.status_code >= 400:
                friendly_reason = translate_gateway_reason(response.text)
                return {
                    "status": False,
                    "target": target_clean,
                    "message": f"HTTP {response.status_code}: {friendly_reason}",
                    "response": response.text
                }

            return {"status": True, "target": target_clean, "message": "Pesan terkirim ke gateway", "response": response.text}

    except httpx.TimeoutException:
        logger.error(f"[WhatsApp] Timeout connecting to {prov}")
        return {
            "status": False,
            "target": target_clean,
            "message": "Koneksi ke gateway WhatsApp timeout (melebihi batas waktu 15 detik)"
        }
    except Exception as e:
        logger.error(f"[WhatsApp] Exception saat kirim ke {target_clean}: {e}")
        return {
            "status": False,
            "target": target_clean,
            "message": f"Terjadi kesalahan koneksi: {str(e)}"
        }


def send_whatsapp_message(
    target: str,
    message: str,
    db: Optional[Session] = None,
    tenant_id: Optional[UUID] = None,
    config_override: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Mengirim pesan WhatsApp (mendukung target multiple dipisah koma/baris baru).
    """
    cfg = get_whatsapp_config(db=db, tenant_id=tenant_id)
    if config_override:
        cfg.update(config_override)

    if not cfg.get("enabled"):
        logger.info("[WhatsApp] Pengiriman dinonaktifkan di pengaturan")
        return {"status": False, "message": "WhatsApp gateway dinonaktifkan di pengaturan"}

    target_str = target or cfg.get("siaga_target") or ""
    if not target_str.strip():
        logger.warning("[WhatsApp] Target nomor/grup WA belum disetel di pengaturan")
        return {"status": False, "message": "Target nomor / ID grup WhatsApp belum diatur"}

    # Pisahkan target jika ada beberapa (koma atau baris baru)
    raw_targets = [t.strip() for t in target_str.replace("\n", ",").split(",") if t.strip()]
    if not raw_targets:
        return {"status": False, "message": "Tidak ada target penerima yang valid"}

    results = []
    success_count = 0
    failure_messages = []

    for t in raw_targets:
        res = send_single_target(
            target_raw=t,
            message=message,
            provider=cfg.get("provider", "fonnte"),
            token=cfg.get("api_token", ""),
            url=cfg.get("api_url", "https://api.fonnte.com/send"),
            instance_name=cfg.get("instance_name", "sim-armada")
        )
        results.append(res)
        if res.get("status"):
            success_count += 1
        else:
            failure_messages.append(f"{t}: {res.get('message')}")

    is_overall_success = success_count > 0
    overall_message = (
        f"Berhasil terkirim ke {success_count}/{len(raw_targets)} target"
        if is_overall_success
        else ("; ".join(failure_messages) if failure_messages else "Gagal mengirim pesan WhatsApp")
    )

    return {
        "status": is_overall_success,
        "success_count": success_count,
        "total_targets": len(raw_targets),
        "message": overall_message,
        "results": results
    }


def notify_incident_verified(
    insiden: Insiden,
    db: Optional[Session] = None,
    target_override: Optional[str] = None
) -> Dict[str, Any]:
    """
    Kirim notifikasi otomatis ke Grup WhatsApp Siaga saat insiden diverifikasi.
    """
    message = format_incident_message(insiden)
    return send_whatsapp_message(
        target=target_override or "",
        message=message,
        db=db,
        tenant_id=insiden.tenant_id
    )
