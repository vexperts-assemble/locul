// This is a Next.js API route for handling Mux webhooks
// You'll need to deploy this to Vercel or another platform

import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("mux-signature") || "";

    // Verify webhook signature (recommended for security)
    const isValid = Mux.Webhooks.verifyHeader(
      body,
      sig,
      process.env.MUX_WEBHOOK_SECRET!,
    );

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Mux webhook event:", event.type);

    if (event.type === "video.asset.ready") {
      const asset = event.data;
      const playbackId = asset.playback_ids?.[0]?.id;
      const duration = asset.duration;
      const thumbnailUrl = asset.thumbnail_url;

      // Update the video record with Mux asset details
      const { error } = await supabase
        .from("videos")
        .update({
          status: "ready",
          mux_asset_id: asset.id,
          mux_playback_id: playbackId,
          duration: Math.round(duration),
          thumbnail_url: thumbnailUrl,
        })
        .eq("mux_upload_id", asset.upload_id);

      if (error) {
        console.error("Error updating video record:", error);
        return NextResponse.json(
          { error: "Failed to update video" },
          { status: 500 },
        );
      }

      console.log(`Video asset ready: ${asset.id}, playback ID: ${playbackId}`);
    }

    if (event.type === "video.asset.errored") {
      const asset = event.data;

      // Update video status to failed
      await supabase
        .from("videos")
        .update({ status: "failed" })
        .eq("mux_upload_id", asset.upload_id);

      console.log(`Video asset errored: ${asset.id}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
