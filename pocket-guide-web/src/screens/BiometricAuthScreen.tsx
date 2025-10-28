/**
 * BiometricAuthScreen.tsx - Tela de autenticação biométrica
 * 
 * Permite usuário se autenticar com:
 * - Biometria (fingerprint/face)
 * - PIN fallback
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fingerprint, Lock, Eye, EyeOff, Loader } from 'lucide-react'
import useI18n from '../hooks/useI18n'
import { biometryService } from '../services/biometryService'
import { useAuth } from '../hooks/useAuth'

export const BiometricAuthScreen = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuth()
  
  const [authMethod, setAuthMethod] = useState<'fingerprint' | 'pin'>('fingerprint')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await biometryService.isBiometricAvailable()
      setBiometricAvailable(available)
      
      // Fallback para PIN se biometria não disponível
      if (!available) {
        setAuthMethod('pin')
      }
    }

    checkBiometric()
  }, [])

  if (!user) {
    return null
  }

  const handleBiometricAuth = async () => {
    if (!biometricAvailable) {
      setError(t('biometricAuth.error'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await biometryService.authenticateWithBiometric(user as any)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => navigate('/home'), 1500)
      } else {
        setError(result.error || t('biometricAuth.error'))
      }
    } catch (err) {
      setError(t('biometricAuth.error'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePINAuth = async () => {
    if (!pin || pin.length < 4) {
      setError(t('biometricAuth.pinMinLength'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await biometryService.authenticateWithPIN(user as any, pin)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => navigate('/home'), 1500)
      } else {
        setError(result.error || t('biometricAuth.error'))
        setPin('')
      }
    } catch (err) {
      setError(t('biometricAuth.error'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePINKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePINAuth()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success State */}
        {success && (
          <div className="text-center">
            <div className="mb-4 inline-block">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-pulse">
                <Fingerprint className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-slate-900 dark:text-white font-semibold">
              Autenticado com sucesso!
            </p>
          </div>
        )}

        {/* Main Content */}
        {!success && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t('biometricAuth.title')}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {t('biometricAuth.subtitle')}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* Auth Method Tabs */}
            <div className="flex gap-3 mb-8">
              {biometricAvailable && (
                <button
                  onClick={() => setAuthMethod('fingerprint')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    authMethod === 'fingerprint'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Fingerprint className="w-4 h-4 inline mr-2" />
                  Biometria
                </button>
              )}

              <button
                onClick={() => setAuthMethod('pin')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  authMethod === 'pin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                PIN
              </button>
            </div>

            {/* Fingerprint Auth */}
            {authMethod === 'fingerprint' && biometricAvailable && (
              <button
                onClick={handleBiometricAuth}
                disabled={loading}
                className="w-full py-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 border-2 border-blue-300 dark:border-slate-500 rounded-lg hover:border-blue-400 dark:hover:border-slate-400 transition-colors mb-6"
              >
                <div className="flex flex-col items-center gap-4">
                  {loading ? (
                    <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <Fingerprint className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {loading ? t('biometricAuth.authenticating') : t('biometricAuth.biometricButton')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Use sua impressão digital
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* PIN Auth */}
            {authMethod === 'pin' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      onKeyPress={handlePINKeyPress}
                      placeholder={t('biometricAuth.pinButton')}
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 pr-10"
                    />
                    <button
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-3 text-slate-500 dark:text-slate-400"
                    >
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePINAuth}
                  disabled={loading || pin.length < 4}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    loading || pin.length < 4
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                      {t('biometricAuth.authenticating')}
                    </>
                  ) : (
                    'Autenticar'
                  )}
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Pocket Guide Secure Auth
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
