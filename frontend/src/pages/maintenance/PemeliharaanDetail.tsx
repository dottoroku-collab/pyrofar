import { PrinterOutlined, ArrowLeftOutlined, CheckCircleOutlined, ToolOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Skeleton,
  Table,
  Tag,
  Typography,
  message,
  Image,
  Space
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { armadaApi } from "@/api/armada";
import { pemeliharaanApi } from "@/api/pemeliharaan";
import type { ArmadaListItem } from "@/types/armada";
import type { Pemeliharaan } from "@/types/pemeliharaan";
import { useTokens } from "@/store/themeStore";
import { getAssetUrl } from "@/api/client";

const { Title, Text } = Typography;

export default function PemeliharaanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tokens = useTokens();

  const [data, setData] = useState<Pemeliharaan | null>(null);
  const [armada, setArmada] = useState<ArmadaListItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const result = await pemeliharaanApi.get(Number(id));
        setData(result);
        
        if (result.armada_id) {
          const armadas = await armadaApi.list({ page_size: 200 });
          const found = armadas.find(a => a.id === result.armada_id);
          if (found) setArmada(found);
        }
      } catch (err: any) {
        message.error("Gagal memuat data detail pemeliharaan");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <Skeleton active />;
  }

  if (!data) {
    return <div style={{ textAlign: "center", padding: 50 }}>Data tidak ditemukan</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <Title level={3} style={{ margin: 0, color: tokens.textPrimary }}>Detail Pemeliharaan</Title>
        </Space>
        <Button icon={<PrinterOutlined />} onClick={handlePrint} size="large" style={{ fontWeight: 600 }}>
          Print Detail
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span style={{ color: tokens.textPrimary, fontWeight: 700 }}>Informasi Pemeliharaan</span>} 
            bordered={false} 
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
          >
            <Descriptions column={{ xs: 1, sm: 1, md: 2 }} bordered size="middle">
              <Descriptions.Item label="Armada" span={2}>
                <Text strong>{armada?.kode_armada ?? `#${data.armada_id}`}</Text>
                <br />
                <Text type="secondary">{armada?.nama_armada ?? "-"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal">{dayjs(data.tanggal).format("DD/MM/YYYY")}</Descriptions.Item>
              <Descriptions.Item label="Status">
                {data.status === "selesai" ? (
                  <Tag color={tokens.success} style={{ border: 'none', fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>SELESAI</Tag>
                ) : (
                  <Tag color={tokens.warning} style={{ border: 'none', fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>PROSES</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Jenis Kendala">{data.jenis_kendala || "-"}</Descriptions.Item>
              <Descriptions.Item label="Kategori">{data.kategori || "-"}</Descriptions.Item>
              <Descriptions.Item label="Jenis Pekerjaan">{data.jenis_pekerjaan || "-"}</Descriptions.Item>
              <Descriptions.Item label="Nama Montir">{data.nama_montir || "-"}</Descriptions.Item>
              <Descriptions.Item label="Vendor">{data.vendor || "-"}</Descriptions.Item>
              <Descriptions.Item label="Total Biaya">
                <Text strong style={{ color: tokens.danger, fontSize: 16 }}>
                  {`Rp ${Number(data.biaya || 0).toLocaleString("id-ID")}`}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Keterangan" span={2}>{data.keterangan || "-"}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card 
            title={<span style={{ color: tokens.textPrimary, fontWeight: 700 }}>Daftar Sparepart Diganti</span>} 
            bordered={false} 
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: 24 }}
          >
            <Table
              dataSource={data.sparepart}
              rowKey="id"
              pagination={false}
              size="middle"
              columns={[
                { title: "Nama Sparepart", dataIndex: "nama_sparepart" },
                { title: "Merk", dataIndex: "merk" },
                { title: "Jumlah", dataIndex: "jumlah", align: "center" },
                { 
                  title: "Harga", 
                  dataIndex: "harga",
                  align: "right",
                  render: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}` 
                },
                {
                  title: "Total",
                  align: "right",
                  render: (_, r) => <Text strong>{`Rp ${Number(r.jumlah * r.harga).toLocaleString("id-ID")}`}</Text>
                }
              ]}
              locale={{ emptyText: "Tidak ada data sparepart" }}
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={<span style={{ color: tokens.textPrimary, fontWeight: 700 }}>Dokumentasi</span>} 
            bordered={false} 
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
          >
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: 'block', marginBottom: 8, color: tokens.textMuted }}>Foto Sebelum</Text>
              {data.foto_sebelum_url ? (
                <Image
                  src={getAssetUrl(data.foto_sebelum_url) ?? undefined}
                  alt="Foto Sebelum"
                  style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
                />
              ) : (
                <div style={{ padding: 32, background: tokens.surfaceHover, borderRadius: 8, textAlign: 'center', color: tokens.textMuted }}>
                  Tidak ada foto
                </div>
              )}
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, color: tokens.textMuted }}>Foto Sesudah</Text>
              {data.foto_sesudah_url ? (
                <Image
                  src={getAssetUrl(data.foto_sesudah_url) ?? undefined}
                  alt="Foto Sesudah"
                  style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
                />
              ) : (
                <div style={{ padding: 32, background: tokens.surfaceHover, borderRadius: 8, textAlign: 'center', color: tokens.textMuted }}>
                  Tidak ada foto
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
