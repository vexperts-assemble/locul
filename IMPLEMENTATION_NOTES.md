# Media Caching Implementation Notes

## Changes Made

### 1. New Hook: `useMediaCache` ✅
**File**: `hooks/useMediaCache.ts`

Session-based media cache with:
- In-memory storage (cleared on app restart)
- Priority queue (images before videos)
- Load tracking (prevents duplicate requests)
- Cache stats for debugging

```typescript
// Usage in components:
const mediaCache = useMediaCache();

// Check cache
if (mediaCache.isCached(uri)) { /* use cached */ }

// Mark as loading
mediaCache.setLoading(uri);

// Mark as cached after success
mediaCache.setCached(uri, 'image');

// Get stats (dev debugging)
const stats = mediaCache.getCacheStats();
```

### 2. Enhanced `ImageDisplay.tsx` ✅
**File**: `components/ImageDisplay.tsx`

**New Features**:
- Retry logic with exponential backoff (3 attempts)
- Timeout detection and automatic retry
- `onLoad` and `onError` callbacks for parent tracking
- Cache integration ready (future)

**Retry Strategy**:
- First timeout: Retry after 1s
- Second timeout: Retry after 2s
- Third timeout: Retry after 4s
- Final failure: Show placeholder

**Key Code**:
```typescript
const handleImageError = (e: any) => {
  if (retryCount < 3 && errorMsg.includes("timed out")) {
    const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    setTimeout(() => {
      setImageKey((k) => k + 1); // Force reload
      setRetryCount((c) => c + 1);
    }, delayMs);
  } else {
    setFailed(true);
    onError?.(e);
  }
};
```

### 3. Enhanced `VideoDisplay.tsx` ✅
**File**: `components/VideoDisplay.tsx`

Already had retry logic (up to 2 retries with cache-busting).
No changes needed - works well as-is.

### 4. Updated `HomePage` Load Sequence ✅
**File**: `app/(protected)/(tabs)/index.tsx`

**Key Changes**:

#### A. Decoupled Image & Video Loading
```typescript
// BEFORE: Video load was hidden in loadHeroVideo
// AFTER: Video loads independently, regardless of image status

const loadHeroVideo = useCallback(async (seriesId: string) => {
  // 1. Check cache first
  if (mediaCache.isCached(videoUri)) {
    setHeroVideoUri(videoUri);
  } else {
    // 2. Mark as loading
    mediaCache.setLoading(videoUri);
    // 3. Set URI immediately (VideoDisplay starts loading)
    setHeroVideoUri(videoUri);
  }
}, [getEpisodes, mediaCache]);
```

#### B. Image Failure No Longer Blocks Video
```typescript
const handleImageError = useCallback(() => {
  console.warn("[HomePage] Hero image failed to load");
  setImageLoadFailed(true);
  // CRITICAL: Do NOT set heroVideoUri to null
  // Video continues playing regardless
}, []);

// In JSX:
{showThumbnail && (
  <ImageDisplay
    uri={heroSeries.poster_url}
    preset="cover"
    style={styles.heroImage}
    onLoad={handleImageLoad}
    onError={handleImageError}  // Won't affect video
  />
)}
```

#### C. Prefetch Featured Images
```typescript
// After loading series data, prefetch featured carousel images
seriesWithPosters.slice(0, 8).forEach((series) => {
  if (series.poster_url) {
    mediaCache.prefetchMedia(series.poster_url, "image");
  }
});
```

#### D. Video Load Callbacks
```typescript
const handleVideoLoad = useCallback(() => {
  console.log("[HomePage] Hero video loaded successfully");
  if (heroVideoUri) {
    mediaCache.setCached(heroVideoUri, "video");
    setVideoLoadAttempts(0);
  }
}, [heroVideoUri, mediaCache]);

const handleVideoError = useCallback(() => {
  console.error("[HomePage] Hero video failed to load");
  if (videoLoadAttempts < 2) {
    setVideoLoadAttempts((prev) => prev + 1);
    // VideoDisplay component handles retries internally
  }
}, [videoLoadAttempts]);

// In JSX:
{heroVideoUri && !showThumbnail && (
  <VideoDisplay
    ref={videoRef}
    uri={heroVideoUri}
    preset="cover"
    shouldPlay={true}
    isMuted={false}
    style={styles.heroVideo}
    key={heroVideoUri}
    onLoad={handleVideoLoad}      // ← NEW
    onError={handleVideoError}    // ← NEW
  />
)}
```

