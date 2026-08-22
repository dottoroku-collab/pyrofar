import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input, Select, Tag } from "antd";
import { superadminApi } from "@/api/superadmin";
import { TenantPublic } from "@/types/tenant";

export default function TenantsDashboard() {
  const [tenants, setTenants] = useState<TenantPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const [isLicenseModalVisible, setIsLicenseModalVisible] = useState(false);
  const [licenseForm] = Form.useForm();
  const [generatedLicense, setGeneratedLicense] = useState<{
    license_key: string;
    license_id: string;
    expires_at: string;
  } | null>(null);

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

  const handleGenerateLicense = () => {
    licenseForm.resetFields();
    setGeneratedLicense(null);
    setIsLicenseModalVisible(true);
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

  const handleLicenseModalOk = async () => {
    try {
      const values = await licenseForm.validateFields();
      const res = await superadminApi.generateLicense(values);
      message.success("Lisensi berhasil digenerate!");
      setGeneratedLicense(res);
    } catch (error) {
      console.error(error);
      message.error("Gagal men-generate lisensi.");
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
        <Space>
          <Button type="default" onClick={handleGenerateLicense}>Generate License</Button>
          <Button type="primary" onClick={handleAdd}>Tambah Tenant</Button>
        </Space>
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
          <Form.Item name="plan_code" label="Plan Code" initialValue="BASIC">
            <Select>
              <Select.Option value="BASIC">BASIC</Select.Option>
              <Select.Option value="PRO">PRO</Select.Option>
              <Select.Option value="ENTERPRISE">ENTERPRISE</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Generate License"
        open={isLicenseModalVisible}
        onOk={handleLicenseModalOk}
        onCancel={() => {
          setIsLicenseModalVisible(false);
          setGeneratedLicense(null);
        }}
        okText="Generate"
      >
        {generatedLicense ? (
          <div>
            <p><strong>License ID:</strong> {generatedLicense.license_id}</p>
            <p><strong>Expires At:</strong> {new Date(generatedLicense.expires_at).toLocaleDateString()}</p>
            <p><strong>License Key:</strong></p>
            <Input.TextArea 
              rows={4} 
              value={generatedLicense.license_key} 
              readOnly 
              onClick={(e) => (e.target as HTMLTextAreaElement).select()} 
            />
            <p style={{ marginTop: 10, color: 'gray', fontSize: 12 }}>
              Salin License Key di atas dan berikan ke Tenant untuk diaktifkan.
            </p>
          </div>
        ) : (
          <Form form={licenseForm} layout="vertical">
            <Form.Item name="plan_code" label="Paket Lisensi" rules={[{ required: true }]} initialValue="BASIC">
              <Select>
                <Select.Option value="BASIC">BASIC</Select.Option>
                <Select.Option value="PRO">PRO</Select.Option>
                <Select.Option value="ENTERPRISE">ENTERPRISE</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="organization_name" label="Nama Organisasi" rules={[{ required: true }]}>
              <Input placeholder="Misal: PT Armada Jaya" />
            </Form.Item>
            <Form.Item name="years" label="Masa Berlaku (Tahun)" rules={[{ required: true }]} initialValue={1}>
              <Input type="number" min={1} max={10} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
