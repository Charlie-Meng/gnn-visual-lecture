# GAT Visual Lab

An interactive, English-language teaching companion for the Graph Attention Networks section of the neural-network presentation project.

## Scenes

1. Brief QKV attention primer
2. Transformer attention versus original GAT scoring
3. Graph-masked attention neighborhood
4. Edge scores and normalized coefficients
5. Numerical weighted aggregation
6. Hidden and output multi-head behavior
7. Citation-network and PPI evidence
8. Features, computational pressure, and limitations

## Run

```bash
npm install
npm run dev -- --port 4175
```

Use `?scene=<id>&clean=1` to render a presentation-ready state without navigation controls.
