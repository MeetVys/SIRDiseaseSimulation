const PARAMS = [
  {
    name: "Vertices",
    key: "vertexCount",
    range: "20 -- 500",
    defaultVal: "150",
    desc: "Number of people in the population. Each vertex is a person.",
  },
  {
    name: "Edges",
    key: "edgeCount",
    range: "20 -- 3,000",
    defaultVal: "300",
    desc: "Number of contact links. Higher values mean a more connected (denser) network.",
  },
  {
    name: "Max Days",
    key: "maxDays",
    range: "20 -- 600",
    defaultVal: "200",
    desc: "Duration of the simulation in days.",
  },
  {
    name: "Initial Infected",
    key: "initialInfected",
    range: "1 -- vertexCount",
    defaultVal: "3",
    desc: 'Number of "patient zero" seeds at day 0.',
  },
  {
    name: "Transmission Prob",
    key: "transmissionProbability",
    range: "0.01 -- 0.99",
    defaultVal: "0.50",
    desc: "Daily probability of transmitting to a susceptible neighbor. Higher = faster spread.",
  },
  {
    name: "Recovery Prob",
    key: "recoveryProbability",
    range: "0.01 -- 0.99",
    defaultVal: "0.20",
    desc: "Daily probability of recovering. Higher = shorter illness duration.",
  },
  {
    name: "Seed",
    key: "seed",
    range: "any string",
    defaultVal: '"sir-stochastic-1"',
    desc: "Seeds the random number generator for reproducible results. Same seed = same simulation.",
  },
];

function EventDiagram() {
  return (
    <svg viewBox="0 0 600 170" className="event-diagram">
      {/* Priority Queue */}
      <rect x="20" y="10" width="160" height="50" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="100" y="32" textAnchor="middle" fontSize="11" fontWeight="600" fill="#334155">Priority Queue</text>
      <text x="100" y="48" textAnchor="middle" fontSize="10" fill="#64748b">(min-heap by day)</text>

      {/* Arrow down */}
      <line x1="100" y1="60" x2="100" y2="85" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#ah2)" />
      <text x="108" y="76" fontSize="9" fill="#94a3b8">pop earliest</text>

      {/* Event box */}
      <rect x="30" y="88" width="140" height="36" rx="6" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
      <text x="100" y="110" textAnchor="middle" fontSize="11" fontWeight="600" fill="#5b21b6">Process Event</text>

      {/* Two branches */}
      <line x1="100" y1="124" x2="60" y2="148" stroke="#64748b" strokeWidth="1.5" />
      <line x1="100" y1="124" x2="160" y2="148" stroke="#64748b" strokeWidth="1.5" />

      {/* Transmission branch */}
      <rect x="4" y="148" width="112" height="18" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1" />
      <text x="60" y="161" textAnchor="middle" fontSize="9" fontWeight="600" fill="#991b1b">Transmission (T)</text>

      {/* Recovery branch */}
      <rect x="124" y="148" width="90" height="18" rx="4" fill="#dcfce7" stroke="#22c55e" strokeWidth="1" />
      <text x="169" y="161" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">Recovery (R)</text>

      {/* Right side: rules */}
      <rect x="280" y="10" width="300" height="150" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
      <text x="300" y="34" fontSize="12" fontWeight="700" fill="#0f172a">Simulation Rules</text>

      <text x="300" y="56" fontSize="10" fill="#475569">1. Infection only if target is still Susceptible</text>
      <text x="300" y="76" fontSize="10" fill="#475569">2. Transmission must occur before source recovers</text>
      <text x="300" y="96" fontSize="10" fill="#475569">3. Earliest scheduled infection wins</text>
      <text x="300" y="116" fontSize="10" fill="#475569">4. No reinfection after recovery</text>
      <text x="300" y="140" fontSize="10" fill="#94a3b8">Based on Gillespie-style event scheduling</text>

      <defs>
        <marker id="ah2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#64748b" />
        </marker>
      </defs>
    </svg>
  );
}

