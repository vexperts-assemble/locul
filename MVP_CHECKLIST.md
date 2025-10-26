# Locul MVP Checklist

## Global UX Conventions

- [x] **Vertical feed (Reels plugin)**: 1 item per screen, autoplay on focus, pause off-screen
- [x] **Controls overlay**: minimal—Play/Pause, Mute/Unmute, a tiny progress bar, and "⋯" for actions
- [x] **Safe areas honored**: white or dark UI depending on brand
- [ ] **Error/empty states**: "No connection", "No episodes yet", "Processing…"
- [x] **Navigation**: bottom tabs (Home, Search, Library, Profile)

## Pages (UI + Core Functionality)

### 1) Onboarding / Auth

#### UI
- [x] **Welcome screen** with brand splash + "Sign in / Create account"
- [x] **Email field + password** (or OTP); "Continue as guest" (optional)
- [ ] **Minimal legal text links**

#### Core functionality
- [x] **Supabase Auth sign-in/up**
- [x] **Persist session**; silent re-auth on app open
- [ ] **Guest mode**: read-only access (no upload, no watchlist persistence)

### 2) Home (For You) — Vertical Feed

#### UI
- [x] **Fullscreen episode tiles** (Reels scroller)
- [ ] **Overlays**:
  - [ ] Top-left: Series name (tappable → Series Detail)
  - [ ] Bottom: Episode title + short synopsis (1–2 lines)
  - [ ] Right vertical controls: Play/Pause, Mute/Unmute, "⋯"
  - [ ] Tiny progress bar at bottom edge

#### Core functionality
- [x] **Query**: paginated list of episodes where status='ready', ordered by recency
- [x] **Autoplay/pause** based on visibility
- [ ] **Prefetch next** manifest/thumbnail when current reaches 70–80%
- [ ] **Resume**: if user previously watched, start at watch_progress.position_seconds
- [ ] **Actions**:
  - [ ] Tap series name → Series Detail
  - [ ] "⋯" → Save to Watchlist / Report / Copy link
- [ ] **Edge cases**: if Mux not ready → show "Processing…" tile; skip on scroll

### 3) Series Detail

#### UI
- [ ] **Poster/cover**, series title, genre tags, synopsis (expand/collapse)
- [ ] **"Add to Watchlist"** button (toggle)
- [ ] **Episode list** (vertical): episode number, title, duration, status; "Continue" chip if partially watched
- [ ] **Optional hero**: autoplay muted trailer if available

#### Core functionality
- [ ] **Query**: series by id + episodes ordered by episode_number
- [ ] **Watchlist toggle**: insert/delete watchlists row
- [ ] **Tap episode** → open Player (or scroll to episode within Home feed)
- [ ] **If episode processing**, disable and show status

### 4) Player (Fullscreen)

#### UI
- [x] **Fullscreen video**
- [ ] **Overlays**: Back, Title, Mute, Progress bar, "Next Episode" button on end
- [ ] **Minimal buffering indicator**

