import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Heart, Shield, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import useI18n from '../../hooks/useI18n'

/**
 * Sidebar Component
 * 
 * Navegação vertical à esquerda para desktop (>1024px)
 * Contém:
 * - Logo/Branding
 * - Menu items (5 principais)
 * - Collapse button
 * - Responsive (250px ou 60px quando colapsado)
 * 
 * Estados:
 * - Expandido: 250px (mostra labels)
 * - Colapsado: 60px (só ícones)
 * - Mobile: Hidden (usa BottomNav)
 */
export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { label: t('navigation.home'), icon: Home, path: '/home', id: 'home' },
    { label: t('navigation.search'), icon: Search, path: '/search', id: 'search' },
    { label: t('navigation.favorites'), icon: Heart, path: '/favorites', id: 'favorites' },
    { label: t('navigation.security'), icon: Shield, path: '/security', id: 'security' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/home' && location.pathname === '/')
  }

  return (
    <aside
      className={`hidden lg:flex fixed left-0 top-16 bottom-0 z-30 flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo/Brand Section */}
      <div className={`h-20 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 ${isCollapsed ? 'px-2' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">📍</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">PG</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label={isCollapsed ? t('navigation.expandSidebar') : t('navigation.collapseSidebar')}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className={`p-3 border-t border-slate-200 dark:border-slate-700 ${isCollapsed ? 'px-2' : ''}`}>
        <button
          onClick={() => {
            localStorage.removeItem('auth')
            navigate('/login', { replace: true })
          }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title={isCollapsed ? t('navigation.logout') : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">{t('navigation.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}
