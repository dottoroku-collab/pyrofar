import React, { useEffect, useState } from "react";
import { Card, Typography, Table, Button, Space, Modal, Form, Input, InputNumber, message, Statistic, Row, Col, Tooltip } from "antd";
import { PlusOutlined, AimOutlined, TeamOutlined, GlobalOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { getStations, createStation, deleteStation, Station } from "@/api/stations";

const { Title, Text } = Typography;

export default function PoskoList() {
  const [data, setData] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStations();
      setData(res.filter(station => station.is_relawan_post));
    } catch (error) {
      message.error("Gagal memuat data Posko");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (values: any) => {
    try {
      await createStation({ ...values, is_relawan_post: true });
      message.success("Berhasil menambah Posko Relawan");
      setIsModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error("Gagal menambah Posko");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStation(id);
      message.success("Posko dihapus");
      loadData();
    } catch (error) {
      message.error("Gagal menghapus Posko");
    }
  };

  const columns = [
    {
      title: "Nama Posko",
      dataIndex: "nama",
      key: "nama",
      render: (text: string) => (
        <Space>
          <AimOutlined style={{ color: '#0ea5e9' }} />
          <Text strong style={{ fontSize: 16 }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Alamat",
      dataIndex: "alamat",
      key: "alamat",
    },
    {
      title: "Kapasitas",
      dataIndex: "kapasitas_personil",
      key: "kapasitas_personil",
      render: (cap: number) => (
        <Space>
          <TeamOutlined />
          <span>{cap || 0} Personil</span>
        </Space>
      ),
    },
    {
      title: "Koordinat",
      key: "coords",
      render: (_: any, record: Station) => (
        record.latitude && record.longitude ? 
        <Tooltip title={`${record.latitude}, ${record.longitude}`}>
           <Button type="link" icon={<GlobalOutlined />} size="small">Map</Button>
        </Tooltip> : <Text type="secondary">N/A</Text>
      )
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: Station) => (
        <Space size="middle">
          <Button type="link" style={{ padding: 0, color: '#0ea5e9' }}>Edit</Button>
          <Button type="link" danger style={{ padding: 0 }} onClick={() => handleDelete(record.id)}>Hapus</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: '#0369a1' }}>Posko Relawan</Title>
          <Text type="secondary" style={{ color: '#0284c7' }}>Manajemen Posko Pemadam Kebakaran Relawan</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalVisible(true)} style={{ borderRadius: 8, background: '#0ea5e9', border: 'none', boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.4)' }}>
            Tambah Posko
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#0284c7' }}><ThunderboltOutlined /> Total Posko Relawan</span>} value={data.length} valueStyle={{ color: '#0369a1', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#0284c7' }}><TeamOutlined /> Total Kapasitas</span>} value={data.reduce((acc, curr) => acc + (curr.kapasitas_personil || 0), 0)} valueStyle={{ color: '#0369a1', fontSize: 32, fontWeight: 800 }} />
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
        title={<Title level={4} style={{ margin: 0, color: '#0369a1' }}>Tambah Posko Relawan</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: 24 }}>
          <Form.Item name="nama" label="Nama Posko" rules={[{ required: true }]}>
            <Input size="large" placeholder="Contoh: Posko Relawan Pulau Seribu" style={{ borderRadius: 6 }} />
          </Form.Item>
          
          <Form.Item name="alamat" label="Alamat">
            <Input.TextArea rows={3} placeholder="Alamat lengkap" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitude">
                <InputNumber size="large" style={{ width: '100%', borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="Longitude">
                <InputNumber size="large" style={{ width: '100%', borderRadius: 6 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="kapasitas_personil" label="Kapasitas Personil">
            <InputNumber size="large" min={0} style={{ width: '100%', borderRadius: 6 }} />
          </Form.Item>

          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" size="large" block style={{ borderRadius: 6, background: '#0ea5e9', border: 'none' }}>
              Simpan Posko
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
