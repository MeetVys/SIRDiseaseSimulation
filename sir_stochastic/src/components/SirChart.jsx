import { useMemo } from "react";

const CHART_W = 680;
const CHART_H = 160;
const PAD = { top: 20, right: 20, bottom: 30, left: 45 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

const COLORS = { susceptible: "#3b82f6", infected: "#ef4444", recovered: "#22c55e" };

function buildPath(data, key, maxDay, maxPop) {
  if (data.length === 0) return "";
  return data
    .map((row) => {
      const x = (row.day / Math.max(1, maxDay)) * INNER_W;
      const y = INNER_H - (row[key] / Math.max(1, maxPop)) * INNER_H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function SirChart({ countsByDay, currentDay, maxPopulation }) {
  const maxDay = countsByDay.length > 0 ? countsByDay[countsByDay.length - 1].day : 1;

  const paths = useMemo(
    () => ({
      susceptible: buildPath(countsByDay, "susceptible", maxDay, maxPopulation),
      infected: buildPath(countsByDay, "infected", maxDay, maxPopulation),
      recovered: buildPath(countsByDay, "recovered", maxDay, maxPopulation),
    }),
    [countsByDay, maxDay, maxPopulation]
  );

  const dayX = (currentDay / Math.max(1, maxDay)) * INNER_W;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xTickCount = 5;
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) =>
    Math.round((maxDay * i) / xTickCount)
  );

  return (
    <svg
      width={CHART_W}
      height={CHART_H}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="sir-chart"
    >
      <rect width={CHART_W} height={CHART_H} fill="#fafbfc" rx="8" />

      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Grid lines */}
        {yTicks.map((t) => {
          const y = INNER_H - t * INNER_H;
          return (
            <g key={`y-${t}`}>
              <line x1={0} y1={y} x2={INNER_W} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={-8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                {Math.round(t * maxPopulation)}
              </text>
            </g>
          );
        })}

        {xTicks.map((d) => {
          const x = (d / Math.max(1, maxDay)) * INNER_W;
          return (
            <text
              key={`x-${d}`}
              x={x}
              y={INNER_H + 16}
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
            >
              {d}
            </text>
          );
        })}

        {/* S/I/R lines */}
        {Object.entries(COLORS).map(([key, color]) => (
          <polyline
            key={key}
            points={paths[key]}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ))}

        {/* Day marker */}
        <line
          x1={dayX}
          y1={0}
          x2={dayX}
          y2={INNER_H}
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text x={dayX} y={-6} textAnchor="middle" fontSize="10" fill="#334155" fontWeight="600">
          Day {currentDay}
        </text>
      </g>

      {/* Legend */}
      <g transform={`translate(${PAD.left + 10}, ${PAD.top + 8})`}>
        {[
          { label: "Susceptible", color: COLORS.susceptible },
          { label: "Infected", color: COLORS.infected },
          { label: "Recovered", color: COLORS.recovered },
        ].map((item, i) => (
          <g key={item.label} transform={`translate(${i * 95}, 0)`}>
            <rect width="10" height="10" rx="2" fill={item.color} />
            <text x="14" y="9" fontSize="10" fill="#475569">
              {item.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
