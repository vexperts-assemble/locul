# Locul Mux API

This is the API backend for Mux video streaming integration in your Locul app.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Navigate to the API directory:**
   ```bash
   cd vercel-api
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

5. **Set environment variables:**
   ```bash
   vercel env add MUX_TOKEN_ID
   vercel env add MUX_TOKEN_SECRET
   vercel env add MUX_WEBHOOK_SECRET
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import from GitHub** (push this folder to GitHub first)
4. **Set environment variables** in the Vercel dashboard
5. **Deploy**

## 🔧 Environment Variables

You need to set these environment variables in Vercel:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `MUX_TOKEN_ID` | Mux API Token ID | Mux Dashboard → Settings → API Access |
| `MUX_TOKEN_SECRET` | Mux API Token Secret | Mux Dashboard → Settings → API Access |
| `MUX_WEBHOOK_SECRET` | Mux Webhook Signing Secret | Mux Dashboard → Settings → Webhooks |
| `SUPABASE_URL` | Your Supabase URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Supabase Dashboard → Settings → API |

## 📡 API Endpoints

### POST `/api/mux/create-upload-url`
Creates a direct upload URL for Mux.

**Headers:**
```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "videoId": "uuid-of-video-record"
}
```

**Response:**
```json
{
  "url": "https://storage.googleapis.com/...",
  "id": "mux-upload-id"
}
```

### POST `/api/mux/webhook`
Handles Mux webhook events (called by Mux automatically).

**Headers:**
```
mux-signature: <webhook_signature>
Content-Type: application/json
```

## 🔒 Security Features

- ✅ JWT token verification for upload endpoint
- ✅ User ownership verification for videos
- ✅ Webhook signature verification
- ✅ CORS protection (configurable)

## 🧪 Testing

1. **Test upload endpoint:**
   ```bash
   curl -X POST https://your-api.vercel.app/api/mux/create-upload-url \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"videoId": "your-video-id"}'
   ```

2. **Test webhook endpoint:**
   ```bash
   curl -X POST https://your-api.vercel.app/api/mux/webhook \
     -H "Content-Type: application/json" \
     -d '{"type": "test"}'
   ```

## 📝 Next Steps

1. **Deploy this API** to Vercel
2. **Get your API URL** (e.g., `https://your-api.vercel.app`)
3. **Update your Expo app** with the API URL
4. **Set up Mux webhook** to point to your API
5. **Test the complete flow**

## 🆘 Troubleshooting

**Common Issues:**
- **401 Unauthorized:** Check JWT token and Supabase auth
- **404 Video not found:** Verify video belongs to user
- **500 Internal error:** Check environment variables and logs
- **Webhook not working:** Verify webhook URL and signature

**Debug:**
- Check Vercel function logs
- Verify environment variables are set
- Test with curl commands above





