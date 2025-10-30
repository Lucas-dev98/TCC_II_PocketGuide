import React from 'react';
import { LoadingAnimation } from './LoadingAnimation';

interface LoadingOverlayProps {
  /**
   * Se o overlay está visível
   */
  isVisible: boolean;
  /**
   * Mensagem de carregamento
   * @default "Carregando..."
   */
  message?: string;
  /**
   * URL customizada da animação Lottie
   */
  animationSrc?: string;
}

/**
 * Componente de Overlay de Carregamento Fullscreen
 * Cobre toda a tela com um overlay semi-transparente e animação de carregamento
 *
 * @example
 * ```tsx
 * const [isLoading, setIsLoading] = useState(false);
 *
 * return (
 *   <>
 *     <LoadingOverlay isVisible={isLoading} message="Processando..." />
 *     <button onClick={() => setIsLoading(true)}>
 *       Carregar
 *     </button>
 *   </>
 * );
 * ```
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Carregando...',
  animationSrc = 'https://lottie.host/bd19ef0a-6c3b-4673-85df-880582a1e535/tWrCXGEr51.lottie',
}) => {
  // Importante: quando não está visível, não renderizar nada (para evitar bloquear cliques)
  // e adicionar pointer-events-none quando está visível mas para transição suave
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm pointer-events-auto"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 flex flex-col items-center gap-4 pointer-events-auto">
        <LoadingAnimation
          src={animationSrc}
          size="lg"
          label={message}
        />
      </div>
    </div>
  );
};

export default LoadingOverlay;
