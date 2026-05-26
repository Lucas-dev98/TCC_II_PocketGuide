import { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BackendStatusBadge } from '../BackendStatusBadge'

/**
 * MainLayout Component
 * 
 * Layout principal que combina:
 * - TopBar (desktop only, >1024px)
 * - Sidebar (desktop only, >1024px)
 * - BottomNavigation (mobile only, <1024px)
 * 
 * Responsivo:
 * - Mobile (<1024px): TopBar hidden, Sidebar hidden, BottomNav visible
 * - Desktop (>1024px): TopBar visible, Sidebar visible, BottomNav hidden
 * 
 * Props:
 * - children: Conteúdo principal
 * - withoutPadding?: Se true, não adiciona padding (para screens que gerenciam próprio padding)
 */
interface MainLayoutProps {
  children: ReactNode
  withoutPadding?: boolean
}

export function MainLayout({ children, withoutPadding = false }: MainLayoutProps) {
  return (
    <>
      {/* Desktop TopBar */}
      <TopBar />

      {/* Backend health indicator */}
      <BackendStatusBadge />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300
          ${withoutPadding ? '' : 'pt-16'}
          lg:ml-64 lg:pt-16
        `}
      >
        {children}
      </main>
    </>
  )
}
