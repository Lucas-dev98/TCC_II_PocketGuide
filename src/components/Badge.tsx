/**
 * Badge - Componente para status, tags, labels
 * Features: Múltiplas variantes, ícone, contador
 * Autor: GitHub Copilot
 * Data: 22 de outubro de 2025
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  label: string | number;
  style?: ViewStyle;
  dot?: boolean;
}

export const Badge = React.memo(
  ({
    variant = 'primary',
    size = 'md',
    icon,
    label,
    style,
    dot = false,
  }: BadgeProps) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme, variant, size), [theme, variant, size]);

    if (dot) {
      return (
        <View
          style={[styles.dot, style]}
          accessible
          accessibilityLabel={`${variant} badge`}
        />
      );
    }

    return (
      <View
        style={[styles.badge, style]}
        accessible
        accessibilityLabel={`${label} ${variant} badge`}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.text}>{label}</Text>
      </View>
    );
  }
);

Badge.displayName = 'Badge';

// ============================================================================
// ESTILOS
// ============================================================================

const createStyles = (theme: any, variant: BadgeVariant, size: BadgeSize) => {
  const variantMap = {
    primary: {
      backgroundColor: theme.colors.primary[100],
      textColor: theme.colors.primary[700],
      borderColor: theme.colors.primary[300],
    },
    secondary: {
      backgroundColor: theme.colors.neutral[100],
      textColor: theme.colors.neutral[700],
      borderColor: theme.colors.neutral[300],
    },
    success: {
      backgroundColor: '#D1FAE5',
      textColor: '#065F46',
      borderColor: '#A7F3D0',
    },
    warning: {
      backgroundColor: '#FEF3C7',
      textColor: '#92400E',
      borderColor: '#FCD34D',
    },
    error: {
      backgroundColor: '#FEE2E2',
      textColor: '#991B1B',
      borderColor: '#FECACA',
    },
    info: {
      backgroundColor: '#DBEAFE',
      textColor: '#1E40AF',
      borderColor: '#93C5FD',
    },
  };

  const sizeMap = {
    sm: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      fontSize: theme.typography.caption.fontSize,
      height: 20,
    },
    md: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.label2.fontSize,
      height: 24,
    },
    lg: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.label1.fontSize,
      height: 32,
    },
  };

  const current = variantMap[variant];
  const currentSize = sizeMap[size];

  return StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: current.backgroundColor,
      borderRadius: theme.borderRadius.full,
      paddingVertical: currentSize.paddingVertical,
      paddingHorizontal: currentSize.paddingHorizontal,
      borderWidth: 1,
      borderColor: current.borderColor,
      height: currentSize.height,
      justifyContent: 'center',
    },
    icon: {
      marginRight: theme.spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: currentSize.fontSize,
      fontWeight: '600',
      color: current.textColor,
    },
    dot: {
      width: size === 'sm' ? 8 : size === 'md' ? 10 : 12,
      height: size === 'sm' ? 8 : size === 'md' ? 10 : 12,
      borderRadius: size === 'sm' ? 4 : size === 'md' ? 5 : 6,
      backgroundColor: variantMap[variant].backgroundColor,
      borderWidth: 1,
      borderColor: variantMap[variant].borderColor,
    },
  });
};
