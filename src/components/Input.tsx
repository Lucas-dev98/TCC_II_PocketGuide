/**
 * Input Premium - Componente de entrada com validação
 * Features: Ícone, label flutuante, validação, hint, contador
 * Autor: GitHub Copilot
 * Data: 22 de outubro de 2025
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type InputState = 'default' | 'focused' | 'filled' | 'error' | 'success' | 'loading';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  onSuffixPress?: () => void;
  error?: string;
  hint?: string;
  helpText?: string;
  maxLength?: number;
  showCounter?: boolean;
  disabled?: boolean;
  state?: InputState;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
}

export const Input = React.memo(
  ({
    label,
    placeholder,
    value,
    onChangeText,
    icon,
    suffixIcon,
    onSuffixPress,
    error,
    hint,
    helpText,
    maxLength,
    showCounter = false,
    disabled = false,
    state = 'default',
    multiline = false,
    numberOfLines = 1,
    secureTextEntry = false,
    keyboardType = 'default',
    style,
  }: InputProps) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const styles = useMemo(() => createStyles(theme), [theme]);

    const hasError = !!error;
    const hasSuccess = state === 'success';
    const isLoading = state === 'loading';
    const isFilled = value.length > 0;

    // Calcular container border color
    const getContainerBorderColor = () => {
      if (disabled) return theme.colors.neutral[200];
      if (hasError) return theme.colors.error;
      if (hasSuccess) return theme.colors.success;
      if (isFocused) return theme.colors.primary[500];
      if (isFilled) return theme.colors.border;
      return theme.colors.borderLight;
    };

    // Calcular background color
    const getBackgroundColor = () => {
      if (disabled) return theme.colors.neutral[50];
      if (isFocused || isFilled) return theme.colors.background;
      return theme.colors.surface;
    };

    const containerBorderColor = getContainerBorderColor();
    const backgroundColor = getBackgroundColor();

    const characterCount = `${value.length}${maxLength ? `/${maxLength}` : ''}`;

    return (
      <View style={[styles.wrapper, style]}>
        {/* Label */}
        {label && (
          <Text
            style={[
              styles.label,
              (isFocused || isFilled) && styles.labelFloating,
              hasError && styles.labelError,
            ]}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View
          style={[
            styles.container,
            {
              borderColor: containerBorderColor,
              backgroundColor,
            },
            hasError && styles.containerError,
            isFocused && styles.containerFocused,
          ]}
        >
          {/* Prefix Icon */}
          {icon && <View style={styles.icon}>{icon}</View>}

          {/* TextInput */}
          <TextInput
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              { color: theme.colors.onSurface },
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.neutral[400]}
            value={value}
            onChangeText={onChangeText}
            editable={!disabled && !isLoading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={numberOfLines}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            accessibilityLabel={label}
            accessibilityHint={hint}
            accessibilityState={{
              disabled: disabled || isLoading,
            }}
          />

          {/* Suffix Icon / Loading */}
          {isLoading ? (
            <ActivityIndicator
              color={theme.colors.primary[500]}
              size="small"
              style={styles.suffixIcon}
            />
          ) : suffixIcon && onSuffixPress ? (
            <TouchableOpacity
              onPress={onSuffixPress}
              disabled={disabled}
              style={styles.suffixIconButton}
            >
              <View style={styles.suffixIcon}>{suffixIcon}</View>
            </TouchableOpacity>
          ) : suffixIcon ? (
            <View style={styles.suffixIcon}>{suffixIcon}</View>
          ) : null}
        </View>

        {/* Helper Text */}
        <View style={styles.helperContainer}>
          {hasError && error ? (
            <Text style={[styles.helperText, styles.errorText]} numberOfLines={2}>
              {error}
            </Text>
          ) : hint && !isFocused ? (
            <Text style={[styles.helperText, styles.hintText]}>{hint}</Text>
          ) : helpText ? (
            <Text style={[styles.helperText, styles.helpText]}>{helpText}</Text>
          ) : null}

          {showCounter && maxLength && (
            <Text
              style={[
                styles.counterText,
                value.length > maxLength * 0.9 && styles.counterWarning,
              ]}
            >
              {characterCount}
            </Text>
          )}
        </View>
      </View>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// ESTILOS
// ============================================================================

const createStyles = (theme: any) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.label2.fontSize,
      fontWeight: theme.typography.label2.fontWeight as any,
      color: theme.colors.neutral[600],
      marginBottom: theme.spacing.xs,
      letterSpacing: theme.typography.label2.letterSpacing,
    },
    labelFloating: {
      fontSize: theme.typography.label2.fontSize,
      color: theme.colors.primary[500],
    },
    labelError: {
      color: theme.colors.error,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minHeight: 48,
    },
    containerFocused: {
      borderWidth: 2,
    },
    containerError: {
      backgroundColor: '#FEF2F2',
    },
    icon: {
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight as any,
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    inputMultiline: {
      paddingVertical: theme.spacing.sm,
      minHeight: 100,
    },
    suffixIcon: {
      marginLeft: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    suffixIconButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
    helperContainer: {
      marginTop: theme.spacing.xs,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    helperText: {
      fontSize: theme.typography.caption.fontSize,
      lineHeight: theme.typography.caption.lineHeight,
      flex: 1,
    },
    errorText: {
      color: theme.colors.error,
      fontWeight: '500',
    },
    hintText: {
      color: theme.colors.neutral[500],
      fontStyle: 'italic',
    },
    helpText: {
      color: theme.colors.neutral[600],
    },
    counterText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.neutral[500],
      marginLeft: theme.spacing.sm,
    },
    counterWarning: {
      color: theme.colors.warning,
      fontWeight: '600',
    },
  });
