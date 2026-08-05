export const memoryMap = [
  {
    name: "SRAM",
    start: 0x80000000,
    end: 0x8000ffff,
  },
  {
    name: "DMA",
    start: 0x90000000,
    end: 0x9000ffff,
  },
  {
    name: "UART",
    start: 0xa0000000,
    end: 0xa0000fff,
  },
  {
    name: "SPI/GPIO",
    start: 0xa1000000,
    end: 0xa1000fff,
  },
  {
    name: "DRAM",
    start: 0xb0000000,
    end: 0xb0ffffff,
  },
];