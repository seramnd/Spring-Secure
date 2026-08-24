function SelectedHeatmapCell({ selectedCell }) {
  if (!selectedCell) {
    return (
      <section className="analysis-card">
        <div className="analysis-card-header">
          <div>
            <div className="analysis-eyebrow">CELL INSPECTION</div>
            <h2>Selected Analysis</h2>
          </div>
        </div>

        <div className="analysis-empty">
          <div className="analysis-empty-icon">⌁</div>
          <p>Select a heatmap cell to inspect its activity.</p>
        </div>
      </section>
    );
  }

  const threatLevel =
    selectedCell.threat_level?.toLowerCase();

  const severity =
    selectedCell.severity?.toLowerCase();

  const isHighRisk =
    threatLevel === "high" ||
    severity === "high";

  return (
    <section className="analysis-card">
      
      {/* Header */}
      <div className="analysis-card-header">
        <div>
          <div className="analysis-eyebrow">
            CELL INSPECTION
          </div>

          <h2>Selected Analysis</h2>
        </div>

        <span
          className={
            isHighRisk
              ? "analysis-badge danger"
              : "analysis-badge"
          }
        >
          {isHighRisk ? "HIGH RISK" : "NORMAL"}
        </span>
      </div>

      {/* Address */}
      <div className="analysis-address-section">
        <div className="analysis-detail-label">
          ADDRESS
        </div>

        <div className="analysis-address">
          {selectedCell.address}
        </div>

        <div className="analysis-time">
          {selectedCell.time_window_start} ns
          {" → "}
          {selectedCell.time_window_end} ns
        </div>
      </div>

      {/* Main statistics */}
      <div className="analysis-stats">

        <div className="analysis-stat">
          <div className="analysis-stat-label">
            INTENSITY
          </div>

          <div className="analysis-stat-value">
            {selectedCell.intensity}
          </div>
        </div>

        <div className="analysis-stat">
          <div className="analysis-stat-label">
            TRANSACTIONS
          </div>

          <div className="analysis-stat-value">
            {selectedCell.total_txns}
          </div>
        </div>

      </div>

      {/* Details */}
      <div className="analysis-details">

        <div>
          <div className="analysis-detail-label">
            SEVERITY
          </div>

          <div
            className={
              severity === "high"
                ? "analysis-detail-value analysis-danger"
                : "analysis-detail-value"
            }
          >
            {selectedCell.severity}
          </div>
        </div>

        <div>
          <div className="analysis-detail-label">
            THREAT LEVEL
          </div>

          <div
            className={
              threatLevel === "high"
                ? "analysis-detail-value analysis-danger"
                : "analysis-detail-value"
            }
          >
            {selectedCell.threat_level}
          </div>
        </div>

        <div>
          <div className="analysis-detail-label">
            ANOMALY SCORE
          </div>

          <div className="analysis-detail-value">
            {selectedCell.anomaly_score?.toFixed(3)}
          </div>
        </div>

        <div>
          <div className="analysis-detail-label">
            AI FLAG
          </div>

          <div
            className={
              selectedCell.ai_flag
                ? "analysis-detail-value analysis-danger"
                : "analysis-detail-value analysis-success"
            }
          >
            {selectedCell.ai_flag
              ? "Detected"
              : "None"}
          </div>
        </div>

      </div>

      {/* Matched rule */}
      <div className="analysis-rule-section">

        <div className="analysis-detail-label">
          MATCHED RULE
        </div>

        <div className="analysis-rule">
          {selectedCell.matched_rule || "None"}
        </div>

      </div>

    </section>
  );
}

export default SelectedHeatmapCell;