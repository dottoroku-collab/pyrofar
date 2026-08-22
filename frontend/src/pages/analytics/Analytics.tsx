import React, { useEffect, useState, CSSProperties } from "react";
import { Card, Typography, Select, Row, Col, Space, Spin, Alert, List, Badge } from "antd";
import { FireFilled, InfoCircleOutlined, CheckCircleOutlined, CarOutlined } from "@ant-design/icons";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { useTokens, useThemeStore } from "@/store/themeStore";
import { apiClient } from "@/api/client";

const { Title, Text } = Typography;
const { Option } = Select;

// Colors matching the dark UI theme from the user's reference
const COLORS = ["#177ddc", "#13c2c2", "#d4b106", "#d4380d", "#52c41a"];

interface KPI {
  total_insiden: number;
  insiden_aktif: number;
  insiden_selesai: number;
  unit_tersedia: number;
}

interface AnalyticsData {
  kpi: KPI;
  per_kecamatan: any[];
  per_jenis: any[];
  tren_respons: any[];
  distribusi_jam: any[];
  recommendations: any[];
}

export default function Analytics() {
  const tokens = useTokens();
  const isDark = useThemeStore((s) => s.mode === 'dark');
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("30_days");

  useEffect(() => {
    fetchData(timeRange);
  }, [timeRange]);

  const fetchData = async (range: string) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/analytics/incidents?time_range=${range}`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle: CSSProperties = {
    background: isDark ? "#1f1f1f" : "#ffffff",
    border: isDark ? "1px solid #303030" : "1px solid #f0f0f0",
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.05)",
    marginBottom: 24
  };

  const kpiCardStyle: CSSProperties = {
    ...cardStyle,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
    padding: 16
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            Incident Analytics
          </Title>
          <Text type="secondary">Data-driven insights for strategic decision making</Text>
        </Col>
        <Col>
          <Select 
            value={timeRange} 
            onChange={(val) => setTimeRange(val)} 
            style={{ width: 180 }}
            size="large"
          >
            <Option value="daily">Hari Ini (Daily)</Option>
            <Option value="7_days">7 Hari Terakhir (Weekly)</Option>
            <Option value="30_days">30 Hari Terakhir (Monthly)</Option>
          </Select>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" />
        </div>
      ) : data ? (
        <>
          {/* KPI Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <div style={kpiCardStyle}>
                <Space align="center" style={{ marginBottom: 8 }}>
                  <div style={{ padding: 8, background: "rgba(212, 56, 13, 0.2)", borderRadius: '50%', color: "#d4380d" }}>
                    <FireFilled style={{ fontSize: 20 }} />
                  </div>
                  <Text type="secondary" strong>Total Insiden</Text>
                </Space>
                <Title level={2} style={{ margin: 0, color: "#d4380d" }}>{data.kpi.total_insiden}</Title>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={kpiCardStyle}>
                <Space align="center" style={{ marginBottom: 8 }}>
                  <div style={{ padding: 8, background: "rgba(212, 177, 6, 0.2)", borderRadius: '50%', color: "#d4b106" }}>
                    <InfoCircleOutlined style={{ fontSize: 20 }} />
                  </div>
                  <Text type="secondary" strong>Insiden Aktif</Text>
                </Space>
                <Title level={2} style={{ margin: 0, color: "#d4b106" }}>{data.kpi.insiden_aktif}</Title>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={kpiCardStyle}>
                <Space align="center" style={{ marginBottom: 8 }}>
                  <div style={{ padding: 8, background: "rgba(82, 196, 26, 0.2)", borderRadius: '50%', color: "#52c41a" }}>
                    <CheckCircleOutlined style={{ fontSize: 20 }} />
                  </div>
                  <Text type="secondary" strong>Insiden Selesai</Text>
                </Space>
                <Title level={2} style={{ margin: 0, color: "#52c41a" }}>{data.kpi.insiden_selesai}</Title>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={kpiCardStyle}>
                <Space align="center" style={{ marginBottom: 8 }}>
                  <div style={{ padding: 8, background: "rgba(23, 125, 220, 0.2)", borderRadius: '50%', color: "#177ddc" }}>
                    <CarOutlined style={{ fontSize: 20 }} />
                  </div>
                  <Text type="secondary" strong>Unit Tersedia</Text>
                </Space>
                <Title level={2} style={{ margin: 0, color: "#177ddc" }}>{data.kpi.unit_tersedia}</Title>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* Main Charts */}
            <Col xs={24} lg={16}>
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card style={cardStyle} title="Distribusi Insiden Per Jam" bordered={false}>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart data={data.distribusi_jam} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorJam" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#177ddc" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#177ddc" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#eee"} />
                          <XAxis dataKey="jam" stroke={tokens.textMuted} />
                          <YAxis stroke={tokens.textMuted} />
                          <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f1f1f' : '#fff', border: 'none', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
                          <Area type="monotone" dataKey="jumlah" stroke="#177ddc" fillOpacity={1} fill="url(#colorJam)" isAnimationActive={true} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>

                <Col span={24} md={12}>
                  <Card style={cardStyle} title="Insiden per Kecamatan" bordered={false}>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <BarChart data={data.per_kecamatan} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#eee"} />
                          <XAxis type="number" stroke={tokens.textMuted} />
                          <YAxis dataKey="kecamatan" type="category" stroke={tokens.textMuted} width={80} />
                          <Tooltip cursor={{fill: isDark ? '#333' : '#f5f5f5'}} contentStyle={{ backgroundColor: isDark ? '#1f1f1f' : '#fff', border: 'none', borderRadius: 8 }} />
                          <Bar dataKey="jumlah" fill="#13c2c2" radius={[0, 4, 4, 0]} isAnimationActive={true} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>

                <Col span={24} md={12}>
                  <Card style={cardStyle} title="Insiden per Jenis" bordered={false}>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={data.per_jenis}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="jumlah"
                            nameKey="jenis"
                            isAnimationActive={true}
                          >
                            {data.per_jenis.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f1f1f' : '#fff', border: 'none', borderRadius: 8 }} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>

            {/* Side Panel: AI Insights & Line Chart */}
            <Col xs={24} lg={8}>
              <Card style={{...cardStyle, marginBottom: 24}} title="AI Recommendations" bordered={false}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {data.recommendations.map((rec, i) => (
                    <Alert
                      key={i}
                      message={<Text strong>{rec.title}</Text>}
                      description={rec.description}
                      type={rec.type as "success" | "info" | "warning" | "error"}
                      showIcon
                      style={{ 
                        borderRadius: 8, 
                        background: isDark ? 'transparent' : undefined,
                        border: isDark ? `1px solid ${
                          rec.type === 'warning' ? '#d4b106' : 
                          rec.type === 'info' ? '#177ddc' : '#52c41a'
                        }` : undefined
                      }}
                    />
                  ))}
                  {data.recommendations.length === 0 && (
                    <Text type="secondary">Belum ada insight yang terdeteksi.</Text>
                  )}
                </div>
              </Card>

              <Card style={cardStyle} title="Tren Waktu Respons (Menit)" bordered={false}>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <LineChart data={data.tren_respons}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#eee"} />
                      <XAxis dataKey="waktu" stroke={tokens.textMuted} />
                      <YAxis stroke={tokens.textMuted} />
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f1f1f' : '#fff', border: 'none', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="rata_rata_menit" stroke="#d4b106" strokeWidth={3} isAnimationActive={true} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      ) : null}
    </div>
  );
}
