import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";

/**
 * Compute a force-directed layout synchronously.
 * Returns an array of { x, y } positions indexed by vertex id.
 */
export function computeLayout(vertexCount, edges, width, height) {
  const nodes = Array.from({ length: vertexCount }, (_, i) => ({
    id: i,
    x: width / 2 + (Math.random() - 0.5) * width * 0.6,
    y: height / 2 + (Math.random() - 0.5) * height * 0.6,
  }));

  const links = edges.map(([source, target]) => ({ source, target }));

  const sim = forceSimulation(nodes)
    .force(
      "link",
      forceLink(links)
        .id((d) => d.id)
        .distance(30)
        .strength(0.8)
    )
    .force("charge", forceManyBody().strength(-60).distanceMax(200))
    .force("center", forceCenter(width / 2, height / 2))
    .force("collide", forceCollide(6))
    .stop();

  const iterations = 300;
  for (let i = 0; i < iterations; i++) {
    sim.tick();
  }

  const pad = 30;
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  return nodes.map((n) => ({
    x: pad + ((n.x - minX) / rangeX) * (width - 2 * pad),
    y: pad + ((n.y - minY) / rangeY) * (height - 2 * pad),
  }));
}
