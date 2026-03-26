import { useMemo } from "react";

const COLORS = { S: "#3b82f6", I: "#ef4444", R: "#22c55e" };

export default function NetworkGraph({
  width,
  height,
  positions,
  edges,
  currentState,
  selectedNode,
  neighborIds,
  onSelectNode,
}) {
  const hasSelection = selectedNode !== null;

  const edgeElements = useMemo(() => {
    const selectedEdgeSet = new Set();
    if (hasSelection) {
      for (const [a, b] of edges) {
        if (a === selectedNode || b === selectedNode) {
          selectedEdgeSet.add(`${a}:${b}`);
        }
      }
    }

    return edges.map(([a, b], idx) => {
      const pa = positions[a];
      const pb = positions[b];
      if (!pa || !pb) return null;

      const key = `${a}:${b}`;
      const isHighlighted = selectedEdgeSet.has(key);
      if (hasSelection && !isHighlighted) {
        return (
          <line
            key={idx}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke="#e2e8f0"
            strokeWidth="0.5"
          />
        );
      }

      return (
        <line
          key={idx}
          x1={pa.x}
          y1={pa.y}
          x2={pb.x}
          y2={pb.y}
          stroke={isHighlighted ? "#f59e0b" : "#cbd5e1"}
          strokeWidth={isHighlighted ? 2 : 0.8}
          opacity={isHighlighted ? 0.9 : 0.5}
        />
      );
    });
  }, [edges, positions, selectedNode, hasSelection]);

  function nodeColor(id) {
    if (!hasSelection) return COLORS[currentState[id]] || COLORS.S;
    if (id === selectedNode) return "#f59e0b";
    if (neighborIds.has(id)) return COLORS[currentState[id]] || COLORS.S;
    return "#cbd5e1";
  }

  function nodeRadius(id) {
    if (!hasSelection) return 4.5;
    if (id === selectedNode) return 8;
    if (neighborIds.has(id)) return 5.5;
    return 3;
  }

  function nodeOpacity(id) {
    if (!hasSelection) return 0.9;
    if (id === selectedNode || neighborIds.has(id)) return 1;
    return 0.3;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="network-svg"
    >
      <rect width={width} height={height} fill="#fafbfc" rx="8" />
      <g>{edgeElements}</g>
      <g>
        {positions.map((pos, id) => (
          <circle
            key={id}
            cx={pos.x}
            cy={pos.y}
            r={nodeRadius(id)}
            fill={nodeColor(id)}
            opacity={nodeOpacity(id)}
            stroke={id === selectedNode ? "#b45309" : "none"}
            strokeWidth={id === selectedNode ? 2.5 : 0}
            cursor="pointer"
            onClick={() => onSelectNode(id)}
          >
            <title>
              Node {id} ({currentState[id]})
            </title>
          </circle>
        ))}
      </g>
    </svg>
  );
}
