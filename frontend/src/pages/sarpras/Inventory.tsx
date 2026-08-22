import React, { useEffect, useState } from "react";
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, message, Select, Statistic, Row, Col, Progress } from "antd";
import { PlusOutlined, ShoppingCartOutlined, InboxOutlined, AlertOutlined } from "@ant-design/icons";
import { getInventaris, createInventaris, InventarisItem } from "@/api/sarpras";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Inventory() {
  const [data, setData] = useState<InventarisItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInventaris('consumable');
      setData(res);
    } catch (error) {
      message.error("Gagal memuat data inventory");
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
        tipe_barang: 'consumable',
        kategori: values.kategori || 'umum',
        kondisi: 'baik', // Consumables are generally 'baik' unless expired
        metadata_tambahan: {
          min_stock: values.min_stock || 10,
          unit: values.unit || 'pcs'
        }
      });
      message.success("Berhasil menambah item inventory");
      setIsModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error("Gagal menambah item inventory");
    }
  };

  const columns = [
    {
      title: "Item Name",
      dataIndex: "nama_barang",
      key: "nama_barang",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Stock Level",
      key: "stock_level",
      render: (_: any, record: InventarisItem) => {
        const qty = record.jumlah;
        const minStock = record.metadata_tambahan?.min_stock || 10;
        const percent = Math.min(Math.round((qty / (minStock * 2)) * 100), 100);
        let status: 'normal' | 'exception' | 'active' | 'success' = 'normal';
        if (qty <= minStock) status = 'exception';
        else if (qty > minStock * 2) status = 'success';
        
        return (
          <div style={{ width: 120 }}>
            <Progress percent={percent} size="small" status={status} showInfo={false} />
            <Text type="secondary" style={{ fontSize: 12 }}>{qty} / {minStock} (min)</Text>
          </div>
        );
      }
    },
    {
      title: "Quantity",
      key: "jumlah",
      render: (_: any, record: InventarisItem) => (
        <Tag color={record.jumlah <= (record.metadata_tambahan?.min_stock || 10) ? 'red' : 'green'} style={{ borderRadius: 12 }}>
          {record.jumlah} {record.metadata_tambahan?.unit || 'pcs'}
        </Tag>
      )
    },
    {
      title: "Category",
      dataIndex: "kategori",
      key: "kategori",
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<ShoppingCartOutlined />} style={{ padding: 0 }}>Restock</Button>
          <Button type="link" danger style={{ padding: 0 }}>Use</Button>
        </Space>
      ),
    },
  ];

  const lowStockCount = data.filter(d => d.jumlah <= (d.metadata_tambahan?.min_stock || 10)).length;

  return (
    <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: '#92400e' }}>Inventory & Consumables</Title>
          <Text type="secondary" style={{ color: '#b45309' }}>Track fast-moving supplies and restock levels</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalVisible(true)} style={{ borderRadius: 8, background: '#d97706', border: 'none', boxShadow: '0 4px 14px 0 rgba(217, 119, 6, 0.4)' }}>
            Add Item
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Statistic title={<span style={{ color: '#d97706' }}><InboxOutlined /> Total Unique Items</span>} value={data.length} valueStyle={{ color: '#92400e', fontSize: 32, fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Statistic title={<span style={{ color: '#dc2626' }}><AlertOutlined /> Low Stock Alerts</span>} value={lowStockCount} valueStyle={{ color: lowStockCount > 0 ? '#dc2626' : '#10b981', fontSize: 32, fontWeight: 800 }} />
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
        title={<Title level={4} style={{ margin: 0, color: '#92400e' }}>Add Inventory Item</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: 24 }}>
          <Form.Item name="nama_barang" label="Item Name" rules={[{ required: true }]}>
            <Input size="large" placeholder="e.g. Busa Pemadam, Seragam, Masker" style={{ borderRadius: 6 }} />
          </Form.Item>
          <Form.Item name="kategori" label="Category" rules={[{ required: true }]}>
             <Select size="large">
               <Option value="bahan_kimia">Bahan Kimia / Busa</Option>
               <Option value="pakaian">Pakaian / Seragam</Option>
               <Option value="medis">Peralatan Medis</Option>
               <Option value="umum">Umum</Option>
             </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="jumlah" label="Current Qty" rules={[{ required: true }]}>
                <InputNumber size="large" style={{ width: '100%', borderRadius: 6 }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="Unit" rules={[{ required: true }]} initialValue="pcs">
                <Input size="large" placeholder="e.g. Liter, Box, Pcs" style={{ borderRadius: 6 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="min_stock" label="Min Stock Alert" initialValue={10}>
                <InputNumber size="large" style={{ width: '100%', borderRadius: 6 }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block style={{ borderRadius: 6, background: '#d97706', border: 'none' }}>
              Save Item
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
