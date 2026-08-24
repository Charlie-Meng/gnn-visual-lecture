# GCN Visual Lab

An interactive, slide-oriented visualization of the core ideas behind Graph Convolutional Networks.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The current development instance uses `http://localhost:4173/`.

## Scenes

1. Graph structure, adjacency matrices, and hop distance
2. CNN kernel sliding versus irregular graph neighborhoods
3. Message passing: collect, aggregate, and update
4. Spectral graph convolution: transform, filter, and reconstruct
5. The GCN layer: self-loops, degree normalization, aggregation, and transformation
6. Two-layer semi-supervised node classification
7. Oversmoothing, homophily assumptions, full-batch coupling, and fixed edge weights

Use `?scene=<id>` to open a scene directly and `&clean=1` to hide navigation controls for slide capture.

## Verification

```bash
npm run build
npm audit --audit-level=high
```
