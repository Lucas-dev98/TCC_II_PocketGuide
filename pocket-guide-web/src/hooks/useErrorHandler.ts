import { useState, useCallback } from 'react';
import { debug } from '@/utils/debug';
import { useI18n } from '@/i18n/I18nContext';

/**
 * Interface para estado de erro
 */
interface ErrorState {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Hook customizado para gerenciar erros e retries
 * Fornece feedback melhor ao usuário
 */
export const useErrorHandler = () => {
  const { tWithParams } = useI18n();
  const [error, setError] = useState<ErrorState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  /**
   * Mapeia erros técnicos para mensagens amigáveis
   */
  const mapErrorToMessage = useCallback((err: any, operation: string): ErrorState => {
    let message = tWithParams('errors.generic.message', {});
    let code = 'UNKNOWN_ERROR';
    let details = '';

    if (err instanceof TypeError) {
      if (err.message.includes('fetch')) {
        message = tWithParams('errors.network.message', {});
        code = 'NETWORK_ERROR';
        details = tWithParams('errors.network.details', {});
      } else if (err.message.includes('JSON')) {
        message = tWithParams('errors.parseError.message', {});
        code = 'PARSE_ERROR';
        details = tWithParams('errors.parseError.details', {});
      }
    } else if (err instanceof Error) {
      if (err.message.includes('HTTP')) {
        const statusMatch = err.message.match(/HTTP (\d+)/);
        const status = statusMatch ? parseInt(statusMatch[1]) : 0;
        
        if (status === 0) {
          message = tWithParams('errors.noConnection.message', {});
          code = 'OFFLINE';
          details = tWithParams('errors.noConnection.details', {});
        } else if (status === 408 || status === 504) {
          message = tWithParams('errors.timeout.message', {});
          code = 'TIMEOUT';
          details = `O servidor demorou muito para responder`;
        } else if (status === 429) {
          message = tWithParams('errors.rateLimited.message', {});
          code = 'RATE_LIMIT';
          details = tWithParams('errors.rateLimited.details', {});
        } else if (status >= 500) {
          message = tWithParams('errors.serverError.message', {});
          code = 'SERVER_ERROR';
          details = `Erro ${status} no servidor`;
        } else if (status === 404) {
          message = tWithParams('errors.notFound.message', {});
          code = 'NOT_FOUND';
          details = tWithParams('errors.notFound.details', { operation });
        } else if (status >= 400) {
          message = tWithParams('errors.invalidRequest.message', {});
          code = 'CLIENT_ERROR';
          details = tWithParams('errors.invalidRequest.details', { status });
        }
      }
    }

    debug.error(`[${code}] ${message}`, { operation, originalError: err?.message });

    return {
      message,
      code,
      details,
    };
  }, [tWithParams]);

  /**
   * Captura e processa erros
   */
  const captureError = useCallback((err: any, operation: string = 'Operation') => {
    const errorState = mapErrorToMessage(err, operation);
    setError(errorState);
    return errorState;
  }, [mapErrorToMessage]);

  /**
   * Limpa o erro
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsRetrying(false);
  }, []);

  /**
   * Inicia retry
   */
  const startRetry = useCallback(() => {
    setIsRetrying(true);
  }, []);

  /**
   * Finaliza retry
   */
  const endRetry = useCallback(() => {
    setIsRetrying(false);
  }, []);

  return {
    error,
    isRetrying,
    captureError,
    clearError,
    startRetry,
    endRetry,
    mapErrorToMessage,
  };
};

export default useErrorHandler;
