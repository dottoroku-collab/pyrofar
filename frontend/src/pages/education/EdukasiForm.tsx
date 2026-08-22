import { useState } from "react";
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, Row, Col, message } from "antd";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/api/client";
import { useTokens } from "@/store/themeStore";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

export default function EdukasiForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const tokens = useTokens();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        tanggal_pelaksanaan: values.tanggal_pelaksanaan.toISOString(),
        status: "scheduled",
        dokumentasi: [] // Initialize empty
      };
      await apiClient.post("/edukasi/", payload);
      message.success("Jadwal edukasi berhasil ditambahkan");
      navigate("/edukasi");
    } catch (e) {
      console.error(e);
      message.error("Gagal menyimpan data edukasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card bordered={false} title="Tambah Jadwal Edukasi" style={{ background: tokens.surfaceHover }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item label="Kategori Kegiatan" name="kategori" rules={[{ required: true, message: "Kategori wajib diisi" }]}>
              <Select placeholder="Pilih Kategori">
                <Option value="sosialisasi_masyarakat">Sosialisasi Masyarakat</Option>
                <Option value="kunjungan_sekolah">Kunjungan Sekolah / TK</Option>
                <Option value="pelatihan">Pelatihan</Option>
                <Option value="lainnya">Lainnya</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Judul Kegiatan" name="judul_kegiatan" rules={[{ required: true, message: "Judul wajib diisi" }]}>
              <Input placeholder="Contoh: Kunjungan Edukasi TK Pertiwi" />
            </Form.Item>

            <Form.Item label="Tanggal Pelaksanaan" name="tanggal_pelaksanaan" rules={[{ required: true }]} initialValue={dayjs()}>
              <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
            </Form.Item>

            <Form.Item label="Lokasi" name="lokasi" rules={[{ required: true }]}>
              <Input placeholder="Contoh: Mako Damkar Pusat" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Target Audiens" name="target_audiens">
              <Input placeholder="Contoh: Siswa TK, Warga RW 02" />
            </Form.Item>

            <Form.Item label="Perkiraan Jumlah Peserta" name="jumlah_peserta">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Contoh: 50" />
            </Form.Item>

            <Form.Item label="Deskripsi / Catatan" name="deskripsi">
              <TextArea rows={4} placeholder="Tambahkan informasi detail atau rundown singkat..." />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <Button onClick={() => navigate("/edukasi")} style={{ marginRight: 8 }}>Batal</Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ background: tokens.primary, borderColor: tokens.primary }}>
            Simpan Jadwal
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
