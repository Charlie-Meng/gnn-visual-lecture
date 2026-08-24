export type NodeId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface GraphNode {
  id: NodeId;
  x: number;
  y: number;
  features: [number, number];
  label: 0 | 1;
  labeled: boolean;
}

export interface GraphEdge {
  source: NodeId;
  target: NodeId;
}

export type Matrix = number[][];
