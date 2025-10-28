import React, { createContext, useContext, useState, useEffect } from 'react';
import pt from './pt.json';
import en from './en.json';

type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
  tWithParams: (key: string, params: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Map translations
const translations: Record<Language, any> = {
  'pt-BR': pt,
  'en-US': en,
  'es-ES': pt, // TODO: Add Spanish translations later
};

/**
 * Acessa valor aninhado em objeto usando notação de ponto
 * Ex: getNestedValue({a: {b: 'valor'}}, 'a.b') => 'valor'
 */
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Substitui placeholders no formato {{key}} por valores do objeto params
 * Ex: replaceParams('Olá {{name}}', {name: 'Lucas'}) => 'Olá Lucas'
 */
function replaceParams(text: string, params: Record<string, string | number>): string {
  let result = text;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });
  return result;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Tenta recuperar do localStorage ou usar o idioma do navegador
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && translations[saved]) {
      return saved;
    }

    const browserLang = navigator.language;
    if (browserLang.startsWith('pt')) {
      return 'pt-BR';
    } else if (browserLang.startsWith('es')) {
      return 'es-ES';
    }
    return 'en-US';
  });

  // Persiste a preferência de idioma
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Função para traduzir usando notação de ponto (ex: 'components.favoriteButton.add')
  const t = (key: string, defaultValue?: string): string => {
    const translation = getNestedValue(translations[language], key);
    
    if (translation !== undefined && translation !== null) {
      return String(translation);
    }

    // Fallback para inglês se não encontrar tradução
    if (language !== 'en-US') {
      const fallback = getNestedValue(translations['en-US'], key);
      if (fallback !== undefined && fallback !== null) {
        return String(fallback);
      }
    }

    // Retorna valor padrão ou a chave
    return defaultValue || key;
  };

  // Função para traduzir com parâmetros
  const tWithParams = (key: string, params: Record<string, string | number>): string => {
    const baseTranslation = t(key);
    return replaceParams(baseTranslation, params);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, tWithParams }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n deve ser usado dentro de I18nProvider');
  }
  return context;
}
