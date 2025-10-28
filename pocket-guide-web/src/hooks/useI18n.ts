import { useTranslation } from 'react-i18next';

export function useI18n() {
  const { t, i18n } = useTranslation();

  return {
    t,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
    isLoading: i18n.isInitialized === false,
    // Idiomas disponíveis
    languages: [
      { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
      { code: 'en-US', name: 'English', flag: '🇺🇸' },
      { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    ],
  };
}

export default useI18n;
