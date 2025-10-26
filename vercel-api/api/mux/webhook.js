const Mux = require("@mux/mux-node");
const { createClient } = require("@supabase/supabase-js");

function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, mux-signature");
}

module.exports = async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    const sig = req.headers["mux-signature"] || "";

    try {
      if (Mux.Webhooks && Mux.Webhooks.verifyHeader) {
        Mux.Webhooks.verifyHeader(rawBody, sig, process.env.MUX_WEBHOOK_SECRET);
      }
    } catch (e) {
      console.warn("[webhook] signature verify failed, continuing for debug");
    }

    const event = JSON.parse(rawBody || "{}");
    console.log("[webhook] event type", event?.type);

    if (event && event.type === "video.asset.ready") {
      const asset = event.data;
      const playbackId = asset?.playback_ids?.[0]?.id;
      const duration = Math.round(asset?.duration || 0);
      console.log("[webhook] asset.ready", {
        assetId: asset?.id,
        uploadId: asset?.upload_id,
        playbackId,
      });

      await supabase
        .from("episodes")
        .update({
          status: "ready",
          mux_asset_id: asset.id,
          mux_playback_id: playbackId,
          duration_seconds: duration,
        })
        .eq("mux_upload_id", asset?.upload_id);
    }

    if (event && event.type === "video.asset.errored") {
      const asset = event.data;
      console.log("[webhook] asset.errored", {
        assetId: asset?.id,
        uploadId: asset?.upload_id,
      });
      await supabase
        .from("episodes")
        .update({ status: "failed" })
        .eq("mux_upload_id", asset?.upload_id);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("webhook error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};
