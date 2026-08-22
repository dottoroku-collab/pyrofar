import { useEffect, useState } from "react";
import {
  Card, Typography, Spin, Space, Descriptions,
  Tag, Progress, Button, Alert, Modal, Input, message
} from "antd";
import {
  CloudServerOutlined, CheckCircleOutlined,
  CloseCircleOutlined, KeyOutlined
} from "@ant-design/icons";
import { apiClient } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { useTokens } from "@/store/themeStore";

const { Title, Text, Paragraph } = Typography;

interface LicenseInfo {
  id: number;
  license_id: string;
  plan_code: string;
  plan_name: string;
  organization_name: string;
  issued_at: string;
  expires_at: string;
  max_users: number | null;
  max_armada: number | null;
  features: string[];
  is_active: boolean;
}

interface LicenseStatus {
  activated: boolean;
  license: LicenseInfo | null;
}

export default function Subscription() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LicenseStatus | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [activating, setActivating] = useState(false);
  const tokens = useTokens();

  const fetchLicense = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<LicenseStatus>("/license");
      setStatus(res.data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicense();
  }, []);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      message.error("Masukkan kunci lisensi");
      return;
    }
    setActivating(true);
    try {
      const res = await apiClient.post<LicenseStatus>("/license/activate", {
        license_key: licenseKey
      });
      setStatus(res.data);
      setIsModalVisible(false);
      setLicenseKey("");
      message.success("Lisensi berhasil diaktifkan");
    } catch (error: any) {
      console.error(error);
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  const lic = status?.license;
  const isExpired = lic ? new Date(lic.expires_at) < new Date() : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Space direction="vertical" size="large" style={{ display: "flex" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CloudServerOutlined style={{ fontSize: 24, color: tokens.primary }} />
            <h2 style={{ margin: 0, color: tokens.textPrimary, fontFamily: "Manrope, sans-serif" }}>Langganan & Lisensi</h2>
          </div>
          {user?.role === "administrator" && (
            <Button
              type="primary"
              icon={<KeyOutlined />}
              onClick={() => setIsModalVisible(true)}
              style={{ background: tokens.primary, borderColor: tokens.primary }}
            >
              Aktifkan Lisensi
            </Button>
          )}
        </div>
        <Paragraph style={{ color: tokens.textMuted, margin: 0 }}>
          Kelola status langganan SaaS, kuota penggunaan, dan batasan fitur untuk tenant Anda.
        </Paragraph>

        {!status?.activated || !lic ? (
          <Alert
            message="Belum Ada Lisensi Aktif"
            description="Tenant ini belum memiliki lisensi yang aktif. Harap hubungi penyedia layanan atau aktifkan lisensi baru."
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
            style={{ background: tokens.danger + '1A', borderColor: tokens.danger, color: tokens.textPrimary }}
          />
        ) : isExpired ? (
          <Alert
            message="Lisensi Kedaluwarsa"
            description="Lisensi Anda telah kedaluwarsa. Sistem sekarang berada dalam mode Read-Only. Harap perbarui langganan Anda."
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
            style={{ background: tokens.danger + '1A', borderColor: tokens.danger, color: tokens.textPrimary }}
          />
        ) : (
          <Alert
            message="Lisensi Aktif"
            description="Sistem beroperasi secara normal dengan lisensi yang sah."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ background: tokens.success + '1A', borderColor: tokens.success, color: tokens.textPrimary }}
          />
        )}

        {lic && (
          <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ background: tokens.surfaceHover }}>
            <Descriptions title={<span style={{ color: tokens.textPrimary }}>Informasi Langganan</span>} bordered column={1} labelStyle={{ color: tokens.textMuted }} contentStyle={{ color: tokens.textPrimary, fontWeight: 600 }}>
              <Descriptions.Item label="Paket">
                <Text strong style={{ color: tokens.textPrimary }}>{lic.plan_name}</Text> <Tag color={tokens.primary} style={{ border: 'none' }}>{lic.plan_code}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Organisasi">
                {lic.organization_name}
              </Descriptions.Item>
              <Descriptions.Item label="Masa Berlaku">
                {new Date(lic.issued_at).toLocaleDateString()} s/d {new Date(lic.expires_at).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="License ID">
                <Text style={{ color: tokens.textMuted }}>{lic.license_id}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {lic && (
          <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ background: tokens.surfaceHover }}>
            <Title level={4} style={{ color: tokens.textPrimary }}>Batasan Penggunaan (Quota)</Title>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 16 }}>
              <Card type="inner" title="Pengguna (Users)" style={{ background: tokens.surface, borderColor: tokens.border }} headStyle={{ color: tokens.textMuted, borderBottom: `1px solid ${tokens.border}` }}>
                <div style={{ textAlign: "center", color: tokens.textPrimary }}>
                  <Progress
                    type="dashboard"
                    percent={100}
                    format={() => lic.max_users ? `Max ${lic.max_users}` : "Unlimited"}
                    strokeColor={tokens.success}
                  />
                  <p style={{ marginTop: 16, color: tokens.textMuted }}>Kapasitas Pengguna Sistem</p>
                </div>
              </Card>
              <Card type="inner" title="Armada (Vehicles)" style={{ background: tokens.surface, borderColor: tokens.border }} headStyle={{ color: tokens.textMuted, borderBottom: `1px solid ${tokens.border}` }}>
                <div style={{ textAlign: "center", color: tokens.textPrimary }}>
                  <Progress
                    type="dashboard"
                    percent={100}
                    format={() => lic.max_armada ? `Max ${lic.max_armada}` : "Unlimited"}
                    strokeColor={tokens.primary}
                  />
                  <p style={{ marginTop: 16, color: tokens.textMuted }}>Kapasitas Armada Pemadam</p>
                </div>
              </Card>
            </div>
          </Card>
        )}

        {lic && (
          <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ background: tokens.surfaceHover }}>
            <Title level={4} style={{ color: tokens.textPrimary }}>Fitur Aktif (Feature Entitlement)</Title>
            <Space size={[0, 8]} wrap style={{ marginTop: 16 }}>
              {lic.features.length > 0 ? (
                lic.features.map(f => <Tag key={f} color={tokens.surface} style={{ color: tokens.textPrimary, border: `1px solid ${tokens.border}` }}>{f}</Tag>)
              ) : (
                <Text style={{ color: tokens.textMuted }}>Tidak ada batasan fitur khusus terdaftar.</Text>
              )}
            </Space>
          </Card>
        )}

      </Space>

      <Modal
        title="Aktivasi Lisensi Baru"
        open={isModalVisible}
        onOk={handleActivate}
        confirmLoading={activating}
        onCancel={() => {
          setIsModalVisible(false);
          setLicenseKey("");
        }}
        okText="Aktifkan"
        cancelText="Batal"
      >
        <p>Masukkan string lisensi JWT yang diberikan oleh tim support:</p>
        <Input.TextArea
          rows={6}
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="SAM1.eyJhbGciOi... (Tempel di sini)"
        />
      </Modal>
    </div>
  );
}
