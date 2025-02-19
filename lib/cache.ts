import { Event } from "@/types/event"

type CacheItem<T> = {
  data: T
  timestamp: number
}

class Cache {
  private static instance: Cache
  private cache: Map<string, CacheItem<any>>
  private readonly TTL: number // Time to live in milliseconds

  private constructor() {
    this.cache = new Map()
    this.TTL = 30 * 1000 // 30 seconds
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const cache = Cache.getInstance()

// Utility functions for event data caching
export const cacheKeys = {
  event: (id: string) => `event:${id}`,
  eventList: 'events:list'
}

export const getCachedEvent = (id: string): Event | null => {
  return cache.get<Event>(cacheKeys.event(id))
}

export const setCachedEvent = (event: Event): void => {
  cache.set(cacheKeys.event(event.id), event)
}

export const getCachedEventList = (): Event[] | null => {
  return cache.get<Event[]>(cacheKeys.eventList)
}

export const setCachedEventList = (events: Event[]): void => {
  cache.set(cacheKeys.eventList, events)
}

export const invalidateEventCache = (id: string): void => {
  cache.invalidate(cacheKeys.event(id))
  cache.invalidate(cacheKeys.eventList)
}

export const clearEventCache = (): void => {
  cache.clear()
}

// Función de utilidad para generar claves de caché
export function generateCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {} as Record<string, any>)

  return `${prefix}:${JSON.stringify(sortedParams)}`
} 