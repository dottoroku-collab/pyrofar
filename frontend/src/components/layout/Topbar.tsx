import { BellOutlined, DownOutlined, LogoutOutlined, SunOutlined, MoonOutlined, SearchOutlined, SwapOutlined, MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Badge, Dropdown, Empty, List, Input, Tag, Button } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifikasiApi } from "@/api/notifikasi";
import type { Notifikasi } from "@/types/notifikasi";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { useTokens, useThemeStore } from "@/store/themeStore";
import { useLicense } from "@/hooks/useLicense";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Command Center",
  "/notifications": "Notifikasi",
  "/profile": "Profil",
  "/dashboard/operasi": "Dashboard Operasional",
  "/incidents": "Insiden",
  "/rescue": "Penyelamatan",
  "/organizations": "Struktur Organisasi",
  "/personnel": "Personil",
  "/dashboard/pencegahan": "Dashboard Pencegahan",
  "/inspections": "Inspeksi",
  "/buildings": "Gedung",
  "/education": "Edukasi",
  "/certificates": "Sertifikat",
  "/dashboard/sarpras": "Dashboard Sarpras",
  "/armada": "Data Armada",
  "/maintenance": "Pemeliharaan",
  "/equipment": "Perlengkapan",
  "/assets": "Aset",
  "/stations": "Posko",
  "/inventory": "Inventaris",
  "/relawan": "Dashboard Relawan",
  "/relawan/relawan": "Daftar Relawan",
  "/relawan/training": "Pelatihan",
  "/relawan/communities": "Komunitas",
  "/analytics": "Analytics",
  "/reports": "Laporan",
  "/users": "Pengguna",
  "/roles": "Peran Akses",
  "/subscription": "Langganan",
  "/settings": "Pengaturan",
  "/audit-log": "Log Audit",
  "/superadmin/tenants": "Tenant",
  "/superadmin/users": "Pengguna Global",
  "/approval": "Menunggu Persetujuan",
  "/master-data": "Data Utama",
};

interface TopbarProps {
  path: string;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export default function Topbar({ path, onMenuClick, isMobile }: TopbarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [notifs, setNotifs] = useState<Notifikasi[]>([]);
  const { settings } = useTenantStore();
  const { mode, toggleTheme, isSidebarHidden, toggleSidebarHidden } = useThemeStore();
  const tokens = useTokens();
  const { isActive, loading: licenseLoading } = useLicense();

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

  const isPlatformAdmin = user?.role === "administrator";

  return (
    <div
      style={{
        background: "transparent",
        padding: isMobile ? "14px 16px" : "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 16 }}>
        {!isMobile && (
          <Button 
            type="text" 
            icon={isSidebarHidden ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
            onClick={toggleSidebarHidden} 
            style={{ color: tokens.textSecondary, fontSize: '18px' }}
          />
        )}
        {isMobile && (
          <Button type="text" icon={<MenuOutlined style={{ fontSize: 20, color: tokens.textPrimary }} />} onClick={onMenuClick} style={{ padding: 0, marginRight: 8 }} />
        )}
        <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 19, color: tokens.textPrimary, display: isMobile ? 'none' : 'block' }}>
          {PAGE_TITLES[path] ?? settings?.app_name ?? "PYROFAR"}
        </div>
        {!isMobile && (
          <Input
            placeholder="Cari..."
            prefix={<SearchOutlined style={{ color: tokens.textMuted }} />}
            style={{ width: 200, borderRadius: 20, background: tokens.surfaceHover, border: "none" }}
          />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 18 }}>
        {!licenseLoading && !isMobile && (
          <Tag color={isActive ? tokens.success : tokens.danger} style={{ borderRadius: 12, border: "none", fontWeight: 600 }}>
            {isActive ? "Lisensi Aktif" : "Lisensi Kadaluarsa"}
          </Tag>
        )}

        {isPlatformAdmin && !isMobile && (
          <Button type="text" icon={<SwapOutlined />} style={{ color: tokens.textMuted }} onClick={() => {
            const newTenantId = prompt("Enter Tenant ID to switch to:");
            if (newTenantId) {
              localStorage.setItem("sim-armada-tenant", newTenantId);
              window.location.reload();
            }
          }}>
            Ganti Tenant
          </Button>
        )}

        <Dropdown
          trigger={["click"]}
          dropdownRender={() => (
            <div
              style={{
                width: isMobile ? 280 : 320,
                background: tokens.surface,
                borderRadius: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,.12)",
                maxHeight: 360,
                overflowY: "auto",
                color: tokens.textPrimary,
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
                        background: n.is_read ? "transparent" : `${tokens.primary}1A`,
                        borderBottom: `1px solid ${tokens.border}`,
                      }}
                    >
                      <div style={{ fontSize: 12.5 }}>
                        <div style={{ color: tokens.textPrimary }}>{n.pesan}</div>
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
            <BellOutlined style={{ fontSize: 18, color: tokens.textMuted, cursor: "pointer" }} />
          </Badge>
        </Dropdown>
        <div style={{ cursor: "pointer", color: tokens.textMuted, display: "flex", alignItems: "center" }} onClick={() => toggleSidebarHidden()}>
          {!isMobile && (isSidebarHidden ? <MenuUnfoldOutlined style={{ fontSize: 18 }} /> : <MenuFoldOutlined style={{ fontSize: 18 }} />)}
        </div>
        <div style={{ cursor: "pointer", color: tokens.textMuted, display: "flex", alignItems: "center" }} onClick={() => toggleTheme()}>
          {mode === "light" ? <MoonOutlined style={{ fontSize: 18 }} /> : <SunOutlined style={{ fontSize: 18 }} />}
        </div>
        <Dropdown
          menu={{
            items: [
              { key: "logout", label: "Keluar", icon: <LogoutOutlined />, onClick: handleLogout },
            ],
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: tokens.textPrimary }}>
            <Avatar style={{ background: tokens.sidebarBg, fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {initials}
            </Avatar>
            {!isMobile && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 13, lineHeight: 1 }}>{user?.nama}</span>
                <span style={{ fontSize: 10, color: user?.is_superadmin ? tokens.primary : tokens.textMuted, fontWeight: user?.is_superadmin ? 700 : 500, marginTop: 2 }}>
                  {user?.is_superadmin ? "Superadmin" : user?.role.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
            )}
            <DownOutlined style={{ fontSize: 10, color: tokens.textMuted }} />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
