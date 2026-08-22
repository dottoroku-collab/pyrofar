import type { ThemeConfig } from "antd";
import { theme as antdAlgorithm } from "antd";

/**
 * Token warna & tipografi — DAMKAR CLOUD PLATFORM Design System
 *
 * lightTokens / darkTokens from tokens.ts are the authoritative source.
 * antdTheme.ts bridges those to Ant Design's ConfigProvider format.
 */
export const colors = {
  redPrimary: "#C0272D",
  redDark: "#8F1D22",
  nearBlack: "#1A1D23",
  grayPage: "#F4F5F7",
  white: "#FFFFFF",
  grayBorder: "#E4E6EB",
  grayText: "#6B7280",
  greenOk: "#059669",
  amberWarn: "#D97706",
  darkBg: "#0F1117",
  darkSurface: "#1A1D23",
  darkBorder: "#2D3139",
};

const FONT = "'Inter', sans-serif";

/** Light mode Ant Design theme */
const lightTheme: ThemeConfig = {
  algorithm: antdAlgorithm.defaultAlgorithm,
  token: {
    colorPrimary: colors.redPrimary,
    colorSuccess: colors.greenOk,
    colorWarning: colors.amberWarn,
    colorError: colors.redPrimary,
    colorBgLayout: colors.grayPage,
    colorBgContainer: colors.white,
    colorBorder: colors.grayBorder,
    borderRadius: 8,
    fontFamily: FONT,
    fontSize: 14,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  },
  components: {
    Layout: {
      siderBg: colors.nearBlack,
      headerBg: colors.white,
      bodyBg: colors.grayPage,
    },
    Menu: {
      darkItemBg: colors.nearBlack,
      darkItemSelectedBg: "rgba(192,39,45,0.18)",
      darkItemSelectedColor: colors.white,
      darkItemHoverBg: "rgba(255,255,255,0.04)",
      darkSubMenuItemBg: colors.nearBlack,
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: "0 4px 20px rgba(0, 0, 0, 0.03)",
    },
    Table: {
      headerBg: "transparent",
      rowHoverBg: "#F3F4F6",
    },
    Modal: {
      borderRadiusLG: 16,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      fontWeight: 500,
    },
  },
};

/** Dark mode Ant Design theme (Dark Navy / Graphite) */
const darkTheme: ThemeConfig = {
  algorithm: antdAlgorithm.darkAlgorithm,
  token: {
    colorPrimary: "#EF4444",
    colorSuccess: "#34D399",
    colorWarning: "#FBBF24",
    colorError: "#EF4444",
    colorBgLayout: colors.darkBg,
    colorBgContainer: colors.darkSurface,
    colorBorder: colors.darkBorder,
    borderRadius: 8,
    fontFamily: FONT,
    fontSize: 14,
    colorTextBase: "#F9FAFB",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)",
  },
  components: {
    Layout: {
      siderBg: colors.darkBg,
      headerBg: "rgba(26, 29, 35, 0.8)", // translucent
      bodyBg: colors.darkBg,
    },
    Menu: {
      darkItemBg: "transparent",
      darkItemSelectedBg: "rgba(239,68,68,0.15)",
      darkItemSelectedColor: "#FFFFFF",
      darkItemHoverBg: "rgba(255,255,255,0.04)",
      darkSubMenuItemBg: "transparent",
    },
    Card: {
      colorBgContainer: colors.darkSurface,
      borderRadiusLG: 16,
      boxShadowTertiary: "0 4px 20px rgba(0, 0, 0, 0.15)",
      colorBorderSecondary: colors.darkBorder,
    },
    Table: {
      headerBg: "transparent",
      rowHoverBg: "rgba(255, 255, 255, 0.02)",
      colorBgContainer: "transparent",
      borderColor: colors.darkBorder,
    },
    Modal: {
      colorBgContainer: colors.darkSurface,
      borderRadiusLG: 16,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      fontWeight: 500,
      colorBgContainer: "rgba(255, 255, 255, 0.05)",
      colorBorder: "rgba(255, 255, 255, 0.1)",
    },
  },
};

/**
 * Get the Ant Design ThemeConfig for the current mode.
 * Used by App.tsx: <ConfigProvider theme={getAntdTheme(mode)}>
 */
export function getAntdTheme(mode: "light" | "dark"): ThemeConfig {
  return mode === "dark" ? darkTheme : lightTheme;
}

/**
 * Backward-compatible default export — keeps existing code working.
 * This remains the light-mode theme.
 */
export const antdTheme: ThemeConfig = lightTheme;
