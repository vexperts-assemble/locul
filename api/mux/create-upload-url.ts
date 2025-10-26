// This is a Next.js API route that you'll need to deploy to Vercel or another platform
// For now, this is a template showing what you need to implement

import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import { createClient } from "@supabase/supabase-js";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 },
      );
    }

    // 1) Create a Direct Upload in Mux
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        mp4_support: "standard",
        normalize_audio: true,
      },
      cors_origin: "*", // tighten this in production
    });

    // 2) Update the video record with upload ID
    await supabase
      .from("videos")
      .update({
        status: "processing",
        mux_upload_id: upload.id,
      })
      .eq("id", videoId);

    return NextResponse.json({
      url: upload.url,
      id: upload.id,
    });
  } catch (error) {
    console.error("Error creating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 },
    );
  }
}
