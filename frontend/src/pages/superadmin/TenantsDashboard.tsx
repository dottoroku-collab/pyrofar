import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input, Select, Tag } from "antd";
import { superadminApi } from "@/api/superadmin";
import { TenantPublic } from "@/types/tenant";

export default function TenantsDashboard() {
  const [tenants, setTenants] = useState<TenantPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await superadminApi.getTenants();
      setTenants(data);
    } catch (error) {
      message.error("Gagal mengambil data tenant");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      await superadminApi.createTenant(values);
      message.success("Tenant berhasil ditambahkan");
      setIsModalVisible(false);
      fetchTenants();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Apakah Anda yakin ingin menghapus tenant ini?",
      content: "Tindakan ini tidak dapat dibatalkan.",
      onOk: async () => {
        try {
          await superadminApi.deleteTenant(id);
          message.success("Tenant berhasil dihapus");
          fetchTenants();
        } catch (error) {
          message.error("Gagal menghapus tenant");
        }
      },
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 250 },
    { title: "Nama", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    { 
      title: "Plan", 
      dataIndex: "plan_code", 
      key: "plan_code",
      render: (val: string) => <Tag color="blue">{val}</Tag>
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      render: (val: string) => (
        <Tag color={val === 'active' ? 'green' : val === 'trial' ? 'gold' : 'red'}>
          {val.toUpperCase()}
        </Tag>
      )
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_: any, record: TenantPublic) => (
        <Space>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>Hapus</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Kelola Tenant (Superadmin)</h2>
        <Button type="primary" onClick={handleAdd}>Tambah Tenant</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={tenants} 
        rowKey="id" 
        loading={loading}
      />

      <Modal
        title="Tambah Tenant Baru"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nama Tenant" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="active">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="trial">Trial</Select.Option>
              <Select.Option value="suspended">Suspended</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="plan_code" label="Plan Code" initialValue="free">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
