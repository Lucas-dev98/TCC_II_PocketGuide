import { Globe, MapPin } from 'lucide-react'

interface TripScopeSelectorProps {
  value: 'nacional' | 'internacional' | ''
  onChange: (scope: 'nacional' | 'internacional') => void
}

export function TripScopeSelector({ value, onChange }: TripScopeSelectorProps) {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Tipo de Viagem
        </h2>
        <p className="text-body text-slate-600 dark:text-slate-300 mb-6">
          Escolha se sua viagem será nacional ou internacional
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nacional Card */}
        <button
          onClick={() => onChange('nacional')}
          type="button"
          className={`relative p-6 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
            value === 'nacional'
              ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-2 border-green-500 dark:border-green-400 shadow-lg'
              : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-400 shadow-md hover:shadow-lg'
          }`}
        >
          {/* Pulse indicator for selected */}
          {value === 'nacional' && (
            <div className="absolute top-3 right-3">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-1 bg-green-400 rounded-full"></div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <MapPin
              className={`w-10 h-10 transition-colors ${
                value === 'nacional'
                  ? 'text-green-600 dark:text-green-300'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <div className="text-center">
              <h3 className={`text-lg font-bold mb-1 ${
                value === 'nacional'
                  ? 'text-green-700 dark:text-green-100'
                  : 'text-slate-900 dark:text-white'
              }`}>
                🇧🇷 Nacional
              </h3>
              <p className={`text-sm ${
                value === 'nacional'
                  ? 'text-green-600 dark:text-green-200'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                Dentro do Brasil
              </p>
            </div>
          </div>
        </button>

        {/* Internacional Card */}
        <button
          onClick={() => onChange('internacional')}
          type="button"
          className={`relative p-6 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
            value === 'internacional'
              ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-2 border-blue-500 dark:border-blue-400 shadow-lg'
              : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-400 shadow-md hover:shadow-lg'
          }`}
        >
          {/* Pulse indicator for selected */}
          {value === 'internacional' && (
            <div className="absolute top-3 right-3">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-1 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <Globe
              className={`w-10 h-10 transition-colors ${
                value === 'internacional'
                  ? 'text-blue-600 dark:text-blue-300'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <div className="text-center">
              <h3 className={`text-lg font-bold mb-1 ${
                value === 'internacional'
                  ? 'text-blue-700 dark:text-blue-100'
                  : 'text-slate-900 dark:text-white'
              }`}>
                🌍 Internacional
              </h3>
              <p className={`text-sm ${
                value === 'internacional'
                  ? 'text-blue-600 dark:text-blue-200'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                Viagem para o exterior
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