#### Core functionality
- [x] **Play HLS** via expo-av (https://stream.mux.com/{playback_id}.m3u8)
- [ ] **Write watch progress** every N seconds or on pause/blur
- [ ] **On end**: set progress to duration and surface Next Episode

### 5) Search

#### UI
- [ ] **Search bar** at top; tabs for Series and Episodes
- [ ] **Result cards**:
  - [ ] Series: poster + title + tags + episode count
  - [ ] Episode: title + series name + duration

#### Core functionality
- [ ] **Simple full-text search** on series.title, series.tags, episodes.title
- [ ] **Tap result**:
  - [ ] Series → Series Detail
  - [ ] Episode → Player (or jump to it in feed)

### 6) Library (Watchlist & Continue Watching)

#### UI
- [ ] **Two sections**:
  - [ ] Continue Watching (horizontal rail): recent episodes with progress ring
  - [ ] Watchlist (grid/list): series posters; tap → Series Detail
- [ ] **Empty states** with friendly prompts

#### Core functionality
- [ ] **Continue Watching**:
  - [ ] Query latest watch_progress joined with episodes & series
  - [ ] Tap → resume at position_seconds
- [ ] **Watchlist**:
  - [ ] Query watchlists by user; display series posters
  - [ ] Remove from watchlist via long-press or overflow menu

### 7) Upload (Creators only)

#### UI
- [x] **Simple form**: pick file, title, optional synopsis
- [x] **Progress indicator**; "Processing" info after submit
- [ ] **Series dropdown** (or "Create series")

#### Core functionality
- [x] **Get Mux Direct Upload URL** from Vercel API
- [x] **Upload file** → create episodes row with status='processing'
- [x] **Webhook updates** to ready + saves mux_playback_id, duration, thumbnail_url
- [ ] **If series new**: create series row

### 8) Profile

#### UI
- [ ] **Avatar, username, email**
- [ ] **Your uploads list** (if creator); or "Your activity" (watchlist/continue)
- [ ] **"Edit Profile"** (avatar upload, username)

#### Core functionality
- [ ] **Query**:
  - [ ] profiles by current user
  - [ ] If creator flag, list episodes where author_id = user_id
- [ ] **Edit profile**: update profiles.username, avatar_url

### 9) Settings

#### UI
- [ ] **Account** (email), Sign out
- [ ] **Legal**: Terms, Privacy
- [ ] **App info**: version/build, diagnostics
- [ ] **(Optional) Download over Wi-Fi only** toggle

#### Core functionality
- [x] **Supabase sign-out**, clear local state
- [ ] **Link to static legal pages**

## Data Model (tables/fields)

### Current Implementation
- [x] **videos table**: id, title, description, status, mux_asset_id, mux_playback_id, mux_upload_id, file_size, duration, thumbnail_url, created_at, updated_at, user_id

### Missing for MVP
- [ ] **profiles table**: id (auth.users), username, avatar_url, created_at
- [ ] **series table**: id, title, synopsis, tags[], poster_url, created_by, created_at
- [ ] **episodes table**: id, series_id, author_id, title, synopsis, episode_number, duration_seconds, status, mux_asset_id, mux_playback_id, thumbnail_url, created_at
- [ ] **watch_progress table**: user_id, episode_id, position_seconds, updated_at
- [ ] **watchlists table**: user_id, series_id, created_at

### Indexes
- [ ] **episodes(created_at desc)**
- [ ] **episodes(series_id, episode_number)**
- [ ] **watch_progress(user_id, updated_at desc)**
- [ ] **watchlists(user_id, created_at desc)**

### RLS Policies
- [x] **videos**: public SELECT when status='ready'; creators can INSERT/UPDATE their own
- [ ] **series**: public SELECT; owner can UPDATE
- [ ] **watch_progress**: only owner can read/write their rows
- [ ] **watchlists**: only owner can read/write

## Core API Calls

### Current Implementation
- [x] **GET /mux/create-upload-url** → { url, id }
- [x] **POST /mux/webhook** → updates episode to ready, sets mux_*, duration, thumbnail

### Missing for MVP
- [ ] **GET /feed?page=…** (or direct Supabase query) → paginated episodes
- [ ] **Built-in Supabase queries** for search, series detail, watchlist, progress

## Navigation Map

### Current Implementation
- [x] **Tabs**: Home | Upload | Reels
- [x] **Stacks**: Home → Videos (Upload) → Reels

### Missing for MVP
- [ ] **Tabs**: Home | Search | Library | Profile
- [ ] **Stacks**:
  - [ ] Home → Series Detail → Player
  - [ ] Search → Series Detail → Player
  - [ ] Library → Series Detail → Player
  - [ ] Profile → Edit Profile

## Done Criteria for MVP

- [x] **Smooth vertical feed**; autoplay on focus, pause off-screen, mute toggle
- [x] **Episodes load fast**; "Processing" items not playable
- [ ] **Series pages** with ordered episodes and Add to Watchlist
- [ ] **Continue Watching** restores position to within 1s accuracy
- [ ] **Search finds series/episodes** by title/tag quickly (≤300ms from cache)
- [x] **Upload flow works end-to-end**
- [ ] **Clean settings & sign-out**; no crashes on airplane mode

## Current Status Summary

### ✅ Completed (Core Infrastructure)
- Authentication system with Supabase
- Video upload with Mux Direct Uploads
- Vertical feed (Reels) with autoplay
- Basic video playback with HLS
- Database schema for videos
- API endpoints for upload and webhooks

### 🚧 In Progress
- Error handling and empty states
- UI polish and overlays

### ❌ Not Started
- Series/episodes data model
- Search functionality
- Library (watchlist/continue watching)
- Profile management
- Settings page
- Watch progress tracking

## Next Priority Tasks

1. **Data Model Migration**: Convert videos to episodes, add series table
2. **Series Detail Page**: Create series view with episode list
3. **Search Implementation**: Add search functionality
4. **Library Page**: Implement watchlist and continue watching
5. **Profile Management**: Add user profiles and settings
6. **UI Polish**: Add overlays, error states, and better UX
7. **Watch Progress**: Implement resume functionality
8. **Testing**: Ensure no crashes and smooth performance
