function Statistics({ stats }) {
  return (
    <section className="stats-grid">
      <div className="stat-card">
        <h3>Total Transactions</h3>
        <p>{stats.totalTransactions}</p>
      </div>

      <div className="stat-card">
        <h3>Read Operations</h3>
        <p>{stats.reads}</p>
      </div>

      <div className="stat-card">
        <h3>Write Operations</h3>
        <p>{stats.writes}</p>
      </div>

      <div className="stat-card">
        <h3>Avg Latency</h3>
        <p>{stats.averageLatency}</p>
      </div>
    </section>
  );
}

export default Statistics;