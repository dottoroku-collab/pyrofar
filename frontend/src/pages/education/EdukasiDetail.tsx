import { useState, useEffect } from "react";
import { Card, Col, Row, Typography, Tag, Button, Spin, Space, Descriptions, Select, message } from "antd";
import { ArrowLeftOutlined, CameraOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useTokens } from "@/store/themeStore";
import { apiClient } from "@/api/client";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function EdukasiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tokens = useTokens();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/edukasi/${id}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
      message.error("Gagal memuat detail edukasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await apiClient.put(`/edukasi/${id}`, { status: newStatus });
      message.success(`Status diperbarui menjadi ${newStatus}`);
      fetchDetail();
    } catch (e) {
      message.error("Gagal memperbarui status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  if (!data) {
    return <div style={{ padding: 50, textAlign: 'center' }}>Data tidak ditemukan</div>;
  }

  const statusColors: Record<string, string> = {
    scheduled: tokens.primary,
    ongoing: tokens.warning,
    completed: tokens.success,
    cancelled: tokens.danger,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Space size="large">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/edukasi")} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Title level={4} style={{ margin: 0, color: tokens.textPrimary }}>
              {data.judul_kegiatan}
            </Title>
            <Text type="secondary">{data.kategori.replace("_", " ").toUpperCase()}</Text>
          </div>
        </Space>
        <Tag color={statusColors[data.status] || 'default'} style={{ padding: '4px 12px', fontSize: 14 }}>
          {data.status.toUpperCase()}
        </Tag>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="Informasi Kegiatan" style={{ background: tokens.surfaceHover, height: '100%' }}>
            <Descriptions column={1} size="middle">
              <Descriptions.Item label="Tanggal & Waktu">
                {dayjs(data.tanggal_pelaksanaan).format("DD MMMM YYYY, HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Lokasi">{data.lokasi}</Descriptions.Item>
              <Descriptions.Item label="Target Audiens">{data.target_audiens || '-'}</Descriptions.Item>
              <Descriptions.Item label="Perkiraan Peserta">{data.jumlah_peserta} orang</Descriptions.Item>
              <Descriptions.Item label="Deskripsi">
                {data.deskripsi || <Text type="secondary">Tidak ada deskripsi</Text>}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24, borderTop: `1px solid ${tokens.border}`, paddingTop: 16 }}>
              <Text strong>Ubah Status Kegiatan:</Text>
              <div style={{ marginTop: 8 }}>
                <Select
                  value={data.status}
                  style={{ width: 200 }}
                  onChange={handleUpdateStatus}
                  loading={updating}
                >
                  <Select.Option value="scheduled">Scheduled</Select.Option>
                  <Select.Option value="ongoing">Ongoing</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card bordered={false} title="Dokumentasi" style={{ background: tokens.surfaceHover, height: '100%' }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {data.dokumentasi && data.dokumentasi.length > 0 ? (
                data.dokumentasi.map((doc: any, i: number) => (
                  <img key={i} src={doc.url} alt={`Dokumentasi ${i}`} style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }} />
                ))
              ) : (
                <div style={{ width: '100%', height: 200, border: `1px dashed ${tokens.border}`, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: tokens.textMuted }}>
                  <CameraOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                  <div>Belum ada dokumentasi yang diunggah</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <Button type="dashed" block icon={<CameraOutlined />}>
                Unggah Foto / Laporan
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
