import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Select, Switch, Modal, Form, Input } from "antd";
import { superadminApi } from "@/api/superadmin";
import { TenantPublic } from "@/types/tenant";
import { UserAdmin } from "@/types/user";

export default function GlobalUsers() {
  const [tenants, setTenants] = useState<TenantPublic[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Reset Password Modal
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetForm] = Form.useForm();

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchUsers(selectedTenant);
    } else {
      setUsers([]);
    }
  }, [selectedTenant]);

  const fetchTenants = async () => {
    try {
      const data = await superadminApi.getTenants();
      setTenants(data);
    } catch (error) {
      message.error("Gagal mengambil data tenant");
    }
  };

  const fetchUsers = async (tenantId: string) => {
    setLoading(true);
    try {
      const data = await superadminApi.getTenantUsers(tenantId);
      setUsers(data);
    } catch (error) {
      message.error("Gagal mengambil pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (values: any) => {
    if (!selectedTenant) return;
    try {
      setLoading(true);
      await superadminApi.createTenantUser(selectedTenant, values);
      message.success("Pengguna berhasil ditambahkan");
      setIsAddModalVisible(false);
      form.resetFields();
      fetchUsers(selectedTenant);
    } catch (err: any) {
      message.error(err.response?.data?.detail || "Gagal menambahkan pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: any) => {
    if (!selectedTenant || resetUserId === null) return;
    try {
      setLoading(true);
      await superadminApi.resetUserPassword(selectedTenant, resetUserId, { new_password: values.new_password });
      message.success("Password berhasil direset");
      setIsResetModalVisible(false);
      resetForm.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.detail || "Gagal mereset password");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nama", dataIndex: "nama", key: "nama" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    { 
      title: "Status", 
      dataIndex: "is_active", 
      key: "is_active",
      render: (val: boolean) => (val ? "Aktif" : "Non-aktif")
    },
    {
      title: "Superadmin",
      dataIndex: "is_superadmin",
      key: "is_superadmin",
      render: (val: boolean, record: UserAdmin) => (
        <Switch 
          checked={val} 
          onChange={async (checked) => {
            if (!selectedTenant) return;
            try {
              await superadminApi.toggleUserSuperadmin(selectedTenant, record.id, checked);
              message.success(`Status superadmin ${record.nama} diperbarui`);
              fetchUsers(selectedTenant);
            } catch (err) {
              message.error("Gagal mengubah status superadmin");
            }
          }} 
        />
      )
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: UserAdmin) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            danger
            onClick={() => {
              setResetUserId(record.id);
              setIsResetModalVisible(true);
            }}
          >
            Reset Password
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>Global Users (Superadmin)</h2>
        {selectedTenant && (
          <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
            Tambah Pengguna
          </Button>
        )}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Select 
          placeholder="Pilih Tenant" 
          style={{ width: 300 }}
          onChange={(val) => setSelectedTenant(val)}
          options={tenants.map(t => ({ value: t.id, label: t.name }))}
        />
      </div>
      
      {selectedTenant && (
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id" 
          loading={loading}
        />
      )}

      {/* Modal Tambah User */}
      <Modal
        title="Tambah Pengguna Tenant"
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item name="nama" label="Nama" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="username" label="Username">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="administrator">Administrator</Select.Option>
              <Select.Option value="pimpinan">Pimpinan</Select.Option>
              <Select.Option value="operator_cc">Operator Command Center</Select.Option>
              <Select.Option value="operator_lapangan_damkar">Operator Lapangan Damkar</Select.Option>
              <Select.Option value="operator_lapangan_penyelamatan">Operator Lapangan Penyelamatan</Select.Option>
              <Select.Option value="operator_sarpras">Operator Sarpras</Select.Option>
              <Select.Option value="teknisi">Teknisi</Select.Option>
              <Select.Option value="operator_pencegahan">Operator Pencegahan</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="is_superadmin" label="Superadmin" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Reset Password */}
      <Modal
        title="Reset Password"
        open={isResetModalVisible}
        onCancel={() => {
          setIsResetModalVisible(false);
          resetForm.resetFields();
        }}
        onOk={() => resetForm.submit()}
        confirmLoading={loading}
      >
        <Form form={resetForm} layout="vertical" onFinish={handleResetPassword}>
          <Form.Item 
            name="new_password" 
            label="Password Baru" 
            rules={[{ required: true, message: 'Harap masukkan password baru' }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

