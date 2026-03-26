export default function PlaybackBar({
  day,
  maxDay,
  isPlaying,
  speedMs,
  onSetDay,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onSetSpeed,
}) {
  return (
    <div className="playback-bar">
      <div className="playback-controls">
        <button
          className="pb-btn"
          onClick={() => onSetDay(0)}
          title="Go to start"
        >
          &#x23EE;
        </button>
        <button className="pb-btn" onClick={onStepBack} title="Step back">
          &#x23F4;
        </button>
        <button
          className="pb-btn pb-play"
          onClick={onTogglePlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "\u23F8" : "\u25B6"}
        </button>
        <button className="pb-btn" onClick={onStepForward} title="Step forward">
          &#x23F5;
        </button>
        <button
          className="pb-btn"
          onClick={() => onSetDay(maxDay)}
          title="Go to end"
        >
          &#x23ED;
        </button>
      </div>

      <div className="playback-slider">
        <span className="day-label">
          Day <strong>{day}</strong> / {maxDay}
        </span>
        <input
          type="range"
          min={0}
          max={maxDay}
          value={day}
          onChange={(e) => onSetDay(Number(e.target.value))}
        />
      </div>

      <div className="speed-control">
        <span className="speed-label">Speed</span>
        <input
          type="range"
          min={20}
          max={500}
          value={520 - speedMs}
          onChange={(e) => onSetSpeed(520 - Number(e.target.value))}
        />
        <span className="speed-value">{speedMs}ms</span>
      </div>
    </div>
  );
}
