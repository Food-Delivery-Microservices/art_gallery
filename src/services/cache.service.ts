/**
 * Cache Service for ETag-based HTTP caching
 * Manages local storage of API responses and ETags
 */

interface CacheEntry {
  data: any;
  etag: string;
  timestamp: number;
}

const CACHE_PREFIX = 'api_cache_';
const ETAG_PREFIX = 'etag_';

export const cacheService = {
  /**
   * Store data and ETag in local storage
   */
  set: (key: string, data: any, etag: string): void => {
    try {
      const cacheEntry: CacheEntry = {
        data,
        etag,
        timestamp: Date.now(),
      };
      console.log('CACHE_PREFIX',`${CACHE_PREFIX}${key}`)
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheEntry));
      localStorage.setItem(`${ETAG_PREFIX}${key}`, etag);
      
      // Also store with the 'If-None-Match' key as requested
      localStorage.setItem('If-None-Match', etag);
    } catch (error) {
      console.error('Error storing cache:', error);
    }
  },

  /**
   * Get cached data from local storage
   */
  get: (key: string): any | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheEntry: CacheEntry = JSON.parse(cached);
      return cacheEntry.data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  },

  /**
   * Get ETag for a specific cache key
   */
  getETag: (key: string): string | null => {
    try {
      return localStorage.getItem(`${ETAG_PREFIX}${key}`);
    } catch (error) {
      console.error('Error reading ETag:', error);
      return null;
    }
  },

  /**
   * Get the If-None-Match header value
   */
  getIfNoneMatch: (): string | null => {
    try {
      return localStorage.getItem('If-None-Match');
    } catch (error) {
      console.error('Error reading If-None-Match:', error);
      return null;
    }
  },

  /**
   * Check if cache exists and is valid
   */
  has: (key: string): boolean => {
    return localStorage.getItem(`${CACHE_PREFIX}${key}`) !== null;
  },

  /**
   * Remove cached data and ETag
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      localStorage.removeItem(`${ETAG_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  },

  /**
   * Clear all cached data
   */
  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX) || key.startsWith(ETAG_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem('If-None-Match');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  /**
   * Get cache age in milliseconds
   */
  getCacheAge: (key: string): number | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheEntry: CacheEntry = JSON.parse(cached);
      return Date.now() - cacheEntry.timestamp;
    } catch (error) {
      console.error('Error getting cache age:', error);
      return null;
    }
  },

  /**
   * Check if cache is expired (default: 1 hour)
   */
  isExpired: (key: string, maxAge: number = 3600000): boolean => {
    const age = cacheService.getCacheAge(key);
    if (age === null) return true;
    return age > maxAge;
  },
};

export default cacheService;

// Made with Bob
