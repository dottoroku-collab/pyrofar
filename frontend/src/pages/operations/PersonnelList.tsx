import React, { useEffect, useState } from "react";
import { Card, Typography, Table, Button, Space, Modal, Form, Input, Select, message, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";
import { 
  getPersonils, createPersonil, updatePersonil, deletePersonil, Personil,
  getRegus, Regu 
} from "@/api/operations";

const { Title } = Typography;

export default function PersonnelList() {
  const [personils, setPersonils] = useState<Personil[]>([]);
  const [regus, setRegus] = useState<Regu[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([
        getPersonils(),
        getRegus()
      ]);
      setPersonils(p);
      setRegus(r);
    } catch (error) {
      message.error("Gagal memuat data personil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) await updatePersonil(editingId, values);
      else await createPersonil(values);
      message.success("Berhasil menyimpan Personil");
      setIsModalVisible(false);
      loadData();
    } catch (error: any) { 
      message.error(error.response?.data?.detail || "Gagal menyimpan Personil"); 
    }
  };

  const handleDel = async (id: number) => {
    try {
      await deletePersonil(id);
      message.success("Berhasil menghapus personil");
      loadData();
    } catch { message.error("Gagal menghapus"); }
  };

  const columns = [
    { title: "NIP / NIK", dataIndex: "nip_nik" },
    { title: "Nama Lengkap", dataIndex: "nama_lengkap" },
    { title: "Jabatan", dataIndex: "jabatan", render: (val: string) => <Tag color="blue">{val.toUpperCase()}</Tag> },
    { title: "Regu", render: (_: any, record: Personil) => record.regu?.nama || "-" },
    { title: "Pleton", render: (_: any, record: Personil) => record.regu?.pleton?.nama || "-" },
    { title: "Status", dataIndex: "is_active", render: (val: boolean) => <Tag color={val ? "success" : "default"}>{val ? "Aktif" : "Nonaktif"}</Tag> },
    { title: "Aksi", render: (_: any, record: Personil) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => { setEditingId(record.id); form.setFieldsValue(record); setIsModalVisible(true); }} />
        <Button danger icon={<DeleteOutlined />} onClick={() => handleDel(record.id)} />
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <TeamOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <Title level={3} style={{ margin: 0 }}>Manajemen Personil Pemadam</Title>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); form.setFieldsValue({ is_active: true }); setIsModalVisible(true); }}>
            Tambah Personil
          </Button>
        </div>

        <Table 
          dataSource={personils} 
          rowKey="id" 
          loading={loading}
          columns={columns}
        />
      </Card>

      <Modal title={editingId ? "Edit Personil" : "Tambah Personil"} open={isModalVisible} onOk={() => form.submit()} onCancel={() => setIsModalVisible(false)}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="nip_nik" label="NIP / NIK" rules={[{ required: true }]}>
            <Input disabled={!!editingId} placeholder="Digunakan sebagai username login" />
          </Form.Item>
          {!editingId && (
            <Form.Item name="password" label="Password Opsional" tooltip="Jika dikosongkan, password akan sama dengan NIP/NIK">
              <Input.Password placeholder="Default: sama dengan NIP/NIK" />
            </Form.Item>
          )}
          <Form.Item name="nama_lengkap" label="Nama Lengkap" rules={[{ required: true }]}><Input /></Form.Item>
          
          <Form.Item name="email" label="Email (Opsional)"><Input type="email" /></Form.Item>
          
          <Form.Item name="jabatan" label="Jabatan" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="danki">Komandan Kompi (Danki)</Select.Option>
              <Select.Option value="danton">Komandan Pleton (Danton)</Select.Option>
              <Select.Option value="danru">Komandan Regu (Danru)</Select.Option>
              <Select.Option value="operator">Operator Lapangan</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="regu_id" label="Regu">
            <Select allowClear>
              {regus.map(r => <Select.Option key={r.id} value={r.id}>{r.nama} ({r.pleton?.nama})</Select.Option>)}
            </Select>
          </Form.Item>
          
          <Form.Item name="is_active" label="Status Aktif" valuePropName="checked">
            <Select>
              <Select.Option value={true}>Aktif</Select.Option>
              <Select.Option value={false}>Nonaktif</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
