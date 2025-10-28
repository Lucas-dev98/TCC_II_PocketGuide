import React, { useState } from 'react';
import useI18n from '../hooks/useI18n';

export const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage, languages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      {/* Botão de seleção de idioma */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Selecionar idioma / Select language / Seleccionar idioma"
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage?.name}
        </span>
      </button>

      {/* Dropdown de idiomas */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[200px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 ${
                language === lang.code
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-indigo-600 dark:text-indigo-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fechar dropdown ao clicar fora */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;
