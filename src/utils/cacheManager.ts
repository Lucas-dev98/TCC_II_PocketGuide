/**
 * Cache Manager - Centralized caching for API responses
 * Improves performance by reducing unnecessary API calls
 *
 * Features:
 * - TTL (Time To Live) based cache expiration
 * - Key-based storage with metadata
 * - Automatic cache invalidation
 * - Memory and AsyncStorage support
 * - Cache statistics and monitoring
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../services/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
  hits: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

type CacheStrategy = 'memory' | 'storage' | 'hybrid';

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private strategy: CacheStrategy;
  private stats = { hits: 0, misses: 0 };
  private storagePrefix = '@cache_';
  private maxMemorySize = 50; // Max entries in memory

  constructor(strategy: CacheStrategy = 'hybrid') {
    this.strategy = strategy;
    this.startCleanupInterval();
  }

  /**
   * Get from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && this.isValid(memoryEntry)) {
        this.recordHit();
        memoryEntry.hits++;
        logger.debug(`Cache hit (memory): ${key}`);
        return memoryEntry.data as T;
      }

      // Check storage if using hybrid or storage strategy
      if (this.strategy !== 'memory') {
        const storageEntry = await this.getFromStorage<T>(key);
        if (storageEntry) {
          this.recordHit();
          // Promote to memory cache
          this.memoryCache.set(key, storageEntry);
          logger.debug(`Cache hit (storage): ${key}`);
          return storageEntry.data;
        }
      }

      this.recordMiss();
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for ${key}`, error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Set in cache
   */
  async set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
        hits: 0,
      };

      // Store in memory
      this.memoryCache.set(key, entry);

      // Enforce memory size limit
      if (this.memoryCache.size > this.maxMemorySize) {
        this.evictOldest();
      }

      // Store in AsyncStorage if using hybrid or storage strategy
      if (this.strategy !== 'memory') {
        await this.setInStorage(key, entry);
      }

      logger.debug(`Cache set: ${key}`, { ttlMs });
    } catch (error) {
      logger.error(`Cache set error for ${key}`, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Delete specific key
   */
  async delete(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);

      if (this.strategy !== 'memory') {
        await AsyncStorage.removeItem(`${this.storagePrefix}${key}`);
      }

      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`Cache delete error for ${key}`, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();

      if (this.strategy !== 'memory') {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter((k) => k.startsWith(this.storagePrefix));
        await AsyncStorage.multiRemove(cacheKeys);
      }

      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.memoryCache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
    };
  }

  /**
   * Clear statistics
   */
  clearStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Wrapper for API calls with automatic caching
   */
  async withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const data = await fn();
      await this.set(key, data, ttlMs);
      return data;
    } catch (error) {
      logger.error(`Cache withCache error for ${key}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Private helpers
   */

  private isValid(entry: CacheEntry<any>): boolean {
    const age = Date.now() - entry.timestamp;
    return age < entry.ttl;
  }

  private recordHit() {
    this.stats.hits++;
  }

  private recordMiss() {
    this.stats.misses++;
  }

  private evictOldest() {
    let oldest: { key: string; entry: CacheEntry<any> } | null = null;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (!oldest || entry.timestamp < oldest.entry.timestamp) {
        oldest = { key, entry };
      }
    }

    if (oldest) {
      this.memoryCache.delete(oldest.key);
      logger.debug(`Cache evicted oldest: ${oldest.key}`);
    }
  }

  private async getFromStorage<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const data = await AsyncStorage.getItem(`${this.storagePrefix}${key}`);
      if (!data) return null;

      const entry = JSON.parse(data) as CacheEntry<T>;
      return this.isValid(entry) ? entry : null;
    } catch (error) {
      logger.error(`Storage get error for ${key}`, error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  private async setInStorage<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.storagePrefix}${key}`,
        JSON.stringify(entry)
      );
    } catch (error) {
      logger.error(`Storage set error for ${key}`, error instanceof Error ? error : new Error(String(error)));
    }
  }

  private startCleanupInterval() {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    let cleaned = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }
}

// Singleton instance
const cacheManager = new CacheManager('hybrid');

export { CacheManager };
export default cacheManager;
