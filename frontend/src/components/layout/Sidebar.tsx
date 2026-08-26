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
  SafetyCertificateOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import { getAssetUrl } from "@/api/client";
import { useTenantStore } from "@/store/tenantStore";
import { useTokens } from "@/store/themeStore";
import { useLicense } from "@/hooks/useLicense";

import type { MenuProps } from "antd";

interface NavItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  roles?: string[];
  feature?: string;
  requireSuperadmin?: boolean;
  children?: NavItem[];
}

const NAV_STRUCTURE: NavItem[] = [
  {
    key: "core",
    icon: <AppstoreOutlined />,
    label: "CORE",
    children: [
      { key: "/dashboard", label: "Command Center", roles: ["administrator", "pimpinan"], feature: "dashboard" },
      { key: "/notifications", label: "Notifications" },
      { key: "/profile", label: "Profile" },
    ],
  },
  {
    key: "operations",
    icon: <CarOutlined />,
    label: "OPERATIONS",
    children: [
      { key: "/dashboard/operasi", label: "Dashboard", roles: ["administrator", "pimpinan", "operator_cc", "operator_lapangan_damkar", "operator_lapangan_penyelamatan"] },
      { key: "/incidents", label: "Incidents", roles: ["administrator", "pimpinan", "operator_cc", "operator_lapangan_damkar"] },
      { key: "/rescue", label: "Rescue", roles: ["administrator", "pimpinan", "operator_cc", "operator_lapangan_penyelamatan"] },
      { key: "/organizations", label: "Org Structure", roles: ["administrator", "pimpinan"] },
      { key: "/personnel", label: "Personnel", roles: ["administrator", "operator_cc", "pimpinan"] },
    ],
  },
  {
    key: "prevention",
    icon: <CheckSquareOutlined />,
    label: "PREVENTION",
    children: [
      { key: "/dashboard/pencegahan", label: "Dashboard", roles: ["administrator", "pimpinan", "operator_pencegahan"] },
      { key: "/inspections", label: "Inspections", roles: ["administrator", "pimpinan", "operator_pencegahan"] },
      { key: "/buildings", label: "Buildings" },
      { key: "/education", label: "Education", roles: ["administrator", "pimpinan", "operator_pencegahan"] },
      { key: "/certificates", label: "Certificates" },
    ],
  },
  {
    key: "sarpras",
    icon: <DatabaseOutlined />,
    label: "SARPRAS",
    children: [
      { key: "/dashboard/sarpras", label: "Dashboard", roles: ["administrator", "operator_sarpras", "teknisi", "pimpinan"], feature: "dashboard" },
      { key: "/armada", label: "Armada", roles: ["administrator", "operator_sarpras", "teknisi", "pimpinan"], feature: "armada" },
      { key: "/maintenance", label: "Maintenance", roles: ["administrator", "teknisi"], feature: "pemeliharaan" },
      { key: "/equipment", label: "Equipment" },
      { key: "/assets", label: "Assets" },
      { key: "/stations", label: "Stations" },
      { key: "/inventory", label: "Inventory" },
    ],
  },
  {
    key: "redkar",
    icon: <UserOutlined />,
    label: "RELAWAN DAMKAR",
    children: [
      { key: "/relawan", label: "Dashboard", roles: ["administrator", "pimpinan"] },
      { key: "/relawan/training", label: "Training" },
      { key: "/relawan/communities", label: "Communities" },
    ],
  },
  {
    key: "analytics",
    icon: <AppstoreOutlined />,
    label: "ANALYTICS",
    children: [
      { key: "/analytics", label: "Analytics", roles: ["administrator", "pimpinan"] },
      { key: "/reports", label: "Reports", roles: ["administrator", "pimpinan"], feature: "laporan" },
    ],
  },
  {
    key: "admin",
    icon: <SettingOutlined />,
    label: "ADMIN",
    children: [
      { key: "/users", label: "Users", roles: ["administrator"] },
      { key: "/roles", label: "Roles", roles: ["administrator", "pimpinan"] },
      { key: "/subscription", label: "Subscription", roles: ["administrator"] },
      { key: "/settings", label: "Settings", roles: ["administrator"] },
      { key: "/audit-log", label: "Audit Log", roles: ["administrator"], feature: "audit_log" },
    ],
  },
  {
    key: "superadmin",
    icon: <CloudServerOutlined />,
    label: "SUPERADMIN",
    requireSuperadmin: true,
    children: [
      { key: "/superadmin/tenants", label: "Tenants" },
      { key: "/superadmin/users", label: "Global Users" },
    ],
  },
];

function filterNavItems(items: NavItem[], role: string | undefined, hasFeature: (f: string) => boolean, isSuperadmin?: boolean): any[] {
  return items
    .filter((item) => {
      if (item.requireSuperadmin && !isSuperadmin) return false;
      const hasRole = !item.roles || !role || item.roles.includes(role);
      const isFeatureAllowed = !item.feature || hasFeature(item.feature);
      return hasRole && isFeatureAllowed;
    })
    .map((item) => {
      if (item.children) {
        const filteredChildren = filterNavItems(item.children, role, hasFeature, isSuperadmin);
        if (filteredChildren.length === 0) return null; // Hide parent if no children visible
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: filteredChildren,
        };
      }
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
      };
    })
    .filter(Boolean);
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = useAuthStore((s) => s.user?.role);
  const isSuperadmin = useAuthStore((s) => s.user?.is_superadmin);
  const { settings } = useTenantStore();
  const tokens = useTokens();
  const mode = useThemeStore((s) => s.mode);
  const { hasFeature } = useLicense();

  if (!settings) return null;

  const items = filterNavItems(NAV_STRUCTURE, role, hasFeature, isSuperadmin);

  const selectedKey =
    location.pathname === "/pemeliharaan/new"
      ? "/pemeliharaan"
      : location.pathname.startsWith("/pengaturan") && location.pathname !== "/pengaturan" && location.pathname !== "/roles-permissions" && location.pathname !== "/subscription"
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
              background: tokens.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: tokens.textPrimary,
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
            color: tokens.textPrimary,
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
            `repeating-linear-gradient(-45deg, ${tokens.primary} 0 8px, ${tokens.sidebarBg} 8px 10px, ${tokens.sidebarBorder} 10px 18px)`,
        }}
      />

      <Menu
        theme={mode === "dark" ? "dark" : "light"}
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
