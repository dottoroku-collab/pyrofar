import React, { useEffect, useState } from "react";
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, message, Switch, Statistic, Row, Col, Tooltip } from "antd";
import { PlusOutlined, AimOutlined, TeamOutlined, GlobalOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { getStations, createStation, deleteStation, Station } from "@/api/stations";
import { settingsApi } from "@/api/settings";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useThemeStore } from "@/store/themeStore";
import { useTenantStore } from "@/store/tenantStore";
import { lightTokens, darkTokens } from "@/theme/tokens";
import 'leaflet/dist/leaflet.css';

const { Title, Text } = Typography;

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
    // Wait for Modal animation to finish before invalidating size
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [center, map]);
  return null;
}

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} icon={defaultIcon} /> : null;
}

export default function Stations() {
  const [data, setData] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { mode } = useThemeStore();
  const tokens = mode === 'dark' ? darkTokens : lightTokens;
  const { settings } = useTenantStore();
  const defaultCenter = (settings?.latitude && settings?.longitude)
    ? [settings.latitude, settings.longitude] as [number, number]
    : [-6.2088, 106.8456] as [number, number];
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStations(false);
      setData(res);
    } catch (error) {
      message.error("Gagal memuat data stations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (values: any) => {
    try {
      await createStation(values);
      message.success("Berhasil menambah station");
      setIsModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error("Gagal menambah station");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStation(id);
      message.success("Station dihapus");
      loadData();
    } catch (error) {
      message.error("Gagal menghapus station");
    }
  };

  const columns = [
    {
      title: "Station Name",
      dataIndex: "nama",
      key: "nama",
      render: (text: string) => (
        <Space>
          <AimOutlined style={{ color: '#059669' }} />
          <Text strong style={{ fontSize: 16 }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Address",
      dataIndex: "alamat",
      key: "alamat",
    },
    {
      title: "Capacity",
      dataIndex: "kapasitas_personil",
      key: "kapasitas_personil",
      render: (cap: number) => (
        <Space>
          <TeamOutlined />
          <span>{cap || 0} Personnel</span>
        </Space>
      ),
    },
    {
      title: "Coordinates",
      key: "coords",
      render: (_: any, record: Station) => (
        record.latitude && record.longitude ? 
        <Tooltip title={`${record.latitude}, ${record.longitude}`}>
           <Button type="link" icon={<GlobalOutlined />} size="small">Map</Button>
        </Tooltip> : <Text type="secondary">N/A</Text>
      )
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Station) => (
        <Space size="middle">
          <Button type="link" style={{ padding: 0, color: '#059669' }}>Edit</Button>
          <Button type="link" danger style={{ padding: 0 }} onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', background: tokens.bg, minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: tokens.textPrimary }}>Stations</Title>
          <Text type="secondary" style={{ color: tokens.primary }}>Manage fire stations</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => {
            setSelectedPos(null);
            setIsModalVisible(true);
          }} style={{ borderRadius: 8, background: '#10b981', border: 'none', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)' }}>
            Add Station
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#059669' }}><ThunderboltOutlined /> Total Stations</span>} value={data.length} valueStyle={{ color: '#064e3b', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#059669' }}><TeamOutlined /> Total Capacity</span>} value={data.reduce((acc, curr) => acc + (curr.kapasitas_personil || 0), 0)} valueStyle={{ color: '#064e3b', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={<Title level={4} style={{ margin: 0, color: tokens.textPrimary }}>Add New Station</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: 24 }}>
          <Form.Item name="nama" label="Station Name" rules={[{ required: true }]}>
            <Input size="large" placeholder="e.g. Posko Damkar Pusat" style={{ borderRadius: 6 }} />
          </Form.Item>
          
          <Form.Item name="alamat" label="Address">
            <Input.TextArea rows={3} placeholder="Full address" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Select Location on Map" required>
                <div style={{ height: 300, width: '100%', borderRadius: 8, overflow: 'hidden', border: `1px solid ${tokens.border}`, marginBottom: 16 }}>
                  <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <MapUpdater center={defaultCenter} />
                    <TileLayer
                      key={mode}
                      url={mode === 'dark' ? mode === 'dark' ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                    />
                    <LocationPicker 
                      position={selectedPos || defaultCenter} 
                      setPosition={(pos) => {
                        setSelectedPos(pos);
                        form.setFieldsValue({ latitude: pos[0], longitude: pos[1] });
                      }} 
                    />
                  </MapContainer>
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: '100%', borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: '100%', borderRadius: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle">
            <Col span={24}>
              <Form.Item name="kapasitas_personil" label="Personnel Capacity">
                <InputNumber size="large" min={0} style={{ width: '100%', borderRadius: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" size="large" block style={{ borderRadius: 6, background: '#10b981', border: 'none' }}>
              Save Station
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
