import { Card, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { HistoryOutlined } from "@ant-design/icons";
import { auditLogApi } from "@/api/auditLog";
import type { AuditLogItem } from "@/types/auditLog";
import { useTokens } from "@/store/themeStore";

const AKSI_COLOR: Record<string, string> = {
  login: "blue",
  tambah: "green",
  edit: "gold",
  hapus: "red",
  pindah_lokasi: "purple",
  input_maintenance: "cyan",
  approve: "green",
  reject: "red",
};

export default function AuditLog() {
  const [data, setData] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const tokens = useTokens();

  useEffect(() => {
    setLoading(true);
    auditLogApi
      .list()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 24 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', borderBottom: `1px solid ${tokens.border}` }}>
          <HistoryOutlined style={{ fontSize: 24, color: tokens.primary }} />
          <h3 style={{ margin: 0, color: tokens.textPrimary }}>Log Aktivitas Sistem</h3>
        </div>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        size="small"
        columns={[
          { title: "Waktu", dataIndex: "waktu", render: (v) => <span style={{ color: tokens.textPrimary }}>{new Date(v).toLocaleString("id-ID")}</span> },
          { title: "User ID", dataIndex: "user_id", render: (v) => <span style={{ color: tokens.textPrimary }}>{v}</span> },
          {
            title: "Aksi",
            dataIndex: "aksi",
            render: (v: string) => <Tag color={AKSI_COLOR[v] ?? "default"} style={{ border: `1px solid ${tokens.border}` }}>{v.toUpperCase()}</Tag>,
          },
          { title: "Entitas", dataIndex: "entitas", render: (v) => <span style={{ color: tokens.textMuted }}>{v}</span> },
          { title: "Entitas ID", dataIndex: "entitas_id", render: (v) => <span style={{ color: tokens.textMuted }}>{v}</span> },
        ]}
        rowClassName={() => 'editable-row'}
      />
    </Card>
  );
}
