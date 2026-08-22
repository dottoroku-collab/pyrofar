import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  DashboardOutlined,
  EyeOutlined,
  PrinterOutlined
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
  Row,
  Col,
  Statistic,
  DatePicker
} from "antd";
const { RangePicker } = DatePicker;
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { armadaApi } from "@/api/armada";
import { pemeliharaanApi } from "@/api/pemeliharaan";
import type { ArmadaListItem } from "@/types/armada";
import type { Pemeliharaan } from "@/types/pemeliharaan";
import { useTokens } from "@/store/themeStore";

const { Title, Text } = Typography;

export default function PemeliharaanList() {
  const navigate = useNavigate();

  const [data, setData] = useState<Pemeliharaan[]>([]);
  const [armadaList, setArmadaList] = useState<ArmadaListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const tokens = useTokens();


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
        value ? <span style={{ color: tokens.textPrimary, fontWeight: 500 }}>{dayjs(value).format("DD/MM/YYYY")}</span> : "-",
    },
    {
      title: "Armada",
      dataIndex: "armada_id",
      key: "armada_id",
      width: 160,
      render: (value: number) => {
        const armada = armadaList.find((item) => item.id === value);
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <b style={{ color: tokens.textPrimary, fontSize: 14 }}>{armada?.kode_armada ?? `#${value}`}</b>
            <span style={{ fontSize: 12, color: tokens.textMuted }}>{armada?.nama_armada}</span>
          </div>
        );
      },
    },
    {
      title: "Kendala & Pekerjaan",
      key: "detail",
      render: (_, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text strong style={{ color: tokens.textPrimary }}>{r.jenis_kendala || "-"}</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>{r.jenis_pekerjaan || "-"}</Text>
        </div>
      ),
    },
    {
      title: "Montir",
      dataIndex: "nama_montir",
      key: "nama_montir",
      render: (value: string | null) => <span style={{ color: tokens.textPrimary, fontWeight: 500 }}>{value || "-"}</span>,
    },
    {
      title: "Biaya",
      dataIndex: "biaya",
      key: "biaya",
      align: "right",
      width: 140,
      render: (value: number) =>
        <span style={{ color: tokens.warning, fontWeight: 700, fontSize: 15 }}>{`Rp ${Number(value || 0).toLocaleString("id-ID")}`}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: Pemeliharaan["status"]) =>
        value === "selesai" ? (
          <Tag color={tokens.success} style={{ border: 'none', fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>SELESAI</Tag>
        ) : (
          <Tag color={tokens.warning} style={{ border: 'none', fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>PROSES</Tag>
        ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="middle"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/maintenance/${record.id}`)}
            style={{ color: tokens.primary, borderColor: tokens.border }}
          />
          <Popconfirm
            title="Hapus data pemeliharaan?"
            description="Data yang dihapus tidak dapat dikembalikan."
            okText="Ya, hapus"
            cancelText="Batal"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              size="middle"
              danger
              icon={<DeleteOutlined />}
              style={{ color: tokens.danger, borderColor: tokens.border }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Stats calculation
  const totalPemeliharaan = data.length;
  const inProgressCount = data.filter(d => d.status === "proses").length;
  const completedCount = data.filter(d => d.status === "selesai").length;
  const totalCost = data.reduce((sum, item) => sum + (Number(item.biaya) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: tokens.surface, borderRadius: 12, border: `1px solid ${tokens.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Statistic 
              title={<span style={{ color: tokens.textMuted, fontWeight: 600 }}>Total Aktivitas</span>}
              value={totalPemeliharaan} 
              valueStyle={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 32 }}
              prefix={<DashboardOutlined style={{ color: tokens.primary, marginRight: 8, opacity: 0.8 }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: tokens.surface, borderRadius: 12, border: `1px solid ${tokens.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Statistic 
              title={<span style={{ color: tokens.textMuted, fontWeight: 600 }}>Sedang Diproses</span>}
              value={inProgressCount} 
              valueStyle={{ color: tokens.warning, fontWeight: 800, fontSize: 32 }}
              prefix={<ToolOutlined style={{ marginRight: 8, opacity: 0.8 }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: tokens.surface, borderRadius: 12, border: `1px solid ${tokens.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Statistic 
              title={<span style={{ color: tokens.textMuted, fontWeight: 600 }}>Selesai</span>}
              value={completedCount} 
              valueStyle={{ color: tokens.success, fontWeight: 800, fontSize: 32 }}
              prefix={<CheckCircleOutlined style={{ marginRight: 8, opacity: 0.8 }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: tokens.surface, borderRadius: 12, border: `1px solid ${tokens.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Statistic 
              title={<span style={{ color: tokens.textMuted, fontWeight: 600 }}>Total Biaya</span>}
              value={totalCost} 
              formatter={(val) => `Rp ${Number(val).toLocaleString("id-ID")}`}
              valueStyle={{ color: tokens.danger, fontWeight: 800, fontSize: 20, marginTop: 12 }}
              prefix={<DollarOutlined style={{ marginRight: 8, opacity: 0.8 }} />} 
            />
          </Card>
        </Col>
      </Row>

      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 12, overflow: 'hidden' }}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              padding: '20px 24px',
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: tokens.textPrimary, fontWeight: 800 }}>Pemeliharaan Armada</h2>
              <div style={{ color: tokens.textMuted, fontSize: 13, marginTop: 4 }}>
                Riwayat dan proses pemeliharaan kendaraan operasional.
              </div>
            </div>

            <Space wrap>
              <RangePicker 
                value={dateRange} 
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])} 
                style={{ background: tokens.surfaceHover, border: `1px solid ${tokens.border}` }}
              />
              <Button
                size="large"
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
                className="no-print"
                style={{ fontWeight: 600 }}
              >
                Print
              </Button>

              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={loadData}
                loading={loading}
                style={{ background: tokens.surfaceHover, borderColor: tokens.border, color: tokens.textPrimary, fontWeight: 600 }}
              >
                Refresh
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate("/maintenance/new")}
                style={{ background: tokens.primary, borderColor: tokens.primary, fontWeight: 700 }}
              >
                Tambah Pemeliharaan
              </Button>
            </Space>
          </div>
        }
      >
        <Table<Pemeliharaan>
          rowKey="id"
          columns={columns}
          dataSource={data.filter(d => {
            if (dateRange && dateRange[0] && dateRange[1]) {
              const dDate = dayjs(d.tanggal);
              if (dDate.isBefore(dateRange[0], 'day') || dDate.isAfter(dateRange[1], 'day')) {
                return false;
              }
            }
            return true;
          })}
          loading={loading}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['20', '100', '200', '500']
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: "Belum ada data pemeliharaan",
          }}
          size="middle"
          style={{ padding: '0 16px 16px 16px', borderTop: `1px solid ${tokens.border}` }}
        />
      </Card>
    </div>
  );
}
