import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Heart, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

/**
 * BottomNavigation Component
 * 
 * Barra de navegação fixa na base da tela com acesso rápido às principais funcionalidades:
 * - Home
 * - Search (Pesquisa)
 * - Favorites (Favoritos)
 * - Biometry (Segurança/Biometria)
 * - Logout
 * 
 * Utiliza:
 * - React Router para navegação
 * - Lucide React para ícones
 * - Tailwind CSS para estilização (dark mode ready)
 */
export function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()

  // Não mostrar nav em login/share
  if (location.pathname === '/login' || location.pathname.startsWith('/share/')) {
    return null
  }

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      path: '/home',
      action: () => navigate('/home'),
    },
    {
      label: 'Pesquisa',
      icon: Search,
      path: '/search',
      action: () => navigate('/search'),
    },
    {
      label: 'Favoritos',
      icon: Heart,
      path: '/favorites',
      action: () => navigate('/favorites'),
    },
    {
      label: 'Segurança',
      icon: Shield,
      path: '/security',
      action: () => navigate('/security'),
    },
    {
      label: 'Sair',
      icon: LogOut,
      path: '/logout',
      action: async () => {
        try {
          await signOut()
          navigate('/login', { replace: true })
        } catch (error) {
          console.error('Erro ao fazer logout:', error)
        }
      },
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-40">
      <div className="flex items-center justify-around h-16 max-w-6xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            (location.pathname === item.path) ||
            (item.path === '/home' && location.pathname === '/') ||
            (item.path === '/favorites' && location.pathname.includes('/favorites')) ||
            (item.path === '/search' && location.pathname.includes('/search'))

          return (
            <button
              key={item.path}
              onClick={item.action}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 px-2 py-2 transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
