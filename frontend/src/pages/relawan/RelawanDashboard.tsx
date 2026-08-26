import { Card, Typography, Spin, Row, Col, Statistic, Button, Tag, Table } from "antd";
import { useEffect, useState } from "react";
import {
  TeamOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  AlertOutlined,
  ThunderboltOutlined,
  CompassOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { apiClient } from "@/api/client";
import { getRelawanDashboard, getRelawanList } from "@/api/relawan";
import { useTokens } from "@/store/themeStore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { useTenantStore } from "@/store/tenantStore";

// Icons setup
const iconRelawan = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "huechange-green" // CSS trick to colorize
});

const iconIncident = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "huechange-red"
});

const iconPosko = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "huechange-blue"
});

export default function RelawanDashboard() {
  const [data, setData] = useState<any>(null);
  const [relawans, setRelawans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const tokens = useTokens();
  const navigate = useNavigate();
  const { settings } = useTenantStore();

  const defaultCenter = (settings?.latitude && settings?.longitude) 
    ? [parseFloat(settings.latitude.toString()), parseFloat(settings.longitude.toString())] as [number, number]
    : [-5.147665, 119.432731] as [number, number];

  const isDarkMode = tokens.surface === '#141414';
  const tileUrl = isDarkMode
    ? mode === 'dark' ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDashboard, resRelawan] = await Promise.all([
        getRelawanDashboard(),
        getRelawanList()
      ]);
      setData(resDashboard);
      setRelawans(resRelawan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMarkerIcon = (type: string) => {
    if (type === 'relawan') return iconRelawan;
    if (type === 'incident') return iconIncident;
    return iconPosko;
  };

  const relawanColumns = [
    { title: 'NIK', dataIndex: 'nik', key: 'nik' },
    { title: 'Nama', dataIndex: 'nama', key: 'nama' },
    { title: 'No. Telepon', dataIndex: 'no_telepon', key: 'no_telepon' },
    { 
      title: 'Wilayah', 
      key: 'wilayah',
      render: (_: any, record: any) => (
        <span>
          {record.kecamatan ? `${record.kecamatan}, ` : ''}{record.kota || '-'}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => (
        <Tag color={val === 'active' ? 'green' : val === 'in_mission' ? 'orange' : 'default'}>
          {val.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/relawan/relawan/${record.id}`)}
        />
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`
        .huechange-green { filter: hue-rotate(270deg) saturate(3); }
        .huechange-red { filter: hue-rotate(150deg) saturate(5); }
        .huechange-blue { filter: hue-rotate(0deg); }
        .leaflet-container { z-index: 1; }
      `}</style>

      {/* KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={4}>
          <Card styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Relawan Aktif"
              value={data?.kpi?.active_volunteers || 0}
              prefix={<TeamOutlined style={{ color: tokens.primary }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Terlatih"
              value={data?.kpi?.trained_volunteers || 0}
              prefix={<SafetyCertificateOutlined style={{ color: tokens.success }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Komunitas"
              value={data?.kpi?.communities || 0}
              prefix={<GlobalOutlined style={{ color: tokens.info }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Laporan Aktif"
              value={data?.kpi?.incidents_reported || 0}
              prefix={<AlertOutlined style={{ color: tokens.danger }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Rata-rata Respon"
              value={data?.kpi?.average_response || "-"}
              prefix={<ThunderboltOutlined style={{ color: tokens.warning }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Total Simulasi"
              value={data?.kpi?.simulation_count || 0}
              prefix={<CompassOutlined style={{ color: tokens.primary }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Map Pesisir */}
      <Card title="Peta Relawan (Pesisir & Kepulauan)" styles={{ body: { padding: 0 } }}>
        {loading && !data ? (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ height: 400, width: '100%' }}>
            <MapContainer
              center={defaultCenter}
              zoom={13}
              style={{ height: "100%", width: "100%", borderRadius: '0 0 8px 8px' }}
            >
              <TileLayer url={tileUrl} />

              {data?.map_data?.markers?.map((item: any) => (
                <Marker
                  key={item.id}
                  position={[item.lat, item.lng]}
                  icon={getMarkerIcon(item.type)}
                >
                  <Popup>
                    <strong>{item.name}</strong><br/>
                    <span style={{ textTransform: 'capitalize' }}>Tipe: {item.type.replace('_', ' ')}</span><br/>
                    {item.type === 'relawan' && (
                      <a onClick={() => navigate(`/relawan/relawan/${item.id}`)} style={{ cursor: 'pointer', color: tokens.primary }}>
                        Lihat Profil
                      </a>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </Card>

      {/* Daftar Relawan */}
      <Card title="Daftar Relawan" extra={<Button type="primary" onClick={() => navigate('/relawan/relawan/new')}>Tambah Relawan</Button>}>
        <Table
          columns={relawanColumns}
          dataSource={relawans}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}
