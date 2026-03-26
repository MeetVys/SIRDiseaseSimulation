import { useState, useCallback, useMemo, useEffect } from "react";
import { createSeededRandom, runSirSimulation } from "./simulation";
import { computeLayout } from "./layout";
import NetworkGraph from "./components/NetworkGraph";
import ControlPanel from "./components/ControlPanel";
import PlaybackBar from "./components/PlaybackBar";
import SirChart from "./components/SirChart";

const GRAPH_WIDTH = 700;
const GRAPH_HEIGHT = 500;

const DEFAULT_CONFIG = {
  vertexCount: 150,
  edgeCount: 300,
  maxDays: 200,
  transmissionProbability: 0.5,
  recoveryProbability: 0.2,
  initialInfected: 3,
};

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function buildSimData(config, seed) {
  const rng = createSeededRandom(seed);
  const result = runSirSimulation({ ...config, random: rng });
  const positions = computeLayout(
    config.vertexCount,
    result.edges,
    GRAPH_WIDTH,
    GRAPH_HEIGHT
  );
  return { ...result, positions };
}

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [seed, setSeed] = useState("sir-stochastic-1");
  const [generation, setGeneration] = useState({
    ...DEFAULT_CONFIG,
    seed: "sir-stochastic-1",
    version: 0,
  });

  const simData = useMemo(
    () => buildSimData(generation, generation.seed),
    [generation]
  );

  const [day, setDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(100);
  const [selectedNode, setSelectedNode] = useState(null);

  const maxDay = simData.history.length - 1;
  const currentState = simData.history[day] || [];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setDay((d) => {
        if (d >= maxDay) {
          setIsPlaying(false);
          return d;
        }
        return d + 1;
      });
    }, speedMs);
    return () => clearInterval(timer);
  }, [isPlaying, maxDay, speedMs]);

  const runSimulation = useCallback(() => {
    const cleaned = {
      vertexCount: clamp(Math.floor(config.vertexCount), 20, 500),
      edgeCount: clamp(Math.floor(config.edgeCount), 20, 3000),
      maxDays: clamp(Math.floor(config.maxDays), 20, 600),
      transmissionProbability: clamp(config.transmissionProbability, 0.01, 0.99),
      recoveryProbability: clamp(config.recoveryProbability, 0.01, 0.99),
      initialInfected: clamp(
        Math.floor(config.initialInfected),
        1,
        Math.floor(config.vertexCount)
      ),
    };
    setConfig(cleaned);
    setGeneration((prev) => ({ ...cleaned, seed, version: prev.version + 1 }));
    setDay(0);
    setIsPlaying(false);
    setSelectedNode(null);
  }, [config, seed]);

  const updateConfig = useCallback((field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectNode = useCallback(
    (id) => setSelectedNode((prev) => (prev === id ? null : id)),
    []
  );

  const neighborIds = useMemo(() => {
    if (selectedNode === null) return new Set();
    const adj = simData.adjacency[selectedNode] || [];
    return new Set(adj);
  }, [selectedNode, simData.adjacency]);

  const selectedInfo = useMemo(() => {
    if (selectedNode === null) return null;
    return {
      id: selectedNode,
      state: currentState[selectedNode],
      neighborCount: neighborIds.size,
      infectedBy: simData.infectedBy[selectedNode],
    };
  }, [selectedNode, currentState, neighborIds, simData.infectedBy]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>SIR Stochastic Simulation</h1>
        <span className="subtitle">
          Event-driven epidemic model on a random contact network
        </span>
      </header>
      <div className="app-body">
        <aside className="sidebar">
          <ControlPanel
            config={config}
            seed={seed}
            onUpdateConfig={updateConfig}
            onUpdateSeed={setSeed}
            onRun={runSimulation}
            stats={simData.stats}
            selectedInfo={selectedInfo}
          />
        </aside>
        <main className="main-area">
          <div className="graph-section">
            <NetworkGraph
              width={GRAPH_WIDTH}
              height={GRAPH_HEIGHT}
              positions={simData.positions}
              edges={simData.edges}
              currentState={currentState}
              selectedNode={selectedNode}
              neighborIds={neighborIds}
              onSelectNode={handleSelectNode}
            />
          </div>
          <PlaybackBar
            day={day}
            maxDay={maxDay}
            isPlaying={isPlaying}
            speedMs={speedMs}
            onSetDay={setDay}
            onTogglePlay={() => setIsPlaying((v) => !v)}
            onStepBack={() => setDay((d) => Math.max(0, d - 1))}
            onStepForward={() => setDay((d) => Math.min(maxDay, d + 1))}
            onSetSpeed={setSpeedMs}
          />
          <div className="chart-section">
            <SirChart
              countsByDay={simData.countsByDay}
              currentDay={day}
              maxPopulation={generation.vertexCount}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
