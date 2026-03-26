# SIR Disease Simulation

A stochastic, event-driven SIR (Susceptible-Infected-Recovered) epidemic simulation on a random contact network, originally implemented in C and ported to interactive React visualizations.

Project done under **Prof. MVP, CSE, IIT Hyderabad**.

---

## The SIR Model

The SIR model is a compartmental model in epidemiology that divides a population into three mutually exclusive groups:

| Compartment | Description |
|---|---|
| **S (Susceptible)** | Individuals who have not been infected and can contract the disease through contact with an infected neighbor. |
| **I (Infected)** | Individuals currently carrying the disease. They can transmit it to susceptible neighbors and will eventually recover. |
| **R (Recovered)** | Individuals who have recovered and gained permanent immunity. They can no longer be infected or transmit the disease. |

The flow is unidirectional: **S → I → R**. Once recovered, an individual never returns to a susceptible or infected state.

---

## Algorithm (C Implementation)

The simulation (`MA19BTECH11007-PROJECT.c`) uses an event-driven approach on a random graph, processing transmission and recovery events in chronological order via a priority queue.

### 1. Random Contact Network

- **10,000 vertices** (people), each identified by an integer ID (0–9999).
- **3,000 undirected edges** placed randomly between pairs (no self-loops, no parallel edges).
- Stored as an adjacency matrix. Each edge represents a bidirectional contact — if person A is connected to person B, either can infect the other.

### 2. Stochastic Waiting Times

Both transmission and recovery times are random, drawn from **geometric distributions**:

- **Transmission time** (`trn_days`): Each day, there is a probability of 0.5 that the infected person transmits to a given susceptible neighbor. The number of days until transmission follows Geom(0.5), with an expected wait of 2 days.
- **Recovery time** (`rec_days`): Each day, there is a probability of 0.2 that the infected person recovers. The number of days until recovery follows Geom(0.2), with an expected wait of 5 days.

```
P(X = k) = (1 - p)^(k-1) * p
E[X] = 1/p
```

### 3. Event-Driven Simulation Loop

The simulation uses a **min-heap priority queue** (binary heap, array-based) to schedule and process events by day:

1. **Initialization**:
   - All vertices start as Susceptible (S).
   - A random number of vertices are selected as initially infected and queued as Transmission events at day 0.

2. **Main loop** (day 0 to 299):
   - Pop all events scheduled for the current day from the priority queue.
   - **Transmission event (T)**: If the target vertex is still Susceptible:
     - Mark it as Infected (I).
     - Schedule a Recovery event at `current_day + rec_days()`.
     - For each susceptible neighbor, compute a transmission day = `current_day + trn_days()`. Only schedule it if:
       - The transmission would occur **before the source recovers** (ensures recovered people stop being infectious).
       - No earlier transmission to that neighbor is already scheduled (earliest infection wins).
   - **Recovery event (R)**: Mark the vertex as Recovered (R).
   - Record the S, I, R counts for the day.

3. **Output**: The adjacency matrix followed by daily lists of susceptible, infected, and recovered vertex IDs, written to `output.txt`.

### 4. Key Design Decisions

- **Competing events**: Transmission is only scheduled if it occurs before the source's recovery, correctly modeling that recovered people stop being infectious.
- **Earliest infection wins**: If multiple infected people target the same susceptible vertex, only the earliest scheduled transmission takes effect.
- **No reinfection**: Classic SIR — once recovered, immunity is permanent.
- **Custom data structures**: Array-based binary heap for O(log n) event scheduling, adjacency matrix for O(1) edge lookup.

---

## Parameters

| Parameter | C Default | Description |
|---|---|---|
| `total_vertices` | 10,000 | Number of people in the population |
| `max_edges` | 3,000 | Number of undirected contact edges |
| `max_days` | 300 | Simulation duration in days |
| `trans_prob` | 0.5 | Daily probability of transmitting to a neighbor |
| `rec_prob` | 0.2 | Daily probability of recovery |

---

## Project Structure

```
SIRDiseaseSimulation/
├── MA19BTECH11007-PROJECT.c    # Original C simulation
├── README.md
├── sir_stochastic/             # Interactive React simulation app
│   └── src/
│       ├── simulation.js       # JS port of the C engine + infection tree
│       ├── layout.js           # Force-directed graph layout (d3-force)
│       ├── App.jsx             # Main app with tabs
│       └── components/
│           ├── NetworkGraph.jsx # SVG network visualization
│           ├── ControlPanel.jsx # Parameter controls + statistics
│           ├── PlaybackBar.jsx  # Play/pause/step/speed controls
│           ├── SirChart.jsx     # S/I/R time-series chart
│           ├── AboutTab.jsx     # Model explanation + diagrams
│           └── HowItWorksTab.jsx# Implementation details + param table
├── map_viz/                    # Map-based population visualization
│   └── src/
│       ├── data.js             # People + connection generation
│       ├── App.jsx             # Map app with Leaflet
│       └── components/
│           ├── CityMap.jsx     # Interactive Leaflet map
│           ├── Controls.jsx    # City/population controls
│           └── PersonInfo.jsx  # Selected person details
└── sir-visualization/          # Earlier SVG-based SIR visualization
```

---

## Running the Apps

### C Simulation

```bash
gcc MA19BTECH11007-PROJECT.c -o sir_sim
./sir_sim
# Output written to output.txt
```

### React: SIR Stochastic Simulation

```bash
cd sir_stochastic
npm install
npm run dev
# Open http://localhost:5173
```

Features: force-directed network graph, animated day-by-day playback, S/I/R time-series chart, parameter tuning, R0 estimation, informational tabs explaining the model and algorithm.

### React: Map Visualization

```bash
cd map_viz
npm install
npm run dev
# Open http://localhost:5173
```

Features: interactive Leaflet map with population markers, proximity-based social connections, city selection (San Francisco, Hyderabad, New York, London, Tokyo).

---

## Links

- [GitHub Repository](https://github.com/MeetVys/SIRDiseaseSimulation)
- [Original C Code](https://github.com/MeetVys/SIRDiseaseSimulation/blob/master/MA19BTECH11007-PROJECT.c)
