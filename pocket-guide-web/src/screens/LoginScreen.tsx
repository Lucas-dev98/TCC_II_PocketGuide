import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Compass } from 'lucide-react';

/**
 * LoginScreen - Autenticação com Google via Firebase
 * 
 * Fluxo:
 * 1. Exibir logo + descrição
 * 2. Botão "Entrar com Google"
 * 3. Após login → redirect para /home
 * 4. Se já autenticado → redirect imediato
 */
export default function LoginScreen() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, isLoading, error } = useAuth();

  // Se já autenticado, redireciona para home
  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // AuthContext já dispara o redirect em useEffect acima
    } catch (err) {
      console.error('Erro ao fazer login:', err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Container central */}
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-4 shadow-lg">
              <Compass className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Pocket Guide
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
            Crie suas viagens perfeitas
          </p>
          
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Planejamento de roteiros inteligente com IA
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-6">
          {/* Descrição */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Bem-vindo! 👋
            </h2>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Comece a criar roteiros inteligentes para suas viagens. Deixe nossa IA fazer o trabalho pesado.
            </p>
          </div>

          {/* Features rápidas */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-green-600 dark:text-green-200">✓</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Roteiros personalizados em segundos
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-green-600 dark:text-green-200">✓</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Mapas interativos e rotas otimizadas
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-green-600 dark:text-green-200">✓</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Sincronização em todos seus dispositivos
              </p>
            </div>
          </div>

          {/* Erro (se houver) */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-200">
                {error}
              </p>
            </div>
          )}

          {/* Botão Google Sign-In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              {isLoading ? 'Entrando...' : 'Entrar com Google'}
            </div>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Ao entrar, você concorda com nossos{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            Termos de Serviço
          </a>
        </p>
      </div>
    </div>
  );
}
