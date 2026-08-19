export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      return res.status(500).json({
        error: "Supabase environment variables are not configured"
      });
    }

    const fileUrl =
      `${supabaseUrl}/storage/v1/object/spring-secure-data/heatmap_classified_features.json`;

    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${supabaseSecretKey}`,
        apikey: supabaseSecretKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: "Failed to load data from Supabase",
        details: errorText
      });
    }

    const data = await response.json();

    // Prevent Vercel/browser caching from serving an old dataset.
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json(data);

 } catch (error) {
    console.error("Supabase data error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
}
}