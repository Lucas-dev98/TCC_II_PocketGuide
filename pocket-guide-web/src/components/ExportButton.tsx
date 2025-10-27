/**
 * ExportButton.tsx - Botão para exportar viagem como PDF
 * 
 * Componente versátil para exportar viagens com:
 * - Opção de exportar um único PDF
 * - Exportar múltiplas viagens em um PDF
 * - Dropdown com opções adicionais
 */

import { useState } from 'react'
import { FileDown, Loader } from 'lucide-react'
import { Trip } from '../types'
import { pdfService } from '../services/pdfService'

interface ExportButtonProps {
  trip?: Trip
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'filled'
  className?: string
  onExport?: () => void
}

export const ExportButton = ({
  trip,
  size = 'md',
  variant = 'icon',
  className = '',
  onExport,
}: ExportButtonProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Size classes
  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  // Handle single trip export
  const handleExportSingle = async () => {
    if (!trip) return

    setLoading(true)
    setError(null)

    try {
      await pdfService.exportTripToPDF(trip, {
        format: 'A4',
        orientation: 'portrait',
      })
      onExport?.()
    } catch (err) {
      setError('Erro ao exportar PDF')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle multiple trips export
  // const handleExportMultiple = async () => {
  //   if (!trips || trips.length === 0) return
  //   setLoading(true)
  //   setError(null)
  //   try {
  //     await pdfService.exportMultipleTripsToPDF(
  //       trips,
  //       'Minhas Viagens',
  //       { format: 'A4', orientation: 'portrait' }
  //     )
  //     onExport?.()
  //   } catch (err) {
  //     setError('Erro ao exportar PDFs')
  //     console.error(err)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // Handle landscape export
  // const handleExportLandscape = async () => {
  //   if (!trip) return
  //   setLoading(true)
  //   setError(null)
  //   try {
  //     await pdfService.exportTripToPDF(trip, {
  //       format: 'A4',
  //       orientation: 'landscape',
  //     })
  //     onExport?.()
  //   } catch (err) {
  //     setError('Erro ao exportar PDF')
  //     console.error(err)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // Icon variant
  if (variant === 'icon') {
    return (
      <div>
        <button
          onClick={handleExportSingle}
          disabled={loading || !trip}
          title={loading ? 'Exportando...' : 'Exportar como PDF'}
          className={`
            ${sizeClasses[size]}
            rounded-lg
            bg-green-50 dark:bg-green-950
            hover:bg-green-100 dark:hover:bg-green-900
            text-green-600 dark:text-green-400
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${className}
          `}
        >
          {loading ? (
            <Loader className={`${iconSizeClasses[size]} animate-spin`} />
          ) : (
            <FileDown className={iconSizeClasses[size]} />
          )}
        </button>

        {error && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    )
  }

  // Filled variant
  return (
    <div>
      <button
        onClick={handleExportSingle}
        disabled={loading || !trip}
        className={`
          ${sizeClasses[size]}
          px-4 py-2
          rounded-lg
          bg-green-600 dark:bg-green-700
          hover:bg-green-700 dark:hover:bg-green-600
          disabled:bg-gray-400 disabled:cursor-not-allowed
          text-white
          font-medium
          flex items-center gap-2
          transition-colors
          ${className}
        `}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Exportando...</span>
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}
