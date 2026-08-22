import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, message } from "antd";
import { apiClient as api } from "@/api/client";

const { Option } = Select;

export interface Komunitas {
  id: string;
  nama: string;
  lokasi: string;
  jumlah_anggota: number;
  status: string;
  kontak_utama?: string;
  nomor_telepon?: string;
}

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Komunitas | null;
}

export default function KomunitasForm({ visible, onCancel, onSuccess, initialData }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue(initialData);
    } else if (visible && !initialData) {
      form.resetFields();
    }
  }, [visible, initialData, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      if (initialData) {
        await api.put(`/relawan/komunitas/${initialData.id}`, values);
        message.success("Komunitas berhasil diperbarui");
      } else {
        await api.post("/relawan/komunitas", values);
        message.success("Komunitas berhasil ditambahkan");
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      message.error("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? "Edit Komunitas" : "Tambah Komunitas"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Simpan"
      cancelText="Batal"
      okButtonProps={{ style: { background: '#0ea5e9', borderColor: '#0ea5e9' } }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="nama" label="Nama Komunitas" rules={[{ required: true, message: "Harap masukkan nama komunitas" }]}>
          <Input placeholder="Contoh: Nelayan Peduli Lingkungan" />
        </Form.Item>
        <Form.Item name="lokasi" label="Lokasi / Wilayah" rules={[{ required: true, message: "Harap masukkan lokasi" }]}>
          <Input placeholder="Contoh: Muara Angke" />
        </Form.Item>
        <Form.Item name="jumlah_anggota" label="Jumlah Anggota" rules={[{ required: true, message: "Harap masukkan jumlah anggota" }]}>
          <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
        </Form.Item>
        <Form.Item name="status" label="Status Kemitraan" initialValue="active">
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>
        <Form.Item name="kontak_utama" label="Kontak Utama (Penanggung Jawab)">
          <Input placeholder="Nama Penanggung Jawab" />
        </Form.Item>
        <Form.Item name="nomor_telepon" label="Nomor Telepon">
          <Input placeholder="0812xxxxxx" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
