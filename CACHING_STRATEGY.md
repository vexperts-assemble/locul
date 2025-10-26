# Media Caching Strategy

## Overview

Implement a session-based media caching system that:
1. **Prioritizes images** - Load all images first for immediate visual feedback
2. **Defers videos** - Load videos in background after images
3. **Caches during session** - Keep media in memory during active session
4. **Clears on restart** - Automatically clear cache when app closes/restarts
5. **Prevents timeout issues** - Avoid redundant requests for same content

## Current Issues (Logs Analysis)

### Problems Identified
1. **Image Timeouts** (Line 882, 911 in logs)
   - Request timeouts on Supabase Storage
   - Possible network congestion or large image sizes
   - No retry logic for failed images

2. **No Caching**
   - Every render re-fetches images and videos
   - Featured carousel loads all images every scroll
   - Hero section reloads images on hero rotation

3. **Sequencing Issue**
   - Videos may load before images are ready
   - Causes layout shifts and visual jank
   - User sees loading spinner longer than necessary

4. **No Prefetching**
   - Next hero image not preloaded during current playback
   - Featured carousel images load on-demand during scroll
   - Poor perceived performance

## Solution Architecture

### 1. Media Loading Sequence

```
App Load
  ├─ Load Series Data (SQL) ✓ Fast
  │
  ├─ Phase 1: IMMEDIATE (Hero Image)
  │  └─ Fetch hero poster image
  │     └─ Display immediately once loaded
  │
  ├─ Phase 2: PREFETCH (Featured Images)
  │  └─ Fetch next 7-8 featured carousel images
  │     └─ Cache in memory
  │
  ├─ Phase 3: BACKGROUND (Videos)
  │  └─ Fetch hero video in background
  │     └─ Store in-memory cache
  │     └─ Start autoplay when ready (3s delay)
  │
  └─ Phase 4: LAZY (Remaining Videos)
     └─ On-demand as needed
```

### 2. Cache Structure

```typescript
// Session-based cache (cleared on app restart)
cache = {
  'https://...poster1.jpg': {
    uri: '...',
    type: 'image',
    loadedAt: 1234567890,
  },
  'https://stream.mux.com/video.m3u8': {
    uri: '...',
    type: 'video',
    loadedAt: 1234567890,
  },
}

// Loading tracking (prevents duplicate requests)
loading = Set['https://...poster1.jpg', '...']

// Priority queue (images first, then videos)
prefetchQueue = [
  { uri: '...featured1.jpg', type: 'image', priority: 1 },
  { uri: '...featured2.jpg', type: 'image', priority: 1 },
  { uri: '...video.m3u8', type: 'video', priority: 0 },
]
```

### 3. Implementation Points

#### ImageDisplay.tsx Enhancement
```typescript
// Before rendering image:
// 1. Check cache first
// 2. If cached, use cached URI (instant load)
// 3. If loading, show placeholder
// 4. If failed with timeout, retry with exponential backoff
// 5. On success, cache the URI
```

#### VideoDisplay.tsx Enhancement
```typescript
// Before rendering video:
// 1. Check if hero image is fully loaded (dependency)
// 2. Don't start loading video until image is done
// 3. Load video with timeout of 10s (shorter for quick failure)
// 4. On success, cache in session
// 5. Support retry up to 3 times with exponential backoff
```

#### Homepage Load Sequence
```typescript
// 1. Load series data (1-2s)
// 2. Mark hero image for immediate load (prefetch priority 10)
// 3. Show loading state for hero
// 4. Once hero image loads:
//    a. Mark featured images for prefetch (priority 1 each)
//    b. Mark hero video for load (priority 0, background)
// 5. Once featured images prefetch:
//    a. Smooth carousel scroll without loading delays
// 6. Once hero video loads:
//    a. Wait 3s with thumbnail
//    b. Switch to video with audio
```

## Retry Strategy

### Image Timeout Handling
- **First attempt**: 15s timeout
- **Retry 1**: 10s timeout (after 1s delay)
- **Retry 2**: 10s timeout (after 2s delay)
- **Fallback**: Show gray placeholder with error icon

### Video Timeout Handling
- **First attempt**: 30s timeout (HLS streams take longer)
- **Retry 1**: 20s timeout (after 2s delay)
- **Retry 2**: 20s timeout (after 4s delay)
- **Fallback**: Show thumbnail, disable autoplay

## Implementation Checklist

- [ ] Create `useMediaCache` hook (✓ done)
- [ ] Update `ImageDisplay` to use cache
- [ ] Update `VideoDisplay` to use cache
- [ ] Implement sequence in HomePage
- [ ] Add retry logic with exponential backoff
- [ ] Add cache stats logging (dev only)
- [ ] Test with slow network (DevTools throttling)
- [ ] Monitor in production for timeouts

## Performance Targets

- Hero image: <1s to display (cached after first load)
- Featured carousel: No loading spinner on scroll (prefetched)
- Hero video: Ready within 3s (background load during thumbnail)
- Cache hit rate: >95% on hero rotation
- Memory usage: <50MB for typical 8-10 images + 1-2 videos

## Cache Lifecycle

### Session Start (App Opens)
```
cache = {} (empty)
```

### During Session
```
cache = {
  heroImage: { ... },
  featured1-8: { ... },
  heroVideo: { ... },
}
```

### Session End (App Closes)
```
cache = {} (cleared automatically)
// Credentials and settings remain in secure storage
```

### App Restart
```
cache = {} (fresh start, re-fetches needed media)
// Users' watchlist, preferences stay intact
```

## Benefits

✅ **Faster Perceived Performance**: Images load instantly on hero rotation  
✅ **Smooth Scrolling**: Featured carousel preloaded and cached  
✅ **Reduced Network Load**: No duplicate requests for same media  
✅ **Better UX**: No layout shifts from delayed image loads  
✅ **Automatic Cleanup**: Cache clears on app restart (no storage bloat)  
✅ **Privacy**: Media not persisted to disk (session only)  
✅ **Resilience**: Retry logic handles temporary network issues  

## Debugging

Enable cache stats logging in dev builds:

```typescript
const stats = mediaCache.getCacheStats();
console.log('[MediaCache]', stats);
// Output: {
//   totalCached: 9,
//   images: 8,
//   videos: 1,
//   loading: 0,
//   queuedForPrefetch: 0,
// }
```
