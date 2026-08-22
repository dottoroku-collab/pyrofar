import { Card, Table, Typography, Tag, Space, Alert } from "antd";
import { UserOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store/authStore";
import { useTokens } from "@/store/themeStore";

const { Title, Text, Paragraph } = Typography;

export default function RolesPermissions() {
  const { user } = useAuthStore();
  const tokens = useTokens();

  const data = [
    {
      key: "administrator",
      role: "Administrator",
      permissions: [
        "manage_users", "view_users", "manage_armada", "view_armada", "manage_pemeliharaan",
        "view_pemeliharaan", "view_reports", "export_reports", "view_audit_log", "manage_license",
        "manage_settings", "manage_insiden", "view_insiden", "manage_pencegahan", "view_pencegahan",
        "manage_sarana", "view_sarana",
      ],
      description: "Memiliki akses penuh ke seluruh fitur dan pengaturan sistem.",
    },
    {
      key: "pimpinan",
      role: "Pimpinan",
      permissions: [
        "view_users", "view_armada", "view_pemeliharaan", "view_reports", "export_reports",
        "manage_insiden", "view_insiden", "manage_pencegahan", "view_pencegahan", "view_sarana",
      ],
      description: "Memantau laporan dan data, serta menerima notifikasi dan mengelola insiden & pencegahan.",
    },
    {
      key: "operator_cc",
      role: "Operator Command Center",
      permissions: [
        "view_armada", "manage_insiden", "view_insiden",
      ],
      description: "Menerima laporan darurat, dispatch armada, dan monitor insiden real-time di Command Center.",
    },
    {
      key: "operator_lapangan_damkar",
      role: "Operator Lapangan (Pemadam)",
      permissions: [
        "view_insiden", "manage_insiden",
      ],
      description: "Memperbarui status insiden kebakaran dari lokasi dan mengisi data pasca-insiden.",
    },
    {
      key: "operator_lapangan_penyelamatan",
      role: "Operator Lapangan (Penyelamatan)",
      permissions: [
        "view_insiden", "manage_insiden",
      ],
      description: "Memperbarui status insiden rescue/penyelamatan dari lokasi dan mengisi data pasca-insiden.",
    },
    {
      key: "operator_sarpras",
      role: "Operator Sarpras",
      permissions: [
        "manage_armada", "view_armada", "view_pemeliharaan", "manage_sarana", "view_sarana",
      ],
      description: "Menginput dan mengelola data armada, peralatan, serta inventaris.",
    },
    {
      key: "teknisi",
      role: "Teknisi",
      permissions: [
        "view_armada", "manage_pemeliharaan", "view_pemeliharaan", "manage_sarana", "view_sarana",
      ],
      description: "Fokus pada pemeliharaan armada dan sarana prasarana.",
    },
    {
      key: "operator_pencegahan",
      role: "Operator Pencegahan",
      permissions: [
        "manage_pencegahan", "view_pencegahan",
      ],
      description: "Menginput data inspeksi, edukasi, dan sertifikat bangunan.",
    },
  ];

  const columns = [
    {
      title: "Peran (Role)",
      dataIndex: "role",
      key: "role",
      render: (text: string) => (
        <Text strong style={{ color: tokens.textPrimary }}>
          <UserOutlined style={{ marginRight: 8, color: tokens.primary }} />
          {text}
        </Text>
      ),
      width: "20%",
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (text: string) => <span style={{ color: tokens.textMuted }}>{text}</span>,
    },
    {
      title: "Izin (Permissions)",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: string[]) => (
        <Space size={[0, 8]} wrap>
          {permissions.map((p) => (
            <Tag key={p} color={tokens.surfaceHover} style={{ color: tokens.textPrimary, border: `1px solid ${tokens.border}` }}>
              {p}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Space direction="vertical" size="large" style={{ display: "flex" }}>
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <SafetyCertificateOutlined style={{ fontSize: 24, color: tokens.primary }} />
          <h2 style={{ margin: 0, color: tokens.textPrimary, fontFamily: "Manrope, sans-serif" }}>Peran & Izin</h2>
        </div>
        <Paragraph style={{ color: tokens.textMuted, margin: 0 }}>
          Sistem DAMKAR CLOUD menggunakan Role-Based Access Control (RBAC). Setiap peran telah
          dipetakan dengan sekumpulan izin (permissions) yang spesifik untuk menjaga keamanan data.
        </Paragraph>

        {user?.role !== "administrator" && (
          <Alert
            message="Akses Terbatas"
            description="Anda melihat halaman ini dalam mode Read-Only. Hanya Administrator yang dapat mengubah izin."
            type="warning"
            showIcon
            style={{ background: tokens.warning + '1A', borderColor: tokens.warning, color: tokens.textPrimary }}
          />
        )}

        <Card bordered={false} bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            rowClassName={() => 'editable-row'}
          />
        </Card>
      </Space>
    </div>
  );
}
