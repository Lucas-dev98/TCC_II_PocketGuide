import { Skeleton } from './Skeleton'

/**
 * RouteLoadingFallback - Componente exibido enquanto screens estão carregando
 * 
 * Usado com React.lazy() e Suspense para melhor UX durante code-splitting
 * Simula o esqueleto da tela para evitar branco vazio
 */
export function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Content skeleton - simula 3 cards */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default RouteLoadingFallback