export default function HowItWorksTab() {
  return (
    <div className="info-page">
      <div className="info-container">
        <section className="info-section">
          <h2>Random Contact Network</h2>
          <p>
            The population is modeled as an{" "}
            <strong>Erdos-Renyi random graph</strong>. Each person is a vertex,
            and each social contact (someone they could infect or be infected by)
            is an undirected edge placed randomly between two people.
          </p>
          <p>
            This is the same model used in the original C implementation: no
            self-loops, no parallel edges, and each edge represents a
            bidirectional contact. The graph is generated fresh each time you run
            the simulation.
          </p>
          <div className="highlight-box">
            <h4>Network Properties</h4>
            <p>
              Average degree (connections per person) = 2 &times; edges / vertices.
              For the defaults (150 vertices, 300 edges), each person knows about
              4 others on average.
            </p>
          </div>
        </section>

        <section className="info-section">
          <h2>Event-Driven Simulation Engine</h2>
          <EventDiagram />
          <p>
            Rather than scanning every person on every day, the simulation uses
            an <strong>event-driven</strong> approach with a min-heap priority
            queue. Events (transmissions and recoveries) are scheduled at
            specific future days and processed in chronological order.
          </p>
          <p>
            When a person becomes infected, two things happen: (1) a recovery
            event is scheduled at a random future day, and (2) transmission
            events are scheduled for each susceptible neighbor, but only if the
            transmission would occur before the source recovers.
          </p>
        </section>

        <section className="info-section">
          <h2>Parameter Reference</h2>
          <div className="param-table-wrap">
            <table className="param-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Range</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {PARAMS.map((p) => (
                  <tr key={p.key}>
                    <td className="param-name">{p.name}</td>
                    <td className="param-range">{p.range}</td>
                    <td className="param-default">{p.defaultVal}</td>
                    <td>{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="info-section">
          <h2>
            Understanding R<sub>0</sub>
          </h2>
          <p>
            The <strong>basic reproduction number R<sub>0</sub></strong>{" "}
            represents the average number of secondary infections caused by a
            single infected individual. In this simulation, it is estimated
            empirically from the infection tree:
          </p>
          <div className="equation-box">
            <p className="equation">
              R<sub>0</sub> = total secondary infections / total infected
              individuals
            </p>
          </div>
          <p>
            An R<sub>0</sub> greater than 1 means the epidemic will grow; less
            than 1 means it will die out. The actual value depends on the
            network density, transmission probability, and recovery probability.
            Try adjusting these parameters to see how R<sub>0</sub> changes!
          </p>
        </section>

        <section className="info-section">
          <h2>From C to React</h2>
          <p>
            This simulation is a faithful port of the{" "}
            <a
              href="https://github.com/MeetVys/SIRDiseaseSimulation/blob/master/MA19BTECH11007-PROJECT.c"
              target="_blank"
              rel="noopener noreferrer"
            >
              original C implementation
            </a>
            {" "}(<code>MA19BTECH11007-PROJECT.c</code>), which modeled 10,000
            vertices with 3,000 edges over 300 days. The core algorithm is
            identical: a min-heap priority queue, geometric random variables for
            waiting times, and the same event-processing logic.
          </p>
          <p>
            The React version adds interactive visualization with a
            force-directed graph layout, real-time playback controls, and
            parameter tuning -- making it easy to explore how different settings
            affect epidemic dynamics.
          </p>
          <div className="source-links">
            <a
              href="https://github.com/MeetVys/SIRDiseaseSimulation"
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub Repository
            </a>
            <a
              href="https://github.com/MeetVys/SIRDiseaseSimulation/blob/master/MA19BTECH11007-PROJECT.c"
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                <path fillRule="evenodd" d="M4 1.75C4 .784 4.784 0 5.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0114.25 15h-9a.75.75 0 010-1.5h9a.25.25 0 00.25-.25V5h-2.75A1.75 1.75 0 0110 3.25V.5H5.75a.25.25 0 00-.25.25v2.5a.75.75 0 01-1.5 0V1.75zm7.5-.188V3.25c0 .138.112.25.25.25h1.688L11.5 1.562zM1.97 11.28a.75.75 0 00-1.06-1.06l-2.5 2.5a.75.75 0 000 1.06l2.5 2.5a.75.75 0 001.06-1.06L.72 14l1.25-1.25zm4.06-1.06a.75.75 0 10-1.06 1.06L6.22 12.5l-1.25 1.25a.75.75 0 101.06 1.06l2.5-2.5a.75.75 0 000-1.06l-2.5-2.5zm-1.28 2.03L2.5 14.5l2.25 2.25" />
              </svg>
              View Original C Code
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
