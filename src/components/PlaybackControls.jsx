function PlaybackControls({ isPlaying, onPlayPause, onReset }) {
  return (
    <section className="card playback-controls">
      <button onClick={onPlayPause}>
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>

      <button onClick={onReset}>
        ⏹ Reset
      </button>
    </section>
  );
}

export default PlaybackControls;
