import { DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Card, Select, Space, Typography, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import { jenisKendaraanApi, lokasiApi } from "@/api/masterData";
import { STATUS_LABEL } from "@/types/armada";
import type { JenisKendaraan, Lokasi } from "@/types/masterData";
import { useLicense } from "@/hooks/useLicense";
import { useTokens } from "@/store/themeStore";

export default function Laporan() {
  const [jenisList, setJenisList] = useState<JenisKendaraan[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [jenisId, setJenisId] = useState<number>();
  const [lokasiId, setLokasiId] = useState<number>();
  const [status, setStatus] = useState<string>();
  const [downloading, setDownloading] = useState(false);
  const tokens = useTokens();

  const { hasFeature } = useLicense();

  useEffect(() => {
    jenisKendaraanApi.list().then(setJenisList);
    lokasiApi.list().then(setLokasiList);
  }, []);

  async function handleExport(format: "excel" | "pdf") {
    setDownloading(true);
    try {
      const response = await apiClient.get("/laporan/export", {
        params: { format, jenis_id: jenisId, lokasi_id: lokasiId, status_armada: status },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = format === "excel" ? "laporan-armada.xlsx" : "laporan-armada.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 24 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', borderBottom: `1px solid ${tokens.border}` }}>
          <FileTextOutlined style={{ fontSize: 24, color: tokens.primary }} />
          <h3 style={{ margin: 0, color: tokens.textPrimary }}>Pusat Laporan & Ekspor Data</h3>
        </div>
      }
    >
      <div style={{ background: tokens.surfaceHover, padding: 16, borderRadius: 8, border: `1px solid ${tokens.border}`, marginBottom: 24 }}>
        <Typography.Text style={{ display: 'block', marginBottom: 12, color: tokens.textMuted, fontWeight: 600 }}>Filter Laporan Armada</Typography.Text>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
        <Select
          placeholder="Jenis: Semua"
          allowClear
          style={{ width: '100%' }}
          value={jenisId}
          onChange={setJenisId}
          options={jenisList.map((j) => ({ label: j.nama, value: j.id }))}
        />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Lokasi: Semua"
              allowClear
              style={{ width: '100%' }}
              value={lokasiId}
              onChange={setLokasiId}
              options={lokasiList.map((l) => ({ label: l.nama, value: l.id }))}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Status: Semua"
              allowClear
              style={{ width: '100%' }}
              value={status}
              onChange={setStatus}
              options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
            />
          </Col>
        </Row>
      </div>

      <Space size={16}>
        {hasFeature("export_laporan") ? (
          <>
            <Button icon={<DownloadOutlined />} loading={downloading} onClick={() => handleExport("excel")}>
              Export Excel
            </Button>
            <Button icon={<DownloadOutlined />} loading={downloading} onClick={() => handleExport("pdf")}>
              Export PDF
            </Button>
          </>
        ) : (
          <Typography.Text type="secondary" style={{ fontStyle: "italic", color: tokens.textMuted }}>
            Fitur export tidak tersedia pada paket lisensi Anda.
          </Typography.Text>
        )}
      </Space>
    </Card>
  );
}
