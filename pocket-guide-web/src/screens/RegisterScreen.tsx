import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import useI18n from '../hooks/useI18n'
import { ArrowRight, Compass, Globe, MapPin, Sparkles, Zap } from 'lucide-react'

export default function RegisterScreen() {
  const navigate = useNavigate()
  const { isAuthenticated, signUp, isLoading, error } = useAuth()
  const { showError, showSuccess } = useToast()
  const { t } = useI18n()

  const [isAnimating, setIsAnimating] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isConfirmStep, setIsConfirmStep] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error, showError])

  useEffect(() => {
    setIsAnimating(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showError('Nome, email e senha sao obrigatorios.')
      return
    }

    if (password.length < 6) {
      showError('A senha deve ter no minimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      showError('A confirmacao de senha nao confere.')
      return
    }

    setIsConfirmStep(true)
  }

  const handleConfirmCreate = async () => {
    try {
      await signUp(name.trim(), email.trim(), password)
      showSuccess('Conta criada com sucesso!')
      navigate('/home', { replace: true })
    } catch {
      // Errors are handled in the auth context.
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-full p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 cursor-default">
              <Compass className="w-12 h-12 text-white animate-spin-slow" />
            </div>
          </div>

          <h1 className="text-h1 font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
            <span>{t('common.appName')}</span>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </h1>

          <p className="text-body text-slate-600 dark:text-slate-300 mb-2">Crie sua conta para comecar.</p>
          <p className="text-small text-slate-500 dark:text-slate-300">Planeje viagens com IA em poucos cliques.</p>
        </div>

        <Card elevation="lg" className="mb-6 p-8 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/30 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300">
          <div className="mb-8">
            <h2 className="text-h3 font-semibold text-slate-900 dark:text-white mb-3">Cadastro</h2>
            <p className="text-body text-slate-600 dark:text-slate-300 leading-relaxed">Defina seus dados e tenha acesso ao seu painel de viagens.</p>
          </div>

          <div className="space-y-4 mb-8">
            {[{ icon: Zap, text: 'Cadastro rapido com email e senha.' }, { icon: MapPin, text: 'Historico de viagens sincronizado.' }, { icon: Globe, text: 'Sugestoes de destinos inteligentes.' }].map(({ icon: Icon, text }, idx) => (
              <div key={idx} className="flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: `${idx * 90}ms` }}>
                <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-success/20 dark:bg-success/30 flex items-center justify-center mt-0.5 flex-none">
                  <Icon className="w-4 h-4 text-success" />
                </div>
                <p className="text-small text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isConfirmStep}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isConfirmStep}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="voce@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isConfirmStep}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Minimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isConfirmStep}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Repita sua senha"
              />
            </div>

            {isConfirmStep && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary dark:border-primary/40 dark:bg-primary/10 dark:text-primary/90">
                <p className="font-medium">Confirme os dados para finalizar:</p>
                <p>Nome: {name.trim()}</p>
                <p>Email: {email.trim()}</p>
              </div>
            )}

            {!isConfirmStep && (
              <Button type="submit" disabled={isLoading} isLoading={isLoading} className="w-full group hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                <span className="flex items-center justify-center gap-1">
                  {isLoading ? 'Validando...' : 'Continuar'}
                  {!isLoading && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
                </span>
              </Button>
            )}

            {isConfirmStep && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfirmStep(false)}
                  disabled={isLoading}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmCreate}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Criando...' : 'Confirmar cadastro'}
                </Button>
              </div>
            )}
          </form>

          <div className="mt-6 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg text-center text-caption text-primary dark:text-primary/80">
            Ja possui conta? {' '}
            <Link to="/login" className="font-semibold hover:underline">
              Entrar
            </Link>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
