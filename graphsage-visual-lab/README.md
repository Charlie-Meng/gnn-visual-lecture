# GraphSAGE Visual Lab

An interactive, slide-oriented visualization of inductive representation learning with GraphSAGE.

## Run locally

```bash
npm install
npm run dev -- --port 4174
```

Open `http://localhost:4174/`.

## Scenes

1. Transductive versus inductive learning
2. The arrival of an unseen node
3. Fixed fan-out neighborhood sampling
4. A numerical sample-aggregate-concatenate-transform-normalize example
5. Mean, LSTM, and pooling aggregators
6. Predictable mini-batch work under fixed fan-out
7. Sampling, ordering, depth, and model comparison trade-offs

Use `?scene=<id>` to open a scene directly and `&clean=1` to hide navigation controls for slide capture.

## Verification

```bash
npm run build
npm audit --audit-level=high
```
