/**
 * DAMKAR CLOUD PLATFORM — Design Token System
 *
 * Centralized semantic tokens for light and dark modes.
 * Import this file instead of hardcoding colors anywhere.
 *
 * Usage:
 *   import { useTokens } from '@/theme/tokens';
 *   const t = useTokens();
 *   style={{ color: t.textPrimary, background: t.surface }}
 */

export interface ThemeTokens {
  // Backgrounds
  bg: string;
  surface: string;
  surfaceElevated: string;
  surfaceHover: string;

  // Borders
  border: string;
  borderStrong: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Brand
  primary: string;
  primaryHover: string;
  primarySubtle: string;

  // Status
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  danger: string;
  dangerSubtle: string;
  info: string;
  infoSubtle: string;

  // Emergency (operational)
  emergency: string;
  emergencySubtle: string;
  critical: string;
  criticalSubtle: string;

  // Sidebar
  sidebarBg: string;
  sidebarText: string;
  sidebarTextMuted: string;
  sidebarBorder: string;
  sidebarItemHover: string;
  sidebarItemActive: string;
  sidebarGroupLabel: string;
  sidebarAccentBar: string;

  // Topbar
  topbarBg: string;
  topbarBorder: string;
  topbarText: string;

  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
}

export const lightTokens: ThemeTokens = {
  bg: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHover: '#F9FAFB',

  border: '#E4E6EB',
  borderStrong: '#D1D5DB',

  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  primary: '#C62828',
  primaryHover: '#B71C1C',
  primarySubtle: '#FEE2E2',

  success: '#059669',
  successSubtle: '#D1FAE5',
  warning: '#D97706',
  warningSubtle: '#FEF3C7',
  danger: '#DC2626',
  dangerSubtle: '#FEE2E2',
  info: '#2563EB',
  infoSubtle: '#DBEAFE',

  emergency: '#7F1D1D',
  emergencySubtle: '#FEE2E2',
  critical: '#991B1B',
  criticalSubtle: '#FEF2F2',

  sidebarBg: '#1A1D23',
  sidebarText: '#E5E7EB',
  sidebarTextMuted: '#6B7280',
  sidebarBorder: '#2D3139',
  sidebarItemHover: '#22262F',
  sidebarItemActive: '#C62828',
  sidebarGroupLabel: '#6B7280',
  sidebarAccentBar: '#C62828',

  topbarBg: '#FFFFFF',
  topbarBorder: '#E4E6EB',
  topbarText: '#111827',

  shadowSm: '0 1px 3px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.10)',
};

export const darkTokens: ThemeTokens = {
  bg: '#0F1117',
  surface: '#1A1D23',
  surfaceElevated: '#22262F',
  surfaceHover: '#2A2F3A',

  border: '#2D3139',
  borderStrong: '#3D4149',

  textPrimary: '#F3F4F6',
  textSecondary: '#D1D5DB',
  textMuted: '#6B7280',
  textInverse: '#111827',

  primary: '#EF4444',
  primaryHover: '#DC2626',
  primarySubtle: '#450A0A',

  success: '#34D399',
  successSubtle: '#064E3B',
  warning: '#FBBF24',
  warningSubtle: '#451A03',
  danger: '#F87171',
  dangerSubtle: '#450A0A',
  info: '#60A5FA',
  infoSubtle: '#1E3A5F',

  emergency: '#FCA5A5',
  emergencySubtle: '#450A0A',
  critical: '#FCA5A5',
  criticalSubtle: '#3B0A0A',

  sidebarBg: '#0F1117',
  sidebarText: '#E5E7EB',
  sidebarTextMuted: '#6B7280',
  sidebarBorder: '#1E2028',
  sidebarItemHover: '#1A1D23',
  sidebarItemActive: '#EF4444',
  sidebarGroupLabel: '#4B5563',
  sidebarAccentBar: '#EF4444',

  topbarBg: '#1A1D23',
  topbarBorder: '#2D3139',
  topbarText: '#F3F4F6',

  shadowSm: '0 1px 3px rgba(0,0,0,0.40)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.40)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.50)',
};

/** Typography scale */
export const typography = {
  fontFamily: "'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
  fontSizeXs: 11,
  fontSizeSm: 12,
  fontSizeMd: 14,
  fontSizeLg: 16,
  fontSizeXl: 18,
  fontSize2xl: 22,
  fontSize3xl: 28,
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightSemibold: 600,
  fontWeightBold: 700,
  lineHeightTight: 1.25,
  lineHeightBase: 1.5,
  lineHeightRelaxed: 1.75,
};

/** Spacing scale (px values) */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

/** Border radius scale */
export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
};

/** Status color mapping (for incident/operational use) */
export const statusColors = {
  light: {
    CRITICAL: '#7F1D1D',
    HIGH:     '#DC2626',
    MEDIUM:   '#D97706',
    LOW:      '#2563EB',
    RESOLVED: '#059669',
    STANDBY:  '#6B7280',
  },
  dark: {
    CRITICAL: '#FCA5A5',
    HIGH:     '#F87171',
    MEDIUM:   '#FBBF24',
    LOW:      '#60A5FA',
    RESOLVED: '#34D399',
    STANDBY:  '#9CA3AF',
  },
};
