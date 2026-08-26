import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Badge, Card, Typography, Spin, Tag } from "antd";
import { useTokens, useThemeStore } from "@/store/themeStore";
import { apiClient } from "@/api/client";
import { useTenantStore } from "@/store/tenantStore";
import { usePttStore } from "@/store/pttStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'leaflet/dist/leaflet.css';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface LiveMapProps {
  onEmergencyChange?: (hasEmergency: boolean) => void;
}

interface PersonnelLocation {
  user_id: number;
  nama: string;
  role: string;
  regu?: string | null;
  pleton?: string | null;
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
  speed_kmh: number | null;
  heading: number | null;
  battery_pct: number | null;
  personnel_status: string;
  updated_at: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Custom icons using standard Leaflet DivIcon to allow for CSS animations
const createAnimatedIcon = (color: string, type: 'fire' | 'rescue' | 'station' | 'personnel', isActive: boolean) => {
  const shadowAnim = isActive ? `animation: pulse 1.5s infinite;` : '';
  const bgColor = isActive ? color : '#9CA3AF'; // Gray if completed

  const emojiMap: Record<string, string> = {
    fire: '🔥',
    rescue: '🚑',
    station: '🏢',
    personnel: '👤',
  };

  const iconHtml = `
    <div style="
      background-color: ${bgColor}; 
      width: 32px; 
      height: 32px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white;
      box-shadow: 0 0 10px ${bgColor}, 0 0 20px ${bgColor};
      ${shadowAnim}
      border: 2px solid white;
      font-size: 16px;
    ">
      ${emojiMap[type] ?? '📍'}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: "animated-incident-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const ROLE_LABELS: Record<string, string> = {
  operator_cc: "Operator CC",
  operator_lapangan_damkar: "Op. Lapangan Damkar",
  operator_lapangan_penyelamatan: "Op. Lapangan Penyelamatan",
  operator_sarpras: "Op. Sarpras",
  operator_pencegahan: "Op. Pencegahan",
  teknisi: "Teknisi",
};

const PERSONNEL_STATUS_CONFIG: Record<string, { color: string; label: string; emoji: string }> = {
  standby: { color: '#10B981', label: 'STANDBY', emoji: '✅' },
  berangkat: { color: '#F59E0B', label: 'BERANGKAT', emoji: '🚒' },
  penanganan: { color: '#EF4444', label: 'PENANGANAN', emoji: '🔥' },
};

export default function LiveMap({ onEmergencyChange }: LiveMapProps) {
  const tokens = useTokens();
  const { mode } = useThemeStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useTenantStore();
  const activeSpeakers = usePttStore((state) => state.activeSpeakers);
  
  const [defaultCenter, setDefaultCenter] = useState<[number, number]>([-6.2088, 106.8456]);

  useEffect(() => {
    if (settings && settings.latitude && settings.longitude) {
      setDefaultCenter([settings.latitude, settings.longitude]);
    }
  }, [settings]);

  useEffect(() => {
    // Add keyframes to document if not present
    if (!document.getElementById("live-map-styles")) {
      const style = document.createElement('style');
      style.id = "live-map-styles";
      style.innerHTML = `
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(255, 82, 82, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
        }
      `;
      document.head.appendChild(style);
    }

    const fetchData = async () => {
      try {
        const [res, stationsRes, personnelRes] = await Promise.all([
          apiClient.get("/insiden/").catch(() => ({ data: [] })),
          apiClient.get("/stations").catch(() => ({ data: [] })),
          apiClient.get("/tracking/active").catch(() => ({ data: [] })),
        ]);
        const twentyFourHoursAgo = dayjs().subtract(24, 'hour');
        
        // Filter incidents reported within the last 24 hours with valid coordinates
        const visible = (res.data || []).filter((i: any) => {
          if (!i.latitude || !i.longitude) return false;
          
          const reportTime = i.waktu_lapor || i.created_at;
          if (!reportTime) return false;

          return dayjs(reportTime).isAfter(twentyFourHoursAgo);
        });
        setIncidents(visible);
        
        if (onEmergencyChange) {
          const hasEmergency = visible.some((i: any) => i.status === 'menunggu');
          onEmergencyChange(hasEmergency);
        }

        setStations(stationsRes.data || []);
        setPersonnel(personnelRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="glass-panel" style={{ height: "100%", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", background: tokens.surface }}>
        <Spin tip="Memuat Peta Live..." />
      </Card>
    );
  }

  const center: [number, number] = defaultCenter;

  const mapTileUrl = mode === 'dark'
    ? mode === 'dark' ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <Card 
      className="glass-panel"
      bordered={false} 
      title={<span style={{ fontWeight: 700, color: tokens.textPrimary }}>Live Map Insiden Terkini</span>} 
      extra={
        personnel.length > 0 ? (
          <Tag color="blue" style={{ fontWeight: 600, fontSize: 12 }}>
            👤 {personnel.length} Personil Aktif
          </Tag>
        ) : null
      }
      style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface, padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
    >
      <div style={{ flex: 1, minHeight: 400, width: "100%", zIndex: 0 }}>
        <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <MapUpdater center={center} />
          <TileLayer
            key={mode} // Re-render when theme changes
            url={mapTileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {incidents.map((incident) => {
            const isFire = incident.jenis_insiden === 'pemadaman';
            const isActive = (incident.status === 'penanganan' || incident.status === 'berangkat' || incident.status === 'menunggu');
            const icon = createAnimatedIcon(isFire ? tokens.danger : tokens.primary, isFire ? 'fire' : 'rescue', isActive);
            
            return (
              <Marker 
                key={incident.id} 
                position={[parseFloat(incident.latitude), parseFloat(incident.longitude)]}
                icon={icon}
              >
                <Popup>
                  <div style={{ padding: 4, color: '#1f2937' }}>
                    <h4 style={{ margin: 0, marginBottom: 4, fontWeight: 'bold', color: '#1f2937' }}>{incident.kategori}</h4>
                    <span style={{ fontSize: 12, color: '#4b5563' }}>{incident.alamat}</span><br/>
                    <Badge 
                      status={isActive ? 'processing' : 'success'} 
                      text={<span style={{ color: '#1f2937', fontWeight: 'bold' }}>{incident.status.toUpperCase()}</span>} 
                      style={{ marginTop: 8 }} 
                    />
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {stations.map((station) => {
            if (!station.latitude || !station.longitude) return null;
            const icon = createAnimatedIcon(tokens.info, 'station' as any, false);
            return (
              <Marker 
                key={`station-${station.id}`} 
                position={[parseFloat(station.latitude), parseFloat(station.longitude)]}
                icon={icon}
              >
                <Popup>
                  <div style={{ padding: 4 }}>
                    <h4 style={{ margin: 0, marginBottom: 4, fontWeight: 'bold' }}>{station.nama}</h4>
                    <Text style={{ fontSize: 12 }}>{station.alamat}</Text><br/>
                    <Badge 
                      status="processing" 
                      text={station.is_relawan_post ? "POSKO RELAWAN" : "MARKAS KOMANDO"} 
                      style={{ marginTop: 8, fontWeight: 'bold' }} 
                    />
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {/* --- Personnel Tracking Markers --- */}
          {personnel.map((p) => {
            const statusKey = p.personnel_status || 'standby';
            const statusCfg = PERSONNEL_STATUS_CONFIG[statusKey] ?? PERSONNEL_STATUS_CONFIG.standby;
            
            // Check if personnel is speaking
            const isSpeaking = (activeSpeakers || []).some(s => s.identity === p.user_id.toString() || s.identity === `user-${p.user_id}`);
            const isMarkerActive = statusKey !== 'standby' || isSpeaking;
            const markerColor = isSpeaking ? "#1890ff" : statusCfg.color; // Blue for speaking
            
            const icon = createAnimatedIcon(markerColor, 'personnel', isMarkerActive);
            const roleLabel = ROLE_LABELS[p.role] ?? p.role;
            const lastSeen = p.updated_at ? dayjs(p.updated_at).fromNow() : '-';
            
            return (
              <Marker
                key={`personnel-${p.user_id}`}
                position={[p.latitude, p.longitude]}
                icon={icon}
              >
                <Popup>
                    <div style={{ padding: 6, minWidth: 180, color: '#1f2937' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 20 }}>👤</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{p.nama}</div>
                          <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>{roleLabel}</div>
                          {(p.regu || p.pleton) && (
                            <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>
                              {p.pleton ? p.pleton : ''}{(p.pleton && p.regu) ? ' - ' : ''}{p.regu ? p.regu : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
                      {p.battery_pct != null && (
                        <div>🔋 Baterai: <strong>{p.battery_pct}%</strong></div>
                      )}
                      {p.speed_kmh != null && p.speed_kmh > 0 && (
                        <div>🚗 Kecepatan: <strong>{p.speed_kmh.toFixed(1)} km/h</strong></div>
                      )}
                      {p.accuracy_m != null && (
                        <div>📡 Akurasi GPS: <strong>±{p.accuracy_m.toFixed(0)}m</strong></div>
                      )}
                      <div>🕒 Terakhir update: <strong>{lastSeen}</strong></div>
                    </div>
                    <Badge 
                      status={statusKey === 'standby' ? 'success' : 'processing'} 
                      text={<span style={{ color: statusCfg.color, fontWeight: 'bold', fontSize: 11 }}>{statusCfg.emoji} {statusCfg.label}</span>} 
                      style={{ marginTop: 8 }} 
                    />
                    {isSpeaking && (
                      <Badge 
                        status="processing" 
                        color="#1890ff"
                        text={<span style={{ color: "#1890ff", fontWeight: 'bold', fontSize: 11 }}>🎙️ SEDANG BERBICARA...</span>} 
                        style={{ marginTop: 4, display: "block" }} 
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </Card>
  );
}
