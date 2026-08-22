import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Select } from "antd";
import { superadminApi } from "@/api/superadmin";
import { TenantPublic } from "@/types/tenant";
import { UserAdmin } from "@/types/user";

export default function GlobalUsers() {
  const [tenants, setTenants] = useState<TenantPublic[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchUsers(selectedTenant);
    } else {
      setUsers([]);
    }
  }, [selectedTenant]);

  const fetchTenants = async () => {
    try {
      const data = await superadminApi.getTenants();
      setTenants(data);
    } catch (error) {
      message.error("Gagal mengambil data tenant");
    }
  };

  const fetchUsers = async (tenantId: string) => {
    setLoading(true);
    try {
      const data = await superadminApi.getTenantUsers(tenantId);
      setUsers(data);
    } catch (error) {
      message.error("Gagal mengambil pengguna");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nama", dataIndex: "nama", key: "nama" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    { 
      title: "Status", 
      dataIndex: "is_active", 
      key: "is_active",
      render: (val: boolean) => (val ? "Aktif" : "Non-aktif")
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Global Users (Superadmin)</h2>
      <div style={{ marginBottom: 16 }}>
        <Select 
          placeholder="Pilih Tenant" 
          style={{ width: 300 }}
          onChange={(val) => setSelectedTenant(val)}
          options={tenants.map(t => ({ value: t.id, label: t.name }))}
        />
      </div>
      
      {selectedTenant && (
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id" 
          loading={loading}
        />
      )}
    </div>
  );
}
