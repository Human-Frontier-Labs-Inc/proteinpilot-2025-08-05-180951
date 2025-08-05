// Simple in-memory cache for development
// In production, use Redis or similar

import { useState, useEffect } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 15): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of Array.from(this.cache.entries())) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const item of Array.from(this.cache.values())) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired
    };
  }
}

// Create singleton instance
export const cache = new SimpleCache();

// Auto-cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

// Cache key generators
export const cacheKeys = {
  foodItems: (filters?: string) => `food-items${filters ? `-${filters}` : ''}`,
  userDailyStats: (userId: string, date: string) => `daily-stats-${userId}-${date}`,
  userProfile: (userId: string) => `user-profile-${userId}`,
  weeklyData: (userId: string, week: string) => `weekly-data-${userId}-${week}`,
  recentFoods: (userId: string) => `recent-foods-${userId}`,
};

// Cached API functions
export async function getCachedFoodItems(filters?: { category?: string; search?: string }) {
  const filterKey = filters ? JSON.stringify(filters) : '';
  const cacheKey = cacheKeys.foodItems(filterKey);
  
  // Try cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // If not cached, this would normally fetch from API
  // For now, return mock data
  const mockFoodItems = [
    {
      id: "1",
      name: "Chicken Breast",
      category: "protein",
      brand: "Generic",
      calories: 165,
      protein: 31,
      carbohydrates: 0,
      fat: 3.6,
      servingSize: 100,
      servingUnit: "g",
      verified: true
    },
    {
      id: "2",
      name: "Greek Yogurt",
      category: "dairy",
      brand: "Generic",
      calories: 100,
      protein: 10,
      carbohydrates: 6,
      fat: 5,
      servingSize: 100,
      servingUnit: "g",
      verified: true
    },
    {
      id: "3",
      name: "Eggs",
      category: "protein",
      brand: "Generic",
      calories: 155,
      protein: 13,
      carbohydrates: 1.1,
      fat: 11,
      servingSize: 100,
      servingUnit: "g",
      verified: true
    },
    {
      id: "4",
      name: "Whey Protein Powder",
      category: "supplements",
      brand: "Generic",
      calories: 103,
      protein: 20,
      carbohydrates: 2,
      fat: 1,
      servingSize: 25,
      servingUnit: "g",
      verified: true
    }
  ];

  // Apply filters if provided
  let filtered = mockFoodItems;
  if (filters?.category) {
    filtered = filtered.filter(item => item.category === filters.category);
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)
    );
  }

  // Cache for 30 minutes
  cache.set(cacheKey, filtered, 30);
  return filtered;
}

export async function getCachedUserDailyStats(userId: string, date?: Date) {
  const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const cacheKey = cacheKeys.userDailyStats(userId, dateStr);
  
  // Try cache first (shorter TTL for stats)
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Mock daily stats
  const mockStats = {
    userProfile: {
      proteinGoalDaily: 150,
      calorieGoalDaily: 2000
    },
    dailyTotals: {
      calories: Math.floor(Math.random() * 500) + 800, // 800-1300 calories
      protein: Math.floor(Math.random() * 60) + 40,    // 40-100g protein
      carbohydrates: Math.floor(Math.random() * 100) + 80, // 80-180g carbs
      fat: Math.floor(Math.random() * 40) + 30         // 30-70g fat
    },
    foodLogs: [],
    proteinGoal: 150,
    calorieGoal: 2000
  };

  // Cache for 5 minutes (stats change frequently)
  cache.set(cacheKey, mockStats, 5);
  return mockStats;
}

// Client-side caching hooks
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMinutes: number = 15
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check cache first
        const cached = cache.get<T>(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Fetch and cache
        setLoading(true);
        const result = await fetcher();
        cache.set(key, result, ttlMinutes);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  const refetch = async () => {
    cache.delete(key);
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      cache.set(key, result, ttlMinutes);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// Performance monitoring
export function createPerformanceMonitor() {
  const metrics = {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalResponseTime: 0,
    slowQueries: [] as Array<{ key: string; time: number; timestamp: Date }>
  };

  return {
    recordApiCall: (responseTime: number) => {
      metrics.apiCalls++;
      metrics.totalResponseTime += responseTime;
    },
    
    recordCacheHit: () => {
      metrics.cacheHits++;
    },
    
    recordCacheMiss: (key: string, responseTime: number) => {
      metrics.cacheMisses++;
      if (responseTime > 1000) { // Slow query threshold: 1 second
        metrics.slowQueries.push({
          key,
          time: responseTime,
          timestamp: new Date()
        });
      }
    },
    
    getMetrics: () => ({
      ...metrics,
      cacheHitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100,
      averageResponseTime: metrics.totalResponseTime / metrics.apiCalls,
      cacheStats: cache.getStats()
    }),
    
    reset: () => {
      Object.keys(metrics).forEach(key => {
        if (Array.isArray(metrics[key as keyof typeof metrics])) {
          (metrics[key as keyof typeof metrics] as any[]).length = 0;
        } else {
          (metrics[key as keyof typeof metrics] as number) = 0;
        }
      });
    }
  };
}

// Global performance monitor
export const performanceMonitor = createPerformanceMonitor();