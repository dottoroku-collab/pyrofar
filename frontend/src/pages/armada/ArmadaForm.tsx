import { InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Tabs,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { armadaApi } from "@/api/armada";
import { jenisKendaraanApi, lokasiApi } from "@/api/masterData";
import type { ArmadaPayload } from "@/types/armada";
import type { JenisKendaraan, Lokasi } from "@/types/masterData";

import { usersApi } from "@/api/users";

const DOC_TYPES = [
  { key: "stnk", label: "STNK" },
  { key: "bpkb", label: "BPKB" },
];
const FOTO_TYPES = [
  { key: "foto_depan", label: "Foto Depan" },
  { key: "foto_belakang", label: "Foto Belakang" },
  { key: "foto_kanan", label: "Foto Kanan" },
  { key: "foto_kiri", label: "Foto Kiri" },
  { key: "foto_interior", label: "Foto Interior" },
];

export default function ArmadaForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [jenisList, setJenisList] = useState<JenisKendaraan[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedArmadaId, setSavedArmadaId] = useState<number | null>(id ? Number(id) : null);

  useEffect(() => {
    jenisKendaraanApi.list().then(setJenisList);
    lokasiApi.list().then(setLokasiList);
    usersApi.list().then(setUserList);
    if (isEdit && id) {
      armadaApi.get(Number(id)).then((data) => {
        form.setFieldsValue({
          ...data,
          tanggal_stnk: data.tanggal_stnk ? dayjs(data.tanggal_stnk) : undefined,
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(values: any) {
    setSaving(true);
    const payload: ArmadaPayload = {
      ...values,
      tanggal_stnk: values.tanggal_stnk ? values.tanggal_stnk.format("YYYY-MM-DD") : undefined,
    };
    try {
      if (isEdit && id) {
        await armadaApi.update(Number(id), payload);
        message.success("Armada berhasil diperbarui");
      } else {
        const created = await armadaApi.create(payload);
        setSavedArmadaId(created.id);
        message.success("Armada berhasil ditambahkan. Silakan unggah dokumen & foto di tab berikutnya.");
      }
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menyimpan armada");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(jenisFile: string, file: File) {
    if (!savedArmadaId) {
      message.warning("Simpan data Identitas terlebih dahulu sebelum unggah file");
      return false;
    }
    try {
      await armadaApi.uploadFile(savedArmadaId, jenisFile, file);
      message.success("File berhasil diunggah");
    } catch {
      message.error("Gagal mengunggah file");
    }
    return false; // cegah Upload otomatis submit ke URL default
  }

  return (
    <Card title={isEdit ? "Edit Armada" : "Tambah Armada Baru"}>
      <Tabs
        items={[
          {
            key: "identitas",
            label: "Identitas",
            children: (
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="kode_armada" label="Kode Armada" rules={[{ required: true }]}>
                      <Input placeholder="DMK-001" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="nama_armada" label="Nama Armada">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="jenis_kendaraan_id" label="Jenis Kendaraan" rules={[{ required: true }]}>
                      <Select options={jenisList.map((j) => ({ label: j.nama, value: j.id }))} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="lokasi_saat_ini_id" label="Lokasi Awal">
                      <Select options={lokasiList.map((l) => ({ label: l.nama, value: l.id }))} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="driver_id" label="Driver">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Pilih Driver"
                        optionFilterProp="label"
                        options={userList.map((u) => ({ label: `${u.nama} (${u.role})`, value: u.id }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="merk" label="Merk">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="type" label="Type">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="tahun" label="Tahun">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="no_polisi" label="No. Polisi">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="no_lambung" label="No. Lambung">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="kapasitas" label="Kapasitas">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="no_mesin" label="No. Mesin">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="no_rangka" label="No. Rangka">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="no_bpkb" label="No. BPKB">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="tanggal_stnk" label="Tanggal STNK">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="status_kepemilikan" label="Status Kepemilikan">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <Button onClick={() => navigate("/armada")}>Batal</Button>
                  <Button type="primary" htmlType="submit" loading={saving}>
                    Simpan
                  </Button>
                </div>
              </Form>
            ),
          },
          {
            key: "dokumen",
            label: "Dokumen",
            children: (
              <Row gutter={16}>
                {DOC_TYPES.map((d) => (
                  <Col span={12} key={d.key}>
                    <Upload.Dragger
                      multiple={false}
                      beforeUpload={(file) => handleUpload(d.key, file)}
                      showUploadList={false}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p>Unggah {d.label}</p>
                    </Upload.Dragger>
                  </Col>
                ))}
              </Row>
            ),
          },
          {
            key: "foto",
            label: "Foto",
            children: (
              <Row gutter={16}>
                {FOTO_TYPES.map((f) => (
                  <Col span={8} key={f.key} style={{ marginBottom: 16 }}>
                    <Upload.Dragger
                      multiple={false}
                      accept="image/*"
                      beforeUpload={(file) => handleUpload(f.key, file)}
                      showUploadList={false}
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p>{f.label}</p>
                    </Upload.Dragger>
                  </Col>
                ))}
              </Row>
            ),
          },
        ]}
      />
    </Card>
  );
}
