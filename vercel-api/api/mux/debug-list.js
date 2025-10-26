const { createClient } = require("@supabase/supabase-js");

function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const { data, error } = await supabase
      .from("videos")
      .select(
        "id, status, mux_upload_id, mux_asset_id, mux_playback_id, created_at, user_id, title",
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ videos: data });
  } catch (err) {
    console.error("debug-list error:", err);
    return res.status(500).json({ error: "Failed to list videos" });
  }
};
