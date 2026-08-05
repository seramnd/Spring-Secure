function DriftPanel({ drift }) {
  return (
    <section className="card">
      <h2>Data Drift Detection</h2>

      <p className="drift-score">{drift.score}</p>
      <p>Severity: {drift.severity}</p>
      <p>Status: {drift.anomaly ? "Anomaly Detected" : "Normal"}</p>
    </section>
  );
}

export default DriftPanel;