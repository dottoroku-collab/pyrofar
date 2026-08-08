import { DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Popconfirm, Select, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { armadaApi } from "@/api/armada";
import { jenisKendaraanApi, lokasiApi } from "@/api/masterData";
import type { ArmadaListItem, StatusArmada } from "@/types/armada";
import { STATUS_LABEL } from "@/types/armada";
import type { JenisKendaraan, Lokasi } from "@/types/masterData";

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

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <Space wrap>
          <Input.Search
            placeholder="Cari kode, no. polisi..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={load}
            style={{ width: 220 }}
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/armada/new")}>
          Tambah Armada
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: "Kode", dataIndex: "kode_armada" },
          { title: "Nama", dataIndex: "nama_armada" },
          { title: "Jenis", render: (_, r) => jenisMap[r.jenis_kendaraan_id] ?? "-" },
          { title: "Lokasi", render: (_, r) => (r.lokasi_saat_ini_id ? lokasiMap[r.lokasi_saat_ini_id] : "-") },
          { title: "No. Polisi", dataIndex: "no_polisi" },
          {
            title: "Status",
            dataIndex: "status_armada",
            render: (val: StatusArmada) => <Tag color={STATUS_COLOR[val]}>{STATUS_LABEL[val]}</Tag>,
          },
          {
            title: "STNK",
            dataIndex: "tanggal_stnk",
            render: (val: string | null) => {
              if (!val) return "-";
              const selisih = Math.ceil((new Date(val).getTime() - Date.now()) / 86400000);
              if (selisih < 0) return <Tag color="red">Terlewat {Math.abs(selisih)}h</Tag>;
              if (selisih <= 30) return <Tag color="orange">{selisih}h lagi</Tag>;
              return <span style={{ fontSize: 12 }}>{val}</span>;
            },
          },
          {
            title: "Aksi",
            width: 110,
            render: (_, r) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/armada/${r.id}`)} />
                <Popconfirm
                  title="Hapus armada ini?"
                  okText="Hapus"
                  cancelText="Batal"
                  onConfirm={() => handleDelete(r.id)}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
}
