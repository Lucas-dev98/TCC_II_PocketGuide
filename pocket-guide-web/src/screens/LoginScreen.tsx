import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import useI18n from '../hooks/useI18n'
import { Compass, MapPin, Zap, Globe, ArrowRight, Sparkles } from 'lucide-react'

/**
 * LoginScreen - Autenticação com Google via Firebase
 * 
 * Fluxo:
 * 1. Exibir logo + descrição
 * 2. Botão "Entrar com Google"
 * 3. Após login → redirect para /home
 * 4. Se já autenticado → redirect imediato
 * 5. Toast feedback para sucesso/erro
 */
export default function LoginScreen() {
  const navigate = useNavigate()
  const { user, signInWithGoogle, isLoading, error } = useAuth()
  const { showError } = useToast()
  const { t } = useI18n()
  const [isAnimating, setIsAnimating] = useState(false)

  // Se já autenticado, redireciona para home
  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [user, navigate])

  // Mostrar erro via Toast
  useEffect(() => {
    if (error) {
      showError(typeof error === 'string' ? error : 'Erro ao fazer login. Tente novamente.')
    }
  }, [error, showError])

  // Iniciar animação na montagem do componente
  useEffect(() => {
    setIsAnimating(true)
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      // AuthContext já dispara o redirect em useEffect acima
    } catch (err) {
      console.error('Erro ao fazer login:', err)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Container central */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 ${
        isAnimating 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        {/* Logo e título com animação */}
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
          
          <p className="text-body text-slate-600 dark:text-slate-300 mb-2">
            {t('auth.loginDescription')}
          </p>
          
          <p className="text-small text-slate-500 dark:text-slate-400">
            {t('auth.loginTitle')}
          </p>
        </div>

        {/* Card de login com glassmorphism */}
        <Card elevation="lg" className="mb-6 p-8 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/30 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300">
          {/* Descrição */}
          <div className="mb-8">
            <h2 className="text-h3 font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span>👋 {t('auth.loginTitle')}</span>
            </h2>
            
            <p className="text-body text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('auth.loginDescription')}
            </p>
          </div>

          {/* Features com ícones melhorados */}
          <div className="space-y-4 mb-8">
            {[
              { icon: Zap, text: t('activities.adventure'), delay: 0 },
              { icon: MapPin, text: t('navigation.search'), delay: 100 },
              { icon: Globe, text: t('settings.about'), delay: 200 },
            ].map(({ icon: Icon, text, delay }, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 animate-slide-in-left"
                style={{ animationDelay: `${delay}ms` }}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-success/20 dark:bg-success/30 flex items-center justify-center mt-0.5 flex-none">
                  <Icon className="w-4 h-4 text-success" />
                </div>
                <p className="text-small text-slate-600 dark:text-slate-300">
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* Botão Google Sign-In com animação */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full group hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="flex items-center gap-1">
                {isLoading ? t('auth.signingIn') : t('auth.loginWithGoogle')}
                {!isLoading && <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
              </span>
            </div>
          </Button>

          {/* Info box com dica */}
          <div className="mt-6 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-caption text-primary dark:text-primary/80 text-center">
              ✨ {t('auth.loginDescription')}
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-caption text-slate-500 dark:text-slate-400">
          Ao entrar, você concorda com nossos{' '}
          <a href="#" className="text-primary hover:underline font-medium transition-colors duration-200">
            Termos de Serviço
          </a>
        </p>
      </div>

      {/* Estilos customizados para animações */}
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
