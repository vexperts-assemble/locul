# Mux Video Streaming Setup Guide

This guide will help you set up Mux for production-grade video streaming in your Expo app.

## 🎯 What's Already Implemented

✅ **Client-side components:**
- Video upload component with progress tracking
- Video player component using HLS streaming
- Video list component to display uploaded videos
- React hooks for video management
- Tab navigation with videos screen

✅ **Database schema:**
- Videos table with Mux integration fields
- Row Level Security policies
- Proper indexing for performance

## 🔧 What You Need to Set Up

### 1. **Supabase Database Setup**

Run the SQL migration in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-migration.sql`
4. Click **Run** to create the videos table

### 2. **Mux Account Setup**

1. **Create Mux Account:**
   - Go to [mux.com](https://mux.com)
   - Sign up for a free account
   - Verify your email

2. **Get API Credentials:**
   - Go to **Settings** → **API Access**
   - Copy your **Token ID** and **Token Secret**
   - Copy your **Webhook Signing Secret**

3. **Set up Webhook:**
   - Go to **Settings** → **Webhooks**
   - Add webhook URL: `https://your-domain.com/api/mux/webhook`
   - Select events: `video.asset.ready` and `video.asset.errored`

### 3. **Deploy API Routes**

You need to deploy the API routes to handle Mux integration:

**Option A: Vercel (Recommended)**
1. Create a new Vercel project
2. Copy the `api/` folder to your Vercel project
3. Set environment variables in Vercel:
   ```
   MUX_TOKEN_ID=your_token_id
   MUX_TOKEN_SECRET=your_token_secret
   MUX_WEBHOOK_SECRET=your_webhook_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

**Option B: Other Platforms**
- Deploy to Railway, Render, or any Node.js hosting platform
- Make sure to set the same environment variables

### 4. **Update App Configuration**

1. **Add Mux credentials to your app:**
   ```javascript
   // In supabase.config.js, add:
   export const muxConfig = {
     tokenId: 'your_mux_token_id',
     tokenSecret: 'your_mux_token_secret',
     // ... rest of config
   };
   ```

2. **Set API endpoint:**
   ```javascript
   // In your app, set the API base URL
   const API_BASE_URL = 'https://your-deployed-api.com';
   ```

### 5. **Environment Variables**

Add these to your app's environment:

```bash
# Mux Configuration
EXPO_PUBLIC_MUX_TOKEN_ID=your_token_id
EXPO_PUBLIC_MUX_TOKEN_SECRET=your_token_secret
EXPO_PUBLIC_MUX_WEBHOOK_SECRET=your_webhook_secret

# API Configuration
EXPO_PUBLIC_API_URL=https://your-deployed-api.com

# Supabase (already configured)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key
```

## 🚀 How It Works

### **Upload Flow:**
1. User selects video file
2. App creates video record in Supabase
3. App calls your API to get Mux upload URL
4. App uploads directly to Mux
5. Mux processes the video
6. Mux sends webhook to your API
7. API updates video record with playback details

### **Streaming Flow:**
1. App fetches video list from Supabase
2. For each video, constructs HLS URL: `https://stream.mux.com/{playback_id}.m3u8`
3. Video player streams using native HLS support

## 📱 Testing

1. **Start your Expo app:**
   ```bash
   npm start
   ```

2. **Navigate to Videos tab**
3. **Upload a test video**
4. **Wait for processing** (usually 1-2 minutes)
5. **Video should appear in the list and be playable**

## 🔒 Security Notes

- **Webhook verification:** Always verify webhook signatures
- **CORS origins:** Restrict to your app domains in production
- **API authentication:** Add proper auth to your API routes
- **File validation:** Add file type and size validation

## 🎨 Customization

- **Video player:** Modify `components/VideoPlayer.tsx` for custom controls
- **Upload UI:** Customize `components/VideoUpload.tsx`
- **Video list:** Update `components/VideoList.tsx` for different layouts
- **Styling:** All components use StyleSheet for easy customization

## 🆘 Troubleshooting

**Common Issues:**
1. **"Invalid supabaseUrl"** - Check your Supabase credentials
2. **Upload fails** - Verify API endpoint is deployed and accessible
3. **Videos not processing** - Check webhook URL and Mux credentials
4. **Playback issues** - Ensure HLS URL is correct and video is ready

**Debug Steps:**
1. Check Expo logs for client-side errors
2. Check API logs for server-side errors
3. Verify Mux dashboard for upload status
4. Check Supabase logs for database issues

## 📚 Additional Resources

- [Mux Documentation](https://docs.mux.com/)
- [Expo AV Documentation](https://docs.expo.dev/versions/latest/sdk/av/)
- [Supabase Documentation](https://supabase.com/docs)
- [HLS Streaming Guide](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)

---

**Need Help?** Check the Mux community forum or create an issue in your project repository.
