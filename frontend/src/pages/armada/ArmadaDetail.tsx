import { EditOutlined, EnvironmentOutlined, SwapOutlined, ToolOutlined } from "@ant-design/icons";
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
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { armadaApi } from "@/api/armada";
import { jenisKendaraanApi, lokasiApi } from "@/api/masterData";
import { timelineApi } from "@/api/pemeliharaan";
import type { ArmadaPublic, StatusArmada } from "@/types/armada";
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

  async function load() {
    if (!id) return;
    setArmada(await armadaApi.get(Number(id)));
    setTimeline(await timelineApi.get(Number(id)));
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

  async function handlePindahLokasi(values: { lokasi_baru_id: number; keterangan?: string }) {
    try {
      await armadaApi.pindahLokasi(armada.id, values.lokasi_baru_id, values.keterangan);
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
      await armadaApi.ubahStatus(armada.id, values.status_baru, values.keterangan);
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

  return (
    <Row gutter={16}>
      <Col span={16}>
        <Card
          title={`${armada.kode_armada} — ${armada.nama_armada ?? jenisNama}`}
          extra={
            <Button icon={<EditOutlined />} onClick={() => navigate(`/armada/${armada.id}/edit`)}>
              Edit
            </Button>
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
          <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
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
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Jenis Kendaraan">{jenisNama}</Descriptions.Item>
            <Descriptions.Item label="Merk / Type">
              {armada.merk} {armada.type}
            </Descriptions.Item>
            <Descriptions.Item label="Tahun">{armada.tahun ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="No. Polisi">{armada.no_polisi ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="No. Lambung">{armada.no_lambung ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="No. Mesin">{armada.no_mesin ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="No. Rangka">{armada.no_rangka ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="No. BPKB">{armada.no_bpkb ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Tanggal STNK">{armada.tanggal_stnk ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Kapasitas">{armada.kapasitas ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Status Kepemilikan">
              {armada.status_kepemilikan ?? "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
      <Col span={8}>
        <Card title="QR Code Armada">
          <div style={{ textAlign: "center" }}>
            <QRCode value={armada.qr_code_value} size={160} />
            <p style={{ marginTop: 8, fontFamily: "monospace", fontSize: 12 }}>
              {armada.qr_code_value}
            </p>
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
