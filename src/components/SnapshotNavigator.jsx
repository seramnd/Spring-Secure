function SnapshotNavigator({
  currentWindow,
  totalWindows,
  timeStart,
  timeEnd,
  onPrevious,
  onNext,
}) {
  return (
    <section className="card">
      <h2>Snapshot Window</h2>

      <div className="snapshot-toolbar">
        <button onClick={onPrevious} disabled={currentWindow === 0}>
          ◀ Previous
        </button>

        <div className="snapshot-info">
          <strong>
            Window {currentWindow + 1} / {totalWindows}
          </strong>
          <p>
            {timeStart} ns → {timeEnd} ns
          </p>
        </div>

        <button onClick={onNext} disabled={currentWindow === totalWindows - 1}>
          Next ▶
        </button>
      </div>
    </section>
  );
}

export default SnapshotNavigator;