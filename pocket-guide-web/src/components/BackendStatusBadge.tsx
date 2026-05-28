import { RefreshCw, Server } from 'lucide-react'
import { useBackendHealth } from '../hooks/useBackendHealth'

export function BackendStatusBadge() {
  const { enabled, isOnline, isChecking, baseUrl, error, refresh } = useBackendHealth()

  const statusLabel = !enabled
    ? 'Backend: disabled'
    : isOnline
      ? 'Backend: online'
      : 'Backend: offline'

  const statusClass = !enabled
    ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
    : isOnline
      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700'
      : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700'

  return (
    <button
      type="button"
      onClick={() => void refresh()}
      className={`fixed right-3 top-3 lg:top-20 z-50 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm backdrop-blur-sm flex items-center gap-2 ${statusClass}`}
      title={enabled ? `${statusLabel} (${baseUrl})${error ? ` - ${error}` : ''}` : 'Configure VITE_BACKEND_URL para habilitar persistencia via backend'}
      aria-label={statusLabel}
    >
      <Server className="w-3.5 h-3.5" />
      <span>{statusLabel}</span>
      {isChecking && <RefreshCw className="w-3 h-3 animate-spin" />}
    </button>
  )
}
