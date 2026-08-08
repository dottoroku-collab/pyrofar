import type { ThemeConfig } from "antd";

/**
 * Token warna & tipografi ini mengikuti Tahap 9 (UI Mockup):
 * merah Damkar, near-black untuk sidebar gelap, abu muda untuk background.
 */
export const colors = {
  redPrimary: "#C0272D",
  redDark: "#8F1D22",
  nearBlack: "#15171B",
  grayPage: "#F3F4F6",
  white: "#FFFFFF",
  grayBorder: "#E4E6EB",
  grayText: "#6B7280",
  greenOk: "#1E9E5A",
  amberWarn: "#D9822B",
};

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.redPrimary,
    colorSuccess: colors.greenOk,
    colorWarning: colors.amberWarn,
    colorError: colors.redPrimary,
    colorBgLayout: colors.grayPage,
    borderRadius: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  components: {
    Layout: {
      siderBg: colors.nearBlack,
      headerBg: colors.white,
    },
    Menu: {
      darkItemBg: colors.nearBlack,
      darkItemSelectedBg: "rgba(192,39,45,0.16)",
      darkItemSelectedColor: colors.white,
    },
    Card: {
      boxShadowTertiary: "0 1px 3px rgba(15,15,20,.06)",
    },
  },
};
