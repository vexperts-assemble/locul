#!/bin/bash

# Deploy Mux API to Vercel
# Make sure you have Vercel CLI installed: npm install -g vercel

echo "🚀 Deploying Mux API to Vercel..."

# Navigate to the API directory
cd vercel-api

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - MUX_TOKEN_ID"
echo "   - MUX_TOKEN_SECRET" 
echo "   - MUX_WEBHOOK_SECRET"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "2. Update your Expo app with the API URL"
echo "3. Set up Mux webhook to point to your API"
echo ""
echo "📚 See vercel-api/README.md for detailed instructions"





