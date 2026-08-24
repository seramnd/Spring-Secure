function SemanticPanel({ semantic }) {
  console.log("Semantic data:", semantic);

  const hasSemantic =
    Array.isArray(semantic) && semantic.length > 0;

  return (
    <section className="analysis-card">

      {/* Header */}
      <div className="semantic-header">
        <div>
          <div className="analysis-eyebrow">
            AI INSIGHT
          </div>

          <h2>Semantic Analysis</h2>
        </div>

        {hasSemantic && (
          <span className="semantic-status">
            ANALYSIS AVAILABLE
          </span>
        )}
      </div>

      {hasSemantic ? (
        <>
          {/* AI Summary */}
          <div className="semantic-alert">
            <div className="semantic-alert-icon">
              ✦
            </div>

            <div>
              <div className="semantic-alert-title">
                Activity Pattern Detected
              </div>

              <div className="semantic-alert-text">
                AI semantic analysis is available for
                the selected heatmap cell.
              </div>
            </div>
          </div>

          {/* Semantic findings */}
          <div className="semantic-section">

            <div className="semantic-section-title">
              FINDINGS
            </div>

            <ul className="semantic-list">
              {semantic.map((item, index) => (
                <li key={index}>
                  {item}
                </li>
              ))}
            </ul>

          </div>
        </>
      ) : (
        <div className="analysis-empty">

          <div className="analysis-empty-icon">
            ✦
          </div>

          <p>
            No semantic analysis available.
          </p>

          <span>
            Select a heatmap cell with AI
            analysis to view insights.
          </span>

        </div>
      )}

    </section>
  );
}

export default SemanticPanel;