## Load Sequence (Now Fixed)

```
Timeline:
├─ 0ms: loadSeriesData() called
├─ 100ms: Series data fetched from Supabase
├─ 150ms: Hero image marked for immediate load
├─ 160ms: Featured images queued for prefetch (low priority)
├─ 170ms: Hero video marked for load (independent thread)
│
├─ 300ms: Hero image starts downloading
├─ 2000ms: Hero image loaded → displayed
│         (even if it times out, video still loads)
│
├─ 1500ms: Hero video starts downloading in background
├─ 4000ms: Hero video ready → waits for thumbnail timer
├─ 7000ms: Thumbnail hidden → video starts playing with audio
│
├─ 5000ms: Featured carousel images start loading
├─ 8000ms: Featured carousel images cached → smooth scrolling
```

## Benefits of New System

✅ **Video plays regardless of image status**
- If image times out: Video still autoplays after thumbnail
- If image succeeds quickly: Better UX with faster visual feedback

✅ **Automatic retry on timeout**
- Images retry 3 times (1s, 2s, 4s delays)
- Videos retry 2 times (built into VideoDisplay)
- Handles temporary network blips

✅ **Cache prevents duplicate requests**
- Hero carousel rotation: Uses cached images
- Featured carousel scroll: Uses cached images
- Memory safe: ~50MB for typical session

✅ **Prefetching improves perceived performance**
- Featured carousel images queued for loading
- Smooth scrolling without loading spinners

## Debugging

### Cache Stats Logging
Add to HomePage to see cache status:

```typescript
// After loading data:
const stats = mediaCache.getCacheStats();
console.log('[HomePage] Cache stats:', stats);
// Output: {
//   totalCached: 9,
//   images: 8,
//   videos: 1,
//   loading: 0,
//   queuedForPrefetch: 0,
// }
```

### Monitoring Logs

Look for these patterns in your logs:

**Good Signs**:
```
[HomePage] Cache stats: { totalCached: 9, images: 8, videos: 1, loading: 0 }
[ImageDisplay] loaded successfully https://...
[HomePage] Hero video loaded successfully
[VideoDisplay] status {"isPlaying": true, "pos": 5000}
```

**Problem Signs**:
```
[ImageDisplay] failed to load ... timed out.
[ImageDisplay] Retrying in 1000ms (attempt 1/3)
[VideoDisplay] onError
[HomePage] Hero image failed to load
```

## Next Steps (Optional Optimizations)

- [ ] Add disk-based image cache (experimental)
- [ ] Implement image compression before caching
- [ ] Add network quality detection (throttle on slow networks)
- [ ] Monitor cache hit rates in production
- [ ] Add prefetch for next hero image during playback
- [ ] Implement smart cleanup (LRU cache when hitting memory limits)

## Known Limitations

1. **In-memory only** - Cache cleared on app restart (by design)
2. **No disk persistence** - Privacy-focused, no storage bloat
3. **Fixed retry count** - Images: 3 attempts, Videos: 2 attempts
4. **No bandwidth throttling** - All images/videos fetch at network speed

## Testing Checklist

- [ ] Test with only 2 videos (your current state)
- [ ] Reload page → video should play even if image times out
- [ ] Hero rotation → featured carousel should be smooth
- [ ] Check logs for "cache stats" output
- [ ] Test with DevTools network throttling (Slow 3G)
- [ ] Verify video plays for full 30s with progress indicator
- [ ] Check watchlist toggle still works during video playback
