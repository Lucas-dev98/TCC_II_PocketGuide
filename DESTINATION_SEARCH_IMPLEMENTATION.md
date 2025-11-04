# 🚀 Guia de Implementação - Opção Recomendada (1 + 2)

## 📋 O que vamos fazer

**Implementar**: Ordenação + Ícones + Agrupamento por Tipo

**Resultado**:
- ✅ Cidades ordenadas por relevância
- ✅ Ícones visuais (🏙️ 🌍 🏖️ 🏛️)
- ✅ Agrupadas por tipo
- ✅ Sem duplicatas
- ✅ Melhor UX

---

## 🎯 Passo 1: Preparar Tipos de Dados

### Arquivo: `src/types/index.ts`

Atualizar a interface `CitySuggestion`:

```typescript
export interface CitySuggestion {
  city: string
  country: string
  coordinates?: [number, number]
  
  // ✅ Novos campos
  type: 'country' | 'city' | 'region' | 'landmark' // Tipo de local
  population?: number // Para ordenação
  description?: string // "Capital", "Praia famosa", etc
  relevance?: number // Score 0-100
  isCapital?: boolean // Destaque especial
  isMajorCity?: boolean // Cidade grande
}

export interface GroupedCitySuggestions {
  countries: CitySuggestion[]
  cities: CitySuggestion[]
  regions: CitySuggestion[]
  landmarks: CitySuggestion[]
}
```

---

## 🎯 Passo 2: Atualizar Serviço de Busca

### Arquivo: `src/services/mapboxGeocoding.ts`

**1. Adicionar função de classificação:**

```typescript
/**
 * Classificar tipo de resultado (country, city, region, landmark)
 */
function classifyPlace(feature: GeocodeResult): 'country' | 'city' | 'region' | 'landmark' {
  // Verificar se é país
  if (feature.place_type?.includes('country')) {
    return 'country'
  }
  
  // Verificar se é região/estado
  if (feature.place_type?.includes('region')) {
    return 'region'
  }
  
  // Praias e pontos de interesse
  if (feature.place_type?.includes('poi') || feature.text?.toLowerCase().includes('praia')) {
    return 'landmark'
  }
  
  // Caso contrário é cidade
  return 'city'
}

/**
 * Calcular score de relevância (0-100)
 */
function calculateRelevance(feature: GeocodeResult, query: string): number {
  const queryLower = query.toLowerCase()
  const cityName = (feature.place_name || '').split(',')[0]?.toLowerCase() || ''
  
  let score = 50 // Base
  
  // Bônus se começa com a query
  if (cityName.startsWith(queryLower)) {
    score += 30
  }
  
  // Bônus se é match exato
  if (cityName === queryLower) {
    score += 20
  }
  
  // Bônus para capitais
  if (feature.context?.some(ctx => ctx.id?.includes('capital'))) {
    score += 15
  }
  
  return Math.min(score, 100)
}

/**
 * Extrair população (em dados locais)
 */
function getPopulation(city: string, country: string): number {
  // Usar dados locais se disponível
  const localCity = searchCitiesLocal(city)?.[0]
  return localCity?.population || 0
}
```

**2. Atualizar função `searchCities`:**

