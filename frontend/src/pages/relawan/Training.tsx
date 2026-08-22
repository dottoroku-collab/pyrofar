import React, { useState, useEffect } from "react";
import { Card, Typography, Table, Tag, Button, Space, Row, Col, Statistic, Tooltip, message, Popconfirm } from "antd";
import { PlusOutlined, BookOutlined, CalendarOutlined, TeamOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { apiClient as api } from "@/api/client";
import TrainingForm, { Pelatihan } from "./TrainingForm";

const { Title, Text } = Typography;

export default function Training() {
  const [data, setData] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Pelatihan | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/relawan/pelatihan");
      setData(res.data);
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data pelatihan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/relawan/pelatihan/${id}`);
      message.success("Pelatihan berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("Gagal menghapus pelatihan");
    }
  };

  const handleEdit = (item: Pelatihan) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalVisible(true);
  };

  const columns = [
    { title: "Nama Pelatihan", dataIndex: "nama", key: "nama", render: (text: string) => <Text strong>{text}</Text> },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal", render: (text: string) => <Space><CalendarOutlined />{text}</Space> },
    { title: "Kapasitas", key: "kapasitas", render: (_: any, record: Pelatihan) => `${record.peserta_terdaftar} / ${record.kapasitas}` },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === 'upcoming' ? 'blue' : status === 'completed' ? 'green' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_value: any, record: Pelatihan) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              style={{ color: '#0ea5e9' }}
            />
          </Tooltip>
          <Tooltip title="Hapus">
            <Popconfirm
              title="Hapus Pelatihan"
              description="Yakin ingin menghapus pelatihan ini?"
              onConfirm={() => handleDelete(record.id)}
              okText="Ya"
              cancelText="Tidak"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: '#0369a1' }}>Pelatihan & Edukasi</Title>
          <Text type="secondary" style={{ color: '#0284c7' }}>Manajemen program pelatihan relawan Relawan</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ borderRadius: 8, background: '#0ea5e9', border: 'none', boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.4)' }}>
            Buat Pelatihan
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#0284c7' }}><BookOutlined /> Total Program</span>} value={data.length} valueStyle={{ color: '#0369a1', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#0284c7' }}><TeamOutlined /> Relawan Terlatih</span>} value={120} valueStyle={{ color: '#0369a1', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <TrainingForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        initialData={selectedItem}
        onSuccess={() => {
          setModalVisible(false);
          fetchData();
        }}
      />
    </div>
  );
}
