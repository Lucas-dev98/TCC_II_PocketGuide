import { useState, useCallback } from 'react';
import { debug } from '@/utils/debug';

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
  const [error, setError] = useState<ErrorState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  /**
   * Mapeia erros técnicos para mensagens amigáveis
   */
  const mapErrorToMessage = useCallback((err: any, operation: string): ErrorState => {
    let message = 'Ocorreu um erro ao processar sua solicitação';
    let code = 'UNKNOWN_ERROR';
    let details = '';

    if (err instanceof TypeError) {
      if (err.message.includes('fetch')) {
        message = 'Erro de conexão. Verifique sua internet.';
        code = 'NETWORK_ERROR';
        details = 'Não foi possível conectar ao servidor';
      } else if (err.message.includes('JSON')) {
        message = 'Erro ao processar dados recebidos';
        code = 'PARSE_ERROR';
        details = 'Resposta inválida do servidor';
      }
    } else if (err instanceof Error) {
      if (err.message.includes('HTTP')) {
        const statusMatch = err.message.match(/HTTP (\d+)/);
        const status = statusMatch ? parseInt(statusMatch[1]) : 0;
        
        if (status === 0) {
          message = 'Sem conexão com internet';
          code = 'OFFLINE';
          details = 'Verifique sua conexão e tente novamente';
        } else if (status === 408 || status === 504) {
          message = 'Solicitação expirou. Tente novamente.';
          code = 'TIMEOUT';
          details = 'O servidor demorou muito para responder';
        } else if (status === 429) {
          message = 'Muitas requisições. Aguarde um momento.';
          code = 'RATE_LIMIT';
          details = 'Você está fazendo solicitações com frequência';
        } else if (status >= 500) {
          message = 'Servidor indisponível. Tente mais tarde.';
          code = 'SERVER_ERROR';
          details = `Erro ${status} no servidor`;
        } else if (status === 404) {
          message = 'Recurso não encontrado';
          code = 'NOT_FOUND';
          details = `${operation} não foi encontrado`;
        } else if (status >= 400) {
          message = 'Solicitação inválida';
          code = 'CLIENT_ERROR';
          details = `Erro ${status} na sua solicitação`;
        }
      }
    }

    debug.error(`[${code}] ${message}`, { operation, originalError: err?.message });

    return {
      message,
      code,
      details,
    };
  }, []);

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
