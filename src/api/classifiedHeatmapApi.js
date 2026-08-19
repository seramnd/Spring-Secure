export async function getClassifiedHeatmapData() {
  const response = await fetch("/api/data");

  if (!response.ok) {
    throw new Error("Failed to load classified heatmap data.");
  }

  return await response.json();
}