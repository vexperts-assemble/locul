// Mux Configuration
export const muxConfig = {
  // These will be set via environment variables
  tokenId: process.env.EXPO_PUBLIC_MUX_TOKEN_ID || "",
  tokenSecret: process.env.EXPO_PUBLIC_MUX_TOKEN_SECRET || "",
  webhookSecret: process.env.EXPO_PUBLIC_MUX_WEBHOOK_SECRET || "",
  // Mux API base URL
  apiBaseUrl: "https://api.mux.com",
  // Direct upload endpoint (you'll need to create this API route)
  uploadEndpoint: "/api/mux/create-upload-url",
  // Webhook endpoint (you'll need to create this API route)
  webhookEndpoint: "/api/mux/webhook",
};








