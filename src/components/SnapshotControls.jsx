function SnapshotControls({ windowStart, windowSize, maxTimestamp, onStartChange, onSizeChange }) {
  return (
    <section className="card">
      <h2>Snapshot Window</h2>

      <p>
        Showing traffic from <strong>{windowStart} ns</strong> to{" "}
        <strong>{windowStart + windowSize} ns</strong>
      </p>

      <label>
        Window Start: {windowStart} ns
        <input
          type="range"
          min="0"
          max={maxTimestamp}
          step="10"
          value={windowStart}
          onChange={(event) => onStartChange(Number(event.target.value))}
        />
      </label>

      <label>
        Window Size: {windowSize} ns
        <select
          value={windowSize}
          onChange={(event) => onSizeChange(Number(event.target.value))}
        >
          <option value={200}>200 ns</option>
          <option value={500}>500 ns</option>
          <option value={1000}>1000 ns</option>
          <option value={2000}>2000 ns</option>
        </select>
      </label>
    </section>
  );
}

export default SnapshotControls;