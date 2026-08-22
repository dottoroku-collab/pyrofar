import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Modal, Popconfirm, Select, Switch, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { usersApi } from "@/api/users";
import type { UserAdmin, UserRole } from "@/types/user";

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: "Administrator", value: "administrator" },
  { label: "Pimpinan", value: "pimpinan" },
  { label: "Operator CC", value: "operator_cc" },
  { label: "Operator Lapangan (Damkar)", value: "operator_lapangan_damkar" },
  { label: "Operator Lapangan (Penyelamatan)", value: "operator_lapangan_penyelamatan" },
  { label: "Operator Sarpras", value: "operator_sarpras" },
  { label: "Teknisi", value: "teknisi" },
  { label: "Operator Pencegahan", value: "operator_pencegahan" },
];

export default function Pengguna() {
  const [data, setData] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserAdmin | null>(null);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      setData(await usersApi.list());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(user: UserAdmin) {
    setEditing(user);
    form.setFieldsValue({ nama: user.nama, role: user.role, is_active: user.is_active });
    setModalOpen(true);
  }

  async function handleSubmit(values: any) {
    try {
      if (editing) {
        await usersApi.update(editing.id, values);
        message.success("Pengguna berhasil diperbarui");
      } else {
        await usersApi.create(values);
        message.success("Pengguna berhasil ditambahkan");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menyimpan pengguna");
    }
  }

  async function handleDelete(id: number) {
    try {
      await usersApi.remove(id);
      message.success("Pengguna berhasil dihapus");
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menghapus pengguna");
    }
  }

  return (
    <Card
      title="Manajemen Pengguna"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tambah Pengguna
        </Button>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: "Nama", dataIndex: "nama" },
          { title: "Email", dataIndex: "email" },
          { title: "Role", dataIndex: "role", render: (v) => <Tag>{v}</Tag> },
          {
            title: "Status",
            dataIndex: "is_active",
            render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "Aktif" : "Nonaktif"}</Tag>,
          },
          {
            title: "Aksi",
            width: 120,
            render: (_, user) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(user)} />
                <Popconfirm
                  title="Hapus pengguna ini?"
                  okText="Hapus"
                  cancelText="Batal"
                  onConfirm={() => handleDelete(user.id)}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Edit Pengguna" : "Tambah Pengguna"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="nama" label="Nama" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {!editing && (
            <>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}>
                <Input.Password />
              </Form.Item>
            </>
          )}
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
          {editing && (
            <Form.Item name="is_active" label="Aktif" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
}
