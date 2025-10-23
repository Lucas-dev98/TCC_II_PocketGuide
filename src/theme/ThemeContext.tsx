/**
 * Theme Context - Gerenciamento de tema (light/dark)
 * Permite alternar entre temas e persistir preferência
 * Autor: GitHub Copilot
 * Data: 22 de outubro de 2025
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, type Theme } from './index';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar preferência de tema salva
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode');
        if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
          setModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  // Atualizar tema quando modo ou sistema muda
  useEffect(() => {
    if (!isLoaded) return;

    const shouldBeDark = mode === 'auto'
      ? systemColorScheme === 'dark'
      : mode === 'dark';

    setIsDark(shouldBeDark);
  }, [mode, systemColorScheme, isLoaded]);

  const handleSetMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem('themeMode', newMode);
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        mode,
        setMode: handleSetMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook para acessar tema atual e contexto
 * @returns Contexto de tema
 * @example
 * const { theme, isDark, setMode } = useTheme();
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};

/**
 * Hook para usar cores do tema atual
 * @returns Cores do tema atual
 * @example
 * const colors = useThemeColors();
 */
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

/**
 * Hook para usar tipografia do tema
 * @returns Tipografia
 * @example
 * const typography = useThemeTypography();
 */
export const useThemeTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

/**
 * Hook para usar espaçamento do tema
 * @returns Espaçamento
 * @example
 * const spacing = useThemeSpacing();
 */
export const useThemeSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

/**
 * HOC para componentes com suporte a tema
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
): React.FC<P> => {
  const ThemedComponent: React.FC<P> = (props) => {
    const { theme } = useTheme();
    return <Component {...(props as P)} theme={theme} />;
  };

  ThemedComponent.displayName = `withTheme(${Component.displayName || 'Component'})`;
  return ThemedComponent;
};
