export async function getClassifiedHeatmapData() {
  const response = await fetch("/data/heatmap_classified_features.json");

  if (!response.ok) {
    throw new Error("Failed to load classified heatmap data.");
  }

  return await response.json();
}