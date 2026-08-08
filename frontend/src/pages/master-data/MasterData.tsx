import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Popconfirm, Table, Tabs } from "antd";
import { useEffect, useState } from "react";
import { jenisKendaraanApi, lokasiApi } from "@/api/masterData";
import type { JenisKendaraan, Lokasi, MasterDataPayload } from "@/types/masterData";

type Resource = "jenis" | "lokasi";

function ResourceTable({ resource }: { resource: Resource }) {
  const api = resource === "jenis" ? jenisKendaraanApi : lokasiApi;
  const [data, setData] = useState<(JenisKendaraan | Lokasi)[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JenisKendaraan | Lokasi | null>(null);
  const [form] = Form.useForm<MasterDataPayload>();

  async function load() {
    setLoading(true);
    try {
      setData(await api.list());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(item: JenisKendaraan | Lokasi) {
    setEditing(item);
    form.setFieldsValue({ nama: item.nama, deskripsi: item.deskripsi ?? undefined });
    setModalOpen(true);
  }

  async function handleSubmit(values: MasterDataPayload) {
    try {
      if (editing) {
        await api.update(editing.id, values);
        message.success("Data berhasil diperbarui");
      } else {
        await api.create(values);
        message.success("Data berhasil ditambahkan");
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menyimpan data");
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.remove(id);
      message.success("Data berhasil dihapus");
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menghapus data");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tambah
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={false}
        columns={[
          { title: "Nama", dataIndex: "nama" },
          { title: "Deskripsi", dataIndex: "deskripsi" },
          {
            title: "Aksi",
            width: 120,
            render: (_, item) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(item)} />
                <Popconfirm
                  title="Hapus data ini?"
                  okText="Hapus"
                  cancelText="Batal"
                  onConfirm={() => handleDelete(item.id)}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Edit Data" : "Tambah Data"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="nama" label="Nama" rules={[{ required: true, message: "Nama wajib diisi" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function MasterData() {
  return (
    <Tabs
      defaultActiveKey="jenis"
      items={[
        { key: "jenis", label: "Jenis Kendaraan", children: <ResourceTable resource="jenis" /> },
        { key: "lokasi", label: "Lokasi / Posko", children: <ResourceTable resource="lokasi" /> },
      ]}
    />
  );
}
