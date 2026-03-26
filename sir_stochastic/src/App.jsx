import { useState, useCallback, useMemo, useEffect } from "react";
import { createSeededRandom, runSirSimulation } from "./simulation";
import { computeLayout } from "./layout";
import TabBar from "./components/TabBar";
import NetworkGraph from "./components/NetworkGraph";
import ControlPanel from "./components/ControlPanel";
import PlaybackBar from "./components/PlaybackBar";
import SirChart from "./components/SirChart";
import AboutTab from "./components/AboutTab";
import HowItWorksTab from "./components/HowItWorksTab";

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
  const [activeTab, setActiveTab] = useState("simulation");
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

  const handleTabChange = useCallback(
    (tab) => {
      if (tab !== "simulation") setIsPlaying(false);
      setActiveTab(tab);
    },
    []
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-top">
          <h1>SIR Stochastic Simulation</h1>
          <span className="subtitle">
            Event-driven epidemic model on a random contact network
          </span>
          <a
            className="github-link"
            href="https://github.com/MeetVys/SIRDiseaseSimulation"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>
        <TabBar activeTab={activeTab} onChangeTab={handleTabChange} />
      </header>

      {activeTab === "simulation" && (
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
      )}

      {activeTab === "about" && <AboutTab />}
      {activeTab === "how" && <HowItWorksTab />}
    </div>
  );
}
