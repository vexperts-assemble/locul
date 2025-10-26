# Media Caching Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOMEPAGE                               │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ loadSeriesData()                                           │ │
│  │  ├─ Fetch series from Supabase SQL                         │ │
│  │  ├─ Set heroSeries, featuredSeries                         │ │
│  │  └─ Trigger: loadHeroVideo() + prefetchFeaturedImages()   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           ↓↓↓                                   │
│  ┌──────────────────────────┬──────────────────────────────────┐ │
│  │   HERO SECTION           │   FEATURED CAROUSEL              │ │
│  │  ┌────────────────────┐  │  ┌──────────────────────────────┐ │
│  │  │ Hero Image         │  │  │ mediaCache.prefetchMedia()   │ │
│  │  │ (Thumbnail)        │  │  │  - Add 8 images to queue     │ │
│  │  │                    │  │  │  - Priority: 1 (images)      │ │
│  │  │ URI: poster_url    │  │  │  - Status: Queued            │ │
│  │  └────────────────────┘  │  └──────────────────────────────┘ │
│  │  ┌────────────────────┐  │                                   │
│  │  │ Hero Video         │  │  ┌──────────────────────────────┐ │
│  │  │ (Autoplay 3s)      │  │  │ FeaturedImages loaded in     │ │
│  │  │                    │  │  │ background → cached          │ │
│  │  │ URI: mux stream    │  │  │ Result: Smooth carousel      │ │
│  │  └────────────────────┘  │  └──────────────────────────────┘ │
│  └──────────────────────────┴──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         ↓                              ↓
```

## Data Flow: Image Loading

```
ImageDisplay Component
    ↓
┌───────────────────────────────────┐
│ Render Image                      │
│  onLoad={handleImageLoad}         │
│  onError={handleImageError}       │
└───────────────────────────────────┘
    │                           │
    ├─→ SUCCESS ────────→ ✅ onLoad()
    │                    - mediaCache.setCached()
    │                    - setImageLoadFailed(false)
    │
    └─→ ERROR (Timeout?) ──────→ Check retry count
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                Retry<3       Retry=3      Max retries hit
                (YES)          (MAX)        (FAILED)
                    │             │             │
                    ↓             ↓             ↓
            Wait & Retry    onError() called  ❌ Show placeholder
            (1s/2s/4s)      - setImageLoadFailed(true)
                    │        - MediaCache NOT blocked
                    ↓
            Re-render Image
            with new key
                    │
                    └─→ Back to SUCCESS/ERROR loop
```

## Data Flow: Video Loading (Independent)

```
HomePage Component
    ├─→ loadHeroVideo() 
    │   ├─ Check mediaCache.isCached(videoUri)
    │   ├─ Mark mediaCache.setLoading(videoUri)
    │   └─ setHeroVideoUri(videoUri) ← Triggers VideoDisplay
    │
    └─→ VideoDisplay Component
        ↓
    ┌─────────────────────────────────┐
    │ Load MUX Stream                 │
    │  onLoad={handleVideoLoad}       │
    │  onError={handleVideoError}     │
    └─────────────────────────────────┘
        │                       │
        ├─→ SUCCESS ────→ ✅ onLoad()
        │                - mediaCache.setCached()
        │                - Play starts after 3s thumbnail
        │
        └─→ ERROR ──────→ handleVideoError()
                          ├─ If retries < 2:
                          │  └─ VideoDisplay retries internally
                          │
                          └─ Show placeholder, no autoplay
```

## Timing Diagram

```
0ms   ├─ loadSeriesData() called
      │
100ms ├─ Series data fetched
      │  ├─ Hero image URI set
      │  ├─ Hero video URI set
      │  └─ Featured images queued
      │
200ms ├─ Hero image: Start loading
      │  │  Priority: IMMEDIATE
      │  │  URI: https://supabase.../poster.jpg
      │  │
      │  └─ Featured images: Queued
      │     Priority: LOW
      │     Status: Waiting to prefetch
      │
300ms ├─ Hero video: Start loading
      │  │  Priority: BACKGROUND
      │  │  URI: https://stream.mux.com/video.m3u8
      │  │  Size: ~5-50MB (HLS stream)
      │
