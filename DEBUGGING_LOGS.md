# Debugging Guide: HomePage Loading Logs

## Overview

Comprehensive logging has been added to `app/(protected)/(tabs)/index.tsx` to track every step of the data loading and rendering process.

## Expected Log Sequence (Normal Operation)

### Phase 1: Initial Load (0ms - 1s)

```
[HomePage] useEffect: Initial load - calling loadSeriesData()
[HomePage] Starting loadSeriesData()
[HomePage] Calling getSeries(10, 0)...
```

**What's happening**: Component mounted, fetching series data from Supabase

**Expected time**: 100-300ms for database query

### Phase 2: Series Data Received (1s - 2s)

```
[HomePage] getSeries returned 10 series
[HomePage] First series: {
  id: "abc-123",
  title: "Series Name",
  has_poster: true
}
[HomePage] Filtered to 8 series with posters
[HomePage] Setting heroSeries: {
  id: "abc-123",
  title: "Series Name",
  heroIndex: 0
}
[HomePage] Featured series set: 8 items
```

**What's happening**: 
- Series data fetched and displayed
- Filter applied (only series with poster images)
- Hero and featured series set

**Expected time**: Immediate once data arrives from database

**Troubleshooting**:
- If you see `Filtered to 0 series with posters` → **No series have poster_url**
- Check Supabase: Do all series have `poster_url` populated?

### Phase 3: Video Loading (2s - 3s)

```
[HomePage] Calling loadHeroVideo() for series: Series Name
[HomePage] Prefetching featured images...
[HomePage] Dismissing loading state
[HomePage] Calling getEpisodes( abc-123 , 1, 0)...
[HomePage] getEpisodes returned 1 episode(s)
[HomePage] First episode found: {
  id: "ep-123",
  title: "Episode Title",
  has_playback_id: true
}
[HomePage] Video URI: https://stream.mux.com/xxxxxxxxx.m3u8
[HomePage] Video not in cache, marking as loading
[HomePage] Starting video load: https://stream.mux.com/xxxxxxxxx.m3u8
```

**What's happening**:
- Episodes fetched for first series
- First episode extracted
- Mux playback URL constructed
- Video marked as loading in cache system

**Expected time**: 100-200ms for episode query

**Troubleshooting**:
- If you see `No episodes found for series` → Series has no episodes
- If you see `No mux_playback_id in first episode` → Episode has no video link

### Phase 4: UI Ready (3s - 4s)

```
[HomePage] useEffect: heroSeries changed, new series: Series Name
[HomePage] useEffect: Thumbnail timer - heroSeries: Series Name, showThumbnail: true, heroVideoUri: SET
[HomePage] useEffect: Starting 3-second thumbnail timer
[HomePage] render - isLoading: false, heroSeries: Series Name, showThumbnail: true, heroVideoUri: SET
```

**What's happening**:
- Loading state dismissed
- UI renders with hero thumbnail visible
- 3-second timer started for thumbnail display

**Expected time**: Loading spinner should disappear at this point

**Visual**: See loading spinner gone, hero image appearing

### Phase 5: Video Playing (6s - 7s)

```
[HomePage] useEffect: Thumbnail timer complete, hiding thumbnail
[HomePage] render - isLoading: false, heroSeries: Series Name, showThumbnail: false, heroVideoUri: SET
[VideoDisplay] onLoad status loaded true
[VideoDisplay] status {"isPlaying": true, "pos": 0}
```

**What's happening**:
- Thumbnail timer complete (3 seconds elapsed)
- Thumbnail hidden, video shows
- Video starts playing

**Visual**: See thumbnail disappear, video start playing

---

## Troubleshooting Flowchart

### Issue: Stuck on "Loading content..." forever

**Check logs for**:
```
[HomePage] Starting loadSeriesData()
```

**If missing**: Component never mounted
- Check if page is being rendered
- Check for navigation/routing issues

**If present but no "getSeries returned"**: Database query hanging
- Check Supabase connection
- Check network tab for timeout
- Look for Supabase error logs

### Issue: "Filtered to 0 series with posters"

**Problem**: No series have images
- Check Supabase `series` table
- Verify `poster_url` column is populated
- Look for NULL values

**Fix**: Upload poster images for series

### Issue: "No episodes found for series"

**Problem**: Selected series has no episodes
- Check `episodes` table in Supabase
- Verify episodes are linked to series (series_id matches)
- Check episode status is "ready"

**Fix**: Upload episodes for series

### Issue: "No mux_playback_id in first episode"

**Problem**: Episode has no video link
- Check `mux_playback_id` column in `episodes` table
- Verify video processing completed
- Check Mux dashboard for asset status

**Fix**: Ensure video upload is complete

