export function buildClassifiedHeatmap(rows = []) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const normalizedRows = safeRows.map((row) => ({
    ...row,
    address: row.address ?? "Unknown",
    intensity: Number(row.intensity) || 0,
    total_txns: Number(row.total_txns) || 0,
  }));

  const timeLabels = [
    ...new Set(
      normalizedRows.map(
        (row) =>
          `${row.time_window_start}-${row.time_window_end} ns`
      )
    ),
  ];

  const addressLabels = [
    ...new Set(
      normalizedRows
        .map((row) => row.address)
        .filter((address) => address && address !== "Unknown")
    ),
  ].sort(
    (a, b) =>
      Number.parseInt(a, 16) - Number.parseInt(b, 16)
  );

  const rowLookup = new Map(
    normalizedRows.map((row) => {
      const timeLabel =
        `${row.time_window_start}-${row.time_window_end} ns`;

      const key = `${timeLabel}|${row.address}`;

      return [key, row];
    })
  );

  const heatmapData = [];

  timeLabels.forEach((timeLabel, timeIndex) => {
    addressLabels.forEach((address, addressIndex) => {
      const key = `${timeLabel}|${address}`;

      const existingRow = rowLookup.get(key);

      const row =
        existingRow ??
        {
          time_window_start: null,
          time_window_end: null,
          address,
          intensity: 0,
          total_txns: 0,
          classification: "Empty",
          severity: "low",
          matched_rule: "none",
          isEmpty: true,
        };

      heatmapData.push({
        value: [
          timeIndex,
          addressIndex,
          Number(row.intensity) || 0,
        ],
        row,
      });
    });
  });
  console.log("Time windows:", timeLabels.length);
  console.log("Addresses:", addressLabels.length);
  console.log("Heatmap cells:", heatmapData.length);

  console.log("First time labels:", timeLabels.slice(0, 5));
  console.log("First address labels:", addressLabels.slice(0, 5));
  
  return {
    timeLabels,
    addressLabels,
    heatmapData,
  };
}

export function getClassificationBorderColor(classification) {
  switch (classification) {
    case "Memory Prober":
      return "#f97316";

    case "Permission Violator":
      return "#ef4444";

    case "Bus Starver":
      return "#ef4444";

    case "Normal":
      return "#eab308";

    case "Empty":
      return "#1f2d42";

    default:
      return "#64748b";
  }
}