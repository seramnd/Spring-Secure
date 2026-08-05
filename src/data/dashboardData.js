export const dashboardData = {
  statistics: {
    totalTransactions: 12486,
    reads: 7845,
    writes: 4641,
    hottestRegion: "0xB0000000 (DRAM)",
  },

  semantic: {
    summary: [
      "DMA engine transferring frame buffer.",
      "CPU polling UART status register.",
      "Hotspot detected in SRAM region.",
    ],
  },

  drift: {
    score: 0.87,
    severity: "High",
    anomaly: true,
  },
};