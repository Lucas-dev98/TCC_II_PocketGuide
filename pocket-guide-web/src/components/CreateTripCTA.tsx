import { useNavigate } from 'react-router-dom'
import useI18n from '../hooks/useI18n'
import { Plus, Globe } from 'lucide-react'

/**
 * CreateTripCTA - Call-to-Action destacado para criar nova viagem
 * 
 * Características:
 * ✨ Ícone de globo (destino internacional)
 * 📱 Responsivo (banner em mobile, card em desktop)
 * ⚡ Alto destaque visual
 * 🎯 CTA principal da aplicação
 */
export function CreateTripCTA() {
  const navigate = useNavigate()
  const { t } = useI18n()

  const handleCreateTrip = () => {
    navigate('/create-trip')
  }

  return (
    <div className="mb-8">
      {/* Mobile - Banner style */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-slate-900 shadow-md">
                <Globe className="w-7 h-7 text-blue-600 animate-bounce" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">
                {t('trips.readyToExplore')}
              </h2>
              <p className="text-blue-100 text-sm">
                {t('trips.createYourNextAdventure')}
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateTrip}
            className="mt-6 w-full px-6 py-3 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {t('trips.createNewTrip')}
          </button>
        </div>
      </div>

      {/* Desktop - Card style with more prominence */}
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-xl shadow-xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-800" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 dark:bg-blue-600 rounded-full opacity-20 blur-3xl transform translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 dark:bg-indigo-600 rounded-full opacity-20 blur-3xl transform -translate-x-24 translate-y-24" />

          {/* Content */}
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-slate-900 shadow-xl">
                    <Globe className="w-10 h-10 text-blue-600 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {t('trips.readyToExplore')}
                    </h2>
                    <p className="text-blue-100 text-lg max-w-md">
                      {t('trips.createYourNextAdventure')}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-blue-100">
                    <p className="font-semibold text-white">🤖 AI Powered</p>
                    <p className="text-sm">Smart itineraries</p>
                  </div>
                  <div className="text-blue-100">
                    <p className="font-semibold text-white">📍 Personalized</p>
                    <p className="text-sm">Your preferences</p>
                  </div>
                  <div className="text-blue-100">
                    <p className="font-semibold text-white">🎯 Easy to Use</p>
                    <p className="text-sm">Few clicks away</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="ml-8">
                <button
                  onClick={handleCreateTrip}
                  className="px-8 py-4 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center gap-2 group whitespace-nowrap text-lg"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  {t('trips.createNewTrip')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTripCTA
