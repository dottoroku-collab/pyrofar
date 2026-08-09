import {
  AppstoreOutlined,
  CarOutlined,
  CheckSquareOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SettingOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme/antdTheme";
import { getAssetUrl } from "@/api/client";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useLicense } from "@/hooks/useLicense";

const ALL_ITEMS = [
  {
    key: "/dashboard",
    icon: <AppstoreOutlined />,
    label: "Dashboard",
    roles: ["administrator", "pimpinan", "kabid"],
    feature: "dashboard",
  },
  {
    key: "/armada",
    icon: <CarOutlined />,
    label: "Data Armada",
    roles: ["administrator", "operator", "teknisi", "pimpinan", "kabid"],
    feature: "armada",
  },
  {
    key: "/pemeliharaan",
    icon: <ToolOutlined />,
    label: "Pemeliharaan",
    roles: ["administrator", "teknisi"],
    feature: "pemeliharaan",
  },
  {
    key: "/approval",
    icon: <CheckSquareOutlined />,
    label: "Approval",
    roles: ["kabid"],
    feature: "approval",
  },
  {
    key: "/master-data",
    icon: <DatabaseOutlined />,
    label: "Master Data",
    roles: ["administrator"],
    // Master data usually accessible by admin always, but tying to dashboard or generally available if needed
  },
  {
    key: "/laporan",
    icon: <FileTextOutlined />,
    label: "Laporan",
    roles: ["administrator", "pimpinan", "kabid"],
    feature: "laporan",
  },
  {
    key: "/audit-log",
    icon: <HistoryOutlined />,
    label: "Audit Log",
    roles: ["administrator"],
    feature: "audit_log",
  },
  {
    key: "/pengguna",
    icon: <UserOutlined />,
    label: "Pengguna",
    roles: ["administrator"],
    // System feature, no license needed typically
  },
  {
    key: "/pengaturan",
    icon: <SettingOutlined />,
    label: "Pengaturan",
    roles: ["administrator"],
    // Always accessible to manage license
  },
];



export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = useAuthStore((s) => s.user?.role);
  const { settings } = useAppSettings();
  const { hasFeature } = useLicense();

  const items = ALL_ITEMS
    .filter((item) => {
      const hasRole = !role || item.roles.includes(role);
      const isFeatureAllowed = !item.feature || hasFeature(item.feature);
      return hasRole && isFeatureAllowed;
    })
    .map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
    }));

  const selectedKey =
    location.pathname === "/pemeliharaan/new"
      ? "/pemeliharaan"
      : location.pathname.startsWith("/pengaturan")
        ? "/pengaturan"
        : location.pathname;

  const logoUrl = getAssetUrl(settings.logo_url);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "22px 20px 16px",
        }}
      >
        {logoUrl ? (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={logoUrl}
              alt={settings.app_short_name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: 4,
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: colors.redPrimary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            SM
          </div>
        )}

        <div
          style={{
            fontFamily: "Manrope, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: 1.3,
            color: "#fff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {settings.app_short_name}
          </div>

          <div
            style={{
              fontSize: 10.5,
              fontWeight: 500,
              color: "#9AA0AC",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {settings.region_name || settings.organization_name || "Damkar"}
          </div>
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
        selectedKeys={[selectedKey]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{
          background: "transparent",
          border: "none",
          flex: 1,
        }}
      />
    </div>
  );
}
