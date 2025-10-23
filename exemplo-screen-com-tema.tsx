/**
 * exemplo-screen-com-tema.tsx
 * Exemplo de como integrar o design system em um Screen
 * Autor: GitHub Copilot
 * Data: 22 de outubro de 2025
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useTheme, useThemeColors, useThemeSpacing } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

/**
 * Exemplo de Screen com Design System Integrado
 * Demonstra: Tema, Componentes, Animações, Acessibilidade
 */
export const ExampleScreen: React.FC = () => {
  const { theme, isDark, setMode } = useTheme();
  const colors = useThemeColors();
  const spacing = useThemeSpacing();

  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const styles = useStyles(theme);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleDestinationChange = useCallback((text: string) => {
    setDestination(text);
    setError(''); // Limpar erro ao digitar
  }, []);

  const handleCreateTrip = useCallback(async () => {
    // Validar
    if (!destination.trim()) {
      setError('Digite um destino');
      return;
    }

    // Loading
    setLoading(true);
    try {
      // Simulando API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Sucesso
      setDestination('');
      console.log('Viagem criada:', destination);
    } catch (err) {
      setError('Erro ao criar viagem');
    } finally {
      setLoading(false);
    }
  }, [destination]);

  const handleToggleDarkMode = useCallback(
    (value: boolean) => {
      setMode(value ? 'dark' : 'light');
    },
    [setMode]
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessible
      accessibilityLabel="Example screen"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================================ */}
        {/* HEADER COM TÍTULO */}
        {/* ================================================================ */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.onBackground },
            ]}
            accessible
            accessibilityRole="header"
          >
            ✨ Design System Demo
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.neutral[600] },
            ]}
          >
            Exemplo de integração completa
          </Text>
        </View>

        {/* ================================================================ */}
        {/* DARK MODE TOGGLE */}
        {/* ================================================================ */}
        <Card elevation="md" style={styles.cardWithMargin}>
          <Card.Body>
            <View
              style={[
                styles.row,
                { justifyContent: 'space-between', alignItems: 'center' },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.label,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  🌙 Dark Mode
                </Text>
                <Text
                  style={[
                    styles.hint,
                    { color: theme.colors.neutral[500] },
                  ]}
                >
                  {isDark ? 'Escuro' : 'Claro'}
                </Text>
              </View>

              <Switch
                value={isDark}
                onValueChange={handleToggleDarkMode}
                accessible
                accessibilityLabel="Toggle dark mode"
              />
            </View>
          </Card.Body>
        </Card>

        {/* ================================================================ */}
        {/* INPUT SECTION */}
        {/* ================================================================ */}
        <Card elevation="md" style={styles.cardWithMargin}>
          <Card.Header>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              🌍 Criar Viagem
            </Text>
          </Card.Header>

          <Card.Divider />

          <Card.Body>
            <Input
              label="Destino"
              placeholder="Paris, Nova York, Tokyo..."
              value={destination}
              onChangeText={handleDestinationChange}
              icon={<Text>✈️</Text>}
              error={error}
              hint="Digite um destino válido"
              maxLength={50}
              showCounter
              state={
                loading ? 'loading' : error ? 'error' : destination ? 'filled' : 'default'
              }
            />

            <View style={styles.spacing} />

            <Text
              style={[
                styles.helperText,
                { color: theme.colors.neutral[600] },
              ]}
            >
              Selecione um destino para gerar um roteiro com IA
            </Text>
          </Card.Body>

          <Card.Divider />

          <Card.Footer>
            <Button
              variant="primary"
              size="lg"
              onPress={handleCreateTrip}
              loading={loading}
              disabled={!destination.trim()}
            >
              {loading ? 'Gerando...' : 'Gerar Roteiro'}
            </Button>
          </Card.Footer>
        </Card>

        {/* ================================================================ */}
        {/* BUTTONS DEMO */}
        {/* ================================================================ */}
        <Card elevation="md" style={styles.cardWithMargin}>
          <Card.Header>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              🎯 Variantes de Button
            </Text>
          </Card.Header>

          <Card.Body>
            <View style={styles.buttonRow}>
              <Button
                variant="primary"
                size="md"
                onPress={() => console.log('Primary')}
                style={{ flex: 1 }}
              >
                Primary
              </Button>
            </View>

            <View style={styles.spacing} />

            <View style={styles.buttonRow}>
              <Button
                variant="secondary"
                size="md"
                onPress={() => console.log('Secondary')}
                style={{ flex: 1 }}
              >
                Secondary
              </Button>
            </View>

            <View style={styles.spacing} />

            <View style={styles.buttonRow}>
              <Button
                variant="tertiary"
                size="md"
                onPress={() => console.log('Tertiary')}
                style={{ flex: 1 }}
              >
                Tertiary
              </Button>
            </View>

            <View style={styles.spacing} />

            <View style={styles.buttonRow}>
              <Button
                variant="destructive"
                size="md"
                onPress={() => console.log('Destructive')}
                style={{ flex: 1 }}
              >
                Destructive
              </Button>
            </View>
          </Card.Body>
        </Card>

        {/* ================================================================ */}
        {/* BADGES DEMO */}
        {/* ================================================================ */}
        <Card elevation="md" style={styles.cardWithMargin}>
          <Card.Header>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              🏷️ Badges
            </Text>
          </Card.Header>

          <Card.Body>
            <View style={styles.badgeRow}>
              <Badge variant="primary" label="Primary" />
              <Badge variant="success" label="Success" />
            </View>

            <View style={styles.spacing} />

            <View style={styles.badgeRow}>
              <Badge variant="warning" label="Warning" />
              <Badge variant="error" label="Error" />
            </View>

            <View style={styles.spacing} />

            <View style={styles.badgeRow}>
              <Badge variant="info" label="Info" />
              <Badge variant="success" dot />
            </View>
          </Card.Body>
        </Card>

        {/* ================================================================ */}
        {/* CORES DISPONÍVEIS */}
        {/* ================================================================ */}
        <Card elevation="md" style={styles.cardWithMargin}>
          <Card.Header>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              🎨 Paleta de Cores
            </Text>
          </Card.Header>

          <Card.Body>
            <View style={styles.colorGrid}>
              <ColorSwatch
                name="Primary"
                color={theme.colors.primary[500]}
              />
              <ColorSwatch
                name="Secondary"
                color={theme.colors.secondary[500]}
              />
              <ColorSwatch
                name="Success"
                color={theme.colors.success}
              />
              <ColorSwatch
                name="Warning"
                color={theme.colors.warning}
              />
              <ColorSwatch
                name="Error"
                color={theme.colors.error}
              />
              <ColorSwatch
                name="Info"
                color={theme.colors.info}
              />
            </View>
          </Card.Body>
        </Card>

        {/* ================================================================ */}
        {/* FOOTER COM INFORMAÇÕES */}
        {/* ================================================================ */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: theme.colors.neutral[500] },
            ]}
          >
            Design System Premium v1.0
          </Text>

          <Text
            style={[
              styles.footerText,
              { color: theme.colors.neutral[400], marginTop: spacing.sm },
            ]}
          >
            Tema: {isDark ? '🌙 Dark' : '☀️ Light'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================================
// SUBCOMPONENTES
// ============================================================================

interface ColorSwatchProps {
  name: string;
  color: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, color }) => {
  const { theme } = useTheme();

  return (
    <View style={{ alignItems: 'center', marginBottom: theme.spacing.md }}>
      <View
        style={{
          width: 80,
          height: 80,
          backgroundColor: color,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing.sm,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: theme.colors.onSurface,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: theme.colors.neutral[500],
          marginTop: 2,
        }}
      >
        {color}
      </Text>
    </View>
  );
};

// ============================================================================
// ESTILOS
// ============================================================================

const useStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    header: {
      marginBottom: theme.spacing.xxl,
    },
    title: {
      fontSize: theme.typography.h1.fontSize,
      fontWeight: '700',
      marginBottom: theme.spacing.sm,
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontSize: theme.typography.body2.fontSize,
      color: theme.colors.neutral[600],
    },
    cardWithMargin: {
      marginBottom: theme.spacing.lg,
    },
    cardTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    label: {
      fontSize: theme.typography.label1.fontSize,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    hint: {
      fontSize: theme.typography.body3.fontSize,
      color: theme.colors.neutral[500],
      marginTop: theme.spacing.xs,
    },
    helperText: {
      fontSize: theme.typography.body3.fontSize,
      color: theme.colors.neutral[600],
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spacing: {
      height: theme.spacing.md,
    },
    buttonRow: {
      marginBottom: theme.spacing.md,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    footer: {
      alignItems: 'center',
      marginTop: theme.spacing.xxl,
      marginBottom: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
    },
    footerText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.neutral[500],
    },
  });
