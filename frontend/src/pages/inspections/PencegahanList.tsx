import { Card, Table, Tag, Input, Button, Tabs, Row, Col, Typography, Space } from "antd";
import { useEffect, useState } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  PrinterOutlined
} from "@ant-design/icons";
import { apiClient } from "@/api/client";
import { useTokens } from "@/store/themeStore";
import dayjs from "dayjs";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function PencegahanList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const tokens = useTokens();
  const navigate = useNavigate();

  const fetchInspeksi = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/pencegahan/inspeksi");
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspeksi();
  }, []);

  const columns = [
    {
      title: "Tanggal Inspeksi",
      dataIndex: "tanggal_inspeksi",
      key: "tanggal_inspeksi",
      render: (val: string) => <span style={{ color: tokens.textPrimary }}>{val}</span>,
    },
    {
      title: "Objek / Bangunan",
      dataIndex: "objek_inspeksi",
      key: "objek_inspeksi",
      render: (val: string, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ color: tokens.textPrimary, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <SafetyCertificateOutlined style={{ color: tokens.primary }} />
            {record.building_name || val}
          </span>
          {record.owner_name && <Text type="secondary" style={{ fontSize: 12 }}>Pemilik: {record.owner_name}</Text>}
        </Space>
      ),
    },
    {
      title: "Alamat",
      dataIndex: "alamat",
      key: "alamat",
      render: (val: string) => <span style={{ color: tokens.textMuted }}>{val}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val: string) => {
        const statusMap: Record<string, { color: string, label: string }> = {
          pending: { color: tokens.textMuted, label: "PENDING" },
          ongoing: { color: tokens.primary, label: "ONGOING" },
          completed: { color: tokens.success, label: "COMPLETED" },
          followed_up: { color: tokens.warning, label: "FOLLOW-UP" },
        };
        const st = statusMap[val || 'pending'];
        return <Tag color={st.color} style={{ border: 'none', fontWeight: 600 }}>{st.label}</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => navigate(`/pencegahan/${record.id}`)}>
          Detail
        </Button>
      ),
    },
  ];

  const filteredData = data.filter(item => {
    let match = true;
    if (activeTab !== "all") {
      if (activeTab === "findings") {
        match = item.status_kepatuhan === "tidak_patuh" || item.status_kepatuhan === "sebagian";
      } else {
        match = (item.status || "pending") === activeTab;
      }
    }
    
    if (match && searchQuery) {
      const q = searchQuery.toLowerCase();
      const objName = (item.building_name || item.objek_inspeksi || "").toLowerCase();
      if (!objName.includes(q)) match = false;
    }

    if (match && dateRange && dateRange[0] && dateRange[1]) {
      const dDate = dayjs(item.tanggal_inspeksi);
      if (dDate.isBefore(dateRange[0], 'day') || dDate.isAfter(dateRange[1], 'day')) {
        match = false;
      }
    }

    return match;
  });

  const StatCard = ({ title, count, icon, color }: any) => (
    <Card bordered={false} style={{ background: tokens.surfaceHover, borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text type="secondary" style={{ color: tokens.textMuted, fontSize: 13 }}>{title}</Text>
          <Title level={3} style={{ margin: '4px 0 0', color: tokens.textPrimary }}>{count}</Title>
        </div>
        <div style={{ background: `${color}20`, padding: 12, borderRadius: '50%', color: color }}>
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Dashboard Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={4}>
          <StatCard title="Total Schedule" count={data.length} icon={<CalendarOutlined style={{ fontSize: 24 }}/>} color={tokens.primary} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard title="Pending" count={data.filter(d => (d.status || 'pending') === 'pending').length} icon={<ClockCircleOutlined style={{ fontSize: 24 }}/>} color={tokens.textMuted} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard title="Ongoing" count={data.filter(d => d.status === 'ongoing').length} icon={<SyncOutlined style={{ fontSize: 24 }}/>} color={tokens.primary} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard title="Findings" count={data.filter(d => d.status_kepatuhan !== 'patuh').length} icon={<WarningOutlined style={{ fontSize: 24 }}/>} color={tokens.danger} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard title="Follow-up" count={data.filter(d => d.status === 'followed_up').length} icon={<ToolOutlined style={{ fontSize: 24 }}/>} color={tokens.warning} />
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <StatCard title="Completed" count={data.filter(d => d.status === 'completed').length} icon={<CheckCircleOutlined style={{ fontSize: 24 }}/>} color={tokens.success} />
        </Col>
      </Row>

      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: `1px solid ${tokens.border}` }}>
            <h3 style={{ margin: 0, color: tokens.textPrimary }}>Daftar Inspeksi (Pencegahan)</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input 
                prefix={<SearchOutlined style={{ color: tokens.textMuted }} />} 
                placeholder="Cari objek inspeksi..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: 250, background: tokens.surfaceHover, border: `1px solid ${tokens.border}`, color: tokens.textPrimary }} 
              />
              <RangePicker 
                value={dateRange} 
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])} 
              />
              <Button type="default" icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/pencegahan/new')} style={{ background: tokens.primary, borderColor: tokens.primary }}>Inspeksi Baru</Button>
            </div>
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: '0 24px' }}
          items={[
            { key: "all", label: "Semua" },
            { key: "pending", label: "Pending" },
            { key: "ongoing", label: "Ongoing" },
            { key: "findings", label: "Findings" },
            { key: "followed_up", label: "Follow-up" },
            { key: "completed", label: "Completed" },
          ]}
        />
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ 
            defaultPageSize: 20, 
            showSizeChanger: true, 
            pageSizeOptions: ['20', '100', '200', '500'] 
          }}
          style={{ borderTop: `1px solid ${tokens.border}` }}
          size="middle"
        />
      </Card>
    </div>
  );
}
