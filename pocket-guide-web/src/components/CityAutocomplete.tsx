import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchCities, groupSuggestions } from '../services/mapboxGeocoding';
import { CitySuggestion } from '../types';
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
 * Obter ícone baseado no tipo de local
 */
function getTypeIcon(type: string): string {
  switch (type) {
    case 'country':
      return '🌍';
    case 'city':
      return '🏙️';
    case 'region':
      return '🏖️';
    case 'landmark':
      return '🏛️';
    default:
      return '📍';
  }
}

/**
 * Obter label do tipo
 */
function getTypeLabel(type: string): string {
  switch (type) {
    case 'country':
      return 'PAÍS';
    case 'city':
      return 'CIDADES';
    case 'region':
      return 'REGIÕES';
    case 'landmark':
      return 'DESTINOS POPULARES';
    default:
      return 'LOCAL';
  }
}

/**
 * Componente individual de sugestão com ícone e informações adicionais
 */
interface SuggestionItemProps {
  suggestion: CitySuggestion;
  onSelect: (suggestion: CitySuggestion) => void;
}

function SuggestionItem({ suggestion, onSelect }: SuggestionItemProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(suggestion);
      }}
      className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700
                 transition-colors duration-150 border-b border-slate-100 dark:border-slate-700 last:border-b-0
                 focus:outline-none focus:bg-blue-100 dark:focus:bg-slate-700 cursor-pointer
                 group/item"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {getTypeIcon(suggestion.type)} {suggestion.city}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            <span>{suggestion.country}</span>
            {suggestion.isCapital && (
              <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded text-xs font-medium">
                Capital
              </span>
            )}
          </div>
        </div>
        <div className="ml-2 text-slate-300 dark:text-slate-600 group-hover/item:text-blue-400 transition-colors">
          →
        </div>
      </div>
    </button>
  );
}

/**
 * Componente de Autocomplete de Cidades com Agrupamento
 * Mostra sugestões agrupadas por tipo (país, cidade, região, destino)
 * Com ordenação inteligente por relevância
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

  // Sincronizar inputValue quando value prop muda
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce para buscar cidades
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!inputValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchCities(inputValue, language);
        setSuggestions(results);
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

  const handleSelectCity = useCallback(
    (suggestion: CitySuggestion) => {
      setInputValue(`${suggestion.city}, ${suggestion.country}`);
      onCitySelect(suggestion.city, suggestion.country, suggestion.coordinates);
      setIsOpen(false);
      setSuggestions([]);
    },
    [onCitySelect]
  );

  // Agrupar sugestões
  const grouped = groupSuggestions(suggestions);
  const hasResults = suggestions.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (e.target.value.trim()) {
              setShowDropdownHint(false);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
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

        {/* Botão da seta */}
        {!isLoading && inputValue.trim() && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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

        {/* Hint sutil */}
        {showDropdownHint && !inputValue.trim() && !isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs pointer-events-none opacity-70">
            Digite...
          </div>
        )}
      </div>

      {/* ✅ DROPDOWN COM AGRUPAMENTO */}
      {isOpen && hasResults && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600
                        rounded-lg shadow-2xl max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
             style={{ maxHeight: 'calc(70vh)' }}>
          {/* Grupo: Países */}
          {grouped.countries.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 sticky top-0">
                🌍 {getTypeLabel('country')}
              </div>
              {grouped.countries.map((suggestion, index) => (
                <SuggestionItem key={`country-${index}`} suggestion={suggestion} onSelect={handleSelectCity} />
              ))}
            </div>
          )}

          {/* Grupo: Cidades */}
          {grouped.cities.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 sticky top-0">
                🏙️ {getTypeLabel('city')}
              </div>
              {grouped.cities.map((suggestion, index) => (
                <SuggestionItem key={`city-${index}`} suggestion={suggestion} onSelect={handleSelectCity} />
              ))}
            </div>
          )}

          {/* Grupo: Regiões */}
          {grouped.regions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 sticky top-0">
                🏖️ {getTypeLabel('region')}
              </div>
              {grouped.regions.map((suggestion, index) => (
                <SuggestionItem key={`region-${index}`} suggestion={suggestion} onSelect={handleSelectCity} />
              ))}
            </div>
          )}

          {/* Grupo: Destinos Populares */}
          {grouped.landmarks.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 sticky top-0">
                🏛️ {getTypeLabel('landmark')}
              </div>
              {grouped.landmarks.map((suggestion, index) => (
                <SuggestionItem key={`landmark-${index}`} suggestion={suggestion} onSelect={handleSelectCity} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estado vazio */}
      {isOpen && !hasResults && inputValue.trim() && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600
                        rounded-lg shadow-lg p-4 text-center text-slate-500 dark:text-slate-400">
          <div className="text-sm">Nenhuma cidade encontrada</div>
          <div className="text-xs mt-1 opacity-70">Tente outro nome ou verifique a grafia</div>
        </div>
      )}
    </div>
  );
};
