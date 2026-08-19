import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    const { data, error } = await supabase.storage
      .from("spring-secure-data")
      .download("heatmap_classified_features.json");

    if (error) {
      console.error("Supabase Storage error:", error);

      return res.status(500).json({
        error: "Failed to download heatmap data",
        details: error.message
      });
    }

    const text = await data.text();
    const json = JSON.parse(text);

    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json(json);

  } catch (error) {
    console.error("API error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
}