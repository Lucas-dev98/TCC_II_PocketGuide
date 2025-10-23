/**
 * Design System Premium - Pocket Guide
 * Tema consolidado com cores, tipografia, espaçamento e componentes
 * Base: iOS/Material Design 3 + Accessibility
 * Autor: GitHub Copilot
 * Data: 22 de outubro de 2025
 */

// ============================================================================
// CORES - PALETA PROFISSIONAL
// ============================================================================

export const colors = {
  // Primary - Azul moderno vibrante
  primary: {
    0: '#FFFFFF',
    50: '#F0F7FF',
    100: '#E0EEFF',
    200: '#C1DEFF',
    300: '#A2CEFF',
    400: '#83BEFF',
    500: '#4A9EFF',    // Main - Uso principal
    600: '#2E7FD9',
    700: '#2166B3',
    800: '#144D8D',
    900: '#0D3467',
  },

  // Secondary - Laranja energético
  secondary: {
    50: '#FFF5F0',
    100: '#FFE6D9',
    200: '#FFC9A3',
    300: '#FFAD6D',
    400: '#FF9037',
    500: '#FF8C42',    // Main
    600: '#D97035',
    700: '#B35628',
    800: '#8D401B',
    900: '#672B0E',
  },

  // Accent - Rosa para highlights
  accent: {
    50: '#FFF5F7',
    500: '#EC4899',
    900: '#831843',
  },

  // Semantic - Status colors
  success: '#10B981',  // Verde
  warning: '#F59E0B',  // Âmbar
  error: '#EF4444',    // Vermelho
  info: '#3B82F6',     // Azul

  // Neutral - Escala profissional
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Backgrounds
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceVariant: '#F3F4F6',
  surfaceInverse: '#1F2937',

  // Text
  onBackground: '#111827',
  onSurface: '#1F2937',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
};

// Dark mode colors
export const colorsDark = {
  primary: {
    ...colors.primary,
    500: '#5AB3FF',    // Slightly lighter for dark mode
  },
  secondary: colors.secondary,
  success: '#34D399',  // Lighter green
  warning: '#FBBF24',  // Lighter amber
  error: '#F87171',    // Lighter red
  info: '#60A5FA',     // Lighter blue
  neutral: {
    0: '#FFFFFF',
    50: '#1F2937',
    100: '#111827',
    200: '#0F172A',
    300: '#020617',
    400: '#1E293B',
    500: '#64748B',
    600: '#94A3B8',
    700: '#CBD5E1',
    800: '#E2E8F0',
    900: '#F8FAFC',
  },
  background: '#111827',
  surface: '#1F2937',
  surfaceVariant: '#374151',
  surfaceInverse: '#F9FAFB',
  onBackground: '#F9FAFB',
  onSurface: '#E5E7EB',
  onPrimary: '#111827',
  onSecondary: '#111827',
  border: '#374151',
  borderLight: '#1F2937',
};

// ============================================================================
// TIPOGRAFIA
// ============================================================================

export const typography = {
  // Display - Headlines grandes
  display1: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  display2: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },

  // Heading
  h1: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  h2: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },

  // Body
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
  },
  body3: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },

  // Label
  label1: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  label2: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },

  // Caption
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
  },
};

// ============================================================================
// ESPAÇAMENTO (Base 4px)
// ============================================================================

export const spacing = {
  xxs: 2,    // 2px
  xs: 4,     // 4px
  sm: 8,     // 8px
  md: 12,    // 12px
  lg: 16,    // 16px
  xl: 24,    // 24px
  xxl: 32,   // 32px
  xxxl: 48,  // 48px
  xxxxl: 64, // 64px
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 2,      // Minimal
  sm: 4,      // Small buttons, chips
  md: 8,      // Cards, inputs
  lg: 12,     // Large elements
  xl: 16,     // Modal, sheets
  full: 9999, // Pills, circles
};

// ============================================================================
// SHADOWS (ELEVAÇÃO)
// ============================================================================

