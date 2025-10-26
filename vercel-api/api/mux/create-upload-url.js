const Mux = require("@mux/mux-node");
const { createClient } = require("@supabase/supabase-js");

function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const allowNoAuth =
      (process.env.ALLOW_DEV_NOAUTH || "").trim().toLowerCase() === "true";
    const authHeader = req.headers.authorization || "";
    console.log("[create-upload-url] hit", {
      hasAuth: !!authHeader,
      allowNoAuth,
    });
    let userId = null;
    let token = null;
    if (!allowNoAuth) {
      if (!authHeader.startsWith("Bearer "))
        return res.status(401).json({ error: "Unauthorized" });
      token = authHeader.replace("Bearer ", "").trim();
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRole)
      return res.status(500).json({ error: "Missing Supabase env vars" });
    const supabase = createClient(supabaseUrl, serviceRole);

    if (!allowNoAuth) {
      const { data: userData, error: authError } =
        await supabase.auth.getUser(token);
      console.log("[create-upload-url] auth result", {
        hasUser: !!userData?.user,
        hasAuthError: !!authError,
      });
      if (authError || !userData?.user)
        return res.status(401).json({ error: "Invalid token" });
      userId = userData.user.id;
    }

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { episodeId, videoId } = body;
    const targetId = episodeId || videoId; // backward compatible
    if (!targetId)
      return res.status(400).json({ error: "episodeId is required" });
    console.log("[create-upload-url] target id", { episodeId, videoId });

    let query = supabase
      .from("episodes")
      .select("id, author_id")
      .eq("id", targetId);
    if (!allowNoAuth) {
      query = query.eq("author_id", userId);
    }
    const { data: videoRow, error: videoError } = await query.single();
    console.log("[create-upload-url] videoRow", {
      found: !!videoRow,
      hasError: !!videoError,
    });
    if (videoError || !videoRow)
      return res.status(404).json({ error: "Video not found" });

    const muxTokenId = process.env.MUX_TOKEN_ID;
    const muxTokenSecret = process.env.MUX_TOKEN_SECRET;
    if (!muxTokenId || !muxTokenSecret)
      return res.status(500).json({ error: "Missing Mux env vars" });
    const mux = new Mux({ tokenId: muxTokenId, tokenSecret: muxTokenSecret });

    const upload = await mux.video.uploads.create({
      new_asset_settings: { playback_policy: ["public"] },
      cors_origin: "*",
    });
    console.log("[create-upload-url] mux upload created", {
      uploadId: upload?.id,
    });

    let update = supabase
      .from("episodes")
      .update({ status: "processing", mux_upload_id: upload.id })
      .eq("id", targetId);
    if (!allowNoAuth) {
      update = update.eq("author_id", userId);
    }
    const { error: updateError } = await update;
    if (updateError) {
      console.error("[create-upload-url] update error", updateError);
      return res.status(500).json({
        error: "Failed to update video row",
        details: updateError.message,
        uploadId: upload.id,
        url: upload.url,
      });
    }
    console.log("[create-upload-url] updated video to processing");

    return res.status(200).json({ url: upload.url, id: upload.id });
  } catch (err) {
    console.error("create-upload-url error:", err);
    return res
      .status(500)
      .json({ error: "Failed to create upload URL", message: err?.message });
  }
};
