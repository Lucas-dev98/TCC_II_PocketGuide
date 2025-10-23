/**
 * Card Premium - Componente card com elevação e estados
 * Features: Múltiplos níveis de elevação, pressionável, divisores
 * Autor: GitHub Copilot
 * Data: 22 de outubro de 2025
 */

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type CardElevation = 'sm' | 'md' | 'lg' | 'xl';

interface CardProps {
  elevation?: CardElevation;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  borderless?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

interface CardSectionProps {
  divider?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Card Principal
 */
const CardComponent = React.memo(
  ({
    elevation = 'md',
    onPress,
    onLongPress,
    disabled = false,
    borderless = false,
    style,
    children,
  }: CardProps) => {
    const { theme } = useTheme();
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const styles = useMemo(() => createStyles(theme, elevation, borderless), [
      theme,
      elevation,
      borderless,
    ]);

    const isPressed = React.useRef(false);

    const handlePressIn = () => {
      isPressed.current = true;
      if (onPress || onLongPress) {
        Animated.spring(scaleValue, {
          toValue: 0.98,
          useNativeDriver: true,
          speed: 20,
        }).start();
      }
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }).start();
      isPressed.current = false;
    };

    const content = (
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleValue }] },
          style,
        ]}
      >
        {children}
      </Animated.View>
    );

    if (onPress || onLongPress) {
      return (
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          accessible
          accessibilityRole="button"
          accessibilityState={{ disabled }}
        >
          {content}
        </Pressable>
      );
    }

    return content;
  }
);

CardComponent.displayName = 'Card';

/**
 * Card.Header - Seção de cabeçalho
 */
const CardHeader = React.memo(({ divider = false, style, children }: CardSectionProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, 'md', false), [theme]);

  return (
    <View
      style={[
        styles.section,
        styles.header,
        divider && styles.divider,
        style,
      ]}
    >
      {children}
    </View>
  );
});

CardHeader.displayName = 'Card.Header';

/**
 * Card.Body - Seção de conteúdo
 */
const CardBody = React.memo(({ divider = false, style, children }: CardSectionProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, 'md', false), [theme]);

  return (
    <View
      style={[
        styles.section,
        styles.body,
        divider && styles.divider,
        style,
      ]}
    >
      {children}
    </View>
  );
});

CardBody.displayName = 'Card.Body';

/**
 * Card.Footer - Seção de rodapé
 */
const CardFooter = React.memo(({ style, children }: CardSectionProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, 'md', false), [theme]);

  return (
    <View
      style={[
        styles.section,
        styles.footer,
        style,
      ]}
    >
      {children}
    </View>
  );
});

CardFooter.displayName = 'Card.Footer';

/**
 * Card.Divider - Divisor entre seções
 */
const CardDivider = React.memo(() => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, 'md', false), [theme]);

  return <View style={styles.dividerLine} />;
});

CardDivider.displayName = 'Card.Divider';

// Exportar componentes compostos
export const Card = Object.assign(CardComponent, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Divider: CardDivider,
});

// ============================================================================
// ESTILOS
// ============================================================================

const createStyles = (theme: any, elevation: CardElevation, borderless: boolean) => {
  const elevationMap = {
    sm: theme.shadows.sm,
    md: theme.shadows.md,
    lg: theme.shadows.lg,
    xl: theme.shadows.xl,
  };

  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: borderless ? 0 : 1,
      borderColor: theme.colors.borderLight,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: elevation === 'sm' ? 2 : elevation === 'md' ? 4 : elevation === 'lg' ? 6 : 8,
      elevation: elevation === 'sm' ? 2 : elevation === 'md' ? 4 : elevation === 'lg' ? 8 : 12,
    },
    section: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    header: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 0,
    },
    body: {
      flex: 1,
    },
    footer: {
      backgroundColor: theme.colors.surface,
      paddingTop: theme.spacing.md,
      borderTopWidth: 0,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
      marginBottom: 0,
      paddingBottom: 0,
    },
    dividerLine: {
      height: 1,
      backgroundColor: theme.colors.borderLight,
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.sm,
    },
  });
};
