export type LiveScene = {
  src: string;
  model: "GCN" | "GraphSAGE" | "GAT";
  accent: string;
  label: string;
};

export type SlideDefinition = {
  title: string;
  section: string;
  live?: LiveScene;
};

const gcn = (scene: string, label: string): LiveScene => ({
  src: `./labs/gcn/embedded/?scene=${scene}&clean=1`,
  model: "GCN",
  accent: "#244b67",
  label,
});

const sage = (scene: string, label: string): LiveScene => ({
  src: `./labs/graphsage/embedded/?scene=${scene}&clean=1`,
  model: "GraphSAGE",
  accent: "#e46445",
  label,
});

const gat = (scene: string, label: string): LiveScene => ({
  src: `./labs/gat/embedded/?scene=${scene}&clean=1`,
  model: "GAT",
  accent: "#087e72",
  label,
});

export const SLIDES: SlideDefinition[] = [
  { title: "Three answers to one message-passing question", section: "Opening" },
  { title: "One template, three aggregation decisions", section: "Opening" },
  { title: "A graph is structure plus signals", section: "Graph basics", live: gcn("graph", "Explore graph structure") },
  { title: "Graph distance is counted in hops", section: "Graph basics" },
  { title: "A CNN reuses one kernel over a fixed grid", section: "Convolution", live: gcn("kernel", "Slide the convolution kernel") },
  { title: "Graphs have no fixed spatial neighborhood", section: "Why graphs are different" },
  { title: "GNNs share one primitive: message passing", section: "Message passing", live: gcn("message", "Trace message passing") },
  { title: "The local rule is also a matrix operation", section: "Message passing" },
  { title: "Stacking layers expands the receptive field", section: "Message passing" },
  { title: "How can a graph use a convolution-like operator?", section: "Part I / GCN" },
  { title: "Graph Fourier bases make convolution possible", section: "Spectral convolution", live: gcn("spectral", "Explore spectral convolution") },
  { title: "Exact spectral filters depend on the whole graph", section: "Spectral convolution" },
  { title: "Chebyshev filters localize convolution to K hops", section: "Spectral convolution" },
  { title: "GCN keeps only a first-order local filter", section: "From spectrum to GCN" },
  { title: "Self-loops and normalization stabilize propagation", section: "GCN layer" },
  { title: "One row of A-hat is a weighted neighborhood", section: "GCN layer" },
  { title: "A GCN layer = propagate, transform, activate", section: "GCN layer", live: gcn("layer", "Run a complete GCN layer") },
  { title: "Sparse labels can supervise the whole graph", section: "Node classification", live: gcn("classification", "Run node classification") },
  { title: "Citations add signal beyond document words", section: "Paper evidence" },
  { title: "One propagation rule improved accuracy and speed", section: "Paper evidence" },
  { title: "Repeated averaging exposes GCN's limits", section: "GCN limitations", live: gcn("limits", "Stress-test GCN depth") },
  { title: "What if the node or graph did not exist during training?", section: "Part II / GraphSAGE" },
  { title: "The original GCN setup leaves a deployment gap", section: "From GCN to GraphSAGE" },
  { title: "Transductive and inductive learning differ", section: "Learning setting", live: sage("setting", "Compare learning settings") },
  { title: "A new node breaks a fixed embedding table", section: "The new problem", live: sage("unseen", "Introduce an unseen node") },
  { title: "Inductive inference needs three reusable inputs", section: "The solution shape" },
  { title: "Graph SAmple and aggreGatE", section: "The name is the algorithm" },
  { title: "One forward pass repeats five operations", section: "GraphSAGE algorithm" },
  { title: "Sampling builds a bounded computation graph", section: "Graph sample", live: sage("sample", "Change fan-out and depth") },
  { title: "The same sampler works for an unseen target", section: "Inductive reuse" },
  { title: "One sampled neighborhood becomes one vector", section: "Numerical example", live: sage("algorithm", "Build an embedding step by step") },
  { title: "Concatenation preserves self information", section: "Numerical example" },
  { title: "Fixed fan-out makes mini-batch work predictable", section: "Large graphs", live: sage("scaling", "Explore fan-out scaling") },
  { title: "An aggregator receives an unordered set", section: "Aggregator choosing" },
  { title: "Mean is simple, symmetric, and parameter free", section: "Mean aggregator" },
  { title: "LSTM is expressive but order-sensitive", section: "LSTM aggregator" },
  { title: "Pooling learns features before taking a maximum", section: "Pooling aggregator" },
  { title: "Aggregator choice is a trade-off", section: "Aggregator comparison", live: sage("aggregators", "Compare three aggregators") },
  { title: "Every benchmark tests inductive generalization", section: "Paper evidence" },
  { title: "Trainable aggregators beat the GCN-like variant", section: "Paper evidence" },
  { title: "Inductive scale comes with approximation", section: "GraphSAGE limitations", live: sage("limits", "Stress-test GraphSAGE") },
  { title: "What if connected neighbors should not count equally?", section: "Part III / GAT" },
  { title: "Attention is selective aggregation", section: "Attention primer" },
  { title: "Q, K and V separate three roles", section: "Attention primer", live: gat("qkv", "Explore QKV attention") },
  { title: "GAT borrows attention, not Transformer QKV", section: "Conceptual bridge", live: gat("bridge", "Compare Transformer and GAT") },
  { title: "The graph is the attention mask", section: "Graph attention", live: gat("mask", "Toggle the graph mask") },
  { title: "One GAT head repeats four operations", section: "Single-head algorithm" },
  { title: "Same neighborhood, new weighting rule", section: "Running example" },
  { title: "Step 1: transform every eligible node", section: "Numerical example" },
  { title: "Step 2: score each eligible pair", section: "Numerical example" },
  { title: "Step 3: normalize inside the neighborhood", section: "Numerical example", live: gat("coefficients", "Transform, score, and normalize") },
  { title: "Step 4: aggregate the weighted messages", section: "Numerical example", live: gat("aggregate", "Aggregate weighted messages") },
  { title: "The complete layer fits into two equations", section: "Mathematical form" },
  { title: "Hidden heads are concatenated", section: "Multi-head attention", live: gat("multihead", "Compare multi-head outputs") },
  { title: "Prediction heads are averaged", section: "Multi-head attention" },
  { title: "The paper tests both learning settings", section: "Empirical design" },
  { title: "Citation networks: gains are selective", section: "Transductive evidence" },
  { title: "PPI: attention transfers to unseen graphs", section: "Inductive evidence", live: gat("evidence", "Explore empirical evidence") },
  { title: "What GAT adds to message passing", section: "GAT features" },
  { title: "Attention does not remove every GNN constraint", section: "GAT limitations", live: gat("limits", "Stress-test GAT") },
  { title: "Three models, one message-passing template", section: "Comparison" },
  { title: "The progression is in the aggregation rule", section: "Final synthesis" },
];

export const slideImage = (index: number) => `./slides/slide-${String(index + 1).padStart(2, "0")}.png`;
