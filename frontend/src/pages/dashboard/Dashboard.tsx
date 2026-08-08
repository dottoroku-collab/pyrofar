import { Card, Col, Row, Skeleton, Statistic, Table } from "antd";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyticsApi, dashboardApi } from "@/api/dashboard";
import type { DashboardSummary, PerPostoItem, RankingItem, TrenMaintenanceItem } from "@/types/dashboard";
import { colors } from "@/theme/antdTheme";

function formatRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [perPosko, setPerPosko] = useState<PerPostoItem[]>([]);
  const [tren, setTren] = useState<TrenMaintenanceItem[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);

  useEffect(() => {
    dashboardApi.summary().then(setSummary);
    dashboardApi.perPosko().then(setPerPosko);
    dashboardApi.trenMaintenance(12).then(setTren);
    analyticsApi.ranking("terburuk").then(setRanking);
  }, []);

  if (!summary) return <Skeleton active />;

  const sisaLain = Math.max(
    summary.total_armada - summary.standby - summary.pemeliharaan - summary.rusak,
    0
  );
  const donutData = [
    { name: "Standby", value: summary.standby, color: colors.greenOk },
    { name: "Pemeliharaan", value: summary.pemeliharaan, color: colors.amberWarn },
    { name: "Rusak", value: summary.rusak, color: colors.redPrimary },
    { name: "Lainnya", value: sisaLain, color: "#D1D5DB" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Armada" value={summary.total_armada} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Standby" value={summary.standby} valueStyle={{ color: colors.greenOk }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rusak (Ringan + Berat)"
              value={summary.rusak}
              valueStyle={{ color: colors.redPrimary }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Biaya Maintenance Bulan Ini"
              value={summary.biaya_maintenance_bulan_ini}
              valueStyle={{ color: colors.amberWarn, fontSize: 22 }}
              formatter={(v) => formatRupiah(Number(v))}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="Availability Armada" extra={<b>{summary.availability_pct}%</b>}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80}>
                  {donutData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="Armada per Posko">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={perPosko}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="lokasi_nama" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="jumlah" fill={colors.redPrimary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="Tren Biaya Maintenance Bulanan">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={tren}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bulan" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip formatter={(v: number) => formatRupiah(v)} />
            <Line type="monotone" dataKey="total_biaya" stroke={colors.redPrimary} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Armada Paling Sering Bermasalah (90 hari terakhir)">
        <Table
          rowKey="armada_id"
          dataSource={ranking}
          pagination={false}
          locale={{ emptyText: "Belum ada data pemeliharaan" }}
          columns={[
            { title: "Kode Armada", dataIndex: "kode_armada" },
            { title: "Jumlah Pemeliharaan", dataIndex: "jumlah_pemeliharaan" },
            {
              title: "Total Biaya",
              dataIndex: "total_biaya",
              render: (v: number) => formatRupiah(v),
            },
          ]}
        />
      </Card>
    </div>
  );
}
