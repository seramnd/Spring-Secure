function SelectedHeatmapCell({ selectedCell }) {
  if (!selectedCell) {
    return (
      <section className="card">
        <h2>Selected Analysis</h2>
        <p>Select a heatmap cell.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Selected Analysis</h2>

      <p><strong>Address</strong></p>
      <p>{selectedCell.address}</p>

      <p><strong>Time Window</strong></p>
      <p>
        {selectedCell.time_window_start} ns →
        {" "}
        {selectedCell.time_window_end} ns
      </p>

      <p><strong>Intensity</strong></p>
      <p>{selectedCell.intensity}</p>

      <p><strong>Total Transactions</strong></p>
      <p>{selectedCell.total_txns}</p>

      <p><strong>Severity</strong></p>
      <p>{selectedCell.severity}</p>

      <p><strong>Threat Level</strong></p>
      <p>{selectedCell.threat_level}</p>

      <p><strong>Anomaly Score</strong></p>
      <p>
        {selectedCell.anomaly_score?.toFixed(3)}
      </p>

      <p><strong>AI Flag</strong></p>
      <p>{selectedCell.ai_flag ? "Yes" : "No"}</p>

      <p><strong>Matched Rule</strong></p>
      <p>{selectedCell.matched_rule}</p>

    </section>
  );
}

export default SelectedHeatmapCell;