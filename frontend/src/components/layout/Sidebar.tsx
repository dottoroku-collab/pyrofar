import {
  AppstoreOutlined,
  CarOutlined,
  CheckSquareOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/antdTheme";

const ALL_ITEMS = [
  { key: "/dashboard", icon: <AppstoreOutlined />, label: "Dashboard", roles: ["administrator", "pimpinan", "kabid"] },
  { key: "/armada", icon: <CarOutlined />, label: "Data Armada", roles: ["administrator", "operator", "teknisi", "pimpinan", "kabid"] },
  { key: "/pemeliharaan", icon: <ToolOutlined />, label: "Pemeliharaan", roles: ["administrator", "teknisi"] },
  { key: "/approval", icon: <CheckSquareOutlined />, label: "Approval", roles: ["kabid"] },
  { key: "/master-data", icon: <DatabaseOutlined />, label: "Master Data", roles: ["administrator"] },
  { key: "/laporan", icon: <FileTextOutlined />, label: "Laporan", roles: ["administrator", "pimpinan", "kabid"] },
  { key: "/audit-log", icon: <HistoryOutlined />, label: "Audit Log", roles: ["administrator"] },
  { key: "/pengguna", icon: <UserOutlined />, label: "Pengguna", roles: ["administrator"] },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAuthStore((s) => s.user?.role);

  const items = ALL_ITEMS.filter((item) => !role || item.roles.includes(role)).map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "22px 20px 16px" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: colors.redPrimary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Manrope, sans-serif",
            fontWeight: 800,
            fontSize: 15,
            color: "#fff",
          }}
        >
          SM
        </div>
        <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: "#fff" }}>
          SIM Armada
          <div style={{ fontSize: 10.5, fontWeight: 500, color: "#9AA0AC" }}>Damkar Kota Makassar</div>
        </div>
      </div>
      <div
        style={{
          height: 3,
          margin: "0 20px 12px",
          borderRadius: 2,
          background:
            "repeating-linear-gradient(-45deg, #C0272D 0 8px, #000 8px 10px, #15171B 10px 18px)",
        }}
      />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{ background: "transparent", border: "none", flex: 1 }}
      />
    </div>
  );
}
