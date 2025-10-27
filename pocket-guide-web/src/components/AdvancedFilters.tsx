/**
 * AdvancedFilters Component
 * 
 * Filtros avançados para busca:
 * - Date range picker
 * - Budget range selector
 * - Sorting options
 */

import { useState } from 'react'
import { SearchFilters } from '../services/searchService'

interface AdvancedFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onApply: () => void
}

const BUDGET_LEVELS = ['econômico', 'médio', 'luxo']
const SORT_OPTIONS = [
  { value: 'date', label: 'Data (mais recentes)' },
  { value: 'destination', label: 'Destino (A-Z)' },
]

export function AdvancedFilters({ filters, onFiltersChange, onApply }: AdvancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const handleDateChange = (field: string, value: string) => {
    const date = value ? new Date(value) : undefined
    onFiltersChange({
      ...filters,
      [field]: date,
    })
  }

  const handleBudgetChange = (field: 'budgetMin' | 'budgetMax', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as 'date' | 'destination',
    })
  }

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFiltersChange({
      ...filters,
      sortOrder,
    })
  }

  const handleApply = () => {
    setShowFilters(false)
    onApply()
  }

  const hasActiveFilters =
    filters.startDateFrom ||
    filters.startDateTo ||
    filters.endDateFrom ||
    filters.endDateTo ||
    filters.budgetMin ||
    filters.budgetMax ||
    filters.destination

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="font-medium">Filtros</span>
        {hasActiveFilters && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-500 rounded-full">
            {[
              filters.startDateFrom,
              filters.startDateTo,
              filters.endDateFrom,
              filters.endDateTo,
              filters.budgetMin,
              filters.budgetMax,
              filters.destination,
            ].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Date Range */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === 'dates' ? null : 'dates')
                }
                className="w-full flex items-center justify-between mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white">Datas</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === 'dates' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {expandedSection === 'dates' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Início (a partir de)
                    </label>
                    <input
                      type="date"
                      value={
                        filters.startDateFrom ? filters.startDateFrom.toISOString().split('T')[0] : ''
                      }
                      onChange={(e) => handleDateChange('startDateFrom', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Início (até)
                    </label>
                    <input
                      type="date"
                      value={
                        filters.startDateTo ? filters.startDateTo.toISOString().split('T')[0] : ''
                      }
                      onChange={(e) => handleDateChange('startDateTo', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Fim (a partir de)
                    </label>
                    <input
                      type="date"
                      value={
                        filters.endDateFrom ? filters.endDateFrom.toISOString().split('T')[0] : ''
                      }
                      onChange={(e) => handleDateChange('endDateFrom', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Fim (até)
                    </label>
                    <input
                      type="date"
                      value={
                        filters.endDateTo ? filters.endDateTo.toISOString().split('T')[0] : ''
                      }
                      onChange={(e) => handleDateChange('endDateTo', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Budget Range */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === 'budget' ? null : 'budget')
                }
                className="w-full flex items-center justify-between mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white">Orçamento</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === 'budget' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {expandedSection === 'budget' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orçamento Mínimo
                    </label>
                    <select
                      value={filters.budgetMin || ''}
                      onChange={(e) => handleBudgetChange('budgetMin', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Qualquer um</option>
                      {BUDGET_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orçamento Máximo
                    </label>
                    <select
                      value={filters.budgetMax || ''}
                      onChange={(e) => handleBudgetChange('budgetMax', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Qualquer um</option>
                      {BUDGET_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sorting */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <button
                onClick={() =>
                  setExpandedSection(expandedSection === 'sorting' ? null : 'sorting')
                }
                className="w-full flex items-center justify-between mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white">Ordenação</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === 'sorting' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {expandedSection === 'sorting' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={filters.sortBy || 'date'}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ordem
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSortOrderChange('asc')}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                          filters.sortOrder === 'asc'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Crescente
                      </button>
                      <button
                        onClick={() => handleSortOrderChange('desc')}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                          filters.sortOrder === 'desc'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Decrescente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onFiltersChange({
                  query: filters.query,
                  page: 1,
                  pageSize: filters.pageSize,
                })
                setShowFilters(false)
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