export const shadows = {
  none: 'none' as const,

  // Level 1 - Subtle (inputs, small elements)
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',

  // Level 2 - Buttons, cards pequenas
  md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',

  // Level 3 - Cards, lists
  lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',

  // Level 4 - Modals, popovers
  xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',

  // Level 5 - Floating actions
  xxl: '0 25px 50px rgba(0, 0, 0, 0.15)',
};

export const shadowsDark = {
  none: 'none' as const,
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.3), 0 10px 10px rgba(0, 0, 0, 0.2)',
  xxl: '0 25px 50px rgba(0, 0, 0, 0.4)',
};

// ============================================================================
// DURAÇÃO DE ANIMAÇÕES (ms)
// ============================================================================

export const animations = {
  fast: 150,      // Quick interactions
  normal: 300,    // Standard transitions
  slow: 500,      // Complex animations
  verySlow: 800,  // Page transitions
};

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const easing = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
};

// ============================================================================
// BREAKPOINTS (RESPONSIVE)
// ============================================================================

export const breakpoints = {
  xs: 320,    // Mobile
  sm: 480,    // Landscape mobile
  md: 768,    // Tablet
  lg: 1024,   // Desktop
  xl: 1280,   // Large desktop
};

// ============================================================================
// COMPONENTES - ESTILOS RÁPIDOS
// ============================================================================

export const componentStyles = {
  // Button
  button: {
    primary: {
      base: {
        backgroundColor: colors.primary[500],
        color: colors.onPrimary,
      },
      hover: {
        backgroundColor: colors.primary[600],
      },
      active: {
        backgroundColor: colors.primary[700],
      },
      disabled: {
        backgroundColor: colors.neutral[200],
        color: colors.neutral[400],
      },
    },
    secondary: {
      base: {
        backgroundColor: colors.neutral[100],
        color: colors.onBackground,
      },
      hover: {
        backgroundColor: colors.neutral[200],
      },
      active: {
        backgroundColor: colors.neutral[300],
      },
      disabled: {
        backgroundColor: colors.neutral[50],
        color: colors.neutral[400],
      },
    },
  },

  // Input
  input: {
    base: {
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.onSurface,
    },
    focused: {
      borderColor: colors.primary[500],
      backgroundColor: colors.background,
    },
    error: {
      borderColor: colors.error,
      backgroundColor: colors.background,
    },
    success: {
      borderColor: colors.success,
      backgroundColor: colors.background,
    },
    disabled: {
      backgroundColor: colors.neutral[50],
      color: colors.neutral[400],
    },
  },

  // Card
  card: {
    base: {
      backgroundColor: colors.surface,
      borderColor: colors.borderLight,
    },
    hover: {
      backgroundColor: colors.neutral[50],
    },
    pressed: {
      backgroundColor: colors.neutral[100],
    },
  },

  // Badge
  badge: {
    primary: {
      backgroundColor: colors.primary[500],
      color: colors.onPrimary,
    },
    success: {
      backgroundColor: colors.success,
      color: colors.onPrimary,
    },
    warning: {
      backgroundColor: colors.warning,
      color: colors.onPrimary,
    },
    error: {
      backgroundColor: colors.error,
      color: colors.onPrimary,
    },
  },
};

// ============================================================================
// TOUCH TARGETS (ACESSIBILIDADE)
// ============================================================================

export const touchTargets = {
  minimum: 44,  // Mínimo recomendado iOS
  recommended: 48,  // Recomendado WCAG
  comfortable: 56,   // Confortável
};

// ============================================================================
// COMBINED THEME
// ============================================================================

export const lightTheme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  easing,
  breakpoints,
  componentStyles,
  touchTargets,
  isDark: false,
};

export const darkTheme = {
  colors: colorsDark,
  typography,
  spacing,
  borderRadius,
  shadows: shadowsDark,
  animations,
  easing,
  breakpoints,
  componentStyles, // Will need dark variants
  touchTargets,
  isDark: true,
};

export type Theme = typeof lightTheme;

export default lightTheme;
