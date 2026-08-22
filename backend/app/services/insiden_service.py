from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
import logging
from typing import Optional, Any
from fastapi import HTTPException, status
from app.models.insiden import Insiden, StatusInsiden
from app.models.armada import Armada, StatusArmada
from app.models.unit_organisasi import Regu
from app.schemas.insiden import InsidenCreate, InsidenUpdate, DispatchReguRequest
from app.services import whatsapp_service, notifikasi_service
from app.models.user import UserRole

logger = logging.getLogger("insiden_service")

def dispatch_regu(db: Session, tenant_id: UUID, insiden_id: UUID, req: DispatchReguRequest) -> Insiden:
    insiden = get_insiden(db, tenant_id, insiden_id)
    
    for regu_id in req.regu_ids:
        regu = db.query(Regu).filter(Regu.id == regu_id, Regu.tenant_id == tenant_id).first()
        if regu and regu not in insiden.regus:
            insiden.regus.append(regu)
    
    # Update status insiden if it's currently "menunggu"
    if insiden.status == StatusInsiden.menunggu:
        insiden.status = StatusInsiden.berangkat
        insiden.waktu_berangkat = datetime.utcnow()
        
        # Kirim notifikasi ke operator lapangan bahwa regu mereka di-dispatch
        for role in [UserRole.operator_lapangan_damkar, UserRole.operator_lapangan_penyelamatan]:
            notifikasi_service.notify_users_by_role(
                db=db,
                role=role,
                jenis="info",
                pesan=f"Insiden baru ({insiden.jenis_insiden}) telah di-dispatch! Segera meluncur ke lokasi.",
                tenant_id=tenant_id
            )
        
    db.commit()
    db.refresh(insiden)
    return insiden

def get_insiden(db: Session, tenant_id: UUID, insiden_id: UUID) -> Insiden:
    insiden = db.query(Insiden).filter(
        Insiden.id == insiden_id,
        Insiden.tenant_id == tenant_id
    ).first()
    if not insiden:
        raise HTTPException(status_code=404, detail="Insiden not found")
    return insiden

def list_insiden(db: Session, tenant_id: UUID, user: Optional[Any] = None, skip: int = 0, limit: int = 100):
    query = db.query(Insiden).filter(Insiden.tenant_id == tenant_id)
    
    if user and user.role in ["operator_lapangan_damkar", "operator_lapangan_penyelamatan"]:
        from app.models.insiden import JenisInsiden
        jenis_target = JenisInsiden.pemadaman if user.role == "operator_lapangan_damkar" else JenisInsiden.penyelamatan
        
        if user.personil and user.personil.regu_id:
            from sqlalchemy import or_
            query = query.filter(
                Insiden.jenis_insiden == jenis_target,
                or_(
                    ~Insiden.regus.any(),
                    Insiden.regus.any(id=user.personil.regu_id)
                )
            )
        else:
            # Operator doesn't have a regu assigned, return none
            return []
            
    return query.order_by(Insiden.waktu_lapor.desc()).offset(skip).limit(limit).all()

def create_insiden(db: Session, tenant_id: UUID, insiden_in: InsidenCreate) -> Insiden:
    db_insiden = Insiden(
        tenant_id=tenant_id,
        jenis_insiden=insiden_in.jenis_insiden,
        kategori=insiden_in.kategori,
        objek=insiden_in.objek,
        alamat=insiden_in.alamat,
        pelapor_nama=insiden_in.pelapor_nama,
        pelapor_kontak=insiden_in.pelapor_kontak,
        pelapor_alamat=insiden_in.pelapor_alamat,
        status=insiden_in.status,
        latitude=insiden_in.latitude,
        longitude=insiden_in.longitude,
        is_verified=insiden_in.is_verified
    )
    if insiden_in.waktu_lapor:
        db_insiden.waktu_lapor = insiden_in.waktu_lapor
    db.add(db_insiden)
    
    if insiden_in.armada_ids:
        for armada_id in insiden_in.armada_ids:
            armada = db.query(Armada).filter(
                Armada.id == armada_id,
                Armada.tenant_id == tenant_id,
                Armada.is_deleted == False
            ).first()
            if armada:
                db_insiden.armadas.append(armada)
                if insiden_in.status in [StatusInsiden.berangkat, StatusInsiden.penanganan]:
                    armada.status = StatusArmada.bertugas
    
    db.commit()
    db.refresh(db_insiden)

    # Kirim notifikasi WA jika laporan langsung terverifikasi saat dibuat
    if db_insiden.is_verified:
        try:
            res = whatsapp_service.notify_incident_verified(db_insiden, db=db)
            logger.info(f"[InsidenService] WhatsApp broadcast on create result: {res}")
            
            # Kirim notifikasi internal (web/mobile)
            for role in [UserRole.operator_lapangan_damkar, UserRole.operator_lapangan_penyelamatan]:
                notifikasi_service.notify_users_by_role(
                    db=db, role=role, jenis="info", pesan=f"Insiden baru terverifikasi: {db_insiden.jenis_insiden}", tenant_id=tenant_id
                )
        except Exception as e:
            logger.error(f"[InsidenService] Gagal broadcast WA on create: {e}", exc_info=True)

    return db_insiden

