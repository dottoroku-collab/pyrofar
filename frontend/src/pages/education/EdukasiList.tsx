import { useState, useEffect } from "react";
import { Table, Button, Card, Typography, Row, Col, Statistic, Space, Tag, Input, Modal, message, DatePicker } from "antd";
const { RangePicker } = DatePicker;
import { PlusOutlined, SearchOutlined, EyeOutlined, DeleteOutlined, TeamOutlined, ScheduleOutlined, CheckCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTokens } from "@/store/themeStore";
import { apiClient } from "@/api/client";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function EdukasiList() {
  const navigate = useNavigate();
  const tokens = useTokens();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/edukasi/");
      setData(res.data);
    } catch (e) {
      console.error(e);
      message.error("Gagal memuat data edukasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Hapus Data Edukasi',
      content: 'Apakah Anda yakin ingin menghapus data ini?',
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await apiClient.delete(`/edukasi/${id}`);
          message.success("Data berhasil dihapus");
          fetchData();
        } catch (e) {
          message.error("Gagal menghapus data");
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: tokens.primary,
      ongoing: tokens.warning,
      completed: tokens.success,
      cancelled: tokens.danger,
    };
    return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
  };

  const getKategoriTag = (kategori: string) => {
    const labels: Record<string, string> = {
      sosialisasi_masyarakat: "Sosialisasi Masyarakat",
      kunjungan_sekolah: "Kunjungan Sekolah / TK",
      pelatihan: "Pelatihan",
      lainnya: "Lainnya"
    };
    return <Tag>{labels[kategori] || kategori}</Tag>;
  };

  const columns = [
    {
      title: "Kegiatan",
      dataIndex: "judul_kegiatan",
      key: "judul_kegiatan",
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: tokens.textMuted }}>{getKategoriTag(record.kategori)}</div>
        </div>
      ),
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal_pelaksanaan",
      key: "tanggal_pelaksanaan",
      render: (val: string) => dayjs(val).format("DD MMM YYYY, HH:mm"),
    },
    {
      title: "Lokasi",
      dataIndex: "lokasi",
      key: "lokasi",
    },
    {
      title: "Peserta",
      dataIndex: "jumlah_peserta",
      key: "jumlah_peserta",
      render: (val: number) => <Space><TeamOutlined /> {val} orang</Space>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/edukasi/${record.id}`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(d => {
    let match = true;
    if (search) {
      match = d.judul_kegiatan.toLowerCase().includes(search.toLowerCase()) || d.lokasi.toLowerCase().includes(search.toLowerCase());
    }
    if (match && dateRange && dateRange[0] && dateRange[1]) {
      const dDate = dayjs(d.tanggal_pelaksanaan);
      if (dDate.isBefore(dateRange[0], 'day') || dDate.isAfter(dateRange[1], 'day')) {
        match = false;
      }
    }
    return match;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: tokens.surfaceHover }}>
            <Statistic
              title="Total Kegiatan"
              value={data.length}
              prefix={<ScheduleOutlined style={{ color: tokens.primary }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: tokens.surfaceHover }}>
            <Statistic
              title="Terjadwal"
              value={data.filter(d => d.status === 'scheduled').length}
              prefix={<ScheduleOutlined style={{ color: tokens.warning }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: tokens.surfaceHover }}>
            <Statistic
              title="Selesai"
              value={data.filter(d => d.status === 'completed').length}
              prefix={<CheckCircleOutlined style={{ color: tokens.success }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ background: tokens.surfaceHover }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <Space>
            <Title level={4} style={{ margin: 0, color: tokens.textPrimary }}>Daftar Kegiatan Edukasi</Title>
            <Input
              placeholder="Cari kegiatan/lokasi..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 250, marginLeft: 16 }}
            />
            <RangePicker 
              value={dateRange} 
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])} 
            />
          </Space>
          <Space>
            <Button type="default" icon={<PrinterOutlined />} onClick={() => window.print()}>
              Print
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/edukasi/new")} style={{ background: tokens.primary, borderColor: tokens.primary }}>
              Tambah Edukasi
            </Button>
          </Space>
        </div>

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
        />
      </Card>
    </div>
  );
}
