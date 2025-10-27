/**
 * SecuritySettingsScreen.tsx - Tela de configurações de segurança
 * 
 * Permite usuário configurar:
 * - Biometria (fingerprint, face)
 * - PIN
 * - Limpar credenciais
 */

import { useState } from 'react'
import { ArrowLeft, Fingerprint, Lock, Trash2, Plus, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/Layout'
import { biometryService } from '../services/biometryService'

export const SecuritySettingsScreen = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'biometric' | 'pin'>('biometric')
  const [credentials, setCredentials] = useState(biometryService.getCredentials())
  const [newPin, setNewPin] = useState('')
  const [pinSetupMode, setPinSetupMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isPinSetup = biometryService.isPINSetup()

  const handleSetupBiometric = async () => {
    setLoading(true)
    setMessage(null)

    try {
      await biometryService.registerBiometric(
        { uid: 'user' } as any,
        `Credencial ${new Date().toLocaleDateString()}`
      )
      setCredentials(biometryService.getCredentials())
      setMessage({ type: 'success', text: 'Biometria registrada com sucesso!' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao registrar biometria',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetupPIN = () => {
    if (!newPin || newPin.length < 4) {
      setMessage({ type: 'error', text: 'PIN deve ter no mínimo 4 dígitos' })
      return
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      setMessage({ type: 'error', text: 'PIN deve conter apenas números' })
      return
    }

    const success = biometryService.setupPIN(newPin)

    if (success) {
      setMessage({ type: 'success', text: 'PIN configurado com sucesso!' })
      setNewPin('')
      setPinSetupMode(false)
    } else {
      setMessage({ type: 'error', text: 'Erro ao configurar PIN' })
    }
  }

  const handleRemovePIN = () => {
    if (confirm('Tem certeza que deseja remover o PIN?')) {
      const success = biometryService.removePIN()

      if (success) {
        setMessage({ type: 'success', text: 'PIN removido com sucesso!' })
      } else {
        setMessage({ type: 'error', text: 'Erro ao remover PIN' })
      }
    }
  }

  const handleRemoveCredential = (credentialId: string) => {
    const success = biometryService.removeCredential(credentialId)

    if (success) {
      setCredentials(biometryService.getCredentials())
      setMessage({ type: 'success', text: 'Credencial removida!' })
    } else {
      setMessage({ type: 'error', text: 'Erro ao remover credencial' })
    }
  }

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja limpar todas as credenciais?')) {
      biometryService.clearAllCredentials()
      biometryService.removePIN()
      setCredentials([])
      setMessage({ type: 'success', text: 'Todas as credenciais foram removidas!' })
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Mobile Header - Hidden on Desktop */}
        <div className="lg:hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-16 z-10">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Segurança
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gerencie suas credenciais de autenticação
            </p>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Segurança
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gerencie suas credenciais de autenticação
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                message.type === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('biometric')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'biometric'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Fingerprint className="w-4 h-4 inline mr-2" />
            Biometria
          </button>

          <button
            onClick={() => setActiveTab('pin')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'pin'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            PIN
          </button>
        </div>

        {/* Biometric Tab */}
        {activeTab === 'biometric' && (
          <div className="space-y-6">
            {/* Setup */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Registrar Nova Biometria
              </h2>

              <button
                onClick={handleSetupBiometric}
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Registrar Biometria
                  </>
                )}
              </button>
            </div>

            {/* Credentials List */}
            {credentials.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Credenciais Registradas ({credentials.length})
                </h2>

                <div className="space-y-2">
                  {credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {cred.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Criada em{' '}
                          {new Date(cred.created).toLocaleDateString('pt-BR')}
                        </p>
                        {cred.lastUsed && (
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            Último uso:{' '}
                            {new Date(cred.lastUsed).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveCredential(cred.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {credentials.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Fingerprint className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma credencial biométrica registrada</p>
              </div>
            )}
          </div>
        )}

        {/* PIN Tab */}
        {activeTab === 'pin' && (
          <div className="space-y-6">
            {!isPinSetup && !pinSetupMode && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 text-center">
                <Lock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Nenhum PIN configurado
                </p>
                <button
                  onClick={() => setPinSetupMode(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Configurar PIN
                </button>
              </div>
            )}

            {isPinSetup && !pinSetupMode && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    PIN Configurado
                  </p>
                </div>
                <button
                  onClick={() => setPinSetupMode(true)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-2"
                >
                  Alterar PIN
                </button>
                <button
                  onClick={handleRemovePIN}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Remover PIN
                </button>
              </div>
            )}

            {pinSetupMode && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {isPinSetup ? 'Alterar PIN' : 'Configurar PIN'}
                </h2>

                <input
                  type="password"
                  value={newPin}
                  onChange={(e) =>
                    setNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                  }
                  placeholder="Digite um PIN (4-6 dígitos)"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleSetupPIN}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setPinSetupMode(false)
                      setNewPin('')
                    }}
                    className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clear All */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClearAll}
            className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg border border-red-200 dark:border-red-800 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Todas as Credenciais
          </button>
        </div>
      </div>
    </MainLayout>
  )
}

export default SecuritySettingsScreen
