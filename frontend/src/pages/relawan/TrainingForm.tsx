import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from "antd";
import { apiClient as api } from "@/api/client";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

export interface Pelatihan {
  id: string;
  nama: string;
  tanggal: string;
  kapasitas: number;
  peserta_terdaftar: number;
  status: string;
  lokasi?: string;
  deskripsi?: string;
}

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Pelatihan | null;
}

export default function TrainingForm({ visible, onCancel, onSuccess, initialData }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue({
        ...initialData,
        tanggal: initialData.tanggal ? dayjs(initialData.tanggal) : null
      });
    } else if (visible && !initialData) {
      form.resetFields();
    }
  }, [visible, initialData, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        tanggal: values.tanggal ? values.tanggal.format("YYYY-MM-DD") : null
      };

      if (initialData) {
        await api.put(`/relawan/pelatihan/${initialData.id}`, payload);
        message.success("Pelatihan berhasil diperbarui");
      } else {
        await api.post("/relawan/pelatihan", payload);
        message.success("Pelatihan berhasil ditambahkan");
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
      title={initialData ? "Edit Pelatihan" : "Tambah Pelatihan"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Simpan"
      cancelText="Batal"
      okButtonProps={{ style: { background: '#0ea5e9', borderColor: '#0ea5e9' } }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="nama" label="Nama Pelatihan" rules={[{ required: true, message: "Harap masukkan nama pelatihan" }]}>
          <Input placeholder="Contoh: Pelatihan Pertolongan Pertama" />
        </Form.Item>
        <Form.Item name="tanggal" label="Tanggal Pelaksanaan" rules={[{ required: true, message: "Harap pilih tanggal" }]}>
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="lokasi" label="Lokasi">
          <Input placeholder="Contoh: Pantai Losari" />
        </Form.Item>
        <Form.Item name="kapasitas" label="Kapasitas Maksimal" rules={[{ required: true, message: "Harap masukkan kapasitas" }]}>
          <InputNumber min={1} style={{ width: "100%" }} placeholder="50" />
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue="upcoming">
          <Select>
            <Option value="upcoming">Upcoming</Option>
            <Option value="ongoing">Ongoing</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </Form.Item>
        <Form.Item name="deskripsi" label="Deskripsi">
          <TextArea rows={4} placeholder="Detail pelatihan..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
