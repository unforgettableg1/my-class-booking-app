// src/theme.ts
const THEME = {
  colors: {
    primary: '#0B84FF',      // strong brand blue (primary)
    accent: '#00C2A8',       // teal accent
    bg: '#F5F7FB',
    surface: '#FFFFFF',
    text: '#051129',
    muted: '#64748B',
    success: '#16A34A',
    danger: '#EF4444',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
  }
};

export default THEME;
export type Theme = typeof THEME;