```typescript
export async function searchCities(
  query: string,
  language: string = 'en'
): Promise<CitySuggestion[]> {
  // ... código anterior ...

  // Após processar sugestões, adicionar classificação
  const suggestionsWithType: CitySuggestion[] = data.features
    .map((feature: GeocodeResult) => {
      const cityName = (feature.place_name || '').split(',')[0]?.trim() || feature.text || '';
      const countryContext = feature.context?.find(ctx => ctx.id?.startsWith('country.'));
      const country = countryContext?.name || countryContext?.text_pt || countryContext?.text || '';
      
      return {
        city: cityName,
        country: country,
        coordinates: feature.geometry?.coordinates as [number, number] || [0, 0],
        
        // ✅ Novos campos
        type: classifyPlace(feature),
        population: getPopulation(cityName, country),
        description: getDescription(feature), // Função auxiliar
        relevance: calculateRelevance(feature, query),
        isCapital: feature.context?.some(ctx => ctx.id?.includes('capital')) || false,
        isMajorCity: getPopulation(cityName, country) > 500000,
      }
    })
    .filter(s => s.city && s.country);

  // ✅ Remover duplicatas mantendo o com maior relevância
  const uniqueSuggestions = Array.from(
    new Map(suggestionsWithType.map(s => [
      `${s.city.toLowerCase()}-${s.country.toLowerCase()}`,
      s
    ])).values()
  );

  // ✅ Ordenar por relevância
  uniqueSuggestions.sort((a, b) => {
    // 1. Por relevância score
    if (b.relevance !== a.relevance) {
      return (b.relevance || 0) - (a.relevance || 0);
    }
    
    // 2. Por população
    if ((b.population || 0) !== (a.population || 0)) {
      return (b.population || 0) - (a.population || 0);
    }
    
    // 3. Alfabético
    return a.city.localeCompare(b.city);
  });

  // Cachear resultado
  geocodeCache.set(cacheKey, uniqueSuggestions);

  return uniqueSuggestions;
}

/**
 * Agrupar sugestões por tipo
 */
export function groupSuggestions(suggestions: CitySuggestion[]): GroupedCitySuggestions {
  return {
    countries: suggestions.filter(s => s.type === 'country'),
    cities: suggestions.filter(s => s.type === 'city'),
    regions: suggestions.filter(s => s.type === 'region'),
    landmarks: suggestions.filter(s => s.type === 'landmark'),
  };
}

/**
 * Função auxiliar para descrição
 */
function getDescription(feature: GeocodeResult): string {
  // Verificar tipo
  if (feature.place_type?.includes('country')) {
    return 'País';
  }
  if (feature.place_type?.includes('region')) {
    return 'Região';
  }
  
  // Verificar se é capital
  if (feature.context?.some(ctx => ctx.id?.includes('capital'))) {
    return 'Capital';
  }
  
  return 'Cidade';
}
```

---

## 🎯 Passo 3: Atualizar Componente de Autocomplete

### Arquivo: `src/components/CityAutocomplete.tsx`

**Versão completa atualizada:**

```typescript
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchCities, groupSuggestions, CitySuggestion } from '../services/mapboxGeocoding';
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
    case 'country': return '🌍';
    case 'city': return '🏙️';
    case 'region': return '🏖️';
    case 'landmark': return '🏛️';
    default: return '📍';
  }
}

/**
 * Obter label do tipo
 */
function getTypeLabel(type: string): string {
  switch (type) {
    case 'country': return 'País';
    case 'city': return 'Cidade';
    case 'region': return 'Região';
    case 'landmark': return 'Destino Popular';
    default: return 'Local';
  }
}

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

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
    setInputValue(`${suggestion.city}, ${suggestion.country}`);
    onCitySelect(suggestion.city, suggestion.country, suggestion.coordinates);
    setIsOpen(false);
    setSuggestions([]);
  }, [onCitySelect]);

  // ✅ Agrupar sugestões
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

        {/* Hint */}
        {showDropdownHint && !inputValue.trim() && !isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs pointer-events-none opacity-70">
            Digite...
          </div>
        )}
      </div>

      {/* ✅ DROPDOWN COM AGRUPAMENTO */}
      {isOpen && hasResults && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600
                        rounded-lg shadow-xl max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Grupo: Países */}
          {grouped.countries.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 sticky top-0">
                🌍 PAÍSES
              </div>
              {grouped.countries.map((suggestion, index) => (
                <SuggestionItem
                  key={`country-${index}`}
                  suggestion={suggestion}
                  onSelect={handleSelectCity}
                />
              ))}
            </div>
          )}

          {/* Grupo: Cidades */}
          {grouped.cities.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 sticky top-0">
                🏙️ CIDADES
              </div>
              {grouped.cities.map((suggestion, index) => (
                <SuggestionItem
                  key={`city-${index}`}
                  suggestion={suggestion}
                  onSelect={handleSelectCity}
                />
              ))}
            </div>
          )}

          {/* Grupo: Regiões */}
          {grouped.regions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 sticky top-0">
                🏖️ REGIÕES
              </div>
              {grouped.regions.map((suggestion, index) => (
                <SuggestionItem
                  key={`region-${index}`}
                  suggestion={suggestion}
                  onSelect={handleSelectCity}
                />
              ))}
            </div>
          )}

          {/* Grupo: Destinos Populares */}
          {grouped.landmarks.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 sticky top-0">
                🏛️ DESTINOS POPULARES
              </div>
              {grouped.landmarks.map((suggestion, index) => (
                <SuggestionItem
                  key={`landmark-${index}`}
                  suggestion={suggestion}
                  onSelect={handleSelectCity}
                />
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

/**
 * Componente individual de sugestão
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
            {suggestion.isCapital && <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs">Capital</span>}
            {suggestion.population && suggestion.population > 1000000 && 
              <span className="text-amber-600 dark:text-amber-400">({suggestion.population.toLocaleString()} hab.)</span>
            }
          </div>
        </div>
        <div className="ml-2 text-slate-300 dark:text-slate-600 group-hover/item:text-blue-400 transition-colors">
          →
        </div>
      </div>
    </button>
  );
}
```

