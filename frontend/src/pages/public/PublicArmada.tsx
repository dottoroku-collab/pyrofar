import { Button, Card, Skeleton, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicApi } from "@/api/public";
import { colors } from "@/theme/antdTheme";
import type { PublicArmada } from "@/types/public";

const { Title, Text } = Typography;

export default function PublicArmadaPage() {
  const { qrCodeValue } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicArmada | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!qrCodeValue) return;
    publicApi
      .getArmada(qrCodeValue)
      .then(setData)
      .catch(() => setNotFound(true));
  }, [qrCodeValue]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.grayPage,
      }}
    >
      <Card style={{ width: 360, textAlign: "center", borderRadius: 12 }} bodyStyle={{ padding: 28 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: colors.redPrimary,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            margin: "0 auto 12px",
            fontFamily: "Manrope, sans-serif",
          }}
        >
          SM
        </div>

        {notFound && <Text type="danger">Armada tidak ditemukan.</Text>}
        {!notFound && !data && <Skeleton active />}

        {data && (
          <>
            <Title level={4} style={{ marginBottom: 2, fontFamily: "Manrope, sans-serif" }}>
              {data.kode_armada}
            </Title>
            <Text type="secondary">
              {data.jenis} — {data.merk_type}
            </Text>
            <div style={{ margin: "14px 0" }}>
              <Tag color="blue">{data.status_armada}</Tag>
            </div>
            <div
              style={{
                fontSize: 13,
                textAlign: "left",
                background: colors.grayPage,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div>
                <b>No. Polisi:</b> {data.no_polisi ?? "-"}
              </div>
              {data.servis_terakhir && (
                <div style={{ marginTop: 6 }}>
                  <b>Servis Terakhir:</b> {data.servis_terakhir.tanggal} —{" "}
                  {data.servis_terakhir.jenis_pekerjaan ?? "-"}
                </div>
              )}
            </div>
            <Button type="primary" block style={{ marginTop: 16 }} onClick={() => navigate("/login")}>
              Login untuk Detail Lengkap
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
