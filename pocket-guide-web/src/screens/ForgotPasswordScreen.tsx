import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, KeyRound, Sparkles } from 'lucide-react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useToast } from '../components/Toast'
import { requestPasswordReset, resetPassword } from '../services/authApi'

export default function ForgotPasswordScreen() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()

  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResetStage, setIsResetStage] = useState(false)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      showError('Informe seu email para continuar.')
      return
    }

    try {
      setIsLoading(true)
      const response = await requestPasswordReset({ email: email.trim() })
      if (response.resetToken) {
        setToken(response.resetToken)
      }
      setIsResetStage(true)
      showSuccess('Token de redefinicao gerado. Siga para criar a nova senha.')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Falha ao solicitar redefinicao de senha.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showError('Preencha token, nova senha e confirmacao.')
      return
    }

    if (newPassword.length < 6) {
      showError('A senha deve ter no minimo 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      showError('A confirmacao de senha nao confere.')
      return
    }

    try {
      setIsLoading(true)
      await resetPassword({ token: token.trim(), newPassword })
      showSuccess('Senha redefinida com sucesso. Faça login novamente.')
      navigate('/login', { replace: true })
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Falha ao redefinir senha.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-full p-4 shadow-lg">
              <Compass className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-h1 font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <span>Recuperar senha</span>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </h1>
          <p className="text-body text-slate-600 dark:text-slate-300">Siga o fluxo para redefinir o acesso da sua conta.</p>
        </div>

        <Card elevation="lg" className="mb-6 p-8 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/30">
          {!isResetStage && (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="voce@email.com"
                />
              </div>

              <Button type="submit" disabled={isLoading} isLoading={isLoading} className="w-full group">
                <span className="flex items-center justify-center gap-1">
                  {isLoading ? 'Gerando token...' : 'Gerar token de redefinicao'}
                  {!isLoading && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
                </span>
              </Button>
            </form>
          )}

          {isResetStage && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary dark:border-primary/40 dark:bg-primary/10 dark:text-primary/90">
                Em desenvolvimento, o token pode aparecer automaticamente. Em produção, ele deve ser enviado por email.
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Token de redefinicao</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Cole o token aqui"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nova senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Minimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Repita a senha"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsResetStage(false)} disabled={isLoading}>
                  Voltar
                </Button>
                <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                  {isLoading ? 'Aplicando...' : 'Redefinir senha'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg text-center text-caption text-primary dark:text-primary/80">
            <KeyRound className="inline-block w-4 h-4 mr-1" />
            <Link to="/login" className="font-semibold hover:underline">
              Voltar para login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}