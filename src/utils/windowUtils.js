export function filterTransactionsByWindow(
  transactions,
  startTimestamp,
  endTimestamp
) {
  return transactions.filter(
    (transaction) =>
      transaction.timestamp >= startTimestamp &&
      transaction.timestamp < endTimestamp
  );
}