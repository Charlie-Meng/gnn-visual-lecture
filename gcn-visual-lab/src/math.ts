import {
  add,
  diag,
  eigs,
  identity,
  multiply,
  subtract,
  transpose,
} from "mathjs";
import { edges, nodeIds, nodes } from "./data";
import type { Matrix, NodeId } from "./types";

export const round = (value: number, digits = 2) => {
  const power = 10 ** digits;
  return Math.round(value * power) / power;
};

export function adjacency(includeSelf = false): Matrix {
  const matrix = nodeIds.map(() => nodeIds.map(() => 0));
  edges.forEach(({ source, target }) => {
    const i = nodeIds.indexOf(source);
    const j = nodeIds.indexOf(target);
    matrix[i][j] = 1;
    matrix[j][i] = 1;
  });
  if (includeSelf) matrix.forEach((row, i) => (row[i] = 1));
  return matrix;
}

export function normalizedAdjacency(): Matrix {
  const a = adjacency(true);
  const degree = a.map((row) => row.reduce((sum, value) => sum + value, 0));
  return a.map((row, i) =>
    row.map((value, j) => value / Math.sqrt(degree[i] * degree[j])),
  );
}

export function neighbors(id: NodeId): NodeId[] {
  return edges.flatMap((edge) => {
    if (edge.source === id) return [edge.target];
    if (edge.target === id) return [edge.source];
    return [];
  });
}

export function hopDistance(start: NodeId): Record<NodeId, number> {
  const distances = Object.fromEntries(nodeIds.map((id) => [id, Infinity])) as Record<NodeId, number>;
  distances[start] = 0;
  const queue: NodeId[] = [start];
  while (queue.length) {
    const current = queue.shift()!;
    neighbors(current).forEach((next) => {
      if (distances[next] === Infinity) {
        distances[next] = distances[current] + 1;
        queue.push(next);
      }
    });
  }
  return distances;
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix {
  return (multiply(a, b) as { toArray?: () => Matrix }).toArray?.() ?? (multiply(a, b) as Matrix);
}

export function relu(matrix: Matrix): Matrix {
  return matrix.map((row) => row.map((value) => Math.max(0, value)));
}

export function softmax(row: number[]): number[] {
  const max = Math.max(...row);
  const exps = row.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / total);
}

export const featureMatrix: Matrix = nodes.map((node) => [...node.features]);

export const hiddenWeight: Matrix = [
  [1.15, -0.25],
  [-0.15, 1.1],
];

export const outputWeight: Matrix = [
  [1.2, -0.6],
  [-0.6, 1.2],
];

export function gcnForward() {
  const aHat = normalizedAdjacency();
  const aggregated = multiplyMatrices(aHat, featureMatrix);
  const hidden = relu(multiplyMatrices(aggregated, hiddenWeight));
  const secondAggregate = multiplyMatrices(aHat, hidden);
  const logits = multiplyMatrices(secondAggregate, outputWeight);
  const probabilities = logits.map(softmax);
  return { aHat, aggregated, hidden, logits, probabilities };
}

export function propagateFeatures(layers: number, heterophily = false): Matrix {
  let features = featureMatrix.map((row) => [...row]);
  let operator = normalizedAdjacency();
  if (heterophily) {
    const a = adjacency(true).map((row) => [...row]);
    const pairs: [NodeId, NodeId][] = [["B", "G"], ["C", "D"], ["F", "E"]];
    pairs.forEach(([left, right]) => {
      const i = nodeIds.indexOf(left);
      const j = nodeIds.indexOf(right);
      a[i][j] = 1;
      a[j][i] = 1;
    });
    const degree = a.map((row) => row.reduce((sum, value) => sum + value, 0));
    operator = a.map((row, i) => row.map((value, j) => value / Math.sqrt(degree[i] * degree[j])));
  }
  for (let layer = 0; layer < layers; layer += 1) {
    features = multiplyMatrices(operator, features);
  }
  return features;
}

export interface Spectrum {
  eigenvalues: number[];
  eigenvectors: Matrix;
  coefficients: number[];
  filteredCoefficients: number[];
  reconstructed: number[];
}

export function pathGraphSpectrum(cutoff: number): Spectrum {
  const a: Matrix = [
    [0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 1],
    [0, 0, 0, 1, 0],
  ];
  const degree = a.map((row) => row.reduce((sum, value) => sum + value, 0));
  const dInv = diag(degree.map((value) => 1 / Math.sqrt(value))) as unknown as Matrix;
  const laplacian = subtract(identity(5), multiply(multiply(dInv, a), dInv)) as unknown as Matrix;
  const result = eigs(laplacian) as unknown as { values: number[]; eigenvectors: Array<{ value: number; vector: number[] }> };
  const ordered = result.eigenvectors
    .map((entry) => ({ value: Number(entry.value), vector: entry.vector.map(Number) }))
    .sort((left, right) => left.value - right.value);
  const eigenvalues = ordered.map((entry) => entry.value);
  const eigenvectors = transpose(ordered.map((entry) => entry.vector)) as unknown as Matrix;
  const signal = [1, 0.85, -0.35, -0.8, -1];
  const coefficients = multiply(transpose(eigenvectors), signal) as unknown as number[];
  const gains = eigenvalues.map((value) => Math.exp(-cutoff * value));
  const filteredCoefficients = coefficients.map((value, index) => value * gains[index]);
  const reconstructed = multiply(eigenvectors, filteredCoefficients) as unknown as number[];
  return {
    eigenvalues,
    eigenvectors,
    coefficients: coefficients.map(Number),
    filteredCoefficients,
    reconstructed: reconstructed.map(Number),
  };
}

export function convolutionAt(step: number) {
  const grid = [
    [1, 1, 0, 0, 0],
    [1, 1, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1],
  ];
  const k = [
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1],
  ];
  const row = Math.floor(step / 3);
  const col = step % 3;
  let sum = 0;
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 3; x += 1) sum += grid[row + y][col + x] * k[y][x];
  }
  return { row, col, sum };
}

export const matrixAddIdentity = (matrix: Matrix): Matrix => {
  const result = add(matrix, identity(matrix.length)) as unknown as { toArray?: () => Matrix };
  return result.toArray?.() ?? (result as unknown as Matrix);
};
