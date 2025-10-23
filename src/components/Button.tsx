/**
 * Button Premium - Componente button com 4 variants
 * Autor: GitHub Copilot
 * Data: 22 de outubro de 2025
 */

import React, { useMemo } from 'react';
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Pressable,
  View,
  Animated,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onPress: () => void;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button = React.memo(
  ({
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    children,
    onPress,
    fullWidth = false,
    style,
  }: ButtonProps) => {
    const { theme } = useTheme();
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const styles = useMemo(() => createStyles(theme, variant, size), [theme, variant, size]);

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 20,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }).start();
    };

    const isDisabled = disabled || loading;

    return (
      <Animated.View
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          accessible
          accessibilityLabel={typeof children === 'string' ? children : 'Button'}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.button,
                pressed && !isDisabled && styles.pressed,
                isDisabled && styles.disabled,
                style,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  color={styles.text.color}
                  size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
                  style={icon ? { marginRight: theme.spacing.xs } : undefined}
                />
              ) : icon ? (
                <View style={{ marginRight: theme.spacing.sm }}>{icon}</View>
              ) : null}

              <Text
                style={[
                  styles.text,
                  ...(loading && icon ? [{ marginLeft: theme.spacing.xs }] : []),
                ]}
              >
                {typeof children === 'string' ? children : children}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// ESTILOS
// ============================================================================

const createStyles = (theme: any, variant: ButtonVariant, size: ButtonSize) => {
  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      minHeight: 32,
      fontSize: 12,
      fontWeight: 600,
    },
    md: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 44,
      fontSize: 14,
      fontWeight: 600,
    },
    lg: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      minHeight: 56,
      fontSize: 16,
      fontWeight: 700,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary[500],
      textColor: theme.colors.onPrimary,
      pressedBackground: theme.colors.primary[600],
      disabledBackground: theme.colors.neutral[200],
      disabledText: theme.colors.neutral[400],
    },
    secondary: {
      backgroundColor: theme.colors.neutral[100],
      textColor: theme.colors.onBackground,
      pressedBackground: theme.colors.neutral[200],
      disabledBackground: theme.colors.neutral[50],
      disabledText: theme.colors.neutral[400],
    },
    tertiary: {
      backgroundColor: 'transparent',
      textColor: theme.colors.primary[500],
      pressedBackground: theme.colors.primary[50],
      disabledBackground: 'transparent',
      disabledText: theme.colors.neutral[400],
    },
    destructive: {
      backgroundColor: theme.colors.error,
      textColor: theme.colors.onPrimary,
      pressedBackground: '#DC2626',
      disabledBackground: theme.colors.neutral[200],
      disabledText: theme.colors.neutral[400],
    },
  };

  const current = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return StyleSheet.create({
    container: {
      width: '100%',
    },
    fullWidth: {
      width: '100%',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: current.backgroundColor,
      paddingVertical: currentSize.paddingVertical,
      paddingHorizontal: currentSize.paddingHorizontal,
      borderRadius: theme.borderRadius.md,
      minHeight: currentSize.minHeight,
    },
    pressed: {
      backgroundColor: current.pressedBackground,
      opacity: 0.9,
    },
    disabled: {
      backgroundColor: current.disabledBackground,
      opacity: 0.6,
    },
    text: {
      fontSize: currentSize.fontSize,
      fontWeight: currentSize.fontWeight as any,
      color: current.textColor,
    },
  });
};
