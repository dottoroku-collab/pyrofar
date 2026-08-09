import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import { jenisKendaraanApi, lokasiApi } from "@/api/masterData";
import { STATUS_LABEL } from "@/types/armada";
import type { JenisKendaraan, Lokasi } from "@/types/masterData";
import { useLicense } from "@/hooks/useLicense";

export default function Laporan() {
  const [jenisList, setJenisList] = useState<JenisKendaraan[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);
  const [jenisId, setJenisId] = useState<number>();
  const [lokasiId, setLokasiId] = useState<number>();
  const [status, setStatus] = useState<string>();
  const [downloading, setDownloading] = useState(false);

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
    <Card title="Laporan Armada">
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="Jenis: Semua"
          allowClear
          style={{ width: 180 }}
          value={jenisId}
          onChange={setJenisId}
          options={jenisList.map((j) => ({ label: j.nama, value: j.id }))}
        />
        <Select
          placeholder="Lokasi: Semua"
          allowClear
          style={{ width: 180 }}
          value={lokasiId}
          onChange={setLokasiId}
          options={lokasiList.map((l) => ({ label: l.nama, value: l.id }))}
        />
        <Select
          placeholder="Status: Semua"
          allowClear
          style={{ width: 180 }}
          value={status}
          onChange={setStatus}
          options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
        />
      </Space>

      <Space>
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
          <Typography.Text type="secondary" style={{ fontStyle: "italic" }}>
            Fitur export tidak tersedia pada paket lisensi Anda.
          </Typography.Text>
        )}
      </Space>
    </Card>
  );
}
