import { memoryMap } from "./memoryMap";

export function getMemoryRegion(address) {
  const numericAddress = parseInt(address, 16);

  return memoryMap.find(
    (region) =>
      numericAddress >= region.start &&
      numericAddress <= region.end
  );
}

export function isIllegalAccess(transaction) {
  return !getMemoryRegion(transaction.address);
}