### Issue: "Video not in cache" but then nothing loads

**Problem**: Video URL is set but fails to load
- Check network requests for Mux URL
- Verify Mux playback ID is valid
- Check for CORS issues
- Check network throttling (DevTools)

**Debug**: Open DevTools → Network → Search for "stream.mux.com" → Check response status

---

## Log Levels

### ℹ️ Info (console.log)
```
[HomePage] Starting loadSeriesData()
[HomePage] useEffect: Initial load
```
Normal operations, tracking flow

### ⚠️ Warnings (console.warn)
```
[HomePage] No series with posters found!
[HomePage] No episodes found for series
```
Unexpected but not critical, investigate

### ❌ Errors (console.error)
```
[HomePage] Error in loadSeriesData: Error: Network timeout
[HomePage] Error in loadHeroVideo: Error: Supabase error
```
Critical issues, block loading

---

## Performance Metrics in Logs

Watch timing between log entries:

```
[HomePage] Calling getSeries(10, 0)...
... 100-300ms later ...
[HomePage] getSeries returned 10 series
```

**Expected times**:
- getSeries: 100-300ms (slow network: 500-1000ms)
- getEpisodes: 50-150ms (slow network: 200-500ms)
- Total until "Dismissing loading state": 200-500ms

**If slower**: Check network throttling or database query performance

---

## Real-World Examples

### Example 1: Everything Working ✅

```
[HomePage] useEffect: Initial load - calling loadSeriesData()
[HomePage] Starting loadSeriesData()
[HomePage] Calling getSeries(10, 0)...
[HomePage] getSeries returned 10 series
[HomePage] First series: { id: "123", title: "My Series", has_poster: true }
[HomePage] Filtered to 8 series with posters
[HomePage] Setting heroSeries: { id: "123", title: "My Series", heroIndex: 0 }
[HomePage] Featured series set: 8 items
[HomePage] Calling loadHeroVideo() for series: 123
[HomePage] Prefetching featured images...
[HomePage] Dismissing loading state
[HomePage] Calling getEpisodes( 123 , 1, 0)...
[HomePage] getEpisodes returned 1 episode(s)
[HomePage] First episode found: { id: "ep1", title: "Episode 1", has_playback_id: true }
[HomePage] Video URI: https://stream.mux.com/xxx.m3u8
[HomePage] Video not in cache, marking as loading
[HomePage] Starting video load: https://stream.mux.com/xxx.m3u8
[HomePage] useEffect: heroSeries changed, new series: My Series
[HomePage] useEffect: Thumbnail timer - heroSeries: My Series, showThumbnail: true, heroVideoUri: SET
[HomePage] useEffect: Starting 3-second thumbnail timer
[HomePage] render - isLoading: false, heroSeries: My Series, showThumbnail: true, heroVideoUri: SET
[VideoDisplay] onLoad status loaded true
[VideoDisplay] status {"isPlaying": true, "pos": 0}
[HomePage] useEffect: Thumbnail timer complete, hiding thumbnail
```

**Result**: Page loads, content shows, video plays ✅

### Example 2: No Posters ❌

```
[HomePage] Starting loadSeriesData()
[HomePage] Calling getSeries(10, 0)...
[HomePage] getSeries returned 10 series
[HomePage] First series: { id: "123", title: "My Series", has_poster: false }
[HomePage] Filtered to 0 series with posters
[HomePage] No series with posters found!
```

**Result**: Stuck on loading ❌  
**Fix**: Add poster URLs to series in Supabase

### Example 3: Series but No Episodes ❌

```
[HomePage] Setting heroSeries: { id: "123", title: "My Series", heroIndex: 0 }
[HomePage] Calling loadHeroVideo() for series: 123
[HomePage] Calling getEpisodes( 123 , 1, 0)...
[HomePage] getEpisodes returned 0 episode(s)
[HomePage] No episodes found for series: 123
```

**Result**: No video plays ❌  
**Fix**: Upload episodes for series

---

## Enabling Logs

Logs are **automatically enabled** in development.

To filter logs in your console:

```
// Show only HomePage logs
localStorage.setItem('debug', '*HomePage*')

// Show all logs
localStorage.clear()
```

Or filter in DevTools Console:
- Click filter icon (funnel)
- Type: `[HomePage]`

---

## Disabling Logs (For Production)

When deploying, remove/comment out console.logs:

```typescript
// Instead of:
console.log("[HomePage] Starting loadSeriesData()");

// Use:
if (__DEV__) {
  console.log("[HomePage] Starting loadSeriesData()");
}
```

---

## Summary

1. **Reload page** and watch console
2. **Note any ERROR or WARN logs**
3. **Match against troubleshooting section**
4. **Report the specific log messages** for debugging

Good debugging! 🔍
