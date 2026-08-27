import { EditOutlined, EnvironmentOutlined, SwapOutlined, ToolOutlined, DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  message,
  Modal,
  QRCode,
  Row,
  Select,
  Skeleton,
  Tag,
  Timeline,
  Image,
  Tabs,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { armadaApi } from "@/api/armada";
import { jenisKendaraanApi, lokasiApi } from "@/api/masterData";
import { timelineApi } from "@/api/pemeliharaan";
import type { ArmadaPublic, StatusArmada, ArmadaFile } from "@/types/armada";
import { STATUS_KRITIS, STATUS_LABEL } from "@/types/armada";
import type { TimelineItem } from "@/types/pemeliharaan";
import type { JenisKendaraan, Lokasi } from "@/types/masterData";

export default function ArmadaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [armada, setArmada] = useState<ArmadaPublic | null>(null);
  const [jenisList, setJenisList] = useState<JenisKendaraan[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [pindahOpen, setPindahOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [pindahForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState<StatusArmada | undefined>();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [files, setFiles] = useState<ArmadaFile[]>([]);

  async function load() {
    if (!id) return;
    try {
      const [data, tm, f] = await Promise.all([
        armadaApi.get(Number(id)),
        timelineApi.get(Number(id)),
        armadaApi.listFiles(Number(id)),
      ]);
      setArmada(data);
      setTimeline(tm);
      setFiles(f);
    } catch (err: any) {
      message.error("Gagal memuat data detail armada");
    }
  }

  useEffect(() => {
    load();
    jenisKendaraanApi.list().then(setJenisList);
    lokasiApi.list().then(setLokasiList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!armada) return <Skeleton active />;

  const jenisNama = jenisList.find((j) => j.id === armada.jenis_kendaraan_id)?.nama ?? "-";
  const lokasiNama = lokasiList.find((l) => l.id === armada.lokasi_saat_ini_id)?.nama ?? "-";
  const isMenungguApproval = armada.status_armada === "menunggu_approval";

  // Categorize files
  const fotoFiles = files.filter(f => f.jenis_file.startsWith("foto_"));
  const dokumenFiles = files.filter(f => !f.jenis_file.startsWith("foto_"));

  async function handlePindahLokasi(values: { lokasi_baru_id: number; keterangan?: string }) {
    try {
      if (!armada) return;

await armadaApi.pindahLokasi(
  armada.id,
  values.lokasi_baru_id,
  values.keterangan
);
      message.success("Lokasi armada berhasil diperbarui");
      setPindahOpen(false);
      pindahForm.resetFields();
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal memindahkan lokasi");
    }
  }

  async function handleUbahStatus(values: { status_baru: StatusArmada; keterangan?: string }) {
    try {
      if (!armada) return;

await armadaApi.ubahStatus(
  armada.id,
  values.status_baru,
  values.keterangan
);
      if (STATUS_KRITIS.includes(values.status_baru)) {
        message.success("Pengajuan status kritis dikirim, menunggu approval Kabid");
      } else {
        message.success("Status armada berhasil diperbarui");
      }
      setStatusOpen(false);
      statusForm.resetFields();
      setSelectedStatus(undefined);
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal mengubah status");
    }
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code')?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.download = `QR-${armada.kode_armada}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card
          title={`${armada.kode_armada} — ${armada.nama_armada ?? jenisNama}`}
          extra={
            <div style={{ display: 'flex', gap: 8 }}>
              <Button icon={<PrinterOutlined />} onClick={handlePrint} className="no-print">
                Print
              </Button>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/armada/${armada.id}/edit`)} className="no-print">
                Edit
              </Button>
            </div>
          }
        >
          {isMenungguApproval && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="Sedang menunggu approval Kabid untuk perubahan status kritis."
            />
          )}
          <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Tag color={isMenungguApproval ? "red" : "blue"}>{STATUS_LABEL[armada.status_armada]}</Tag>
            <Tag>{lokasiNama}</Tag>
            <Button size="small" icon={<EnvironmentOutlined />} onClick={() => setPindahOpen(true)}>
              Pindah Lokasi
            </Button>
            <Button
              size="small"
              icon={<SwapOutlined />}
              disabled={isMenungguApproval}
              onClick={() => setStatusOpen(true)}
            >
              Ubah Status
            </Button>
            <Button size="small" icon={<ToolOutlined />} onClick={() => navigate(`/pemeliharaan/new?armada_id=${armada.id}`)}>
              Input Pemeliharaan
            </Button>
          </div>
          <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
            <Descriptions.Item label="Jenis Kendaraan">{jenisNama}</Descriptions.Item>
            <Descriptions.Item label="Merk / Type">
              {armada.merk} {armada.type}
            </Descriptions.Item>
            <Descriptions.Item label="Tahun">{armada.tahun ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="No. Polisi">{armada.no_polisi ?? "-"}</Descriptions.Item>

            <Descriptions.Item label="No. Mesin">{armada.no_mesin ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="No. Rangka">{armada.no_rangka ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="No. BPKB">{armada.no_bpkb ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Tanggal STNK">{armada.tanggal_stnk ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Kapasitas">{armada.kapasitas ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Status Kepemilikan">
              {armada.status_kepemilikan ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Operator Lapangan">
              {armada.operator_lapangan_id ? (
                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => navigate(`/operators/${armada.operator_lapangan_id}`)}>
                  {armada.driver_name || `Operator ID: ${armada.operator_lapangan_id}`}
                </Button>
              ) : armada.driver_name ? (
                armada.driver_name
              ) : (
                "-"
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Lampiran & Media" style={{ marginTop: 16 }}>
          <Tabs
            items={[
              {
                key: "foto",
                label: "Foto Kendaraan",
                children: fotoFiles.length > 0 ? (
                  <Image.PreviewGroup>
                    <Row gutter={[16, 16]}>
                      {fotoFiles.map(f => (
                        <Col xs={12} sm={8} key={f.id}>
                          <div style={{ textAlign: "center" }}>
                            <Image
                              src={f.file_url}
                              alt={f.jenis_file}
                              style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
                            />
                            <div style={{ marginTop: 8, fontSize: 12, textTransform: "capitalize", color: "#666" }}>
                              {f.jenis_file.replace("_", " ")}
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                ) : (
                  <Empty description="Belum ada foto yang diunggah" />
                ),
              },
              {
                key: "dokumen",
                label: "Dokumen (STNK/BPKB)",
                children: dokumenFiles.length > 0 ? (
                  <Image.PreviewGroup>
                    <Row gutter={[16, 16]}>
                      {dokumenFiles.map(f => (
                        <Col xs={24} sm={12} key={f.id}>
                          <div style={{ textAlign: "center" }}>
                            {f.file_url.endsWith(".pdf") ? (
                              <Button type="link" href={f.file_url} target="_blank">
                                Unduh {f.jenis_file.toUpperCase()} (PDF)
                              </Button>
                            ) : (
                              <>
                                <Image
                                  src={f.file_url}
                                  alt={f.jenis_file}
                                  style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8 }}
                                />
                                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "#666" }}>
                                  {f.jenis_file.toUpperCase()}
                                </div>
                              </>
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                ) : (
                  <Empty description="Belum ada dokumen yang diunggah" />
                ),
              }
            ]}
          />
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title="QR Code Armada">
          <div style={{ textAlign: "center" }} id="qr-code">
            <QRCode value={armada.qr_code_value} size={160} style={{ margin: "0 auto" }} />
            <p style={{ marginTop: 8, fontFamily: "monospace", fontSize: 12 }}>
              {armada.qr_code_value}
            </p>
            <Button
              type="dashed"
              icon={<DownloadOutlined />}
              onClick={downloadQRCode}
              style={{ marginTop: 8 }}
              className="no-print"
            >
              Unduh QR
            </Button>
          </div>
        </Card>
        <Card title="Timeline" style={{ marginTop: 16 }}>
          {timeline.length === 0 ? (
            <Empty description="Belum ada riwayat" />
          ) : (
            <Timeline
              items={timeline.map((t) => ({
                children: (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>{t.judul}</div>
                    {t.deskripsi && (
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{t.deskripsi}</div>
                    )}
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {new Date(t.tanggal).toLocaleString("id-ID")}
                    </div>
                  </div>
                ),
              }))}
            />
          )}
        </Card>
      </Col>

      <Modal
        title="Pindah Lokasi"
        open={pindahOpen}
        onCancel={() => setPindahOpen(false)}
        onOk={() => pindahForm.submit()}
        okText="Pindahkan"
        cancelText="Batal"
      >
        <Form form={pindahForm} layout="vertical" onFinish={handlePindahLokasi}>
          <Form.Item
            name="lokasi_baru_id"
            label="Lokasi Tujuan"
            rules={[{ required: true, message: "Lokasi tujuan wajib dipilih" }]}
          >
            <Select options={lokasiList.map((l) => ({ label: l.nama, value: l.id }))} />
          </Form.Item>
          <Form.Item name="keterangan" label="Keterangan">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Ubah Status Armada"
        open={statusOpen}
        onCancel={() => setStatusOpen(false)}
        onOk={() => statusForm.submit()}
        okText={selectedStatus && STATUS_KRITIS.includes(selectedStatus) ? "Ajukan Approval" : "Simpan"}
        cancelText="Batal"
      >
        <Form form={statusForm} layout="vertical" onFinish={handleUbahStatus}>
          <Form.Item
            name="status_baru"
            label="Status Baru"
            rules={[{ required: true, message: "Status wajib dipilih" }]}
          >
            <Select
              options={Object.entries(STATUS_LABEL)
                .filter(([value]) => value !== "menunggu_approval")
                .map(([value, label]) => ({ value, label }))}
              onChange={(val) => setSelectedStatus(val)}
            />
          </Form.Item>
          {selectedStatus && STATUS_KRITIS.includes(selectedStatus) && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="Status ini kritis — perubahan baru berlaku efektif setelah disetujui Kabid."
            />
          )}
          <Form.Item
            name="keterangan"
            label="Keterangan / Alasan"
            rules={[{ required: true, message: "Alasan wajib diisi" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
}
