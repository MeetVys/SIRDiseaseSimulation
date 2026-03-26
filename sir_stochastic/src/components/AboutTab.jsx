function CompartmentDiagram() {
  return (
    <svg viewBox="0 0 640 120" className="compartment-diagram">
      {/* S box */}
      <rect x="20" y="30" width="140" height="60" rx="10" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
      <text x="90" y="56" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">Susceptible</text>
      <text x="90" y="74" textAnchor="middle" fontSize="11" fill="#3b82f6">(S)</text>

      {/* Arrow S -> I */}
      <line x1="160" y1="60" x2="230" y2="60" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <text x="195" y="48" textAnchor="middle" fontSize="10" fill="#64748b">transmission</text>

      {/* I box */}
      <rect x="240" y="30" width="140" height="60" rx="10" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" />
      <text x="310" y="56" textAnchor="middle" fontSize="13" fontWeight="700" fill="#991b1b">Infected</text>
      <text x="310" y="74" textAnchor="middle" fontSize="11" fill="#ef4444">(I)</text>

      {/* Arrow I -> R */}
      <line x1="380" y1="60" x2="450" y2="60" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowHead)" />
      <text x="415" y="48" textAnchor="middle" fontSize="10" fill="#64748b">recovery</text>

      {/* R box */}
      <rect x="460" y="30" width="140" height="60" rx="10" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" />
      <text x="530" y="56" textAnchor="middle" fontSize="13" fontWeight="700" fill="#166534">Recovered</text>
      <text x="530" y="74" textAnchor="middle" fontSize="11" fill="#22c55e">(R)</text>

      <defs>
        <marker id="arrowHead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#64748b" />
        </marker>
      </defs>
    </svg>
  );
}

export default function AboutTab() {
  return (
    <div className="info-page">
      <div className="info-container">
        <section className="info-section">
          <h2>What is the SIR Model?</h2>
          <p>
            The <strong>SIR model</strong> is one of the most fundamental
            compartmental models in epidemiology. It divides a population into
            three mutually exclusive groups and tracks how individuals move
            between them as a disease spreads through a contact network.
          </p>
          <p>
            Originally formulated by Kermack and McKendrick in 1927, the SIR
            framework remains the foundation for understanding epidemic dynamics
            -- from seasonal flu to COVID-19 modeling.
          </p>
        </section>

        <section className="info-section">
          <h2>The Three Compartments</h2>
          <CompartmentDiagram />
          <div className="compartment-cards">
            <div className="compartment-card card-s">
              <h3>S -- Susceptible</h3>
              <p>
                Individuals who have not yet been infected and can catch the
                disease. They transition to Infected when they receive the
                disease from a connected infected neighbor.
              </p>
            </div>
            <div className="compartment-card card-i">
              <h3>I -- Infected</h3>
              <p>
                Individuals currently carrying the disease. They can transmit it
                to their susceptible neighbors. After a random recovery period,
                they move to the Recovered compartment.
              </p>
            </div>
            <div className="compartment-card card-r">
              <h3>R -- Recovered</h3>
              <p>
                Individuals who have recovered and gained immunity. In the
                classic SIR model, recovery is permanent -- there is no
                reinfection. They no longer participate in transmission.
              </p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2>Why Stochastic?</h2>
          <p>
            The classic deterministic SIR model uses ordinary differential
            equations (ODEs) where the rates of change are smooth and
            predictable. In contrast, this simulation uses a{" "}
            <strong>stochastic</strong> approach -- transmission and recovery
            times are <em>random variables</em>, not fixed rates.
          </p>
          <p>
            This matters because real epidemics are inherently uncertain. Two
            identical populations with the same parameters can have very
            different outcomes. A stochastic model captures this variability,
            making it more realistic for small populations and network-based
            spread.
          </p>
          <div className="highlight-box">
            <h4>Deterministic vs. Stochastic</h4>
            <p>
              <strong>Deterministic:</strong> dI/dt = &beta;SI - &gamma;I
              &nbsp;&rarr;&nbsp; smooth curves, same result every run.
            </p>
            <p>
              <strong>Stochastic:</strong> Each transmission and recovery is a
              random event drawn from a geometric distribution &nbsp;&rarr;&nbsp;
              different outcome each run, captures real-world uncertainty.
            </p>
          </div>
        </section>

        <section className="info-section">
          <h2>Key Equations</h2>
          <p>
            Both transmission and recovery waiting times follow a{" "}
            <strong>geometric distribution</strong>. Each day, there is a fixed
            probability <em>p</em> that the event (transmission or recovery)
            occurs:
          </p>
          <div className="equation-box">
            <p className="equation">P(X = k) = (1 - p)<sup>k-1</sup> &middot; p</p>
            <p className="equation-note">
              where <em>k</em> is the number of days until the event occurs
            </p>
          </div>
          <p>The expected waiting time is:</p>
          <div className="equation-box">
            <p className="equation">E[X] = 1 / p</p>
            <p className="equation-note">
              e.g. with transmission probability 0.5, the average wait is 2
              days; with recovery probability 0.2, the average recovery takes 5
              days
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
