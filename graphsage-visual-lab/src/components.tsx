import type { ReactNode } from "react";
import { allEdges, nodeById, nodes, sampleNeighbors } from "./data";
import type { GraphEdge, NodeId } from "./types";
import { Math as TeX } from "./Math";

interface GraphViewProps {
  selected?: NodeId;
  showUnseen?: boolean;
  activeNodes?: NodeId[];
  sampledEdges?: GraphEdge[];
  pulse?: boolean;
  compact?: boolean;
  onSelect?: (id: NodeId) => void;
}

export function GraphView({
  selected = "A",
  showUnseen = true,
  activeNodes = [],
  sampledEdges = [],
  pulse = false,
  compact = false,
  onSelect,
}: GraphViewProps) {
  const visibleNodes = nodes.filter((node) => showUnseen || node.split === "train");
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const isSampledEdge = (source: NodeId, target: NodeId) => sampledEdges.some(
    (edge) => (edge.source === source && edge.target === target) || (edge.source === target && edge.target === source),
  );

  return (
    <svg className="sage-graph-svg" viewBox="0 0 680 430" role="img" aria-label="GraphSAGE example graph">
      {allEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)).map((edge) => {
        const source = nodeById(edge.source);
        const target = nodeById(edge.target);
        const sampled = isSampledEdge(edge.source, edge.target);
        return (
          <g key={`${edge.source}-${edge.target}`}>
            <line
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              className={`sage-edge ${sampled ? "is-sampled" : ""} ${source.split === "unseen" || target.split === "unseen" ? "is-new" : ""}`}
            />
            {pulse && sampled && (
              <circle r="5" className="message-dot">
                <animateMotion dur="1.2s" repeatCount="indefinite" path={`M ${target.x} ${target.y} L ${source.x} ${source.y}`} />
              </circle>
            )}
          </g>
        );
      })}
      {visibleNodes.map((node) => {
        const active = node.id === selected || activeNodes.includes(node.id);
        return (
          <g
            key={node.id}
            className={`sage-node ${node.id === selected ? "is-selected" : ""} ${active ? "is-active" : ""} ${node.split === "unseen" ? "is-unseen" : ""}`}
            role={onSelect ? "button" : undefined}
            aria-label={onSelect ? `Select node ${node.id}` : undefined}
            onClick={() => onSelect?.(node.id)}
          >
            <circle cx={node.x} cy={node.y} r={compact ? 23 : 28} />
            <text x={node.x} y={node.y + 1}>{node.id}</text>
            {!compact && <text className="sage-feature" x={node.x} y={node.y + 45}>[{node.features.map((value) => value.toFixed(1)).join(", ")}]</text>}
            {node.split === "unseen" && <text className="new-label" x={node.x} y={node.y - 40}>new</text>}
          </g>
        );
      })}
    </svg>
  );
}

export function ComputationTree({ root, fanout, depth = 2 }: { root: NodeId; fanout: number; depth?: number }) {
  const first = sampleNeighbors(root, fanout);
  const second = depth > 1 ? first.flatMap((parent) => sampleNeighbors(parent, fanout).map((child) => ({ parent, child }))) : [];
  const firstPositions = first.map((id, index) => ({ id, x: 100 + ((index + 1) * 420) / (first.length + 1), y: 160 }));
  const secondPositions = second.map((item, index) => ({ ...item, x: 55 + ((index + 1) * 510) / (second.length + 1), y: 280 }));
  return (
    <svg className="tree-svg" viewBox="0 0 620 340" role="img" aria-label={`Sampled computation tree for node ${root}`}>
      {firstPositions.map((item) => <line key={`r-${item.id}`} x1="310" y1="65" x2={item.x} y2={item.y} />)}
      {secondPositions.map((item, index) => {
        const parent = firstPositions.find((candidate) => candidate.id === item.parent)!;
        return <line key={`s-${item.parent}-${item.child}-${index}`} x1={parent.x} y1={parent.y} x2={item.x} y2={item.y} />;
      })}
      <TreeNode id={root} x={310} y={65} role="target" />
      {firstPositions.map((item) => <TreeNode key={`n1-${item.id}`} id={item.id} x={item.x} y={item.y} role="sampled" />)}
      {secondPositions.map((item, index) => <TreeNode key={`n2-${item.parent}-${item.child}-${index}`} id={item.child} x={item.x} y={item.y} role="leaf" />)}
      <text className="tree-depth" x="18" y="70">target</text>
      <text className="tree-depth" x="18" y="165">1-hop</text>
      {depth > 1 && <text className="tree-depth" x="18" y="285">2-hop</text>}
    </svg>
  );
}

function TreeNode({ id, x, y, role }: { id: NodeId; x: number; y: number; role: "target" | "sampled" | "leaf" }) {
  return (
    <g className={`tree-node ${role}`}>
      <circle cx={x} cy={y} r={role === "target" ? 27 : 23} />
      <text x={x} y={y + 1}>{id}</text>
    </g>
  );
}

export function Vector({ values, label, accent = false }: { values: number[]; label?: string; accent?: boolean }) {
  return (
    <span className={`vector ${accent ? "vector-accent" : ""}`}>
      {label && <em>{label}</em>}
      <span>[{values.map((value) => value.toFixed(value >= 1 ? 1 : 2)).join(", ")}]</span>
    </span>
  );
}

export function Formula({ children, accent = false, tex }: { children?: ReactNode; accent?: boolean; tex?: string }) {
  return <div className={`formula ${accent ? "formula-accent" : ""}`}>{tex ? <TeX tex={tex} display /> : children}</div>;
}

export function SampleLegend() {
  return (
    <div className="sample-legend">
      <span><i className="legend-target" />target</span>
      <span><i className="legend-sampled" />sampled</span>
      <span><i className="legend-new" />unseen at training</span>
    </div>
  );
}
