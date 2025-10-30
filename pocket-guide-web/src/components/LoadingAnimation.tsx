import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoadingAnimationProps {
  /**
   * URL da animação Lottie
   * @default "https://lottie.host/bd19ef0a-6c3b-4673-85df-880582a1e535/tWrCXGEr51.lottie"
   */
  src?: string;
  /**
   * Tamanho do container da animação
   * @default "w-24 h-24"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Se deve reproduzir em loop
   * @default true
   */
  loop?: boolean;
  /**
   * Se deve reproduzir automaticamente
   * @default true
   */
  autoplay?: boolean;
  /**
   * Classe customizada do container
   */
  className?: string;
  /**
   * Texto de carregamento opcional
   */
  label?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

/**
 * Componente de Animação de Carregamento
 * Exibe uma animação Lottie enquanto o conteúdo está sendo carregado
 *
 * @example
 * ```tsx
 * <LoadingAnimation />
 * ```
 *
 * @example
 * ```tsx
 * <LoadingAnimation
 *   size="lg"
 *   label="Carregando..."
 * />
 * ```
 */
export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  src = 'https://lottie.host/bd19ef0a-6c3b-4673-85df-880582a1e535/tWrCXGEr51.lottie',
  size = 'md',
  loop = true,
  autoplay = true,
  className = '',
  label,
}) => {
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label || 'Carregando'}
    >
      <div className={sizeClass}>
        <DotLottieReact src={src} loop={loop} autoplay={autoplay} />
      </div>
      {label && (
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
          {label}
        </p>
      )}
    </div>
  );
};

export default LoadingAnimation;
