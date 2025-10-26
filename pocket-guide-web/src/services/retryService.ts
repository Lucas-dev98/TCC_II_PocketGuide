import { debug } from '@/utils/debug';

/**
 * Interface para resultado de retry
 */
interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/**
 * Interface para configuração de retry
 */
interface RetryConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Serviço de retry com backoff exponencial
 * Melhora confiabilidade de requisições de rede
 */
class RetryService {
  private readonly defaultConfig: Required<RetryConfig> = {
    maxAttempts: 3,
    initialDelayMs: 500,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    shouldRetry: (error: Error) => {
      // Não fazer retry para erros de validação (4xx), exceto 408 e 429
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
          return false;
        }
      }
      return true;
    },
  };

  /**
   * Executa uma função com retry
   */
  async execute<T>(
    fn: () => Promise<T>,
    config?: RetryConfig
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();
    let lastError: Error | undefined;
    let delay = finalConfig.initialDelayMs;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        debug.log(`🔄 Retry [${attempt}/${finalConfig.maxAttempts}] - Executando...`);
        const data = await fn();
        
        const totalTime = Date.now() - startTime;
        debug.log(`✅ Retry [${attempt}] - Sucesso (${totalTime}ms)`);
        
        return {
          success: true,
          data,
          attempts: attempt,
          totalTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        debug.warn(`⚠️ Retry [${attempt}] - Erro:`, lastError.message);

        // Verificar se devemos fazer retry
        if (attempt < finalConfig.maxAttempts && finalConfig.shouldRetry(lastError, attempt)) {
          debug.log(`⏳ Retry [${attempt}] - Aguardando ${delay}ms antes de tentar novamente...`);
          await this.sleep(delay);
          delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxDelayMs);
        } else if (attempt === finalConfig.maxAttempts) {
          debug.error(`❌ Retry - Falhou após ${attempt} tentativas`);
        }
      }
    }

    const totalTime = Date.now() - startTime;
    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      attempts: finalConfig.maxAttempts,
      totalTime,
    };
  }

  /**
   * Executa fetch com retry
   */
  async fetchWithRetry(
    url: string,
    options?: RequestInit,
    retryConfig?: RetryConfig
  ): Promise<Response> {
    const result = await this.execute(
      async () => {
        const response = await fetch(url, options);
        if (!response.ok) {
          const error: any = new Error(`HTTP ${response.status} ${response.statusText}`);
          error.status = response.status;
          throw error;
        }
        return response;
      },
      retryConfig
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }

  /**
   * Aguarda por um período (sleep)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Executa múltiplas operações em paralelo com retry individual
   */
  async executeParallel<T>(
    fns: Array<() => Promise<T>>,
    config?: RetryConfig
  ): Promise<RetryResult<T>[]> {
    return Promise.all(fns.map((fn) => this.execute(fn, config)));
  }

  /**
   * Cria uma função com retry automático
   */
  withRetry<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    config?: RetryConfig
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      const result = await this.execute(() => fn(...args), config);
      if (!result.success) {
        throw result.error;
      }
      return result.data!;
    };
  }
}

// Export singleton instance
export const retryService = new RetryService();
export default retryService;