---

## 🎯 Passo 4: Adicionar Testes

### Arquivo: `src/__tests__/services/mapboxGeocoding.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { groupSuggestions } from '../../services/mapboxGeocoding';
import { CitySuggestion } from '../../services/mapboxGeocoding';

describe('mapboxGeocoding - Agrupamento', () => {
  const mockSuggestions: CitySuggestion[] = [
    {
      city: 'Portugal',
      country: 'Portugal',
      type: 'country',
      coordinates: [0, 0],
    },
    {
      city: 'Lisboa',
      country: 'Portugal',
      type: 'city',
      population: 505526,
      isCapital: true,
      relevance: 95,
    },
    {
      city: 'Algarve',
      country: 'Portugal',
      type: 'region',
      relevance: 85,
    },
    {
      city: 'Mosteiro de Alcobaça',
      country: 'Portugal',
      type: 'landmark',
      relevance: 70,
    },
  ];

  it('should group suggestions by type', () => {
    const grouped = groupSuggestions(mockSuggestions);
    
    expect(grouped.countries).toHaveLength(1);
    expect(grouped.cities).toHaveLength(1);
    expect(grouped.regions).toHaveLength(1);
    expect(grouped.landmarks).toHaveLength(1);
  });

  it('should have correct city data in groups', () => {
    const grouped = groupSuggestions(mockSuggestions);
    
    expect(grouped.countries[0].city).toBe('Portugal');
    expect(grouped.cities[0].city).toBe('Lisboa');
    expect(grouped.cities[0].isCapital).toBe(true);
    expect(grouped.regions[0].city).toBe('Algarve');
  });
});
```

---

## 🎯 Passo 5: Exportar Tipos

### Arquivo: `src/services/mapboxGeocoding.ts`

Adicionar exports:

```typescript
export type { CitySuggestion, GroupedCitySuggestions }
export { groupSuggestions, getTypeIcon, getTypeLabel }
```

---

## 📋 Checklist de Implementação

- [ ] **Passo 1**: Atualizar `src/types/index.ts`
- [ ] **Passo 2**: Atualizar `src/services/mapboxGeocoding.ts`
  - [ ] Função `classifyPlace()`
  - [ ] Função `calculateRelevance()`
  - [ ] Função `getPopulation()`
  - [ ] Atualizar `searchCities()`
  - [ ] Adicionar `groupSuggestions()`
  - [ ] Atualizar ordenação
- [ ] **Passo 3**: Atualizar `src/components/CityAutocomplete.tsx`
  - [ ] Importar novas funções
  - [ ] Adicionar `getTypeIcon()` e `getTypeLabel()`
  - [ ] Implementar `SuggestionItem` component
  - [ ] Atualizar renderização com agrupamento
- [ ] **Passo 4**: Adicionar testes
- [ ] **Passo 5**: Exportar tipos
- [ ] **Teste Local**: `npm run dev`
- [ ] **Rodar Testes**: `npm run test`
- [ ] **Build**: `npm run build`

---

## 🧪 Como Testar

```bash
# Ir para pasta do projeto
cd pocket-guide-web

# Instalar deps (se necessário)
npm install

# Rodar testes
npm run test

# Visualizar no navegador
npm run dev
```

Acessar: http://localhost:5173/create-trip

---

## ✅ Pronto!

Depois de implementar todos os passos, você terá:

✨ **Uma busca de destinos profissional com:**
- Ordenação inteligente por relevância
- Ícones visuais para cada tipo
- Agrupamento claro por categoria
- Sem duplicatas
- Melhor UX em mobile e desktop

Quer que eu implemente? 🚀
