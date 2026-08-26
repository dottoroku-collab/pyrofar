import { Card, Col, Row, Typography, Tag, Button, Tabs, Spin, Space, Descriptions, List, message } from "antd";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTokens, useThemeStore } from "@/store/themeStore";
import {
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PaperClipOutlined,
  CameraOutlined
} from "@ant-design/icons";
import { apiClient } from "@/api/client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { useTenantStore } from "@/store/tenantStore";
const { Title, Text } = Typography;

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

export default function PencegahanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tokens = useTokens();
  const { mode } = useThemeStore();
  const { settings } = useTenantStore();

  const defaultCenter = (settings?.latitude && settings?.longitude) 
    ? [parseFloat(settings.latitude.toString()), parseFloat(settings.longitude.toString())] as [number, number]
    : [-5.147665, 119.432731] as [number, number];

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/pencegahan/inspeksi`);
      // Since mock api doesn't have get by id, find it here
      const item = res.data.find((d: any) => d.id === id);
      if (item) {
        // mock checklist if empty
        if (!item.checklist) {
           item.checklist = [
             { item: "Fire Extinguisher terisi dan belum kadaluarsa", passed: true },
             { item: "Jalur Evakuasi bersih dari hambatan", passed: false, note: "Ada kardus di tangga" },
             { item: "Alarm Kebakaran berfungsi normal", passed: true }
           ];
        }
        setData(item);
      }
    } catch (e) {
      console.error(e);
      message.error("Gagal memuat detail inspeksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  if (!data) {
    return <div style={{ padding: 50, textAlign: 'center' }}>Data tidak ditemukan</div>;
  }

  const updateStatus = async (newStatus: string) => {
    try {
      await apiClient.put(`/pencegahan/inspeksi/${id}`, { status: newStatus });
      message.success(`Status diubah menjadi ${newStatus}`);
      fetchDetail();
    } catch (e) {
      message.error("Gagal mengubah status");
    }
  };

  const updateApproval = async (appStatus: string) => {
    try {
      await apiClient.put(`/pencegahan/inspeksi/${id}`, { approval_status: appStatus });
      message.success(`Persetujuan diubah menjadi ${appStatus}`);
      fetchDetail();
    } catch (e) {
      message.error("Gagal memberikan persetujuan");
    }
  };

  const tabItems = [
    {
      key: "checklist",
      label: "Inspection Checklist",
      children: (
        <List
          dataSource={data.checklist || []}
          renderItem={(item: any) => (
            <List.Item>
              <Space>
                {item.passed ? <CheckCircleOutlined style={{ color: tokens.success }} /> : <CloseCircleOutlined style={{ color: tokens.danger }} />}
                <Text>{item.item}</Text>
                {item.note && <Text type="secondary">({item.note})</Text>}
              </Space>
            </List.Item>
          )}
        />
      )
    },
    {
      key: "findings",
      label: "Findings",
      children: (
        <List
          dataSource={data.findings || []}
          renderItem={(item: any) => (
            <List.Item>
              <Text>{item}</Text>
            </List.Item>
          )}
          locale={{ emptyText: "Tidak ada temuan" }}
        />
      )
    },
    {
      key: "photos",
      label: "Photos",
      children: (
        <div style={{ display: 'flex', gap: 16 }}>
          {(data.photos || []).map((p: string, i: number) => (
            <img key={i} src={p} alt={`Foto ${i}`} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
          ))}
          {!data.photos?.length && (
            <div style={{ width: 120, height: 120, border: `1px dashed ${tokens.border}`, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: tokens.textMuted }}>
              <CameraOutlined style={{ fontSize: 24 }} />
              <div style={{ fontSize: 12, marginTop: 8 }}>Belum ada foto</div>
            </div>
          )}
        </div>
      )
    },
    {
      key: "recommendation",
      label: "Recommendation",
      children: (
        <div>
          <Text>{data.recommendations || "Belum ada rekomendasi yang diberikan."}</Text>
        </div>
      )
    },
    {
      key: "document",
      label: "Document",
      children: (
        <List
          dataSource={data.documents || []}
          renderItem={(item: any) => (
            <List.Item>
              <Space>
                <PaperClipOutlined />
                <a href={item.url} target="_blank" rel="noreferrer">{item.name}</a>
              </Space>
            </List.Item>
          )}
          locale={{ emptyText: "Tidak ada dokumen pendukung" }}
        />
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Space size="large">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/pencegahan")} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Title level={4} style={{ margin: 0, color: tokens.textPrimary }}>
              {data.building_name || data.objek_inspeksi}
            </Title>
            <Text type="secondary">{data.objek_inspeksi}</Text>
          </div>
        </Space>
        <Space>
          <Tag color={data.status === 'completed' ? tokens.success : tokens.primary} style={{ padding: '4px 12px', fontSize: 14 }}>
            {(data.status || 'pending').toUpperCase()}
          </Tag>
          <Tag color={data.status_kepatuhan === 'patuh' ? tokens.success : (data.status_kepatuhan === 'sebagian' ? tokens.warning : tokens.danger)} style={{ padding: '4px 12px', fontSize: 14 }}>
            {data.status_kepatuhan.toUpperCase().replace("_", " ")}
          </Tag>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Maps */}
            <Card bordered={false} bodyStyle={{ padding: 0, height: 250, overflow: 'hidden', borderRadius: 12 }}>
              <MapContainer
                center={data.latitude && data.longitude ? [parseFloat(data.latitude), parseFloat(data.longitude)] : defaultCenter}
                zoom={14}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={false}
              >
                <TileLayer
                  url={mode === 'dark'
                    ? mode === 'dark' ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  }
                  attribution='&copy; OpenStreetMap & CARTO'
                />
                {data.latitude && data.longitude && (
                  <Marker position={[parseFloat(data.latitude), parseFloat(data.longitude)]}>
                    <Popup>{data.building_name || data.objek_inspeksi}</Popup>
                  </Marker>
                )}
                <MapResizer />
              </MapContainer>
            </Card>

            <Card bordered={false} title="Informasi Bangunan" style={{ background: tokens.surfaceHover }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Pemilik">{data.owner_name || '-'}</Descriptions.Item>
                <Descriptions.Item label="Alamat">{data.alamat}</Descriptions.Item>
                <Descriptions.Item label="Tgl Inspeksi">{data.tanggal_inspeksi}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card bordered={false} title="Approval Workflow" style={{ background: tokens.surfaceHover }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>Status Persetujuan: <strong>{data.approval_status || 'PENDING'}</strong></div>
                {(data.approval_status === 'pending' || !data.approval_status) && (
                  <Space>
                    <Button type="primary" style={{ background: tokens.success, borderColor: tokens.success }} onClick={() => updateApproval('approved')}>Approve</Button>
                    <Button type="primary" danger onClick={() => updateApproval('rejected')}>Reject</Button>
                  </Space>
                )}
              </div>
            </Card>

          </div>
        </Col>

        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ background: tokens.surfaceHover, minHeight: 600 }}>
             <Tabs defaultActiveKey="checklist" items={tabItems} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