def update_insiden(db: Session, tenant_id: UUID, insiden_id: UUID, insiden_in: InsidenUpdate, user: Optional[Any] = None) -> Insiden:
    db_insiden = get_insiden(db, tenant_id, insiden_id)
    previously_verified = db_insiden.is_verified
    
    # Auto assign regu if a field operator interacts with the incident
    if user and user.role in ["operator_lapangan_damkar", "operator_lapangan_penyelamatan"]:
        if user.personil and user.personil.regu_id:
            regu = db.query(Regu).filter(Regu.id == user.personil.regu_id, Regu.tenant_id == tenant_id).first()
            if regu and regu not in db_insiden.regus:
                db_insiden.regus.append(regu)
                
    if insiden_in.status:
        db_insiden.status = insiden_in.status
        if insiden_in.status in [StatusInsiden.selesai, StatusInsiden.batal]:
            for armada in db_insiden.armadas:
                armada.status_armada = StatusArmada.standby
        if insiden_in.status == StatusInsiden.berangkat:
            for role in [UserRole.operator_lapangan_damkar, UserRole.operator_lapangan_penyelamatan]:
                notifikasi_service.notify_users_by_role(
                    db=db, role=role, jenis="info", pesan=f"Armada diinstruksikan berangkat untuk insiden: {db_insiden.jenis_insiden}", tenant_id=tenant_id
                )
                
    if insiden_in.waktu_berangkat:
        db_insiden.waktu_berangkat = insiden_in.waktu_berangkat
    if insiden_in.waktu_tiba:
        db_insiden.waktu_tiba = insiden_in.waktu_tiba
    if insiden_in.waktu_selesai:
        db_insiden.waktu_selesai = insiden_in.waktu_selesai
    if insiden_in.jumlah_terdampak is not None:
        db_insiden.jumlah_terdampak = insiden_in.jumlah_terdampak
    if insiden_in.is_verified is not None:
        db_insiden.is_verified = insiden_in.is_verified
        
    db.commit()
    db.refresh(db_insiden)

    # Kirim notifikasi WA saat status verifikasi berubah dari False/None menjadi True
    if not previously_verified and db_insiden.is_verified:
        try:
            res = whatsapp_service.notify_incident_verified(db_insiden, db=db)
            logger.info(f"[InsidenService] WhatsApp broadcast on verify result: {res}")
            
            # Kirim notifikasi internal (web/mobile)
            for role in [UserRole.operator_lapangan_damkar, UserRole.operator_lapangan_penyelamatan]:
                notifikasi_service.notify_users_by_role(
                    db=db, role=role, jenis="info", pesan=f"Insiden baru terverifikasi: {db_insiden.jenis_insiden}", tenant_id=tenant_id
                )
        except Exception as e:
            logger.error(f"[InsidenService] Gagal broadcast WA on verify: {e}", exc_info=True)

    return db_insiden

def delete_insiden(db: Session, tenant_id: UUID, insiden_id: UUID) -> bool:
    db_insiden = get_insiden(db, tenant_id, insiden_id)
    db.delete(db_insiden)
    db.commit()
    return True
