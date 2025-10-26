/**
 * WebVitalsDebugger Component
 * 
 * Componente que mostra Web Vitals em tempo real
 * Apenas visível em desenvolvimento com VITE_DEBUG=true
 */

import React from 'react'
import { useWebVitals } from '../hooks/useWebVitals'

export const WebVitalsDebugger: React.FC = () => {
  const { report, overallScore, summary } = useWebVitals()

  // Apenas mostra em desenvolvimento
  const isDev = import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true'

  if (!isDev) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 max-w-sm bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg z-30 font-mono border border-slate-700 max-h-64 overflow-y-auto">
      <div className="mb-2 pb-2 border-b border-slate-700">
        <div className="font-bold text-blue-300">📊 Web Vitals</div>
        <div className="text-slate-400">
          Score: <span className={getScoreColor(overallScore)}>{overallScore}</span>
        </div>
      </div>

      <div className="space-y-1">
        {/* LCP */}
        {report.metrics.lcp && (
          <VitalRow
            name="LCP"
            value={report.metrics.lcp.value}
            unit="ms"
            rating={report.metrics.lcp.rating}
            description="Largest Contentful Paint"
          />
        )}

        {/* FCP */}
        {report.metrics.fcp && (
          <VitalRow
            name="FCP"
            value={report.metrics.fcp.value}
            unit="ms"
            rating={report.metrics.fcp.rating}
            description="First Contentful Paint"
          />
        )}

        {/* FID */}
        {report.metrics.inp && (
          <VitalRow
            name="INP"
            value={report.metrics.inp.value}
            unit="ms"
            rating={report.metrics.inp.rating}
            description="Interaction to Next Paint"
          />
        )}

        {/* CLS */}
        {report.metrics.cls && (
          <VitalRow
            name="CLS"
            value={report.metrics.cls.value}
            unit=""
            rating={report.metrics.cls.rating}
            description="Cumulative Layout Shift"
          />
        )}

        {/* TTFB */}
        {report.metrics.ttfb && (
          <VitalRow
            name="TTFB"
            value={report.metrics.ttfb.value}
            unit="ms"
            rating={report.metrics.ttfb.rating}
            description="Time to First Byte"
          />
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-700 text-slate-400">
        <div>Good: {summary.good} ✅</div>
        <div>Needs: {summary['needs-improvement']} ⚠️</div>
        <div>Poor: {summary.poor} ❌</div>
      </div>
    </div>
  )
}

interface VitalRowProps {
  name: string
  value: number
  unit: string
  rating: 'good' | 'needs-improvement' | 'poor'
  description: string
}

function VitalRow({ name, value, unit, rating, description }: VitalRowProps) {
  const color = {
    good: 'text-green-400',
    'needs-improvement': 'text-yellow-400',
    poor: 'text-red-400',
  }[rating]

  const emoji = {
    good: '✅',
    'needs-improvement': '⚠️',
    poor: '❌',
  }[rating]

  return (
    <div className={color} title={description}>
      <div>
        {emoji} {name}: <span className="font-bold">{value}{unit}</span>
      </div>
    </div>
  )
}

function getScoreColor(score: string): string {
  switch (score) {
    case 'excellent':
      return 'text-green-400'
    case 'good':
      return 'text-yellow-400'
    case 'needs-work':
      return 'text-red-400'
    default:
      return 'text-slate-400'
  }
}
