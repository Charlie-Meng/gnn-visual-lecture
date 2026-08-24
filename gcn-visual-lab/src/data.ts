import type { GraphEdge, GraphNode, Matrix, NodeId } from "./types";

export const nodes: GraphNode[] = [
  { id: "A", x: 330, y: 210, features: [0.7, 0.3], label: 0, labeled: false },
  { id: "B", x: 190, y: 115, features: [1.0, 0.1], label: 0, labeled: true },
  { id: "C", x: 470, y: 110, features: [0.85, 0.2], label: 0, labeled: false },
  { id: "D", x: 205, y: 320, features: [0.2, 0.9], label: 1, labeled: true },
  { id: "E", x: 470, y: 315, features: [0.1, 1.0], label: 1, labeled: false },
  { id: "F", x: 70, y: 70, features: [0.95, 0.05], label: 0, labeled: true },
  { id: "G", x: 595, y: 365, features: [0.05, 0.95], label: 1, labeled: true },
];

export const edges: GraphEdge[] = [
  { source: "A", target: "B" },
  { source: "A", target: "C" },
  { source: "A", target: "D" },
  { source: "A", target: "E" },
  { source: "B", target: "C" },
  { source: "B", target: "F" },
  { source: "D", target: "E" },
  { source: "E", target: "G" },
];

export const nodeIds = nodes.map((node) => node.id);

export const imageGrid: Matrix = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 1, 0],
  [0, 0, 1, 1, 0],
  [0, 1, 1, 0, 0],
  [0, 0, 0, 0, 1],
];

export const kernel: Matrix = [
  [1, 0, -1],
  [1, 0, -1],
  [1, 0, -1],
];

export const nodeById = (id: NodeId) => nodes.find((node) => node.id === id)!;