2000ms│  ├─ Hero image: Loaded ✅ OR Timed out ⏱
      │  │
      │  └─ (Either way, video continues loading)
      │
3000ms├─ Hero video: Ready (typical)
      │  │  Status: Downloaded and buffered
      │  │
      │  └─ Thumbnail showing (3s delay starts)
      │
5000ms├─ Featured images: Start prefetch
      │  │  Status: Loading carousel images
      │  │
      │  └─ Not blocking anything
      │
6000ms├─ Hero thumbnail: Timer complete
      │  │  Action: Switch to video playback
      │  │
      │  └─ Video starts playing with audio ▶️
      │
8000ms├─ Featured images: Loaded ✅
      │  │  Cached in mediaCache
      │  │
      │  └─ Carousel scroll: Instant (no spinner)
      │
30000ms
      ├─ Hero video: Playing complete (30s cap)
      │
```

## Cache Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│ Session Start (App Opens)                               │
│ cache = {}                                              │
│ mediaCache.clearCache() was called                      │
└──────────────────────────┬────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│ During Session (User Browsing)                          │
│ cache = {                                               │
│   "https://.../poster1.jpg": {                         │
│     uri: "...",                                         │
│     type: "image",                                      │
│     loadedAt: 1698765432123                            │
│   },                                                    │
│   "https://stream.mux.com/video1.m3u8": {             │
│     uri: "...",                                         │
│     type: "video",                                      │
│     loadedAt: 1698765432500                            │
│   },                                                    │
│   ... (more cached items)                             │
│ }                                                       │
│                                                         │
│ Hero Rotation (10s):                                    │
│  - Next hero image: HIT ✅ (instant from cache)        │
│  - Next hero video: HIT ✅ (instant from cache)        │
│                                                         │
│ Featured Carousel Scroll:                               │
│  - Images: HIT ✅ (prefetched)                         │
│  - No loading spinners                                  │
└──────────────────────────┬────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Session End (App Closes)                                │
│ mediaCache.clearCache() called automatically            │
│ cache = {} ← CLEARED                                    │
│                                                         │
│ ✅ Credentials: Still in secure storage                │
│ ✅ Watchlist: Still in Supabase                         │
│ ✅ Settings: Still in device storage                    │
│ ❌ Media cache: Cleared (session-only)                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│ App Restart                                              │
│ cache = {} (fresh start)                                │
│ New loading cycle begins...                             │
└─────────────────────────────────────────────────────────┘
```

## Retry Logic Flowchart

```
                    Load Starts
                         ↓
        ┌────────────────────────────────┐
        │ IMAGE or VIDEO Component       │
        │ (Attempt 1)                    │
        └────────────────┬───────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
        SUCCESS        ERROR        TIMEOUT
          │              │              │
          ↓              ↓              ↓
        ✅ Done     Other Error   Was it timeout?
                       ↓              ├─ NO → onError()
                      ✅             └─ YES ↓
                      Done        ┌─────────────────┐
                                  │ retryCount < 3? │
                                  └─────┬───────────┘
                                        │
                          ┌─────────────┼─────────────┐
                          │             │             │
                        YES            NO            (Video)
                         │              │          Retries: < 2?
                         ↓              ↓               │
                   ┌──────────┐   ✅ Failed       ┌─────┴─────┐
                   │Wait:     │   Show placeholder│YES   │NO   │
              Attempt 1: 1s  ├────→    ❌         │      │     │
              Attempt 2: 2s  │                    ↓      ↓     ↓
              Attempt 3: 4s  │                   Retry  Failed Done
                   └────┬────┘                   ✅      ❌
                        │
                    Retry Load
                        │
                        └──→ Back to START
```

## Component Interaction

