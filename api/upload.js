import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Vercel may provide req.body as either a string or an object.
    const body =
      typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);

    // Validate the JSON before replacing the existing dataset.
    JSON.parse(body);

    const { data, error } = await supabase.storage
      .from("spring-secure-data")
      .upload(
        "heatmap_classified_features.json",
        Buffer.from(body, "utf-8"),
        {
          contentType: "application/json",
          upsert: true,
        }
      );

    if (error) {
      console.error("Supabase upload error:", error);

      return res.status(500).json({
        error: "Failed to upload data",
        details: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Heatmap data updated successfully",
      path: data.path,
    });

  } catch (error) {
    console.error("Upload API error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}