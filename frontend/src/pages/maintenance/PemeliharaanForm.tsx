import { DeleteOutlined, InboxOutlined, PlusOutlined } from "@ant-design/icons";
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
  Table,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { armadaApi } from "@/api/armada";
import { pemeliharaanApi } from "@/api/pemeliharaan";
import type { SparepartInput } from "@/types/pemeliharaan";
import type { ArmadaListItem } from "@/types/armada";

export default function PemeliharaanForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [armadaList, setArmadaList] = useState<ArmadaListItem[]>([]);
  const [sparepartList, setSparepartList] = useState<SparepartInput[]>([]);
  const [sparepartForm] = Form.useForm<SparepartInput>();
  const [savedId, setSavedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    armadaApi.list({ page_size: 200 }).then(setArmadaList);
    const armadaIdParam = searchParams.get("armada_id");
    if (armadaIdParam) form.setFieldValue("armada_id", Number(armadaIdParam));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addSparepart(values: SparepartInput) {
    setSparepartList((prev) => [...prev, values]);
    sparepartForm.resetFields();
  }

  function removeSparepart(index: number) {
    setSparepartList((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(values: any) {
    setSaving(true);
    try {
      const payload = {
        ...values,
        tanggal: values.tanggal.format("YYYY-MM-DD"),
        sparepart: sparepartList,
      };
      const created = await pemeliharaanApi.create(payload);
      setSavedId(created.id);
      message.success("Pemeliharaan berhasil disimpan. Unggah foto sebelum/sesudah di bawah.");
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menyimpan pemeliharaan");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadFoto(jenis: "sebelum" | "sesudah", file: File) {
    if (!savedId) {
      message.warning("Simpan data pemeliharaan terlebih dahulu");
      return false;
    }
    try {
      if (jenis === "sebelum") await pemeliharaanApi.uploadFotoSebelum(savedId, file);
      else await pemeliharaanApi.uploadFotoSesudah(savedId, file);
      message.success("Foto berhasil diunggah");
    } catch {
      message.error("Gagal mengunggah foto");
    }
    return false;
  }

  async function handleTandaiSelesai() {
    if (!savedId) return;
    try {
      await pemeliharaanApi.update(savedId, { status: "selesai" } as any);
      message.success("Pemeliharaan ditandai selesai, status armada kembali Standby");
      navigate(-1);
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menandai selesai");
    }
  }

  return (
    <Card title="Input Pemeliharaan">
      <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={!!savedId}>
        <Row gutter={16}>
          <Col span={24} lg={12}>
            <Form.Item name="armada_id" label="Pilih Armada" rules={[{ required: true }]}>
              <Select
                showSearch
                size="large"
                placeholder="Cari atau pilih armada..."
                optionFilterProp="label"
                options={armadaList.map((a) => ({ label: `${a.kode_armada} — ${a.nama_armada ?? ""}`, value: a.id }))}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.armada_id !== curr.armada_id}>
          {() => {
            const armadaId = form.getFieldValue("armada_id");
            if (!armadaId) return null;
            return (
              <>
                <Row gutter={16}>
                  <Col span={24} lg={6}>
                    <Form.Item name="tanggal" label="Tanggal" initialValue={dayjs()} rules={[{ required: true }]}>
                      <DatePicker style={{ width: "100%" }} size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={6}>
                    <Form.Item name="kategori" label="Kategori">
                      <Select size="large" placeholder="Pilih Kategori">
                        <Select.Option value="Rutin">Rutin</Select.Option>
                        <Select.Option value="Perbaikan">Perbaikan</Select.Option>
                        <Select.Option value="Darurat">Darurat</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={6}>
                    <Form.Item name="vendor" label="Vendor (Bengkel)">
                      <Input size="large" placeholder="Nama Bengkel" />
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={6}>
                    <Form.Item name="nama_montir" label="Nama Montir">
                      <Input size="large" placeholder="Nama Montir" />
                    </Form.Item>
                  </Col>

                  <Col span={24} lg={12}>
                    <Form.Item
                      name="jenis_kendala"
                      label="Jenis Kendala"
                      tooltip="Keluhan atau masalah yang dialami. Contoh: Rem blong, Mesin cepat panas."
                    >
                      <Input size="large" placeholder="Contoh: Rem blong" />
                    </Form.Item>
                  </Col>
                  <Col span={24} lg={12}>
                    <Form.Item
                      name="jenis_pekerjaan"
                      label="Jenis Pekerjaan"
                      tooltip="Tindakan perbaikan yang dilakukan. Contoh: Ganti kampas rem, Kuras radiator."
                    >
                      <Input size="large" placeholder="Contoh: Ganti kampas rem" />
                    </Form.Item>
                  </Col>

                  <Col span={24} lg={12}>
                    <Form.Item
                      name="biaya"
                      label="Biaya Jasa"
                      tooltip="Biaya pengerjaan oleh montir/bengkel (tidak termasuk harga sparepart)"
                      initialValue={0}
                      rules={[{ required: true }]}
                    >
                      <InputNumber style={{ width: "100%" }} min={0} prefix="Rp" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
                
                {/* Kolom jumlah disembunyikan agar tidak membingungkan, nilai defaultnya 1 */}
                <Form.Item name="jumlah" initialValue={1} style={{ display: 'none' }}>
                  <InputNumber />
                </Form.Item>
                <Form.Item name="keterangan" label="Keterangan">
                  <Input.TextArea rows={3} size="large" />
                </Form.Item>

        <Card size="small" title="Sparepart Diganti (opsional)" style={{ marginBottom: 16 }}>
          <Table
            size="small"
            pagination={false}
            dataSource={sparepartList}
            rowKey={(_, i) => String(i)}
            columns={[
              { title: "Nama", dataIndex: "nama_sparepart" },
              { title: "Merk", dataIndex: "merk" },
              { title: "Jumlah", dataIndex: "jumlah" },
              { title: "Harga", dataIndex: "harga", render: (v) => `Rp ${v?.toLocaleString("id-ID")}` },
              {
                title: "",
                width: 40,
                render: (_, __, i) => (
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeSparepart(i)} />
                ),
              },
            ]}
          />
          <Form form={sparepartForm} layout="inline" onFinish={addSparepart} style={{ marginTop: 12 }}>
            <Form.Item name="nama_sparepart" rules={[{ required: true }]}>
              <Input placeholder="Nama sparepart" />
            </Form.Item>
            <Form.Item name="merk">
              <Input placeholder="Merk" style={{ width: 100 }} />
            </Form.Item>
            <Form.Item name="jumlah" initialValue={1} rules={[{ required: true }]}>
              <InputNumber placeholder="Jumlah" min={1} style={{ width: 90 }} />
            </Form.Item>
            <Form.Item name="harga" initialValue={0} rules={[{ required: true }]}>
              <InputNumber placeholder="Harga" min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item>
              <Button icon={<PlusOutlined />} htmlType="submit">
                Tambah
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {!savedId && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => navigate(-1)}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Simpan
            </Button>
          </div>
        )}
              </>
            );
          }}
        </Form.Item>
      </Form>

      {savedId && (
        <>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Upload.Dragger showUploadList={false} beforeUpload={(f) => handleUploadFoto("sebelum", f)}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p>Unggah Foto Sebelum</p>
              </Upload.Dragger>
            </Col>
            <Col span={12}>
              <Upload.Dragger showUploadList={false} beforeUpload={(f) => handleUploadFoto("sesudah", f)}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p>Unggah Foto Sesudah</p>
              </Upload.Dragger>
            </Col>
          </Row>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button type="primary" onClick={handleTandaiSelesai}>
              Tandai Selesai
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
