import { useRef, useCallback } from "react";

interface CachedMedia {
  uri: string;
  type: "image" | "video";
  loadedAt: number;
}

interface MediaCache {
  [key: string]: CachedMedia;
}

/**
 * Session-based media caching hook
 * - Caches images and videos during the app session
 * - Clears automatically on app restart
 * - Prioritizes image loading before video
 * - Supports prefetching for better performance
 */
export const useMediaCache = () => {
  const cacheRef = useRef<MediaCache>({});
  const loadingRef = useRef<Set<string>>(new Set());
  const priorityQueueRef = useRef<
    { uri: string; type: "image" | "video"; priority: number }[]
  >([]);

  // Check if media is cached
  const isCached = useCallback((uri: string) => {
    return !!cacheRef.current[uri];
  }, []);

  // Get cached media
  const getCachedMedia = useCallback((uri: string) => {
    return cacheRef.current[uri];
  }, []);

  // Mark media as loaded/cached
  const setCached = useCallback((uri: string, type: "image" | "video") => {
    cacheRef.current[uri] = {
      uri,
      type,
      loadedAt: Date.now(),
    };
    loadingRef.current.delete(uri);
  }, []);

  // Mark media as loading
  const setLoading = useCallback((uri: string) => {
    loadingRef.current.add(uri);
  }, []);

  // Check if media is currently loading
  const isLoading = useCallback((uri: string) => {
    return loadingRef.current.has(uri);
  }, []);

  // Prefetch media with priority queue
  const prefetchMedia = useCallback(
    (uri: string, type: "image" | "video" = "image") => {
      if (!isCached(uri) && !isLoading(uri)) {
        // Images have priority (1) over videos (0)
        const priority = type === "image" ? 1 : 0;
        priorityQueueRef.current.push({ uri, type, priority });
        // Sort by priority (descending)
        priorityQueueRef.current.sort((a, b) => b.priority - a.priority);
        return true;
      }
      return false;
    },
    [isCached, isLoading],
  );

  // Get next media to prefetch from queue
  const getNextPrefetchMedia = useCallback(() => {
    return priorityQueueRef.current.shift();
  }, []);

  // Clear entire cache (call on app restart/logout)
  const clearCache = useCallback(() => {
    cacheRef.current = {};
    loadingRef.current.clear();
    priorityQueueRef.current = [];
  }, []);

  // Get cache stats for debugging
  const getCacheStats = useCallback(() => {
    const images = Object.values(cacheRef.current).filter(
      (m) => m.type === "image",
    ).length;
    const videos = Object.values(cacheRef.current).filter(
      (m) => m.type === "video",
    ).length;
    return {
      totalCached: Object.keys(cacheRef.current).length,
      images,
      videos,
      loading: loadingRef.current.size,
      queuedForPrefetch: priorityQueueRef.current.length,
    };
  }, []);

  return {
    isCached,
    getCachedMedia,
    setCached,
    setLoading,
    isLoading,
    prefetchMedia,
    getNextPrefetchMedia,
    clearCache,
    getCacheStats,
  };
};
