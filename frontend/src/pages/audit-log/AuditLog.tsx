import { Card, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { auditLogApi } from "@/api/auditLog";
import type { AuditLogItem } from "@/types/auditLog";

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

  useEffect(() => {
    setLoading(true);
    auditLogApi
      .list()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card title="Audit Log">
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: "Waktu", dataIndex: "waktu", render: (v) => new Date(v).toLocaleString("id-ID") },
          { title: "User ID", dataIndex: "user_id" },
          {
            title: "Aksi",
            dataIndex: "aksi",
            render: (v: string) => <Tag color={AKSI_COLOR[v] ?? "default"}>{v}</Tag>,
          },
          { title: "Entitas", dataIndex: "entitas" },
          { title: "Entitas ID", dataIndex: "entitas_id" },
        ]}
      />
    </Card>
  );
}
