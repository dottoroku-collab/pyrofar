import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Descriptions, Tag, Spin, message, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { OperatorLapangan, getOperator } from "@/api/operatorLapangan";
import dayjs from "dayjs";
import { useTokens } from "@/store/themeStore";

export default function OperatorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tokens = useTokens();
  const [operator, setOperator] = useState<OperatorLapangan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOperator(parseInt(id));
    }
  }, [id]);

  const fetchOperator = async (opId: number) => {
    try {
      const res = await getOperator(opId);
      setOperator(res);
    } catch (e: any) {
      message.error("Gagal memuat detail operator");
      navigate("/operators");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !operator) {
    return <Spin style={{ display: "block", margin: "50px auto" }} />;
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/operators")}>
          Kembali
        </Button>
      </Space>

      <Card className="glass-panel" title="Detail Operator Lapangan">
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Nama Lengkap">{operator.nama}</Descriptions.Item>
          <Descriptions.Item label="NIK / NIP (Username)">{operator.nip_nik}</Descriptions.Item>
          <Descriptions.Item label="Tipe Operator">
            {operator.role === "operator_lapangan_damkar" ? (
              <Tag color="red">Pemadam Kebakaran</Tag>
            ) : (
              <Tag color="blue">Penyelamatan</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Armada yang Digunakan">
            {operator.armada ? (
              <Button type="link" onClick={() => navigate(`/armada/${operator.armada?.id}`)} style={{ padding: 0 }}>
                {operator.armada.nama_armada || "-"} ({operator.armada.no_polisi || "-"})
              </Button>
            ) : (
              <Tag>Belum di-assign</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Masa Berlaku SIM">
            {operator.sim_expiry_date ? dayjs(operator.sim_expiry_date).format("DD MMMM YYYY") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Foto Profil">
            {operator.foto_url ? (
              <img src={operator.foto_url} alt="Foto Profil" style={{ maxWidth: 100, borderRadius: 8 }} />
            ) : (
              <div style={{ color: tokens.textMuted }}>Tidak ada foto</div>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
