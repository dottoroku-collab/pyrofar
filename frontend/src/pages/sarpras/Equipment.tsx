import React, { useEffect, useState } from "react";
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, message, Select, Statistic, Row, Col } from "antd";
import { PlusOutlined, ToolOutlined, CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { getInventaris, createInventaris, InventarisItem } from "@/api/sarpras";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Equipment() {
  const [data, setData] = useState<InventarisItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInventaris('equipment');
      setData(res);
    } catch (error) {
      message.error("Gagal memuat data equipment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (values: any) => {
    try {
      await createInventaris({
        ...values,
        tipe_barang: 'equipment',
        kategori: values.kategori || 'umum',
      });
      message.success("Berhasil menambah equipment");
      setIsModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error("Gagal menambah equipment");
    }
  };

  const columns = [
    {
      title: "Nama Equipment",
      dataIndex: "nama_barang",
      key: "nama_barang",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Kondisi",
      dataIndex: "kondisi",
      key: "kondisi",
      render: (kondisi: string) => {
        let color = "green";
        let icon = <CheckCircleOutlined />;
        if (kondisi === "rusak") {
          color = "red";
          icon = <WarningOutlined />;
        } else if (kondisi === "maintenance") {
          color = "orange";
          icon = <ToolOutlined />;
        }
        return (
          <Tag color={color} icon={icon} style={{ textTransform: 'capitalize' }}>
            {kondisi}
          </Tag>
        );
      },
    },
    {
      title: "Jumlah",
      dataIndex: "jumlah",
      key: "jumlah",
    },
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: () => (
        <Space size="middle">
          <Button type="link" style={{ padding: 0 }}>Detail</Button>
          <Button type="link" danger style={{ padding: 0 }}>Hapus</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: '#1e293b' }}>Equipments Dashboard</Title>
          <Text type="secondary">Manage your firefighting gears and operational equipments</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalVisible(true)} style={{ borderRadius: 8, background: 'linear-gradient(to right, #2563eb, #3b82f6)', border: 'none', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}>
            Add Equipment
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Statistic title="Total Equipments" value={data.reduce((acc, curr) => acc + curr.jumlah, 0)} valueStyle={{ color: '#0f172a', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Statistic title="In Maintenance" value={data.filter(d => d.kondisi === 'maintenance').length} valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Statistic title="Ready for Deployment" value={data.filter(d => d.kondisi === 'baik').length} valueStyle={{ color: '#10b981', fontWeight: 'bold' }} />
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
        title={<Title level={4} style={{ margin: 0 }}>Add New Equipment</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: 24 }}>
          <Form.Item name="nama_barang" label="Equipment Name" rules={[{ required: true }]}>
            <Input size="large" placeholder="e.g. Fire Hose, Nozzle, Breathing Apparatus" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item name="kategori" label="Category" rules={[{ required: true }]}>
             <Select size="large">
               <Option value="safety">Safety Gear</Option>
               <Option value="extinguisher">Extinguisher</Option>
               <Option value="communications">Communications</Option>
               <Option value="tools">Hand Tools</Option>
               <Option value="umum">General</Option>
             </Select>
          </Form.Item>
          <Form.Item name="jumlah" label="Quantity" rules={[{ required: true }]}>
            <InputNumber size="large" min={1} style={{ width: '100%', borderRadius: 6 }} />
          </Form.Item>
          <Form.Item name="kondisi" label="Condition" rules={[{ required: true }]}>
            <Select size="large">
              <Option value="baik">Baik (Good)</Option>
              <Option value="rusak">Rusak (Damaged)</Option>
              <Option value="maintenance">Maintenance</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block style={{ borderRadius: 6, background: '#2563eb' }}>
              Save Equipment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
