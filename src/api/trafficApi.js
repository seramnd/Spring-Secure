export async function getTrafficData() {
  const response = await fetch("/data/traffic.json");

  if (!response.ok) {
    throw new Error("Failed to load traffic data");
  }

  return await response.json();
}