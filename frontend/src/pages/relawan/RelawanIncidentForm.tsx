import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, DatePicker, message } from "antd";
import { apiClient as api } from "@/api/client";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

export interface InsidenRelawan {
  id: string;
  judul: string;
  tanggal: string;
  lokasi: string;
  skala: string;
  status: string;
  deskripsi?: string;
  jumlah_korban?: number;
}

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: InsidenRelawan | null;
}

export default function RelawanIncidentForm({ visible, onCancel, onSuccess, initialData }: Props) {
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
        tanggal: values.tanggal ? values.tanggal.toISOString() : null
      };

      if (initialData) {
        await api.put(`/relawan/insiden/${initialData.id}`, payload);
        message.success("Insiden berhasil diperbarui");
      } else {
        await api.post("/relawan/insiden", payload);
        message.success("Insiden berhasil ditambahkan");
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
      title={initialData ? "Edit Insiden" : "Tambah Insiden"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Simpan"
      cancelText="Batal"
      okButtonProps={{ style: { background: '#0ea5e9', borderColor: '#0ea5e9' } }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="judul" label="Judul Insiden" rules={[{ required: true, message: "Harap masukkan judul insiden" }]}>
          <Input placeholder="Contoh: Kapal Nelayan Terbakar" />
        </Form.Item>
        <Form.Item name="tanggal" label="Tanggal Kejadian" rules={[{ required: true, message: "Harap pilih waktu kejadian" }]}>
          <DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        <Form.Item name="lokasi" label="Lokasi" rules={[{ required: true, message: "Harap masukkan lokasi" }]}>
          <Input placeholder="Contoh: Perairan Utara Jakarta" />
        </Form.Item>
        <Form.Item name="skala" label="Skala Insiden" initialValue="kecil">
          <Select>
            <Option value="kecil">Kecil</Option>
            <Option value="menengah">Menengah</Option>
            <Option value="besar">Besar</Option>
          </Select>
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue="aktif">
          <Select>
            <Option value="aktif">Aktif</Option>
            <Option value="teratasi">Teratasi</Option>
          </Select>
        </Form.Item>
        <Form.Item name="jumlah_korban" label="Jumlah Korban (Jika ada)">
          <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
        </Form.Item>
        <Form.Item name="deskripsi" label="Deskripsi">
          <TextArea rows={4} placeholder="Detail kejadian..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
