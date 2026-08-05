export function buildTrafficStats(transactions) {
  const totalTransactions = transactions.length;

  const reads = transactions.filter(
    (txn) => txn.operation === "READ"
  ).length;

  const writes = transactions.filter(
    (txn) => txn.operation === "WRITE"
  ).length;

  const averageLatency =
    totalTransactions === 0
      ? 0
      : (
          transactions.reduce((sum, txn) => sum + Number(txn.latency || 0), 0) /
          totalTransactions
        ).toFixed(2);

  return {
    totalTransactions,
    reads,
    writes,
    averageLatency,
  };
}