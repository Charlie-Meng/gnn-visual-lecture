export const round = (value: number, digits = 2) => Number(value.toFixed(digits));

export function mean(vectors: number[][]): number[] {
  if (!vectors.length) return [];
  return vectors[0].map((_, index) => round(vectors.reduce((sum, vector) => sum + vector[index], 0) / vectors.length));
}

export function matVec(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) => round(row.reduce((sum, value, index) => sum + value * vector[index], 0), 3));
}

export function normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return vector.map((value) => round(value / norm, 3));
}
