/**
 * SearchInput Component
 * 
 * Input de busca com:
 * - Sugestões em tempo real
 * - Histórico de buscas
 * - Debouncing automático
 * - Atalhos de teclado
 */

import { useState, useRef, useEffect } from 'react'
import { SearchResult, SearchSuggestion, searchService } from '../services/searchService'
import { Trip } from '../types'
import { debug } from '../utils/debug'

interface SearchInputProps {
  trips: Trip[]
  onSearch: (results: SearchResult) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ trips, onSearch, placeholder, className }: SearchInputProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Atualiza sugestões quando query muda
   */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      if (query.length > 0) {
        const newSuggestions = searchService.getSuggestions(query, trips)
        setSuggestions(newSuggestions)
        setShowSuggestions(true)
        setSelectedIndex(-1)
      } else {
        const recentSearches = searchService.getRecentSearches()
        setSuggestions(
          recentSearches.map((search) => ({
            type: 'recent' as const,
            text: search,
            icon: '🕐',
          }))
        )
        setShowSuggestions(true)
      }
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, trips])

  /**
   * Fecha sugestões ao clicar fora
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Navega com setas do teclado
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex].text)
        } else {
          handleSearchSubmit()
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setQuery('')
        break
    }
  }

  /**
   * Seleciona uma sugestão
   */
  const selectSuggestion = (text: string) => {
    setQuery(text)
    searchService.addToRecentSearches(text)
    setShowSuggestions(false)
    performSearch(text)
  }

  /**
   * Submete busca
   */
  const handleSearchSubmit = () => {
    if (query.trim()) {
      searchService.addToRecentSearches(query)
      performSearch(query)
      setShowSuggestions(false)
    }
  }

  /**
   * Executa a busca
   */
  const performSearch = (searchQuery: string) => {
    debug.log('🔍 Searching for:', searchQuery)
    const results = searchService.search(trips, {
      query: searchQuery,
    })
    onSearch(results)
  }

  /**
   * Limpa a busca
   */
  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query || searchService.getRecentSearches().length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder || 'Buscar viagens...'}
          className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:border-transparent transition-colors"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <ul className="py-1 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li key={`${suggestion.type}-${suggestion.text}`}>
                <button
                  onClick={() => selectSuggestion(suggestion.text)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{suggestion.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {suggestion.text}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.type === 'recent' && 'Recente'}
                        {suggestion.type === 'destination' && 'Destino'}
                        {suggestion.type === 'country' && 'País'}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {showSuggestions && suggestions.length === 0 && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum resultado para &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  )
}