```
useMediaCache Hook
   ├─ cacheRef: { uri → { type, loadedAt } }
   ├─ loadingRef: Set<uri> (prevents duplicates)
   ├─ priorityQueueRef: Queue (images first, then videos)
   │
   ├─ Functions:
   │  ├─ isCached(uri): boolean
   │  ├─ getCachedMedia(uri): CachedMedia
   │  ├─ setCached(uri, type): void
   │  ├─ setLoading(uri): void
   │  ├─ isLoading(uri): boolean
   │  ├─ prefetchMedia(uri, type): boolean
   │  ├─ getNextPrefetchMedia(): PrefetchItem
   │  ├─ clearCache(): void
   │  └─ getCacheStats(): Stats
   │
   └─ Used in:
      ├─ HomePage: Track hero image/video, prefetch featured
      ├─ ImageDisplay: Check cache before loading
      └─ VideoDisplay: Check cache before loading


ImageDisplay Component
   ├─ Props:
   │  ├─ uri: string (image URL)
   │  ├─ preset: 'poster' | 'cover' | ...
   │  ├─ onLoad: () => void (new)
   │  └─ onError: (error) => void (new)
   │
   ├─ State:
   │  ├─ failed: boolean
   │  ├─ retryCount: number
   │  ├─ imageKey: number (force reload)
   │  └─ retryTimeoutRef: NodeJS.Timeout
   │
   ├─ Logic:
   │  └─ handleImageError: Retry 3x on timeout
   │
   └─ Used in:
      └─ HomePage: Thumbnail display


VideoDisplay Component
   ├─ Props:
   │  ├─ uri: string (HLS stream)
   │  ├─ onLoad: () => void (already had)
   │  └─ onError: (error) => void (already had)
   │
   ├─ State:
   │  ├─ retryCount: number
   │  ├─ cacheBust: string
   │  └─ videoKey: number
   │
   ├─ Logic:
   │  └─ handleError: Retry 2x with cache-bust
   │
   └─ Used in:
      └─ HomePage: Hero video playback


HomePage (index.tsx)
   ├─ Imports:
   │  ├─ useMediaCache (new)
   │  ├─ ImageDisplay (enhanced)
   │  └─ VideoDisplay (unchanged)
   │
   ├─ State:
   │  ├─ heroSeries: HeroVideoData
   │  ├─ heroVideoUri: string
   │  ├─ imageLoadFailed: boolean (new)
   │  ├─ videoLoadAttempts: number (new)
   │  ├─ showThumbnail: boolean
   │  └─ videoProgress: 0-1
   │
   ├─ Functions:
   │  ├─ loadSeriesData: Load from Supabase + prefetch
   │  ├─ loadHeroVideo: Get video URI, check cache
   │  ├─ handleImageLoad: Track cache
   │  ├─ handleImageError: Don't block video
   │  ├─ handleVideoLoad: Track cache
   │  └─ handleVideoError: Retry logic
   │
   └─ Render:
      ├─ Hero Image (ImageDisplay with callbacks)
      ├─ Hero Video (VideoDisplay with callbacks)
      └─ Featured Carousel (ImageDisplay × 8)
```

## State Machine: Video Autoplay

```
                    START
                     ↓
        ┌────────────────────────┐
        │ heroSeries loaded      │
        │ videoUri fetched       │
        └────────┬───────────────┘
                 ↓
        ┌────────────────────────┐
        │ showThumbnail = true   │
        │ Thumbnail displayed    │
        └────────┬───────────────┘
                 │
         3-second timer
                 │
                 ↓
        ┌────────────────────────┐
        │ showThumbnail = false  │
        │ Swap to video          │
        └────────┬───────────────┘
                 ↓
        ┌────────────────────────┐
        │ Video playing          │
        │ Audio ON               │
        │ Progress: 0-30s        │
        └────────┬───────────────┘
                 │
           30s reached OR
       Video finishes early
                 │
                 ↓
        ┌────────────────────────┐
        │ handleVideoEnd()        │
        │ heroIndex++             │
        │ showThumbnail = true    │
        └────────┬───────────────┘
                 │
                 └─→ LOOP to Hero Image Display
```

---

## Summary

- **Caching**: In-memory, session-based, cleared on restart
- **Retry**: Images (3x), Videos (2x), both with backoff
- **Sequencing**: Parallel loading, no dependencies
- **Performance**: Cache hits instant (<100ms)
- **UX**: Video always plays, image timeout doesn't block
- **Privacy**: No disk storage, only credentials/watchlist persisted

The system ensures robust, resilient media loading with excellent perceived performance! 🚀
