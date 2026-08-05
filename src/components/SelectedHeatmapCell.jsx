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

      <p><strong>Time Window</strong></p>
      <p>
        {selectedCell.time_window_start} ns →
        {" "}
        {selectedCell.time_window_end} ns
      </p>

      <p><strong>Memory Region</strong></p>
      <p>{selectedCell.region}</p>

      <p><strong>Classification</strong></p>
      <p>{selectedCell.classification}</p>

      <p><strong>Severity</strong></p>
      <p>{selectedCell.severity}</p>

      <p><strong>Total Transactions</strong></p>
      <p>{selectedCell.total_txns}</p>

      <p><strong>Matched Rule</strong></p>
      <p>{selectedCell.matched_rule}</p>
    </section>
  );
}

export default SelectedHeatmapCell;