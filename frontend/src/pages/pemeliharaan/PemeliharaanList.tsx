import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { armadaApi } from "@/api/armada";
import { pemeliharaanApi } from "@/api/pemeliharaan";
import type { ArmadaListItem } from "@/types/armada";
import type { Pemeliharaan } from "@/types/pemeliharaan";

const { Title, Text } = Typography;

export default function PemeliharaanList() {
  const navigate = useNavigate();

  const [data, setData] = useState<Pemeliharaan[]>([]);
  const [armadaList, setArmadaList] = useState<ArmadaListItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);

    try {
      const [result, armada] = await Promise.all([
        pemeliharaanApi.list(),
        armadaApi.list({ page_size: 200 }),
      ]);

      setData(result);
      setArmadaList(armada);
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ?? "Gagal memuat data pemeliharaan"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: number) {
    try {
      await pemeliharaanApi.remove(id);
      message.success("Data pemeliharaan berhasil dihapus");
      loadData();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ?? "Gagal menghapus data pemeliharaan"
      );
    }
  }

  const columns: ColumnsType<Pemeliharaan> = [
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      width: 120,
      render: (value: string) =>
        value ? dayjs(value).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Armada",
      dataIndex: "armada_id",
      key: "armada_id",
      width: 140,
      render: (value: number) => {
        const armada = armadaList.find((item) => item.id === value);

        return armada?.kode_armada ?? `#${value}`;
      },
    },
    {
      title: "Kendala",
      dataIndex: "jenis_kendala",
      key: "jenis_kendala",
      render: (value: string | null) => value || "-",
    },
    {
      title: "Pekerjaan",
      dataIndex: "jenis_pekerjaan",
      key: "jenis_pekerjaan",
      render: (value: string | null) => value || "-",
    },
    {
      title: "Montir",
      dataIndex: "nama_montir",
      key: "nama_montir",
      render: (value: string | null) => value || "-",
    },
    {
      title: "Biaya",
      dataIndex: "biaya",
      key: "biaya",
      align: "right",
      width: 140,
      render: (value: number) =>
        `Rp ${Number(value || 0).toLocaleString("id-ID")}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: Pemeliharaan["status"]) =>
        value === "selesai" ? (
          <Tag color="green">Selesai</Tag>
        ) : (
          <Tag color="orange">Proses</Tag>
        ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Hapus data pemeliharaan?"
          description="Data yang dihapus tidak dapat dikembalikan."
          okText="Ya, hapus"
          cancelText="Batal"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Pemeliharaan Armada
          </Title>

          <Text type="secondary">
            Riwayat dan proses pemeliharaan kendaraan
          </Text>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            Refresh
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/pemeliharaan/new")}
          >
            Tambah Pemeliharaan
          </Button>
        </Space>
      </div>

      <Table<Pemeliharaan>
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: "Belum ada data pemeliharaan",
        }}
      />
    </Card>
  );
}