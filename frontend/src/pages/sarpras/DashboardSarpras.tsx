import { Card, Col, Row, Skeleton, Statistic, Typography, Tag, Space, Badge } from "antd";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import { useTokens } from "@/store/themeStore";
import { useLicense } from "@/hooks/useLicense";
import "@/styles/dashboard-animation.css";
import {
  FundProjectionScreenOutlined,
  FireOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  ToolOutlined,
  DatabaseOutlined
} from "@ant-design/icons";

const { Text } = Typography;

function formatRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardSarpras() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [perPosko, setPerPosko] = useState<PerPostoItem[]>([]);
  const [tren, setTren] = useState<TrenMaintenanceItem[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  
  const tokens = useTokens();
  const { isActive, hasFeature, loading: licenseLoading } = useLicense();

  useEffect(() => {
    dashboardApi.summary().then(setSummary).catch(() => {});
    dashboardApi.perPosko().then(setPerPosko).catch(() => {});
    dashboardApi.trenMaintenance(12).then(setTren).catch(() => {});
    analyticsApi.ranking("terburuk").then(setRanking).catch(() => {});
  }, []);

  if (!summary) return (
    <div style={{ padding: 24, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Skeleton active paragraph={{ rows: 10 }} />
    </div>
  );

  const donutData = [
    { name: "Standby", value: summary.standby, color: tokens.success },
    { name: "Rusak", value: summary.rusak, color: tokens.danger },
  ];

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="dashboard-container" 
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Header section with futuristic vibe */}
      <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.primary}80)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 8px 32px ${tokens.primary}40`
          }}>
            <DatabaseOutlined className="pulse-icon" style={{ fontSize: 28, color: "#fff" }} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: tokens.textPrimary, fontFamily: "Inter, sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>DASHBOARD SARPRAS</h2>
            <Text style={{ color: tokens.textMuted, fontSize: 14 }}>Real-time Facilities & Infrastructure</Text>
          </div>
        </div>
        <Space>
          {!licenseLoading && (
            <Tag color={isActive ? tokens.success : tokens.danger} style={{ padding: "6px 16px", borderRadius: 20, border: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <SafetyCertificateOutlined />
              {isActive ? "Sistem Aktif & Terlindungi" : "Lisensi Kadaluarsa"}
            </Tag>
          )}
        </Space>
      </motion.div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="glass-panel gradient-card-1" bordered={false} style={{ border: 'none', borderRadius: 16, overflow: 'hidden' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Armada</span>}
                value={summary.total_armada}
                valueStyle={{ color: 'white', fontWeight: 800, fontSize: 36, marginTop: 8 }}
                prefix={<AlertOutlined style={{ opacity: 0.8, marginRight: 12 }} />}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="glass-panel gradient-card-3" bordered={false} style={{ border: 'none', borderRadius: 16, overflow: 'hidden' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Siap Operasi (Standby)</span>}
                value={summary.standby}
                valueStyle={{ color: 'white', fontWeight: 800, fontSize: 36, marginTop: 8 }}
                prefix={<FireOutlined style={{ opacity: 0.8, marginRight: 12 }} />}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="glass-panel" bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
              <Statistic
                title={<span style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Armada Rusak</span>}
                value={summary.rusak}
                prefix={<ToolOutlined className="pulse-icon" style={{ color: tokens.danger, marginRight: 12 }} />}
                valueStyle={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 36, marginTop: 8 }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="glass-panel" bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
              <Statistic
                title={<span style={{ color: tokens.textMuted, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biaya Maintenance</span>}
                value={summary.biaya_maintenance_bulan_ini}
                prefix={<MedicineBoxOutlined style={{ color: tokens.warning, marginRight: 12 }} />}
                valueStyle={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 24, marginTop: 16 }}
                formatter={(v) => formatRupiah(Number(v))}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} style={{ height: "100%" }}>
            <Card className="glass-panel" title={<span style={{ fontWeight: 700, color: tokens.textPrimary }}>Availability Armada</span>} bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface, height: "100%" }} extra={<Badge status={summary.availability_pct > 80 ? "success" : "warning"} text={<b style={{ color: tokens.textPrimary }}>{summary.availability_pct}%</b>} />}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={95} paddingAngle={5}>
                    {donutData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.textPrimary }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={16}>
          <motion.div variants={itemVariants} style={{ height: "100%" }}>
            <Card className="glass-panel" title={<span style={{ fontWeight: 700, color: tokens.textPrimary }}>Distribusi Armada per Posko</span>} bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface, height: "100%" }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={perPosko} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.border} />
                  <XAxis dataKey="lokasi_nama" fontSize={12} stroke={tokens.textMuted} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} allowDecimals={false} stroke={tokens.textMuted} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: tokens.primary + '1A' }} contentStyle={{ borderRadius: 8, background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.textPrimary }} />
                  <Bar dataKey="jumlah" fill={tokens.primary} radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {perPosko.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? tokens.primary : tokens.primary + 'CC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Advanced Chart Row */}
      {hasFeature("analytics") && (
        <motion.div variants={itemVariants}>
          <Card className="glass-panel" title={<span style={{ fontWeight: 700, color: tokens.textPrimary }}>Tren Biaya Maintenance Bulanan</span>} bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 16, background: tokens.surface }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={tren} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tokens.danger} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={tokens.danger} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.border} />
                <XAxis dataKey="bulan" fontSize={12} stroke={tokens.textMuted} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} stroke={tokens.textMuted} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v/1000000}M`} />
                <Tooltip formatter={(v: number) => formatRupiah(v)} contentStyle={{ borderRadius: 8, background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.textPrimary }} />
                <Line type="monotone" dataKey="total_biaya" stroke={tokens.danger} strokeWidth={3} dot={{ r: 4, fill: tokens.danger, strokeWidth: 2, stroke: tokens.surface }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

    </motion.div>
  );
}
