import type { GraphEdge, GraphNode, NodeId } from "./types";

export const nodes: GraphNode[] = [
  { id: "A", x: 330, y: 205, features: [0.6, 0.4], split: "train" },
  { id: "B", x: 190, y: 115, features: [0.9, 0.1], split: "train" },
  { id: "C", x: 475, y: 105, features: [0.8, 0.2], split: "train" },
  { id: "D", x: 190, y: 315, features: [0.2, 0.8], split: "train" },
  { id: "E", x: 475, y: 310, features: [0.1, 0.9], split: "train" },
  { id: "F", x: 65, y: 65, features: [1.0, 0.0], split: "train" },
  { id: "G", x: 605, y: 365, features: [0.0, 1.0], split: "train" },
  { id: "H", x: 610, y: 155, features: [0.55, 0.45], split: "unseen" },
  { id: "I", x: 330, y: 385, features: [0.3, 0.7], split: "unseen" },
];

export const trainEdges: GraphEdge[] = [
  { source: "A", target: "B" },
  { source: "A", target: "C" },
  { source: "A", target: "D" },
  { source: "A", target: "E" },
  { source: "B", target: "C" },
  { source: "B", target: "F" },
  { source: "D", target: "E" },
  { source: "E", target: "G" },
];

export const unseenEdges: GraphEdge[] = [
  { source: "H", target: "B" },
  { source: "H", target: "E" },
  { source: "H", target: "I" },
  { source: "I", target: "D" },
  { source: "I", target: "G" },
];

export const allEdges = [...trainEdges, ...unseenEdges];
export const nodeById = (id: NodeId) => nodes.find((node) => node.id === id)!;

export function neighbors(id: NodeId, includeUnseen = true): NodeId[] {
  const edges = includeUnseen ? allEdges : trainEdges;
  return edges.flatMap((edge) => {
    if (edge.source === id) return [edge.target];
    if (edge.target === id) return [edge.source];
    return [];
  });
}

export const samplePriority: Record<NodeId, NodeId[]> = {
  A: ["B", "D", "C", "E"],
  B: ["A", "F", "C", "H"],
  C: ["A", "B"],
  D: ["A", "G", "E", "I"],
  E: ["A", "G", "D", "H"],
  F: ["B"],
  G: ["E", "I"],
  H: ["B", "E", "I"],
  I: ["D", "G", "H"],
};

export function sampleNeighbors(id: NodeId, fanout: number): NodeId[] {
  const available = new Set(neighbors(id));
  return samplePriority[id].filter((candidate) => available.has(candidate)).slice(0, fanout);
}
