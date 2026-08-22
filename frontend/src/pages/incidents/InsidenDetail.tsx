import { Card, Col, Row, Steps, Typography, Tag, Button, Timeline, List, Avatar, Space, Tabs, Input, message, Spin, Badge, Modal, InputNumber } from "antd";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTokens, useThemeStore } from "@/store/themeStore";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CarOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  PaperClipOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WhatsAppOutlined
} from "@ant-design/icons";
import { apiClient } from "@/api/client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTenantStore } from "@/store/tenantStore";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const { Title, Text } = Typography;
const { TextArea } = Input;

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function InsidenDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tokens = useTokens();
  const { mode } = useThemeStore();
  const { settings } = useTenantStore();
  
  const defaultCenter = (settings?.latitude && settings?.longitude) 
    ? [settings.latitude, settings.longitude] as [number, number]
    : [-5.147665, 119.432731] as [number, number];

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [jumlahTerdampak, setJumlahTerdampak] = useState<number>(0);
  const [luasAreal, setLuasAreal] = useState<number | null>(null);
  const [korbanMeninggal, setKorbanMeninggal] = useState<number | null>(null);
  const [korbanLuka, setKorbanLuka] = useState<number | null>(null);
  const [korbanKk, setKorbanKk] = useState<number | null>(null);
  const [taksiranKerugian, setTaksiranKerugian] = useState<number | null>(null);
  const isPenyelamatan = location.pathname.startsWith("/penyelamatan") || location.pathname.startsWith("/rescue");

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/insiden/${id}`);
      setIncident(res.data);
    } catch (e) {
      console.error(e);
      message.error("Gagal memuat detail insiden");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);



  const updateStatus = async (newStatus: string, params?: { 
    jumlah_terdampak?: number;
    luas_areal?: number | null;
    korban_meninggal?: number | null;
    korban_luka?: number | null;
    korban_kk?: number | null;
    taksiran_kerugian?: number | null;
  }) => {
    try {
      const payload: any = { status: newStatus };
      if (newStatus === "berangkat") payload.waktu_berangkat = new Date().toISOString();
      if (newStatus === "penanganan") payload.waktu_tiba = new Date().toISOString();
      if (newStatus === "selesai") {
        payload.waktu_selesai = new Date().toISOString();
      }
      if (params) {
        Object.assign(payload, params);
      }
      
      await apiClient.patch(`/insiden/${id}`, payload);
      message.success(`Status insiden diperbarui menjadi ${newStatus.toUpperCase()}`);
      fetchDetail();
    } catch (e) {
      console.error(e);
      message.error("Gagal memperbarui status");
    } finally {
      setResolveModalVisible(false);
    }
  };

  const shareToWhatsApp = () => {
    if (!incident) return;
    const jenisStr = incident.jenis_insiden === 'penyelamatan' ? 'PENYELAMATAN (RESCUE)' : 'KEBAKARAN';
    const mapsLink = (incident.latitude && incident.longitude) ? `https://maps.google.com/?q=${incident.latitude},${incident.longitude}` : '-';
    const text = `🚨 *SIAGA DAMKAR - LAPORAN INSIDEN* 🚨\n━━━━━━━━━━━━━━━━━━━━━━\n🔥 *Jenis Insiden* : ${jenisStr}\n🏷️ *Kategori*      : ${incident.kategori || '-'}\n🏢 *Objek Kejadian* : ${incident.objek || '-'}\n📍 *Alamat Lokasi* : ${incident.alamat || '-'}\n🗺️ *Titik Peta*    : ${mapsLink}\n\n👤 *Data Pelapor (Sesuai KTP)*:\n• *Nama*   : ${incident.pelapor_nama || '-'}\n• *Kontak* : ${incident.pelapor_kontak || '-'}\n• *Alamat* : ${incident.pelapor_alamat || '-'}\n\n⚠️ *Status*: *${(incident.status || 'TERVERIFIKASI').toUpperCase()}*\n━━━━━━━━━━━━━━━━━━━━━━\n_Sistem Informasi Manajemen Armada (PYROFAR)_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const verifyIncident = async () => {
    try {
      const payload: any = { is_verified: true };
      await apiClient.patch(`/insiden/${id}`, payload);
      message.success(`Insiden berhasil diverifikasi! Notifikasi WhatsApp telah diteruskan ke grup siaga.`);
      fetchDetail();
    } catch (e) {
      console.error(e);
      message.error("Gagal memverifikasi laporan");
    }
  };

  const handleResolveClick = () => {
    if (!isPenyelamatan) {
      setResolveModalVisible(true);
    } else {
      updateStatus("selesai");
    }
  };

  if (loading || !incident) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  let currentStep = 0;
  if (incident.status === "menunggu") currentStep = 2; // Waiting for DISPATCH
  else if (incident.status === "berangkat") currentStep = 4; // Waiting for ARRIVED
  else if (incident.status === "penanganan") currentStep = 6; // Waiting for CONTROLLED / CLOSED
  else if (incident.status === "selesai") currentStep = 8; // Done
  else if (incident.status === "batal") currentStep = 8; // Done but cancelled

  const timelineEvents = [];
  if (incident.waktu_lapor) timelineEvents.push({ title: "Laporan Diterima", time: new Date(incident.waktu_lapor).toLocaleString(), type: "success" });
  if (incident.waktu_berangkat) timelineEvents.push({ title: "Unit Diberangkatkan (Dispatch)", time: new Date(incident.waktu_berangkat).toLocaleString(), type: "primary" });
  if (incident.waktu_tiba) timelineEvents.push({ title: "Tiba di Lokasi (Penanganan)", time: new Date(incident.waktu_tiba).toLocaleString(), type: "primary" });
  if (incident.waktu_selesai) timelineEvents.push({ title: "Insiden Selesai", time: new Date(incident.waktu_selesai).toLocaleString(), type: "success" });
  if (incident.status === "batal") timelineEvents.push({ title: "Insiden Dibatalkan", time: new Date(incident.updated_at).toLocaleString(), type: "gray" });

  const assignedVehicles = incident.armadas || [];
  // For now, personnel and victims are mock or empty since backend doesn't have it explicitly yet
  const assignedPersonnel: any[] = [];
  const victims: any[] = [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(isPenyelamatan ? "/rescue" : "/incidents")} type="text" style={{ color: tokens.textPrimary }} />
        <div>
          <Title level={4} style={{ margin: 0, color: tokens.textPrimary }}>Detail Insiden: {incident.id}</Title>
          <Text style={{ color: tokens.textMuted }}>{new Date(incident.waktu_lapor).toLocaleString()} • {incident.alamat}</Text>
        </div>
      </div>

      {/* Workflow Stepper */}
      <Card bordered={false} className="glass-panel hover-lift" style={{ border: `1px solid ${tokens.border}`, padding: '16px 24px' }} bodyStyle={{ padding: 0 }}>
        <Steps
          current={currentStep}
          size="small"
          status={incident.status === "batal" ? "error" : "process"}
          items={isPenyelamatan ? [
            { title: "REPORT" },
            { title: "ASSESSMENT" },
            { title: "DISPATCH" },
            { title: "EN ROUTE" },
            { title: "ON SCENE" },
            { title: "RESCUE" },
            { title: "EVACUATED/SAFE" },
            { title: "CLOSED" }
          ] : [
            { title: "REPORT" },
            { title: "VERIFY" },
            { title: "DISPATCH" },
            { title: "EN ROUTE" },
            { title: "ARRIVED" },
            { title: "RESPONSE" },
            { title: "CONTROLLED" },
            { title: "CLOSED" }
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        {/* Left Column: Map & Details */}
        <Col xs={24} lg={8}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
            <Card bordered={false} className="glass-panel" bodyStyle={{ padding: 0, height: 250, overflow: 'hidden', borderRadius: 12 }}>
              <MapContainer
                center={incident.latitude && incident.longitude ? [parseFloat(incident.latitude), parseFloat(incident.longitude)] : defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={false}
              >
                <TileLayer
                  url={mode === 'dark'
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                <Marker position={incident.latitude && incident.longitude ? [parseFloat(incident.latitude), parseFloat(incident.longitude)] : defaultCenter}>
                  <Popup>Lokasi Insiden: <br/> {incident.alamat}</Popup>
                </Marker>
                <MapResizer />
              </MapContainer>
            </Card>

            <Card title="Informasi Laporan" bordered={false} className="glass-panel hover-lift">
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Jenis Insiden / Kategori</Text><br/>
                  <Text strong style={{ color: tokens.textPrimary, display: "flex", alignItems: "center", gap: 8 }}>
                    <FireOutlined style={{ color: tokens.danger }} /> {incident.jenis_insiden.toUpperCase()} - {incident.kategori}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Objek</Text><br/>
                  <Text style={{ color: tokens.textPrimary }}>{incident.objek}</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Alamat Lengkap</Text><br/>
                  <Text style={{ color: tokens.textPrimary }}>{incident.alamat}</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Pelapor</Text><br/>
                  <Text style={{ color: tokens.textPrimary }}>{incident.pelapor_nama} ({incident.pelapor_kontak})</Text>
                </div>
              </Space>
            </Card>

            {incident.status === 'selesai' && (
              <Card title="Dampak & Kerugian" bordered={false} className="glass-panel hover-lift" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  {incident.jumlah_terdampak !== null && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Rumah/Bangunan Terdampak</Text><br/>
                      <Text style={{ color: tokens.textPrimary }}>{incident.jumlah_terdampak} Unit</Text>
                    </div>
                  )}
                  {incident.luas_areal !== null && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Luas Areal (m²)</Text><br/>
                      <Text style={{ color: tokens.textPrimary }}>{incident.luas_areal} m²</Text>
                    </div>
                  )}
                  {(incident.korban_meninggal !== null || incident.korban_luka !== null || incident.korban_kk !== null) && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Korban Jiwa / Terdampak</Text><br/>
                      <Text style={{ color: tokens.textPrimary }}>
                        {incident.korban_meninggal || 0} Meninggal, {incident.korban_luka || 0} Luka-luka, {incident.korban_kk || 0} KK
                      </Text>
                    </div>
                  )}
                  {incident.taksiran_kerugian !== null && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Taksiran Kerugian (Rp)</Text><br/>
                      <Text style={{ color: tokens.danger, fontWeight: 'bold' }}>Rp {incident.taksiran_kerugian.toLocaleString('id-ID')}</Text>
                    </div>
                  )}
                </Space>
              </Card>
            )}

            <Card title="Attachments" bordered={false} className="glass-panel hover-lift" extra={<Button type="link" size="small" style={{ color: tokens.primary }}><PaperClipOutlined /> Add</Button>}>
              <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                <Text style={{ color: tokens.textMuted }}>Belum ada lampiran.</Text>
              </div>
            </Card>
          </div>
        </Col>

        {/* Middle Column: Assignments & Resources */}
        <Col xs={24} lg={10}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
            <Card
              bordered={false}
              className="glass-panel hover-lift"
              title={<span style={{ color: tokens.textPrimary }}>Resource Dispatch</span>}
              bodyStyle={{ padding: 0 }}
            >
              <Tabs
                defaultActiveKey="1"
                style={{ padding: "0 20px" }}
                items={[
                  {
                    key: "1",
                    label: <span><CarOutlined /> Armada</span>,
                    children: (
                      <List
                        dataSource={assignedVehicles}
                        locale={{ emptyText: "Belum ada armada ditugaskan." }}
                        renderItem={(v: any) => (
                          <List.Item style={{ borderBottom: `1px solid ${tokens.border}`, padding: "12px 0" }}>
                            <List.Item.Meta
                              avatar={<Avatar icon={<CarOutlined />} style={{ background: tokens.primary }} />}
                              title={<span style={{ color: tokens.textPrimary }}>{v.nomor_polisi}</span>}
                              description={<span style={{ color: tokens.textMuted }}>{v.jenis_kendaraan?.nama_jenis}</span>}
                            />
                            <Tag color={tokens.warning} style={{ border: 'none' }}>{v.status}</Tag>
                          </List.Item>
                        )}
                      />
                    )
                  },
                  {
                    key: "2",
                    label: <span><TeamOutlined /> Personel</span>,
                    children: (
                      <List
                        dataSource={assignedPersonnel}
                        locale={{ emptyText: "Belum ada personel ditugaskan." }}
                        renderItem={p => (
                          <List.Item style={{ borderBottom: `1px solid ${tokens.border}`, padding: "12px 0" }}>
                            <List.Item.Meta
                              avatar={<Avatar icon={<UserOutlined />} style={{ background: tokens.surfaceHover, color: tokens.textPrimary }} />}
                              title={<span style={{ color: tokens.textPrimary }}>{p.name}</span>}
                              description={<span style={{ color: tokens.textMuted }}>{p.role} • {p.unit}</span>}
                            />
                          </List.Item>
                        )}
                      />
                    )
                  },
                  {
                    key: "3",
                    label: <span><ToolOutlined /> Peralatan</span>,
                    children: <div style={{ padding: "20px 0", textAlign: "center", color: tokens.textMuted }}>Peralatan melekat pada armada.</div>
                  }
                ]}
              />
            </Card>

            <Card title="Korban / Terdampak" bordered={false} className="glass-panel hover-lift">
               <List
                  dataSource={victims}
                  locale={{ emptyText: "Tidak ada data korban." }}
                  renderItem={v => (
                    <List.Item style={{ borderBottom: `1px solid ${tokens.border}` }}>
                      <List.Item.Meta
                        title={<span style={{ color: tokens.textPrimary }}>{v.name}</span>}
                        description={<span style={{ color: tokens.textMuted }}>{v.location}</span>}
                      />
                      <Tag color={v.status === "Luka Ringan" ? tokens.warning : tokens.danger} style={{ border: 'none' }}>{v.status}</Tag>
                    </List.Item>
                  )}
                />
            </Card>
          </div>
        </Col>

        {/* Right Column: Timeline & Actions */}
        <Col xs={24} lg={6}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>

            <Card bordered={false} className="glass-panel hover-lift" style={{ border: `2px solid ${incident.status === 'menunggu' ? tokens.danger : tokens.border}` }}>
              {incident.status === "menunggu" && incident.is_verified === false && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Badge status="warning" color="orange" text={<Text strong style={{ color: 'orange', fontSize: 18, animation: 'emergencyPulse 2s infinite' }}>MENUNGGU VERIFIKASI</Text>} />
                </div>
              )}
              {incident.status === "menunggu" && incident.is_verified !== false && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Badge status="processing" color="red" text={<Text strong type="danger" style={{ fontSize: 18, animation: 'emergencyPulse 2s infinite' }}>LAPORAN DITERIMA</Text>} />
                </div>
              )}
              {incident.status === "batal" && incident.is_verified === false && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Badge status="default" color={tokens.textMuted} text={<Text strong style={{ color: tokens.textMuted, fontSize: 16 }}>VERIFIKASI DITOLAK (DIBATALKAN)</Text>} />
                </div>
              )}
              {incident.status === "menunggu" && incident.is_verified === false && (
                <>
                  <Button type="primary" block size="large" onClick={verifyIncident} style={{ background: "orange", borderColor: "orange", marginBottom: 12, height: 60, fontSize: 18, fontWeight: 900, whiteSpace: 'normal', lineHeight: '1.2' }}>
                    VERIFIKASI<br/><small style={{fontSize: 12, fontWeight: 'normal'}}>Laporan Valid & Diterima</small>
                  </Button>
                  <Button type="primary" block size="large" onClick={() => updateStatus("batal")} style={{ background: tokens.textMuted, borderColor: tokens.textMuted, marginBottom: 12, height: 60, fontSize: 18, fontWeight: 900, whiteSpace: 'normal', lineHeight: '1.2' }}>
                    TOLAK<br/><small style={{fontSize: 12, fontWeight: 'normal'}}>Laporan Palsu</small>
                  </Button>
                </>
              )}
              {incident.status === "menunggu" && incident.is_verified !== false && (
                <Button type="primary" block size="large" onClick={() => updateStatus("berangkat")} style={{ background: tokens.danger, borderColor: tokens.danger, marginBottom: 12, height: 60, fontSize: 18, fontWeight: 900, whiteSpace: 'normal', lineHeight: '1.2' }}>
                  DISPATCH ARMADA<br/><small style={{fontSize: 12, fontWeight: 'normal'}}>Berangkat ke Lokasi</small>
                </Button>
              )}
              {incident.status === "berangkat" && (
                <Button type="primary" block size="large" onClick={() => updateStatus("penanganan")} style={{ background: tokens.warning, borderColor: tokens.warning, marginBottom: 12, height: 60, fontSize: 18, fontWeight: 900, whiteSpace: 'normal', lineHeight: '1.2' }}>
                  ON SCENE<br/><small style={{fontSize: 12, fontWeight: 'normal'}}>Tiba & Mulai Penanganan</small>
                </Button>
              )}
              {incident.status === "penanganan" && (
                <Button type="primary" block size="large" onClick={handleResolveClick} style={{ background: tokens.success, borderColor: tokens.success, marginBottom: 12, height: 60, fontSize: 18, fontWeight: 900, whiteSpace: 'normal', lineHeight: '1.2' }}>
                  CLOSED<br/><small style={{fontSize: 12, fontWeight: 'normal'}}>Selesai Penanganan</small>
                </Button>
              )}
              {incident.status !== "selesai" && incident.status !== "batal" && (
                <Button block size="large" onClick={() => updateStatus("batal")} style={{ background: "transparent", color: tokens.textMuted, borderColor: tokens.border, marginTop: 12 }}>
                  Batalkan Insiden
                </Button>
              )}
              {incident.status === "selesai" && (
                <Tag color={tokens.success} style={{ width: '100%', textAlign: 'center', padding: '12px 8px', fontSize: 18, fontWeight: 'bold' }}>INSIDEN SELESAI</Tag>
              )}
              {incident.status === "batal" && (
                <Tag color={tokens.danger} style={{ width: '100%', textAlign: 'center', padding: '12px 8px', fontSize: 18, fontWeight: 'bold' }}>INSIDEN DIBATALKAN</Tag>
              )}

              {/* Tombol Bagikan WhatsApp Siaga */}
              <Button
                block
                size="large"
                icon={<WhatsAppOutlined style={{ fontSize: 20 }} />}
                onClick={shareToWhatsApp}
                style={{
                  marginTop: 16,
                  backgroundColor: '#25D366',
                  borderColor: '#25D366',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  height: 48,
                  borderRadius: 8,
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                Bagikan ke WhatsApp
              </Button>
            </Card>

            <Card title="Timeline Operasional" bordered={false} className="glass-panel hover-lift" bodyStyle={{ maxHeight: 400, overflowY: "auto" }}>
              <Timeline
                items={timelineEvents.map((ev) => ({
                  color: ev.type === "primary" ? tokens.primary : ev.type === "success" ? tokens.success : tokens.textMuted,
                  children: (
                    <div>
                      <Text strong style={{ color: tokens.textPrimary }}>{ev.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />{ev.time}
                      </Text>
                    </div>
                  )
                }))}
              />
            </Card>

            <Card title="Catatan Komando" bordered={false} className="glass-panel hover-lift" extra={<MessageOutlined style={{ color: tokens.textMuted }} />}>
              <TextArea
                placeholder="Tambahkan instruksi komando atau catatan lapangan..."
                rows={3}
                style={{ background: tokens.surfaceHover, color: tokens.textPrimary, border: `1px solid ${tokens.border}`, marginBottom: 12 }}
              />
              <Button type="primary" size="small" style={{ background: tokens.primary, borderColor: tokens.primary, float: "right" }}>Kirim</Button>
            </Card>

          </div>
        </Col>
      </Row>

      <Modal
        title="Selesai Penanganan Kebakaran"
        open={resolveModalVisible}
        onOk={() => updateStatus("selesai", {
          jumlah_terdampak: jumlahTerdampak,
          luas_areal: luasAreal,
          korban_meninggal: korbanMeninggal,
          korban_luka: korbanLuka,
          korban_kk: korbanKk,
          taksiran_kerugian: taksiranKerugian
        })}
        onCancel={() => setResolveModalVisible(false)}
        okText="Selesaikan Insiden"
        cancelText="Batal"
      >
        <div style={{ padding: '20px 0' }}>
          <p>Berapa jumlah rumah / bangunan yang terdampak pada kebakaran ini?</p>
          <InputNumber 
            min={0} 
            value={jumlahTerdampak} 
            onChange={(val) => setJumlahTerdampak(val || 0)} 
            style={{ width: '100%', marginBottom: 16 }} 
            placeholder="Jumlah bangunan"
            size="large"
          />
          
          <p>Luas Areal Kebakaran (m²)</p>
          <InputNumber min={0} value={luasAreal} onChange={setLuasAreal} style={{ width: '100%', marginBottom: 16 }} placeholder="Luas dalam meter persegi" size="large" />

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <p>Meninggal</p>
              <InputNumber min={0} value={korbanMeninggal} onChange={setKorbanMeninggal} style={{ width: '100%' }} size="large" />
            </Col>
            <Col span={8}>
              <p>Luka-luka</p>
              <InputNumber min={0} value={korbanLuka} onChange={setKorbanLuka} style={{ width: '100%' }} size="large" />
            </Col>
            <Col span={8}>
              <p>Jumlah KK</p>
              <InputNumber min={0} value={korbanKk} onChange={setKorbanKk} style={{ width: '100%' }} size="large" />
            </Col>
          </Row>

          <p>Taksiran Kerugian (Rp)</p>
          <InputNumber 
            min={0} 
            value={taksiranKerugian} 
            onChange={setTaksiranKerugian} 
            style={{ width: '100%' }} 
            placeholder="Taksiran nilai kerugian" 
            size="large"
            formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\Rp\s?|(,*)/g, '') as any}
          />
        </div>
      </Modal>

    </div>
  );
}
