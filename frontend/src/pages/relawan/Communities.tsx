import React, { useState, useEffect } from "react";
import { Card, Typography, Table, Tag, Button, Space, Row, Col, Statistic, Tooltip, message, Popconfirm } from "antd";
import { PlusOutlined, TeamOutlined, EnvironmentOutlined, CheckCircleOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { apiClient as api } from "@/api/client";
import KomunitasForm, { Komunitas } from "./KomunitasForm";

const { Title, Text } = Typography;

export default function Communities() {
  const [data, setData] = useState<Komunitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Komunitas | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/relawan/komunitas");
      setData(res.data);
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil data komunitas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/relawan/komunitas/${id}`);
      message.success("Komunitas berhasil dihapus");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("Gagal menghapus komunitas");
    }
  };

  const handleEdit = (item: Komunitas) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalVisible(true);
  };

  const columns = [
    { 
      title: "Nama Komunitas", 
      dataIndex: "nama", 
      key: "nama",
      render: (text: string) => <Text strong>{text}</Text>
    },
    { 
      title: "Lokasi / Wilayah", 
      dataIndex: "lokasi", 
      key: "lokasi",
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#0ea5e9' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    { 
      title: "Jumlah Anggota", 
      dataIndex: "jumlah_anggota", 
      key: "jumlah_anggota",
      render: (val: number) => (
        <Space>
          <TeamOutlined />
          <span>{val} Orang</span>
        </Space>
      )
    },
    {
      title: "Status Kemitraan",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'} style={{ borderRadius: 12 }}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_value: any, record: Komunitas) => (
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
              title="Hapus Komunitas"
              description="Yakin ingin menghapus komunitas ini?"
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
          <Title level={2} style={{ margin: 0, color: '#0369a1' }}>Komunitas Relawan</Title>
          <Text type="secondary" style={{ color: '#0284c7' }}>Manajemen kemitraan dengan komunitas pesisir</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large" style={{ borderRadius: 8, background: '#0ea5e9', border: 'none', boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.4)' }}>
            Tambah Komunitas
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#0284c7' }}><TeamOutlined /> Komunitas Mitra Aktif</span>} value={data.filter(d => d.status === 'active').length} valueStyle={{ color: '#0369a1', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#0284c7' }}><CheckCircleOutlined /> Total Relawan dari Komunitas</span>} value={data.reduce((acc, curr) => acc + curr.jumlah_anggota, 0)} valueStyle={{ color: '#0369a1', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <KomunitasForm
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
