import { debug } from '@/utils/debug';

/**
 * Interface para dados em cache
 */
interface CachedImage {
  url: string;
  data: string; // Base64 encoded image data
  timestamp: number;
  expiresAt: number;
}

/**
 * Serviço de cache de imagens usando IndexedDB
 * Reduz requisições de rede ao armazenar imagens localmente
 */
class ImageCacheService {
  private dbName = 'PocketGuideDB';
  private storeName = 'images';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private cacheEnabled = true;
  private readonly CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
  private cacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
  };

  constructor() {
    this.initDb();
  }

  /**
   * Inicializa a conexão com IndexedDB
   */
  private async initDb(): Promise<void> {
    try {
      if (!('indexedDB' in window)) {
        debug.warn('⚠️ ImageCache: IndexedDB not available');
        this.cacheEnabled = false;
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        debug.error('❌ ImageCache: Failed to open database:', request.error);
        this.cacheEnabled = false;
      };

      request.onsuccess = () => {
        this.db = request.result;
        debug.log('🖼️ ImageCache: Database initialized');
        this.cleanExpiredCache();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
          debug.log('🖼️ ImageCache: Object store created');
        }
      };
    } catch (error) {
      debug.error('❌ ImageCache: Initialization error:', error);
      this.cacheEnabled = false;
    }
  }

  /**
   * Recupera uma imagem do cache
   */
  async getImage(url: string): Promise<string | null> {
    if (!this.cacheEnabled || !this.db) {
      return null;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const cached = request.result as CachedImage | undefined;

          if (cached) {
            const now = Date.now();
            if (now < cached.expiresAt) {
              debug.log(`🖼️ ImageCache: Cache hit for ${url.substring(0, 40)}...`);
              this.cacheStats.hits++;
              resolve(cached.data);
            } else {
              debug.log(`⏰ ImageCache: Cache expired for ${url.substring(0, 40)}...`);
              this.deleteImage(url);
              this.cacheStats.misses++;
              resolve(null);
            }
          } else {
            this.cacheStats.misses++;
            resolve(null);
          }
        };

        request.onerror = () => {
          debug.warn('⚠️ ImageCache: Get error:', request.error);
          this.cacheStats.errors++;
          resolve(null);
        };
      });
    } catch (error) {
      debug.error('❌ ImageCache: Error getting image:', error);
      this.cacheStats.errors++;
      return null;
    }
  }

  /**
   * Armazena uma imagem no cache
   */
  async setImage(url: string, imageData: string): Promise<boolean> {
    if (!this.cacheEnabled || !this.db) {
      return false;
    }

    try {
      const cached: CachedImage = {
        url,
        data: imageData,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_EXPIRATION_MS,
      };

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(cached);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          debug.log(`✅ ImageCache: Cached ${url.substring(0, 40)}...`);
          resolve(true);
        };

        request.onerror = () => {
          debug.warn('⚠️ ImageCache: Set error:', request.error);
          this.cacheStats.errors++;
          resolve(false);
        };
      });
    } catch (error) {
      debug.error('❌ ImageCache: Error setting image:', error);
      this.cacheStats.errors++;
      return false;
    }
  }

  /**
   * Remove uma imagem do cache
   */
  async deleteImage(url: string): Promise<boolean> {
    if (!this.cacheEnabled || !this.db) {
      return false;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(url);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          debug.log(`🗑️ ImageCache: Deleted ${url.substring(0, 40)}...`);
          resolve(true);
        };

        request.onerror = () => {
          debug.warn('⚠️ ImageCache: Delete error:', request.error);
          resolve(false);
        };
      });
    } catch (error) {
      debug.error('❌ ImageCache: Error deleting image:', error);
      return false;
    }
  }

  /**
   * Limpa o cache completamente
   */
  async clearCache(): Promise<boolean> {
    if (!this.cacheEnabled || !this.db) {
      return false;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      return new Promise((resolve) => {
        request.onsuccess = () => {
          debug.log('🗑️ ImageCache: Cache cleared');
          this.cacheStats.hits = 0;
          this.cacheStats.misses = 0;
          this.cacheStats.errors = 0;
          resolve(true);
        };

        request.onerror = () => {
          debug.warn('⚠️ ImageCache: Clear error:', request.error);
          resolve(false);
        };
      });
    } catch (error) {
      debug.error('❌ ImageCache: Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Limpa imagens expiradas do cache
   */
  private async cleanExpiredCache(): Promise<void> {
    if (!this.cacheEnabled || !this.db) {
      return;
    }

    try {
      const now = Date.now();
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(now);
      const request = index.getAll(range);

      request.onsuccess = () => {
        const expiredItems = request.result as CachedImage[];
        expiredItems.forEach((item) => {
          store.delete(item.url);
        });

        if (expiredItems.length > 0) {
          debug.log(`🧹 ImageCache: Cleaned ${expiredItems.length} expired items`);
        }
      };
    } catch (error) {
      debug.error('❌ ImageCache: Error cleaning expired cache:', error);
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? ((this.cacheStats.hits / total) * 100).toFixed(2) : '0.00';

    return {
      ...this.cacheStats,
      total,
      hitRate: `${hitRate}%`,
      enabled: this.cacheEnabled,
    };
  }

  /**
   * Carrega uma imagem de uma URL e armazena em cache
   */
  async fetchAndCache(url: string): Promise<string | null> {
    try {
      // Verificar cache primeiro
      const cached = await this.getImage(url);
      if (cached) {
        return cached;
      }

      // Buscar imagem
      debug.log(`📥 ImageCache: Fetching ${url.substring(0, 40)}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'PocketGuide/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);

      // Armazenar em cache
      await this.setImage(url, base64);

      return base64;
    } catch (error) {
      debug.error(`❌ ImageCache: Error fetching ${url.substring(0, 40)}...`, error);
      this.cacheStats.errors++;
      return null;
    }
  }

  /**
   * Converte Blob para Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Export singleton instance
export const imageCache = new ImageCacheService();
export default imageCache;
