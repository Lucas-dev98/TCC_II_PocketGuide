import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchCities, CitySuggestion } from '../services/mapboxGeocoding';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface CityAutocompleteProps {
  value: string;
  onCitySelect: (city: string, country: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  language?: string;
  className?: string;
}

/**
 * Componente de Autocomplete de Cidades usando Mapbox Geocoding API
 * Mostra sugestões enquanto o usuário digita
 */
export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onCitySelect,
  placeholder = 'Buscar cidade...',
  language = 'en',
  className = '',
}) => {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showDropdownHint, setShowDropdownHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar inputValue quando value prop muda (de fora do componente)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce para buscar cidades enquanto o usuário digita
  // MAS o dropdown SÓ abre se o usuário clicar na seta ou focar o input
  useEffect(() => {
    console.log('🔄 Debounce acionado:', { inputValue });
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!inputValue.trim()) {
      console.log('⏭️ Input vazio');
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      console.log('⏱️ Buscando cidades:', inputValue);
      try {
        const results = await searchCities(inputValue, language);
        console.log('✅ Resultados carregados:', results.length);
        setSuggestions(results);
        
        // NÃO abre o dropdown automaticamente
        // Apenas carrega as sugestões para exibir quando o usuário abrir
      } catch (error) {
        console.error('❌ Erro ao buscar:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, language]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = useCallback((suggestion: CitySuggestion) => {
    console.log('✅ Selecionando cidade:', { city: suggestion.city, country: suggestion.country });
    
    // Atualizar input com o nome completo
    setInputValue(`${suggestion.city}, ${suggestion.country}`);
    
    // Chamar callback para atualizar o formulário pai
    onCitySelect(suggestion.city, suggestion.country, suggestion.coordinates);
    
    // Fechar dropdown IMEDIATAMENTE após seleção
    setIsOpen(false);
    setSuggestions([]);
  }, [onCitySelect]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            // Ocultar hint quando começar a digitar
            if (e.target.value.trim()) {
              setShowDropdownHint(false);
            }
          }}
          onFocus={() => {
            console.log('📍 Campo focado');
            // Se tem sugestões carregadas, abrir o dropdown
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
            // Enter não submete o form
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                     focus:outline-none focus:border-blue-500 dark:focus:border-blue-400
                     transition-all duration-200"
        />

        {/* Indicador de carregamento */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Botão da seta para abrir/fechar - APENAS se tem texto */}
        {!isLoading && inputValue.trim() && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔽 Seta clicada');
              setIsOpen(!isOpen);
            }}
            className={clsx(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
              'transition-all duration-200 p-1 cursor-pointer',
              isOpen && 'text-blue-500'
            )}
            title={isOpen ? 'Fechar sugestões' : 'Abrir sugestões'}
          >
            <ChevronDown
              size={20}
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {/* Hint sutil quando vazio */}
        {showDropdownHint && !inputValue.trim() && !isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs pointer-events-none opacity-70">
            Digite...
          </div>
        )}
      </div>

      {/* Dropdown com sugestões */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600
                        rounded-lg shadow-xl max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.city}-${suggestion.country}-${index}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('✅ Selecionado:', suggestion);
                handleSelectCity(suggestion);
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700
                         transition-colors duration-150 border-b border-slate-100 dark:border-slate-700 last:border-b-0
                         focus:outline-none focus:bg-blue-100 dark:focus:bg-slate-700 cursor-pointer
                         group/item"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {suggestion.city}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {suggestion.country}
                  </div>
                </div>
                <div className="ml-2 text-slate-300 dark:text-slate-600 group-hover/item:text-blue-400 transition-colors">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Estado vazio com sugestões carregadas mas dropdown fechado */}
      {isOpen && suggestions.length === 0 && inputValue.trim() && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600
                        rounded-lg shadow-lg p-4 text-center text-slate-500 dark:text-slate-400">
          <div className="text-sm">Nenhuma cidade encontrada</div>
          <div className="text-xs mt-1 opacity-70">Tente outro nome ou verifique a grafia</div>
        </div>
      )}
    </div>
  );
};
