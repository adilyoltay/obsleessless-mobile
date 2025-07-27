
/**
 * Modern wellness app color palette inspired by leading apps like Calm, Headspace
 */

const tintColorLight = '#6366f1'; // Modern indigo
const tintColorDark = '#a5b4fc';

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    border: '#e2e8f0',
    card: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    gradient: ['#6366f1', '#8b5cf6'],
    accent: '#f1f5f9',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    tint: tintColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    border: '#334155',
    card: '#1e293b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    gradient: ['#a5b4fc', '#c4b5fd'],
    accent: '#334155',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
