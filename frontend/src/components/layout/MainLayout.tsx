import { useEffect, useState } from "react";
import { Layout, Spin, Drawer, Grid, Button, Space, Typography } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useTenantStore } from "@/store/tenantStore";
import { useTokens, useThemeStore } from "@/store/themeStore";
import PttProvider from "@/components/ptt/PttProvider";

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchTenant, isLoading, tenant, settings, error } = useTenantStore();
  const tokens = useTokens();
  const screens = useBreakpoint();
  const isMobile = screens.lg === false;
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { isSidebarHidden } = useThemeStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!tenant && !isLoading) {
      fetchTenant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTenant]);

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  if (error) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: tokens.bg, padding: 24, textAlign: "center" }}>
        <Title level={3} style={{ color: tokens.danger, marginBottom: 8 }}>Gagal Memuat Konfigurasi</Title>
        <Text style={{ color: tokens.textMuted, marginBottom: 24, maxWidth: 400 }}>{error}</Text>
        <Space size="middle">
          <Button type="primary" onClick={() => fetchTenant()} loading={isLoading}>
            Coba Lagi
          </Button>
          <Button onClick={() => { useTenantStore.getState().clearTenant(); navigate("/login"); }}>
            Login Ulang
          </Button>
        </Space>
      </div>
    );
  }

  if (isLoading || !tenant || !settings) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: tokens.bg }}>
        <Spin size="large" tip="Memuat konfigurasi workspace..." />
      </div>
    );
  }

  return (
    <PttProvider>
      <Layout style={{ minHeight: "100vh", background: tokens.bg }}>
        {isMobile ? (
          <Drawer
            placement="left"
            closable={false}
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
            styles={{ body: { padding: 0 } }}
            width={260}
            style={{ background: tokens.sidebarBg }}
          >
            <Sidebar />
          </Drawer>
        ) : !isSidebarHidden && !isFullscreen ? (
          <Sider width={260} style={{
            background: tokens.sidebarBg,
            borderRight: `1px solid ${tokens.sidebarBorder}`,
            boxShadow: "1px 0 10px rgba(0,0,0,0.05)",
            zIndex: 10
          }}>
            <Sidebar />
          </Sider>
        ) : null}
        <Layout style={{ background: "transparent" }}>
          {!isFullscreen && (
            <Header
              className="glass-panel"
              style={{
                height: "auto",
                padding: 0,
                lineHeight: "normal",
                background: tokens.topbarBg,
                borderBottom: `1px solid ${tokens.topbarBorder}`,
                position: 'sticky',
                top: 0,
                zIndex: 11,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 0,
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none'
              }}
            >
              <Topbar path={location.pathname} isMobile={isMobile} onMenuClick={() => setMobileDrawerOpen(true)} />
            </Header>
          )}
          <Content style={{ padding: isFullscreen ? 0 : isMobile ? "16px" : "24px 32px", background: "transparent", height: isFullscreen ? "100vh" : "auto", overflow: isFullscreen ? "hidden" : "auto" }}>
            <div className="animate-fade-in" style={{ maxWidth: isFullscreen ? "100%" : 1600, margin: '0 auto', height: isFullscreen ? "100%" : "auto" }}>
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </PttProvider>
  );
}
