import { BellOutlined, DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, Empty, List } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifikasiApi } from "@/api/notifikasi";
import type { Notifikasi } from "@/types/notifikasi";
import { useAuthStore } from "@/store/authStore";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard Kesiapan Armada",
  "/armada": "Data Armada",
  "/pemeliharaan": "Pemeliharaan",
  "/approval": "Menunggu Approval",
  "/master-data": "Master Data",
  "/laporan": "Laporan",
  "/audit-log": "Audit Log",
  "/pengguna": "Manajemen Pengguna",
};

export default function Topbar({ path }: { path: string }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [notifs, setNotifs] = useState<Notifikasi[]>([]);

  useEffect(() => {
    notifikasiApi.list().then(setNotifs).catch(() => setNotifs([]));
    const interval = setInterval(() => {
      notifikasiApi.list().then(setNotifs).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleOpenNotif(notif: Notifikasi) {
    if (!notif.is_read) {
      await notifikasiApi.markRead(notif.id);
      setNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
    }
    if (notif.armada_id) navigate(`/armada/${notif.armada_id}`);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const unreadCount = notifs.filter((n) => !n.is_read).length;
  const initials = user?.nama
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid #E4E6EB",
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 19 }}>
        {PAGE_TITLES[path] ?? "SIM Armada Damkar"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Dropdown
          trigger={["click"]}
          dropdownRender={() => (
            <div
              style={{
                width: 320,
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,.12)",
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {notifs.length === 0 ? (
                <Empty description="Tidak ada notifikasi" style={{ padding: 20 }} />
              ) : (
                <List
                  dataSource={notifs}
                  renderItem={(n) => (
                    <List.Item
                      onClick={() => handleOpenNotif(n)}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        background: n.is_read ? "#fff" : "#FBE9EA",
                      }}
                    >
                      <div style={{ fontSize: 12.5 }}>
                        <div>{n.pesan}</div>
                        <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 2 }}>
                          {new Date(n.created_at).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          )}
        >
          <Badge count={unreadCount} size="small">
            <BellOutlined style={{ fontSize: 18, color: "#6B7280", cursor: "pointer" }} />
          </Badge>
        </Dropdown>
        <Dropdown
          menu={{
            items: [
              { key: "logout", label: "Keluar", icon: <LogoutOutlined />, onClick: handleLogout },
            ],
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Avatar style={{ background: "#15171B", fontSize: 12, fontWeight: 700 }}>
              {initials}
            </Avatar>
            <span style={{ fontSize: 13 }}>{user?.nama}</span>
            <DownOutlined style={{ fontSize: 10, color: "#9CA3AF" }} />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
