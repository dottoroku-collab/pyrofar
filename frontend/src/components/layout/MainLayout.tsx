import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { colors } from "@/theme/antdTheme";

const { Sider, Header, Content } = Layout;

export default function MainLayout() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={248} style={{ background: colors.nearBlack }}>
        <Sidebar />
      </Sider>
      <Layout>
        <Header style={{ height: "auto", padding: 0, lineHeight: "normal" }}>
          <Topbar path={location.pathname} />
        </Header>
        <Content style={{ padding: 24, background: colors.grayPage }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
