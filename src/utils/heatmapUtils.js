function parseHexAddress(address) {
  return Number.parseInt(address, 16);
}

function formatHex(value) {
  return `0x${value.toString(16).padStart(8, "0")}`;
}

function getAddressBin(address, binSize) {
  const numericAddress = parseHexAddress(address);
  return Math.floor(numericAddress / binSize) * binSize;
}

export function buildAddressBucketedHeatmap(
  transactions,
  windowStart,
  windowEnd,
  timeBucketSize = 20,
  addressBinSize = 0x1000
) {
  const timeBucketCount = Math.ceil((windowEnd - windowStart) / timeBucketSize);

  const timeLabels = Array.from({ length: timeBucketCount }, (_, index) => {
    const start = windowStart + index * timeBucketSize;
    const end = start + timeBucketSize;
    return `${start}-${end}ns`;
  });

  const addressBins = Array.from(
    new Set(
      transactions.map((txn) => getAddressBin(txn.address, addressBinSize))
    )
  ).sort((a, b) => a - b);

  const addressLabels = addressBins.map((binStart) => {
    const binEnd = binStart + addressBinSize - 1;
    return `${formatHex(binStart)}-${formatHex(binEnd)}`;
  });

  const counts = {};

  for (const txn of transactions) {
    const timeIndex = Math.floor((txn.timestamp - windowStart) / timeBucketSize);

    if (timeIndex < 0 || timeIndex >= timeBucketCount) {
      continue;
    }

    const binStart = getAddressBin(txn.address, addressBinSize);
    const addressIndex = addressBins.indexOf(binStart);

    if (addressIndex === -1) {
      continue;
    }

    const key = `${timeIndex}-${addressIndex}`;
    counts[key] = (counts[key] || 0) + 1;
  }

  const heatmapData = [];

  for (let addressIndex = 0; addressIndex < addressLabels.length; addressIndex++) {
    for (let timeIndex = 0; timeIndex < timeLabels.length; timeIndex++) {
      const key = `${timeIndex}-${addressIndex}`;
      heatmapData.push([timeIndex, addressIndex, counts[key] || 0]);
    }
  }

  return {
    timeLabels,
    addressLabels,
    heatmapData,
  };
}