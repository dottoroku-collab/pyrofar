import { Card, Table, Tag, Input, Button, Modal, Badge, Typography, DatePicker, Popconfirm, Space, message } from "antd";
const { RangePicker } = DatePicker;
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SearchOutlined, AlertOutlined, FireOutlined, MedicineBoxOutlined, RocketOutlined, PrinterOutlined, DeleteOutlined } from "@ant-design/icons";
import { apiClient } from "@/api/client";
import { useTokens } from "@/store/themeStore";
import InsidenForm from "./InsidenForm";
import dayjs from "dayjs";

const { Text } = Typography;

export default function InsidenList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const tokens = useTokens();

  const isPenyelamatan = location.pathname.startsWith("/penyelamatan") || location.pathname.startsWith("/rescue");
  const pageTitle = isPenyelamatan ? "Operasi Penyelamatan" : "Operasi Pemadaman";
  const defaultJenis = isPenyelamatan ? "penyelamatan" : "pemadaman";

  const fetchInsiden = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/insiden/?limit=1000");
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsiden();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/insiden/${id}`);
      message.success("Laporan berhasil dihapus");
      fetchInsiden();
    } catch (e) {
      console.error(e);
      message.error("Gagal menghapus laporan");
    }
  };

  // Add a simple pulse animation for waiting status
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes emergencyPulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); }
        70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
      }
      .emergency-btn {
        animation: emergencyPulse 2s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const columns = [
    {
      title: "Waktu Lapor",
      dataIndex: "waktu_lapor",
      key: "waktu_lapor",
      sorter: (a: any, b: any) => dayjs(a.waktu_lapor).valueOf() - dayjs(b.waktu_lapor).valueOf(),
      defaultSortOrder: 'descend' as const,
      render: (val: string) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong style={{ color: tokens.textPrimary }}>{dayjs(val).format('DD MMM YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(val).format('HH:mm')}</Text>
        </div>
      ),
    },
    {
      title: "Jenis & Kategori",
      key: "jenis",
      render: (_: any, record: any) => (
        <span style={{ color: tokens.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
          {record.jenis_insiden.toLowerCase() === "pemadaman" || record.jenis_insiden.toLowerCase().includes("kebakaran") ? <FireOutlined style={{ color: tokens.danger, fontSize: 18 }} /> : <MedicineBoxOutlined style={{ color: tokens.info, fontSize: 18 }} />}
          <Text strong>{record.kategori}</Text>
        </span>
      ),
    },
    {
      title: "Objek / Alamat",
      key: "objek",
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text strong style={{ color: tokens.textPrimary, fontSize: 16 }}>{record.objek}</Text>
          <Text type="secondary">{record.alamat}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_val: string, record: any) => {
        if (record.status === "menunggu") {
          if (record.is_verified === false) {
            return (
              <Badge status="warning" color="orange" text={<Text strong style={{ color: 'orange', fontSize: 14 }}>MENUNGGU VERIFIKASI</Text>} />
            );
          }
          return (
            <Badge status="processing" color="red" text={<Text strong type="danger" style={{ fontSize: 14 }}>LAPORAN DITERIMA</Text>} />
          );
        }
        if (record.status === "batal" && record.is_verified === false) {
           return <Tag color={tokens.textMuted} style={{ border: 'none', fontWeight: 600 }}>VERIFIKASI DITOLAK</Tag>;
        }
        let color = tokens.info;
        if (record.status === "selesai") color = tokens.success;
        if (record.status === "penanganan") color = tokens.warning;
        if (record.status === "batal") color = tokens.textMuted;
        if (record.status === "berangkat") color = tokens.primary;
        return <Tag color={color} style={{ border: 'none', fontWeight: 600 }}>{record.status.toUpperCase()}</Tag>;
      },
    },
    ...(!isPenyelamatan ? [{
      title: "Terdampak",
      key: "terdampak",
      render: (_: any, record: any) => (
        <Text>{record.jumlah_terdampak !== null && record.jumlah_terdampak !== undefined ? `${record.jumlah_terdampak} bgn` : "-"}</Text>
      )
    }] : []),
    {
      title: "Korban & Kerugian",
      key: "korban_kerugian",
      render: (_: any, record: any) => {
        const hasKorban = record.korban_meninggal || record.korban_luka || record.korban_kk;
        const hasKerugian = record.taksiran_kerugian || record.luas_areal;
        
        if (!hasKorban && !hasKerugian) return <Text type="secondary">-</Text>;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {record.korban_meninggal > 0 && <Text type="danger" style={{ fontSize: 12 }}>Meninggal: {record.korban_meninggal} jiwa</Text>}
            {record.korban_luka > 0 && <Text type="warning" style={{ fontSize: 12 }}>Luka: {record.korban_luka} jiwa</Text>}
            {record.korban_kk > 0 && <Text style={{ fontSize: 12 }}>Terdampak: {record.korban_kk} KK</Text>}
            {record.luas_areal > 0 && <Text style={{ fontSize: 12 }}>Luas Areal: {record.luas_areal} m²</Text>}
            {record.taksiran_kerugian > 0 && <Text strong style={{ fontSize: 12, color: tokens.textPrimary }}>Rp {Number(record.taksiran_kerugian).toLocaleString('id-ID')}</Text>}
          </div>
        );
      }
    },
    {
      title: "Waktu Respon",
      key: "waktu_respon",
      render: (_: any, record: any) => {
        if (!record.waktu_lapor || !record.waktu_tiba) return <Text type="secondary">-</Text>;
        const diffMins = dayjs(record.waktu_tiba).diff(dayjs(record.waktu_lapor), 'minute');
        return <Text>{diffMins} mnt</Text>;
      }
    },
    {
      title: "Penanganan",
      key: "penanganan",
      render: (_: any, record: any) => {
        if (!record.waktu_tiba || !record.waktu_selesai) return <Text type="secondary">-</Text>;
        const diffMins = dayjs(record.waktu_selesai).diff(dayjs(record.waktu_tiba), 'minute');
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        return <Text>{h > 0 ? `${h}j ${m}m` : `${m} mnt`}</Text>;
      }
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_: any, record: any) => {
        const isMenunggu = record.status === "menunggu";
        const butuhVerifikasi = isMenunggu && record.is_verified === false;
        
        let buttonText = "Detail";
        let buttonColor = tokens.primary;
        
        if (butuhVerifikasi) {
          buttonText = "VERIFIKASI";
          buttonColor = "orange";
        } else if (isMenunggu) {
          buttonText = "TANGANI!";
          buttonColor = tokens.danger;
        }

        return (
          <Space>
            <Button
              type="primary"
              size="large"
              icon={isMenunggu ? <RocketOutlined /> : undefined}
              onClick={() => navigate(`${isPenyelamatan ? '/rescue' : '/incidents'}/${record.id}`)}
              style={{ 
                background: buttonColor, 
                borderColor: buttonColor,
                fontWeight: 'bold',
                minWidth: 120
              }}
            >
              {buttonText}
            </Button>
            <Popconfirm
              title="Hapus laporan ini?"
              onConfirm={() => handleDelete(record.id)}
              okText="Ya, Hapus"
              cancelText="Batal"
            >
              <Button type="primary" danger size="large" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    }
  ];

  const filteredData = data.filter(d => {
    let match = true;
    const isPemadaman = d.jenis_insiden.toLowerCase() === "pemadaman" || d.jenis_insiden.toLowerCase().includes("kebakaran");
    match = isPenyelamatan ? !isPemadaman : isPemadaman;

    if (match && searchQuery) {
      const q = searchQuery.toLowerCase();
      match = d.alamat.toLowerCase().includes(q) || d.kategori.toLowerCase().includes(q);
    }

    if (match && dateRange && dateRange[0] && dateRange[1]) {
      const dDate = dayjs(d.waktu_lapor);
      if (dDate.isBefore(dateRange[0], 'day') || dDate.isAfter(dateRange[1], 'day')) {
        match = false;
      }
    }

    return match;
  }).sort((a, b) => dayjs(b.waktu_lapor).valueOf() - dayjs(a.waktu_lapor).valueOf());

  return (
    <>
      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        title={
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', gap: 16 }}>
            <h2 style={{ margin: 0, color: tokens.textPrimary, fontWeight: 800 }}>{pageTitle.toUpperCase()}</h2>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
              <Input 
                size="large"
                prefix={<SearchOutlined style={{ color: tokens.textMuted }} />} 
                placeholder="Cari alamat / kategori..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', maxWidth: 200, background: tokens.surfaceHover, border: `1px solid ${tokens.border}`, color: tokens.textPrimary }} 
              />
              <RangePicker 
                size="large"
                value={dateRange} 
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])} 
              />
              <Button type="default" size="large" icon={<PrinterOutlined />} onClick={() => window.print()}>
                Print
              </Button>
              <Button 
                type="primary" 
                size="large"
                className="emergency-btn"
                icon={<AlertOutlined style={{ fontSize: 20 }} />} 
                onClick={() => setIsModalOpen(true)} 
                style={{ 
                  background: tokens.danger, 
                  borderColor: tokens.danger, 
                  height: 50, 
                  fontSize: 16,
                  fontWeight: 800,
                  padding: '0 24px',
                  width: '100%',
                  maxWidth: 300,
                }}
              >
                TERIMA LAPORAN
              </Button>
            </div>
          </div>
        }
      >
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
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={<span style={{ fontSize: 20, fontWeight: 'bold', color: tokens.danger }}><AlertOutlined /> LAPORAN DARURAT BARU</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={700}
      >
        <InsidenForm
          defaultJenis={defaultJenis}
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchInsiden();
          }}
        />
      </Modal>
    </>
  );
}
