import { useEffect, useState } from "react";
import { Badge, Card, Typography, Spin, Tag } from "antd";
import { GoogleMap, useJsApiLoader, TrafficLayer, OverlayView } from "@react-google-maps/api";
import { useTokens, useThemeStore } from "@/store/themeStore";
import { apiClient } from "@/api/client";
import { useTenantStore } from "@/store/tenantStore";
import { usePttStore } from "@/store/pttStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

interface LiveMapProps {
  onEmergencyChange?: (hasEmergency: boolean) => void;
}

interface PersonnelLocation {
  user_id: number;
  nama: string;
  role: string;
  latitude: number;
  longitude: number;
  personnel_status: string;
}

// Google Maps Dark Theme array
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const createAnimatedIcon = (color: string, type: 'fire' | 'rescue' | 'station' | 'personnel', isActive: boolean) => {
  const shadowAnim = isActive ? `animation: pulse 1.5s infinite;` : '';
  const bgColor = isActive ? color : '#9CA3AF'; // Gray if completed

  const emojiMap: Record<string, string> = {
    fire: '🔥',
    rescue: '🚑',
    station: '🏢',
    personnel: '👤',
  };

  return (
    <div style={{
      backgroundColor: bgColor,
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: `0 0 10px ${bgColor}, 0 0 20px ${bgColor}`,
      border: '2px solid white',
      fontSize: 16,
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      cursor: 'pointer',
      ...(isActive ? { animation: 'pulse 1.5s infinite' } : {})
    }}>
      {emojiMap[type] ?? '📍'}
    </div>
  );
};

export default function LiveMap({ onEmergencyChange }: LiveMapProps) {
  const tokens = useTokens();
  const { mode } = useThemeStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useTenantStore();
  const [selectedItem, setSelectedItem] = useState<any>(null); // For popup
  
  const [defaultCenter, setDefaultCenter] = useState({ lat: -6.2088, lng: 106.8456 });

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (settings && settings.latitude && settings.longitude) {
      setDefaultCenter({ lat: Number(settings.latitude), lng: Number(settings.longitude) });
    }
  }, [settings]);

  useEffect(() => {
    if (!document.getElementById("live-map-styles")) {
      const style = document.createElement('style');
      style.id = "live-map-styles";
      style.innerHTML = `
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
          70% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 15px rgba(255, 82, 82, 0); }
          100% { transform: translate(-50%, -50%) scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
        }
        .gmap-popup {
          background: white;
          padding: 8px 12px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          position: absolute;
          bottom: 25px;
          left: -100px;
          width: 200px;
          z-index: 100;
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
  }, [onEmergencyChange]);

  
  if (loadError) {
    return (
      <Card className="glass-panel" style={{ height: "100%", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", background: tokens.surface }}>
        <div style={{ color: 'red' }}>Error loading Google Maps: {loadError.message}</div>
      </Card>
    );
  }

  if (loading || !isLoaded) {
    return (
      <Card className="glass-panel" style={{ height: "100%", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", background: tokens.surface }}>
        <Spin tip="Memuat Peta Live..." />
      </Card>
    );
  }

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
        <GoogleMap
          mapContainerStyle={{ height: "100%", width: "100%" }}
          center={defaultCenter}
          zoom={12}
          options={{
            styles: mode === 'dark' ? darkMapStyle : [],
            disableDefaultUI: false,
            mapTypeControl: false,
          }}
          onClick={() => setSelectedItem(null)}
        >
          {/* TRAFFIC LAYER IS HERE! */}
          <TrafficLayer />

          {/* INCIDENTS */}
          {incidents.map((incident) => {
            const isFire = incident.jenis_insiden === 'pemadaman';
            const isActive = (incident.status === 'penanganan' || incident.status === 'berangkat' || incident.status === 'menunggu');
            const pos = { lat: parseFloat(incident.latitude), lng: parseFloat(incident.longitude) };
            
            return (
              <OverlayView
                key={`inc-${incident.id}`}
                position={pos}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'incident', data: incident }); }}>
                  {createAnimatedIcon(isFire ? tokens.danger : tokens.primary, isFire ? 'fire' : 'rescue', isActive)}
                  
                  {selectedItem?.type === 'incident' && selectedItem?.data?.id === incident.id && (
                    <div className="gmap-popup">
                      <h4 style={{ margin: 0, marginBottom: 4, fontWeight: 'bold', color: '#1f2937' }}>{incident.kategori}</h4>
                      <span style={{ fontSize: 12, color: '#4b5563' }}>{incident.alamat}</span><br/>
                      <Badge 
                        status={isActive ? 'processing' : 'success'} 
                        text={<span style={{ color: '#1f2937', fontWeight: 'bold' }}>{incident.status.toUpperCase()}</span>} 
                        style={{ marginTop: 8 }} 
                      />
                    </div>
                  )}
                </div>
              </OverlayView>
            );
          })}

          {/* STATIONS */}
          {stations.map((station) => {
            if (!station.latitude || !station.longitude) return null;
            const pos = { lat: parseFloat(station.latitude), lng: parseFloat(station.longitude) };
            return (
              <OverlayView
                key={`st-${station.id}`}
                position={pos}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'station', data: station }); }}>
                  {createAnimatedIcon(tokens.info, 'station', false)}
                  
                  {selectedItem?.type === 'station' && selectedItem?.data?.id === station.id && (
                    <div className="gmap-popup">
                      <h4 style={{ margin: 0, marginBottom: 4, fontWeight: 'bold', color: '#1f2937' }}>{station.nama}</h4>
                      <Text style={{ fontSize: 12 }}>{station.alamat}</Text><br/>
                      <Badge 
                        status="processing" 
                        text={station.is_relawan_post ? "POSKO RELAWAN" : "MARKAS KOMANDO"} 
                        style={{ marginTop: 8, fontWeight: 'bold' }} 
                      />
                    </div>
                  )}
                </div>
              </OverlayView>
            );
          })}
        </GoogleMap>
      </div>
    </Card>
  );
}
