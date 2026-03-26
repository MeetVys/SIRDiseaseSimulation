const PARAM_DEFS = [
  { key: "vertexCount", label: "Vertices", min: 20, max: 500, step: 10 },
  { key: "edgeCount", label: "Edges", min: 20, max: 3000, step: 10 },
  { key: "maxDays", label: "Max Days", min: 20, max: 600, step: 10 },
  { key: "initialInfected", label: "Initial Infected", min: 1, max: 100, step: 1 },
  {
    key: "transmissionProbability",
    label: "Transmission Prob",
    min: 0.01,
    max: 0.99,
    step: 0.01,
  },
  {
    key: "recoveryProbability",
    label: "Recovery Prob",
    min: 0.01,
    max: 0.99,
    step: 0.01,
  },
];

function formatValue(key, val) {
  if (key.includes("Probability") || key.includes("probability")) {
    return Number(val).toFixed(2);
  }
  return String(Math.floor(val));
}

export default function ControlPanel({
  config,
  seed,
  onUpdateConfig,
  onUpdateSeed,
  onRun,
  stats,
  selectedInfo,
}) {
  return (
    <div className="control-panel">
      <section className="panel-section">
        <h2>Parameters</h2>
        {PARAM_DEFS.map((p) => (
          <label key={p.key} className="param-row">
            <span className="param-label">
              {p.label}
              <span className="param-value">
                {formatValue(p.key, config[p.key])}
              </span>
            </span>
            <input
              type="range"
              min={p.min}
              max={p.key === "initialInfected" ? config.vertexCount : p.max}
              step={p.step}
              value={config[p.key]}
              onChange={(e) => onUpdateConfig(p.key, Number(e.target.value))}
            />
          </label>
        ))}
        <label className="param-row">
          <span className="param-label">Seed</span>
          <input
            type="text"
            className="seed-input"
            value={seed}
            onChange={(e) => onUpdateSeed(e.target.value)}
          />
        </label>
        <button className="btn-run" onClick={onRun}>
          Run Simulation
        </button>
      </section>

      <section className="panel-section">
        <h2>Statistics</h2>
        <div className="stat-rows">
          <div className="stat-row">
            <span>Peak Infection Day</span>
            <strong>{stats.peakDay}</strong>
          </div>
          <div className="stat-row">
            <span>Peak Infected</span>
            <strong>{stats.peakInfected}</strong>
          </div>
          <div className="stat-row">
            <span>
              R<sub>0</sub> Estimate
            </span>
            <strong>{stats.r0Estimate.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <h2>Selected Node</h2>
        {selectedInfo ? (
          <div className="selected-card">
            <div className="selected-header">
              <span
                className="state-dot"
                style={{
                  background:
                    selectedInfo.state === "S"
                      ? "#3b82f6"
                      : selectedInfo.state === "I"
                        ? "#ef4444"
                        : "#22c55e",
                }}
              />
              <strong>Node {selectedInfo.id}</strong>
              <span className="state-badge">{selectedInfo.state === "S" ? "Susceptible" : selectedInfo.state === "I" ? "Infected" : "Recovered"}</span>
            </div>
            <p>{selectedInfo.neighborCount} connections</p>
            <p>
              {selectedInfo.infectedBy === null
                ? "Never infected"
                : selectedInfo.infectedBy === -1
                  ? "Initial seed (patient zero)"
                  : `Infected by Node ${selectedInfo.infectedBy}`}
            </p>
          </div>
        ) : (
          <p className="hint">Click a node on the graph to inspect it.</p>
        )}
      </section>
    </div>
  );
}
