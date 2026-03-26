class MinHeap {
  constructor() {
    this.data = [];
  }

  push(item) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return null;
    if (this.data.length === 1) return this.data.pop();
    const root = this.data[0];
    this.data[0] = this.data.pop();
    this._bubbleDown(0);
    return root;
  }

  peek() {
    return this.data[0] ?? null;
  }

  get size() {
    return this.data.length;
  }

  _bubbleUp(index) {
    let i = index;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent].day <= this.data[i].day) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  _bubbleDown(index) {
    let i = index;
    const n = this.data.length;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.data[left].day < this.data[smallest].day)
        smallest = left;
      if (right < n && this.data[right].day < this.data[smallest].day)
        smallest = right;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

function hashSeed(seed) {
  const text = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRandom(seed) {
  let state = hashSeed(seed) || 0x9e3779b9;
  return function nextRandom() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function geometricDays(probability, random) {
  let days = 0;
  while (true) {
    days += 1;
    if (random() < probability) return days;
  }
}

function randomGraph(vertexCount, edgeCount, random) {
  const maxPossible = Math.floor((vertexCount * (vertexCount - 1)) / 2);
  const targetEdges = Math.min(edgeCount, maxPossible);
  const adjacency = Array.from({ length: vertexCount }, () => []);
  const edges = [];
  const seen = new Set();

  while (edges.length < targetEdges) {
    const a = Math.floor(random() * vertexCount);
    const b = Math.floor(random() * vertexCount);
    if (a === b) continue;
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    const key = `${from}:${to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    adjacency[from].push(to);
    adjacency[to].push(from);
    edges.push([from, to]);
  }

  return { adjacency, edges };
}

export function runSirSimulation(config) {
  const {
    vertexCount,
    edgeCount,
    maxDays,
    transmissionProbability,
    recoveryProbability,
    initialInfected,
    random = Math.random,
  } = config;

  const { adjacency, edges } = randomGraph(vertexCount, edgeCount, random);

  const state = Array(vertexCount).fill("S");
  const infectionTime = Array(vertexCount).fill(maxDays + 1);
  // infectedBy[v] = id of the node that infected v, or -1 if initially seeded
  const infectedBy = Array(vertexCount).fill(null);
  const heap = new MinHeap();
  const history = [];
  const countsByDay = [];

  const uniqueInitial = new Set();
  while (uniqueInitial.size < Math.min(initialInfected, vertexCount)) {
    const v = Math.floor(random() * vertexCount);
    if (uniqueInitial.has(v)) continue;
    uniqueInitial.add(v);
    infectionTime[v] = 0;
    infectedBy[v] = -1;
    heap.push({ day: 0, action: "T", vertex: v, source: -1 });
  }

  for (let day = 0; day < maxDays; day++) {
    while (heap.size > 0 && heap.peek().day === day) {
      const event = heap.pop();

      if (event.action === "T") {
        if (state[event.vertex] !== "S") continue;
        state[event.vertex] = "I";
        infectedBy[event.vertex] = event.source;

        const recDay = day + geometricDays(recoveryProbability, random);
        if (recDay < maxDays) {
          heap.push({ day: recDay, action: "R", vertex: event.vertex });
        }

        for (const neighbor of adjacency[event.vertex]) {
          if (state[neighbor] !== "S") continue;
          const infDay = day + geometricDays(transmissionProbability, random);
          if (infDay < recDay && infDay < infectionTime[neighbor]) {
            infectionTime[neighbor] = infDay;
            heap.push({
              day: infDay,
              action: "T",
              vertex: neighbor,
              source: event.vertex,
            });
          }
        }
      } else {
        if (state[event.vertex] === "I") {
          state[event.vertex] = "R";
        }
      }
    }

    let susceptible = 0;
    let infected = 0;
    let recovered = 0;
    for (const s of state) {
      if (s === "S") susceptible++;
      else if (s === "I") infected++;
      else recovered++;
    }

    history.push([...state]);
    countsByDay.push({ day, susceptible, infected, recovered });
  }

  // Compute R0 estimate: average secondary infections per initially-infected node
  const secondaryCounts = new Map();
  for (let v = 0; v < vertexCount; v++) {
    if (infectedBy[v] !== null && infectedBy[v] !== -1) {
      secondaryCounts.set(
        infectedBy[v],
        (secondaryCounts.get(infectedBy[v]) || 0) + 1
      );
    }
  }
  const infectedNodes = [];
  for (let v = 0; v < vertexCount; v++) {
    if (infectedBy[v] !== null) {
      infectedNodes.push(v);
    }
  }
  let r0Estimate = 0;
  if (infectedNodes.length > 0) {
    let totalSecondary = 0;
    for (const v of infectedNodes) {
      totalSecondary += secondaryCounts.get(v) || 0;
    }
    r0Estimate = totalSecondary / infectedNodes.length;
  }

  // Peak infection stats
  let peakDay = 0;
  let peakInfected = 0;
  for (const row of countsByDay) {
    if (row.infected > peakInfected) {
      peakInfected = row.infected;
      peakDay = row.day;
    }
  }

  return {
    history,
    countsByDay,
    edges,
    adjacency,
    infectedBy,
    stats: { r0Estimate, peakDay, peakInfected },
  };
}
