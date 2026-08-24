import type { ComponentType } from "react";

export type NodeId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";

export interface GraphNode {
  id: NodeId;
  x: number;
  y: number;
  features: [number, number];
  split: "train" | "unseen";
}

export interface GraphEdge {
  source: NodeId;
  target: NodeId;
}

export interface SceneDefinition {
  id: string;
  kicker: string;
  title: string;
  component: ComponentType;
}
