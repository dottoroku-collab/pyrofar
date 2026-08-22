import React, { useEffect, useState } from "react";
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, message, Select, Statistic, Row, Col, DatePicker } from "antd";
import { PlusOutlined, BankOutlined, EnvironmentOutlined, BarChartOutlined } from "@ant-design/icons";
import { getInventaris, createInventaris, InventarisItem } from "@/api/sarpras";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Assets() {
  const [data, setData] = useState<InventarisItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInventaris('asset');
      setData(res);
    } catch (error) {
      message.error("Gagal memuat data assets");
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
        tipe_barang: 'asset',
        kategori: values.kategori || 'gedung',
        metadata_tambahan: {
          purchase_date: values.purchase_date?.toISOString(),
          value: values.value,
        }
      });
      message.success("Berhasil menambah asset");
      setIsModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error("Gagal menambah asset");
    }
  };

  const columns = [
    {
      title: "Asset Name",
      dataIndex: "nama_barang",
      key: "nama_barang",
      render: (text: string) => (
        <Space>
          <BankOutlined style={{ color: '#4f46e5' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Condition",
      dataIndex: "kondisi",
      key: "kondisi",
      render: (kondisi: string) => {
        const color = kondisi === 'baik' ? 'blue' : kondisi === 'rusak' ? 'red' : 'gold';
        return <Tag color={color} style={{ borderRadius: 12 }}>{kondisi.toUpperCase()}</Tag>;
      }
    },
    {
      title: "Category",
      dataIndex: "kategori",
      key: "kategori",
    },
    {
      title: "Purchase Date",
      key: "purchase_date",
      render: (_: any, record: InventarisItem) => {
        const pd = record.metadata_tambahan?.purchase_date;
        return pd ? dayjs(pd).format("DD MMM YYYY") : "-";
      }
    },
    {
      title: "Estimated Value",
      key: "value",
      render: (_: any, record: InventarisItem) => {
        const val = record.metadata_tambahan?.value;
        return val ? `Rp ${Number(val).toLocaleString('id-ID')}` : "-";
      }
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space size="middle">
          <Button type="link" style={{ padding: 0, color: '#4f46e5' }}>Edit</Button>
          <Button type="link" danger style={{ padding: 0 }}>Archive</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: '#312e81' }}>Corporate Assets</Title>
          <Text type="secondary" style={{ color: '#4f46e5' }}>Manage high-value physical properties, buildings, and lands</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalVisible(true)} style={{ borderRadius: 8, background: '#4f46e5', border: 'none', boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)' }}>
            Register Asset
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12} lg={8}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#6366f1' }}><BankOutlined /> Total Assets</span>} value={data.length} valueStyle={{ color: '#312e81', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#6366f1' }}><EnvironmentOutlined /> In Good Condition</span>} value={data.filter(d => d.kondisi === 'baik').length} valueStyle={{ color: '#10b981', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)' }}>
            <Statistic title={<span style={{ color: '#6366f1' }}><BarChartOutlined /> Total Value (Estimated)</span>} value={`Rp ${data.reduce((acc, curr) => acc + (Number(curr.metadata_tambahan?.value) || 0), 0).toLocaleString('id-ID')}`} valueStyle={{ color: '#0f172a', fontSize: 24, fontWeight: 700 }} />
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
        title={<Title level={4} style={{ margin: 0, color: '#312e81' }}>Register New Asset</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: 24 }}>
          <Form.Item name="nama_barang" label="Asset Name" rules={[{ required: true }]}>
            <Input size="large" placeholder="e.g. Kantor Pusat, Lahan Parkir" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item name="kategori" label="Category" rules={[{ required: true }]}>
             <Select size="large">
               <Option value="gedung">Gedung / Bangunan</Option>
               <Option value="tanah">Tanah / Lahan</Option>
               <Option value="elektronik">Elektronik Besar</Option>
             </Select>
          </Form.Item>
          <Form.Item name="kondisi" label="Condition" rules={[{ required: true }]}>
            <Select size="large">
              <Option value="baik">Baik</Option>
              <Option value="rusak">Renovasi / Rusak</Option>
              <Option value="maintenance">Dalam Pemeliharaan</Option>
            </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="purchase_date" label="Acquisition Date">
                <DatePicker size="large" style={{ width: '100%', borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="value" label="Estimated Value (Rp)">
                <InputNumber size="large" style={{ width: '100%', borderRadius: 6 }} min={0} step={1000000} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="jumlah" initialValue={1} hidden><Input /></Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block style={{ borderRadius: 6, background: '#4f46e5', border: 'none' }}>
              Register Asset
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
