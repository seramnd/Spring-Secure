function RecentTransactions() {
  const transactions = [
    {
      time: "10:21:00",
      address: "0x80000000 SRAM",
      master: "CPU",
      type: "READ",
      length: 4,
    },
    {
      time: "10:21:01",
      address: "0x90000000 DMA",
      master: "DMA",
      type: "WRITE",
      length: 64,
    },
    {
      time: "10:21:05",
      address: "0xB0000000 DRAM",
      master: "DMA",
      type: "WRITE",
      length: 128,
    },
  ];

  return (
    <section className="card">
      <h2>Recent Transactions</h2>

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Address</th>
            <th>Master</th>
            <th>Type</th>
            <th>Length</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((txn, index) => (
            <tr key={index}>
              <td>{txn.time}</td>
              <td>{txn.address}</td>
              <td>{txn.master}</td>
              <td>{txn.type}</td>
              <td>{txn.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default RecentTransactions;