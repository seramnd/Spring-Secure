export default async function handler(req, res) {
  try {
    const response = await fetch(process.env.SUPABASE_URL);

    const text = await response.text();

    return res.status(200).json({
      success: true,
      status: response.status,
      response: text.slice(0, 200)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      name: error.name,
      cause: error.cause?.message || null
    });
  }
}