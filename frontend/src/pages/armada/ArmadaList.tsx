import { DeleteOutlined, EyeOutlined, PlusOutlined, CarOutlined, ToolOutlined, CheckCircleOutlined, WarningOutlined, AlertOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Popconfirm, Select, Space, Table, Tag, Row, Col, Statistic } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { armadaApi } from "@/api/armada";
import { jenisKendaraanApi, lokasiApi } from "@/api/masterData";
import type { ArmadaListItem, StatusArmada } from "@/types/armada";
import { STATUS_LABEL } from "@/types/armada";
import type { JenisKendaraan, Lokasi } from "@/types/masterData";
import { useTokens } from "@/store/themeStore";

const STATUS_COLOR: Record<StatusArmada, string> = {
  standby: "green",
  sedang_bertugas: "blue",
  pemeliharaan: "orange",
  menunggu_sparepart: "orange",
  rusak_ringan: "orange",
  rusak_berat: "red",
  tidak_aktif: "default",
  menunggu_approval: "red",
};

export default function ArmadaList() {
  const navigate = useNavigate();
  const [data, setData] = useState<ArmadaListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [jenisList, setJenisList] = useState<JenisKendaraan[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [jenisId, setJenisId] = useState<number | undefined>();
  const [lokasiId, setLokasiId] = useState<number | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const tokens = useTokens();

  const STATUS_CLASS_MAP: Record<StatusArmada, string> = {
    standby: "success",
    sedang_bertugas: "info",
    pemeliharaan: "warning",
    menunggu_sparepart: "warning",
    rusak_ringan: "warning",
    rusak_berat: "error",
    tidak_aktif: "default",
    menunggu_approval: "error",
  };

  async function load() {
    setLoading(true);
    try {
      const result = await armadaApi.list({
        q: q || undefined,
        jenis_id: jenisId,
        lokasi_id: lokasiId,
        status_armada: status,
      });
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    jenisKendaraanApi.list().then(setJenisList);
    lokasiApi.list().then(setLokasiList);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jenisId, lokasiId, status]);

  async function handleDelete(id: number) {
    try {
      await armadaApi.remove(id);
      message.success("Armada berhasil dihapus");
      load();
    } catch (err: any) {
      message.error(err?.response?.data?.detail ?? "Gagal menghapus armada");
    }
  }

  const jenisMap = Object.fromEntries(jenisList.map((j) => [j.id, j.nama]));
  const lokasiMap = Object.fromEntries(lokasiList.map((l) => [l.id, l.nama]));

  // Calculate stats
  const totalArmada = data.length;
  const standbyCount = data.filter(d => d.status_armada === "standby").length;
  const inUseCount = data.filter(d => d.status_armada === "sedang_bertugas").length;
  const maintenanceCount = data.filter(d => ["pemeliharaan", "menunggu_sparepart", "rusak_ringan", "rusak_berat"].includes(d.status_armada)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: tokens.surface, borderRadius: 12, border: `1px solid ${tokens.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Statistic 
              title={<span style={{ color: tokens.textMuted, fontWeight: 600 }}>Total Armada</span>}
              value={totalArmada} 
              valueStyle={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 32 }}
              prefix={<CarOutlined style={{ color: tokens.primary, marginRight: 8, opacity: 0.8 }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: tokens.surface, borderRadius: 12, border: `1px solid ${tokens.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Statistic 
              title={<span style={{ color: tokens.textMuted, fontWeight: 600 }}>Standby (Siap)</span>}
              value={standbyCount} 
              valueStyle={{ color: tokens.success, fontWeight: 800, fontSize: 32 }}
              prefix={<CheckCircleOutlined style={{ marginRight: 8, opacity: 0.8 }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: tokens.surface, borderRadius: 12, border: `1px solid ${tokens.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Statistic 
              title={<span style={{ color: tokens.textMuted, fontWeight: 600 }}>Sedang Bertugas</span>}
              value={inUseCount} 
              valueStyle={{ color: tokens.info, fontWeight: 800, fontSize: 32 }}
              prefix={<AlertOutlined style={{ marginRight: 8, opacity: 0.8 }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: tokens.surface, borderRadius: 12, border: `1px solid ${tokens.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Statistic 
              title={<span style={{ color: tokens.textMuted, fontWeight: 600 }}>Dalam Perbaikan / Rusak</span>}
              value={maintenanceCount} 
              valueStyle={{ color: tokens.warning, fontWeight: 800, fontSize: 32 }}
              prefix={<ToolOutlined style={{ marginRight: 8, opacity: 0.8 }} />} 
            />
          </Card>
        </Col>
      </Row>

      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 12, overflow: 'hidden' }}
        title={
          <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <h2 style={{ margin: 0, color: tokens.textPrimary, fontWeight: 800 }}>Manajemen Armada</h2>
              <div style={{ color: tokens.textMuted, fontSize: 13, marginTop: 4 }}>
                Kelola status, lokasi, dan kesiapan kendaraan operasional.
              </div>
            </div>
            <Space>
              <Button type="default" icon={<PrinterOutlined />} onClick={() => window.print()}>
                Print
              </Button>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate("/armada/new")} style={{ background: tokens.primary, fontWeight: 700 }}>
                Tambah Armada Baru
              </Button>
            </Space>
          </div>
        }
      >
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 24px", flexWrap: "wrap", gap: 10, background: tokens.surfaceHover, borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}` }}>
          <Space wrap style={{ width: '100%' }}>
            <Input.Search
              placeholder="Cari kode, no. polisi..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onSearch={load}
              style={{ width: '100%', maxWidth: 220 }}
            />
            <Select
              placeholder="Jenis: Semua"
              allowClear
              style={{ width: 160 }}
              value={jenisId}
              onChange={setJenisId}
              options={jenisList.map((j) => ({ label: j.nama, value: j.id }))}
            />
            <Select
              placeholder="Lokasi: Semua"
              allowClear
              style={{ width: 160 }}
              value={lokasiId}
              onChange={setLokasiId}
              options={lokasiList.map((l) => ({ label: l.nama, value: l.id }))}
            />
            <Select
              placeholder="Status: Semua"
              allowClear
              style={{ width: 170 }}
              value={status}
              onChange={setStatus}
              options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
            />
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          scroll={{ x: 1000 }}
          columns={[
            { title: "Kode", dataIndex: "kode_armada", render: (text) => <b style={{ color: tokens.textPrimary, fontSize: 15 }}>{text}</b> },
            { title: "Nama Kendaraan", dataIndex: "nama_armada", render: (text) => <span style={{ color: tokens.textPrimary, fontWeight: 600 }}>{text}</span> },
            { title: "Jenis", render: (_, r) => <span style={{ color: tokens.textMuted }}>{jenisMap[r.jenis_kendaraan_id] ?? "-"}</span> },
            { title: "Lokasi Posko", render: (_, r) => <span style={{ color: tokens.textPrimary }}>{r.lokasi_saat_ini_id ? lokasiMap[r.lokasi_saat_ini_id] : "-"}</span> },
            { title: "No. Polisi", dataIndex: "no_polisi", render: (text) => <Tag style={{ background: '#000', color: '#fff', border: 'none', fontWeight: 'bold' }}>{text}</Tag> },
            {
              title: "Status",
              dataIndex: "status_armada",
              render: (val: StatusArmada) => <Tag color={STATUS_COLOR[val]} style={{ fontWeight: 600, border: 'none', padding: '4px 8px', borderRadius: 6 }}>{STATUS_LABEL[val].toUpperCase()}</Tag>,
            },
            {
              title: "Jatuh Tempo STNK",
              dataIndex: "tanggal_stnk",
              render: (val: string | null) => {
                if (!val) return <span style={{ color: tokens.textMuted }}>-</span>;
                const selisih = Math.ceil((new Date(val).getTime() - Date.now()) / 86400000);
                if (selisih < 0) return <Tag color={tokens.danger} style={{ border: 'none', fontWeight: 'bold' }}>Terlewat {Math.abs(selisih)}h</Tag>;
                if (selisih <= 30) return <Tag color={tokens.warning} style={{ border: 'none', fontWeight: 'bold' }}>{selisih}h lagi</Tag>;
                return <span style={{ fontSize: 13, color: tokens.textMuted }}>{new Date(val).toLocaleDateString('id-ID')}</span>;
              },
            },
            {
              title: "Aksi",
              width: 100,
              render: (_, r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <Button size="middle" icon={<EyeOutlined />} onClick={() => navigate(`/armada/${r.id}`)} />
                  <Popconfirm
                    title="Hapus armada ini?"
                    okText="Hapus"
                    cancelText="Batal"
                    onConfirm={() => handleDelete(r.id)}
                  >
                    <Button size="middle" danger icon={<DeleteOutlined />} style={{ color: tokens.danger, borderColor: tokens.border }} />
                  </Popconfirm>
                </div>
              ),
            },
          ]}
          style={{ padding: 16 }}
          size="middle"
          pagination={{ defaultPageSize: 20, showSizeChanger: true, pageSizeOptions: ['20', '100', '200', '500'] }}
        />
      </Card>
    </div>
  );
}
