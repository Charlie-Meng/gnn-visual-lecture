import type { CSSProperties, ReactNode } from "react";
import { edges, nodeById, nodeIds, nodes } from "./data";
import type { Matrix, NodeId } from "./types";
import { Math as TeX } from "./Math";

interface GraphProps {
  selected?: NodeId;
  hop?: number;
  pulse?: boolean;
  selfLoops?: boolean;
  values?: number[][];
  probabilities?: number[][];
  onSelect?: (id: NodeId) => void;
  compact?: boolean;
  heterophily?: boolean;
}

export function GraphView({
  selected = "A",
  hop = 0,
  pulse = false,
  selfLoops = false,
  values,
  probabilities,
  onSelect,
  compact = false,
  heterophily = false,
}: GraphProps) {
  const distances = new Map<NodeId, number>();
  const queue: Array<[NodeId, number]> = [[selected, 0]];
  while (queue.length) {
    const [current, distance] = queue.shift()!;
    if (distances.has(current)) continue;
    distances.set(current, distance);
    edges.forEach((edge) => {
      if (edge.source === current) queue.push([edge.target, distance + 1]);
      if (edge.target === current) queue.push([edge.source, distance + 1]);
    });
  }
  const extraEdges = heterophily
    ? [["B", "G"], ["C", "D"], ["F", "E"]] as Array<[NodeId, NodeId]>
    : [];
  const allEdges = [...edges.map((edge) => [edge.source, edge.target] as [NodeId, NodeId]), ...extraEdges];
  return (
    <svg className="graph-svg" viewBox="0 0 660 420" role="img" aria-label="Seven-node graph">
      {allEdges.map(([sourceId, targetId], index) => {
        const source = nodeById(sourceId);
        const target = nodeById(targetId);
        const active =
          hop > 0 &&
          ((sourceId === selected && (distances.get(targetId) ?? 99) <= hop) ||
            (targetId === selected && (distances.get(sourceId) ?? 99) <= hop) ||
            ((distances.get(sourceId) ?? 99) < hop && (distances.get(targetId) ?? 99) <= hop));
        return (
          <g key={`${sourceId}-${targetId}-${index}`}>
            <line
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              className={`graph-edge ${active ? "is-active" : ""} ${index >= edges.length ? "is-hetero" : ""}`}
            />
            {pulse && active && (
              <circle r="5" className="message-dot">
                <animateMotion dur="1.25s" repeatCount="indefinite" path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`} />
              </circle>
            )}
          </g>
        );
      })}
      {selfLoops && nodes.map((node) => (
        <circle key={`loop-${node.id}`} cx={node.x + 22} cy={node.y - 22} r="18" className="self-loop" />
      ))}
      {nodes.map((node, index) => {
        const distance = distances.get(node.id) ?? 99;
        const active = node.id === selected || (hop > 0 && distance <= hop);
        const predicted = probabilities?.[index];
        const style = values
          ? ({ "--node-mix": Math.max(0, Math.min(1, values[index][1])) } as CSSProperties)
          : undefined;
        return (
          <g
            key={node.id}
            className={`graph-node ${node.id === selected ? "is-selected" : ""} ${active ? "is-active" : ""}`}
            onClick={() => onSelect?.(node.id)}
            role={onSelect ? "button" : undefined}
            aria-label={onSelect ? `Select node ${node.id}` : undefined}
          >
            <circle cx={node.x} cy={node.y} r={compact ? 24 : 29} style={style} />
            {predicted && (
              <>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={compact ? 27 : 33}
                  className={predicted[1] > predicted[0] ? "prediction-ring class-one" : "prediction-ring class-zero"}
                />
                <rect
                  x={node.x - 12}
                  y={node.y + (compact ? 34 : 42)}
                  width="24"
                  height="4"
                  rx="2"
                  className={node.labeled ? "label-mark is-labeled" : "label-mark"}
                />
              </>
            )}
            <text x={node.x} y={node.y + 1}>{node.id}</text>
            {!compact && (
              <text className="node-feature" x={node.x} y={node.y + 49}>
                [{(values?.[index] ?? node.features).map((value) => value.toFixed(1)).join(", ")}]
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

interface MatrixProps {
  values: Matrix;
  rowLabels?: string[];
  columnLabels?: string[];
  activeRow?: number;
  activeCells?: Array<[number, number]>;
  format?: (value: number) => string;
  title?: string;
}

export function MatrixGrid({
  values,
  rowLabels = nodeIds,
  columnLabels = nodeIds,
  activeRow,
  activeCells = [],
  format = (value) => value.toFixed(value % 1 === 0 ? 0 : 2),
  title,
}: MatrixProps) {
  return (
    <div className="matrix-wrap">
      {title && <div className="matrix-title">{title}</div>}
      <div
        className="matrix-grid"
        style={{ "--cols": values[0].length + 1 } as CSSProperties}
      >
        <span />
        {columnLabels.map((label) => <b key={`c-${label}`}>{label}</b>)}
        {values.flatMap((row, rowIndex) => [
          <b key={`r-${rowIndex}`}>{rowLabels[rowIndex] ?? rowIndex + 1}</b>,
          ...row.map((value, columnIndex) => {
            const cellActive = activeCells.some(([r, c]) => r === rowIndex && c === columnIndex);
            return (
              <span
                key={`${rowIndex}-${columnIndex}`}
                className={`${activeRow === rowIndex ? "active-row" : ""} ${cellActive ? "active-cell" : ""} ${value !== 0 ? "has-value" : ""}`}
              >
                {format(value)}
              </span>
            );
          }),
        ])}
      </div>
    </div>
  );
}

export function Formula({ children, accent, tex }: { children?: ReactNode; accent?: boolean; tex?: string }) {
  return <div className={`formula ${accent ? "formula-accent" : ""}`}>{tex ? <TeX tex={tex} display /> : children}</div>;
}

export function Vector({ values, label }: { values: number[]; label?: string }) {
  return (
    <span className="vector">
      {label && <em>{label}</em>}
      <span>[{values.map((value) => value.toFixed(2)).join(", ")}]</span>
    </span>
  );
}
