import { DisplayMath, Math } from "./Math";

const T = String.raw;

type MathBlock = {
  label: string;
  tex: string;
  caption?: string;
  tone?: "navy" | "teal" | "coral" | "yellow";
};

type MathSlideSpec = {
  section: string;
  title: string;
  lead?: string;
  accent: "navy" | "teal" | "coral";
  layout?: "single" | "split" | "steps" | "grid" | "stack";
  blocks: MathBlock[];
  takeaway: string;
};

const MATH_SLIDES: Record<number, MathSlideSpec> = {
  3: {
    section: "01 / GRAPH BASICS", title: "A graph is structure plus signals", accent: "teal", layout: "grid",
    lead: "Topology and node data are separate mathematical objects.",
    blocks: [
      { label: "GRAPH", tex: T`G=(V,E)`, caption: "Nodes V and edges E define topology.", tone: "teal" },
      { label: "NODE FEATURES", tex: T`\mathbf{X}\in\mathbb{R}^{N\times F}`, caption: "Row i stores the F-dimensional feature vector of node i.", tone: "navy" },
      { label: "ADJACENCY", tex: T`\mathbf{A}\in\{0,1\}^{N\times N}`, caption: "An entry is one exactly when its two nodes share an edge.", tone: "coral" },
    ], takeaway: "A graph neural network combines a feature matrix with a relation structure."
  },
  4: {
    section: "01 / GRAPH BASICS", title: "Graph distance is counted in hops", accent: "teal", layout: "split",
    blocks: [
      { label: "ONE-HOP NEIGHBORHOOD", tex: T`\mathcal{N}_1(v)=\{u\in V:(u,v)\in E\}`, caption: "One edge is traversed.", tone: "teal" },
      { label: "TWO-HOP NEIGHBORHOOD", tex: T`\mathcal{N}_2(v)=\{u\in V:d_G(u,v)=2\}`, caption: "The shortest path contains two edges.", tone: "coral" },
    ], takeaway: "Graph distance replaces the fixed left, right, up, and down directions of an image grid."
  },
  5: {
    section: "02 / CONVOLUTION", title: "A CNN reuses one kernel over a fixed grid", accent: "navy", layout: "single",
    blocks: [
      { label: "2D DISCRETE CONVOLUTION", tex: T`Y_{i,j}=\sum_{a=-r}^{r}\sum_{b=-r}^{r}K_{a,b}\,X_{i+a,j+b}`, caption: "The same kernel K is translated to every image location.", tone: "navy" },
    ], takeaway: "Kernel sliding works because every pixel has a consistently ordered local neighborhood."
  },
  7: {
    section: "03 / MESSAGE PASSING", title: "GNNs share one primitive: message passing", accent: "teal", layout: "steps",
    blocks: [
      { label: "MESSAGE", tex: T`\mathbf{m}_{ij}^{(\ell)}=\phi^{(\ell)}\!\left(\mathbf{h}_i^{(\ell)},\mathbf{h}_j^{(\ell)},\mathbf{e}_{ij}\right)`, caption: "Build a message on each eligible edge.", tone: "navy" },
      { label: "AGGREGATE", tex: T`\mathbf{m}_i^{(\ell)}=\underset{j\in\mathcal{N}(i)}{\operatorname{AGG}}\;\mathbf{m}_{ij}^{(\ell)}`, caption: "Compress an unordered neighbor set.", tone: "teal" },
      { label: "UPDATE", tex: T`\mathbf{h}_i^{(\ell+1)}=\psi^{(\ell)}\!\left(\mathbf{h}_i^{(\ell)},\mathbf{m}_i^{(\ell)}\right)`, caption: "Combine self and neighborhood information.", tone: "coral" },
    ], takeaway: "GCN, GraphSAGE, and GAT differ mainly in the message and aggregation functions."
  },
  8: {
    section: "03 / MESSAGE PASSING", title: "The local rule is also a matrix operation", accent: "navy", layout: "split",
    blocks: [
      { label: "NODE-WISE", tex: T`\mathbf{h}_i'=\sigma\!\left(\sum_{j\in\mathcal{N}(i)\cup\{i\}}c_{ij}\,\mathbf{h}_j\mathbf{W}\right)`, caption: "One weighted neighborhood update.", tone: "teal" },
      { label: "ALL NODES AT ONCE", tex: T`\mathbf{H}'=\sigma\!\left(\mathbf{P}\mathbf{H}\mathbf{W}\right)`, caption: "P stores the graph propagation weights.", tone: "navy" },
    ], takeaway: "Sparse graph propagation can be executed as a standard differentiable matrix computation."
  },
  9: {
    section: "03 / MESSAGE PASSING", title: "Stacking layers expands the receptive field", accent: "coral", layout: "steps",
    blocks: [
      { label: "INPUT", tex: T`\mathbf{H}^{(0)}=\mathbf{X}`, caption: "Only each node's own features.", tone: "navy" },
      { label: "ONE LAYER", tex: T`\mathbf{H}^{(1)}=f^{(0)}\!\left(\mathbf{H}^{(0)},G\right)`, caption: "Information from one-hop neighbors.", tone: "teal" },
      { label: "TWO LAYERS", tex: T`\mathbf{H}^{(2)}=f^{(1)}\!\left(\mathbf{H}^{(1)},G\right)`, caption: "Information can travel two hops.", tone: "coral" },
    ], takeaway: "An L-layer message-passing GNN has an L-hop receptive field."
  },
  11: {
    section: "04 / SPECTRAL CONVOLUTION", title: "Graph Fourier bases make convolution possible", accent: "teal", layout: "steps",
    blocks: [
      { label: "LAPLACIAN", tex: T`\mathbf{L}=\mathbf{D}-\mathbf{A}=\mathbf{U}\boldsymbol{\Lambda}\mathbf{U}^{\mathsf T}`, caption: "The eigenvector matrix defines graph Fourier modes.", tone: "navy" },
      { label: "GRAPH FOURIER TRANSFORM", tex: T`\widehat{\mathbf{x}}=\mathbf{U}^{\mathsf T}\mathbf{x}`, caption: "Project a graph signal into the spectral basis.", tone: "teal" },
      { label: "SPECTRAL FILTER", tex: T`g_{\theta}\star_G\mathbf{x}=\mathbf{U}\,g_{\theta}(\boldsymbol{\Lambda})\,\mathbf{U}^{\mathsf T}\mathbf{x}`, caption: "Filter frequencies, then reconstruct.", tone: "coral" },
    ], takeaway: "The graph Laplacian supplies the frequency basis that an irregular topology lacks geometrically."
  },
  12: {
    section: "04 / SPECTRAL CONVOLUTION", title: "Exact spectral filters depend on the whole graph", accent: "coral", layout: "single",
    blocks: [
      { label: "GLOBAL EIGENBASIS", tex: T`g_{\theta}(\mathbf{L})\mathbf{x}=\mathbf{U}\,g_{\theta}(\boldsymbol{\Lambda})\,\mathbf{U}^{\mathsf T}\mathbf{x}`, caption: "Computing and storing the eigenvector matrix couples the filter to the full graph and can require expensive eigendecomposition.", tone: "coral" },
    ], takeaway: "The exact spectral definition is elegant, but its global basis is difficult to scale and transfer."
  },
  13: {
    section: "04 / SPECTRAL CONVOLUTION", title: "Chebyshev filters localize convolution to K hops", accent: "teal", layout: "split",
    blocks: [
      { label: "POLYNOMIAL FILTER", tex: T`g_{\theta}(\mathbf{L})\mathbf{x}\approx\sum_{k=0}^{K}\theta_k\,T_k(\widetilde{\mathbf{L}})\mathbf{x}`, caption: "No explicit eigenvector matrix is needed at evaluation time.", tone: "teal" },
      { label: "RECURSION", tex: T`T_k(\mathbf{Z})=2\mathbf{Z}T_{k-1}(\mathbf{Z})-T_{k-2}(\mathbf{Z})`, caption: "A degree-K polynomial is localized within K graph hops.", tone: "navy" },
    ], takeaway: "Polynomial filters replace a global spectral operation with sparse localized propagation."
  },
  14: {
    section: "04 / FROM SPECTRUM TO GCN", title: "GCN keeps only a first-order local filter", accent: "coral", layout: "steps",
    blocks: [
      { label: "CHEBYSHEV", tex: T`\sum_{k=0}^{K}\theta_kT_k(\widetilde{\mathbf{L}})\mathbf{x}`, caption: "Localized polynomial filter.", tone: "navy" },
      { label: "SET K = 1", tex: T`\theta_0\mathbf{x}+\theta_1\widetilde{\mathbf{L}}\mathbf{x}`, caption: "Keep only immediate structure.", tone: "teal" },
      { label: "TIE PARAMETERS", tex: T`\theta\!\left(\mathbf{I}+\mathbf{D}^{-1/2}\mathbf{A}\mathbf{D}^{-1/2}\right)\mathbf{x}`, caption: "One shared scalar filter parameter.", tone: "coral" },
    ], takeaway: "GCN compresses spectral theory into a trainable first-order neighborhood operator."
  },
  15: {
    section: "05 / GCN LAYER", title: "Self-loops and normalization stabilize propagation", accent: "teal", layout: "steps",
    blocks: [
      { label: "ADD SELF-LOOPS", tex: T`\widetilde{\mathbf{A}}=\mathbf{A}+\mathbf{I}`, caption: "Each node retains its own message.", tone: "coral" },
      { label: "UPDATED DEGREE", tex: T`\widetilde{\mathbf{D}}_{ii}=\sum_j\widetilde{\mathbf{A}}_{ij}`, caption: "Degrees include the new self-loop.", tone: "navy" },
      { label: "SYMMETRIC NORMALIZATION", tex: T`\widehat{\mathbf{A}}=\widetilde{\mathbf{D}}^{-1/2}\widetilde{\mathbf{A}}\widetilde{\mathbf{D}}^{-1/2}`, caption: "Control the scale of messages from high-degree nodes.", tone: "teal" },
    ], takeaway: "The renormalization trick turns repeated propagation into a numerically stable layer operator."
  },
  16: {
    section: "05 / GCN LAYER", title: "One row of A-hat is a weighted neighborhood", accent: "navy", layout: "split",
    blocks: [
      { label: "ENTRY-WISE WEIGHT", tex: T`\widehat{A}_{ij}=\frac{\widetilde{A}_{ij}}{\sqrt{\widetilde{d}_i\widetilde{d}_j}}`, caption: "Zero for non-neighbors; degree-normalized otherwise.", tone: "navy" },
      { label: "TARGET UPDATE", tex: T`\left(\widehat{\mathbf{A}}\mathbf{H}\right)_i=\sum_{j\in\mathcal{N}(i)\cup\{i\}}\widehat{A}_{ij}\mathbf{h}_j`, caption: "A row of the propagation matrix is one weighted neighborhood.", tone: "teal" },
    ], takeaway: "GCN weights are determined by graph structure and degree, not learned separately for each edge."
  },
  17: {
    section: "05 / GCN LAYER", title: "A GCN layer = propagate, transform, activate", accent: "coral", layout: "steps",
    blocks: [
      { label: "PROPAGATE", tex: T`\mathbf{M}^{(\ell)}=\widehat{\mathbf{A}}\mathbf{H}^{(\ell)}`, caption: "Aggregate normalized neighborhood features.", tone: "teal" },
      { label: "TRANSFORM", tex: T`\mathbf{Z}^{(\ell)}=\mathbf{M}^{(\ell)}\mathbf{W}^{(\ell)}`, caption: "Apply a shared learnable linear map.", tone: "navy" },
      { label: "ACTIVATE", tex: T`\mathbf{H}^{(\ell+1)}=\sigma\!\left(\mathbf{Z}^{(\ell)}\right)`, caption: "Produce the next-layer representations.", tone: "coral" },
    ], takeaway: "Each layer combines one normalized propagation operator, one shared weight matrix, and one nonlinearity."
  },
  18: {
    section: "06 / NODE CLASSIFICATION", title: "Sparse labels can supervise the whole graph", accent: "navy", layout: "stack",
    blocks: [
      { label: "TWO-LAYER GCN", tex: T`\mathbf{Z}=\operatorname{softmax}\!\left(\widehat{\mathbf{A}}\,\sigma\!\left(\widehat{\mathbf{A}}\mathbf{X}\mathbf{W}^{(0)}\right)\mathbf{W}^{(1)}\right)`, caption: "Every node receives a class-probability vector.", tone: "navy" },
      { label: "LABELED-NODE LOSS", tex: T`\mathcal{L}=-\sum_{i\in\mathcal{Y}_{L}}\sum_{c=1}^{C}Y_{ic}\log Z_{ic}`, caption: "Only labeled nodes contribute directly to cross-entropy.", tone: "coral" },
    ], takeaway: "Graph propagation lets a small labeled subset supervise representations throughout the connected graph."
  },
  23: {
    section: "01 / FROM GCN TO GRAPHSAGE", title: "The original GCN setup leaves a deployment gap", accent: "coral", layout: "split",
    blocks: [
      { label: "FIXED GRAPH OPERATOR", tex: T`\widehat{\mathbf{A}}_{\text{train}}=\widetilde{\mathbf{D}}_{\text{train}}^{-1/2}\widetilde{\mathbf{A}}_{\text{train}}\widetilde{\mathbf{D}}_{\text{train}}^{-1/2}`, caption: "The propagation matrix is built from the graph observed during training.", tone: "navy" },
      { label: "REUSABLE LOCAL FUNCTION", tex: T`\mathbf{h}_v=f_{\theta}\!\left(\mathbf{x}_v,\{\mathbf{x}_u:u\in\mathcal{N}(v)\}\right)`, caption: "Shared parameters can be applied to a compatible unseen node.", tone: "teal" },
    ], takeaway: "GraphSAGE learns a neighborhood function instead of storing one embedding per training node."
  },
  24: {
    section: "01 / LEARNING SETTING", title: "Transductive and inductive learning differ", accent: "coral", layout: "split",
    blocks: [
      { label: "TRANSDUCTIVE", tex: T`V_{\text{test}}\subseteq V_{\text{train graph}}`, caption: "Test nodes are already part of the graph available during training.", tone: "navy" },
      { label: "INDUCTIVE", tex: T`V_{\text{test}}\not\subseteq V_{\text{train graphs}}`, caption: "The learned function must transfer to new nodes or entirely new graphs.", tone: "coral" },
    ], takeaway: "Inductive learning changes what must generalize: the function, not a node-specific lookup table."
  },
  25: {
    section: "01 / THE NEW PROBLEM", title: "A new node breaks a fixed embedding table", accent: "coral", layout: "split",
    blocks: [
      { label: "LOOKUP-BASED", tex: T`v\longmapsto\mathbf{z}_v`, caption: "An unseen identifier has no learned row.", tone: "coral" },
      { label: "FUNCTION-BASED", tex: T`(\mathbf{x}_v,\mathcal{N}(v))\longmapsto f_{\theta}(\mathbf{x}_v,\mathcal{N}(v))`, caption: "Features and local structure are sufficient inputs.", tone: "teal" },
    ], takeaway: "The model must generate an embedding from reusable evidence available at inference time."
  },
  28: {
    section: "02 / ALGORITHM 1", title: "One forward pass repeats five operations", accent: "coral", layout: "steps",
    blocks: [
      { label: "SAMPLE", tex: T`\mathcal{S}_k(v)\subseteq\mathcal{N}(v)`, caption: "Choose a bounded neighbor set.", tone: "coral" },
      { label: "AGGREGATE", tex: T`\begin{aligned}\mathcal{H}_k(v)&=\{\mathbf{h}_u^{(k-1)}:u\in\mathcal{S}_k(v)\}\\\mathbf{h}_{\mathcal{N}(v)}^{(k)}&=\operatorname{AGGREGATE}_k\!\left(\mathcal{H}_k(v)\right)\end{aligned}`, caption: "Compress sampled neighbors.", tone: "teal" },
      { label: "UPDATE", tex: T`\begin{aligned}\mathbf{q}_v^{(k)}&=\mathbf{h}_v^{(k-1)}\Vert\mathbf{h}_{\mathcal{N}(v)}^{(k)}\\\mathbf{h}_v^{(k)}&=\sigma\!\left(\mathbf{W}^{(k)}\mathbf{q}_v^{(k)}\right)\end{aligned}`, caption: "Concatenate, transform, and activate.", tone: "navy" },
    ], takeaway: "GraphSAGE learns an inductive function by repeating sample and aggregate at every layer."
  },
  29: {
    section: "02 / GRAPH SAMPLE", title: "Sampling builds a bounded computation graph", accent: "coral", layout: "single",
    blocks: [
      { label: "TWO-LAYER FAN-OUT", tex: T`1+S_1+S_1S_2`, caption: "With two layer-specific fan-outs, one target touches at most this many sampled nodes before duplicate removal.", tone: "coral" },
    ], takeaway: "Fixed fan-out converts variable graph degree into predictable per-target computation."
  },
  30: {
    section: "02 / INDUCTIVE REUSE", title: "The same sampler works for an unseen target", accent: "teal", layout: "single",
    blocks: [
      { label: "SHARED INFERENCE FUNCTION", tex: T`\mathbf{z}_v=f_{\theta}\!\left(\mathbf{x}_v,\{\mathbf{x}_u:u\in\mathcal{S}(v)\}\right)`, caption: "No parameter is indexed by the identity of v.", tone: "teal" },
    ], takeaway: "Compatible features, local edges, and shared weights are enough to embed an unseen node."
  },
  31: {
    section: "02 / NUMERICAL EXAMPLE", title: "One sampled neighborhood becomes one vector", accent: "teal", layout: "split",
    blocks: [
      { label: "SAMPLED SET", tex: T`\mathcal{S}(A)=\{B,D,E\}`, caption: "Neighbor order has no graph-defined meaning.", tone: "coral" },
      { label: "MEAN EXAMPLE", tex: T`\mathbf{h}_{\mathcal{N}(A)}=\frac{1}{3}(\mathbf{h}_B+\mathbf{h}_D+\mathbf{h}_E)=\begin{bmatrix}0.40\\0.60\end{bmatrix}`, caption: "A set of vectors becomes one fixed-width vector.", tone: "teal" },
    ], takeaway: "Aggregation is the information bottleneck that defines a GraphSAGE variant."
  },
  32: {
    section: "02 / NUMERICAL EXAMPLE", title: "Concatenation preserves self information", accent: "navy", layout: "steps",
    blocks: [
      { label: "CONCATENATE", tex: T`\mathbf{q}_A=\mathbf{h}_A^{(k-1)}\Vert\mathbf{h}_{\mathcal{N}(A)}^{(k)}`, caption: "Keep self and neighbor summaries distinct.", tone: "coral" },
      { label: "TRANSFORM", tex: T`\widetilde{\mathbf{h}}_A^{(k)}=\sigma\!\left(\mathbf{W}^{(k)}\mathbf{q}_A\right)`, caption: "Learn a shared update function.", tone: "navy" },
      { label: "NORMALIZE", tex: T`\mathbf{h}_A^{(k)}=\frac{\widetilde{\mathbf{h}}_A^{(k)}}{\lVert\widetilde{\mathbf{h}}_A^{(k)}\rVert_2}`, caption: "The paper applies L2 normalization after each layer.", tone: "teal" },
    ], takeaway: "GraphSAGE explicitly preserves the target representation before the learned update."
  },
  33: {
    section: "02 / LARGE GRAPHS", title: "Fixed fan-out makes mini-batch work predictable", accent: "coral", layout: "stack",
    blocks: [
      { label: "PER-TARGET NODE BUDGET", tex: T`B_K=1+\sum_{k=1}^{K}\prod_{r=1}^{k}S_r`, caption: "The sampled computation tree grows with the product of layer fan-outs.", tone: "coral" },
      { label: "TWO-LAYER SPECIAL CASE", tex: T`B_2=1+S_1+S_1S_2`, caption: "The training batch size can be planned independently of raw node degree.", tone: "navy" },
    ], takeaway: "Sampling improves scalability but introduces stochastic approximation and possible duplicate nodes."
  },
  35: {
    section: "03 / MEAN AGGREGATOR", title: "Mean is simple, symmetric, and parameter free", accent: "teal", layout: "single",
    blocks: [
      { label: "MEAN", tex: T`\mathbf{h}_{\mathcal{N}(v)}^{(k)}=\frac{1}{|\mathcal{S}_k(v)|}\sum_{u\in\mathcal{S}_k(v)}\mathbf{h}_u^{(k-1)}`, caption: "Permutation invariant and inexpensive, but unable to learn feature-specific selection inside the aggregator.", tone: "teal" },
    ], takeaway: "Mean aggregation is a strong baseline because graph neighborhoods are unordered sets."
  },
  36: {
    section: "03 / LSTM AGGREGATOR", title: "LSTM is expressive but order-sensitive", accent: "coral", layout: "single",
    blocks: [
      { label: "SEQUENTIAL AGGREGATION", tex: T`\mathbf{h}_{\mathcal{N}(v)}^{(k)}=\operatorname{LSTM}_k\!\left(\pi(\{\mathbf{h}_u^{(k-1)}\})\right)`, caption: "A random permutation is required because the graph supplies no canonical sequence.", tone: "coral" },
    ], takeaway: "The LSTM aggregator gains expressive parameters but sacrifices exact permutation invariance."
  },
  37: {
    section: "03 / POOLING AGGREGATOR", title: "Pooling learns features before taking a maximum", accent: "teal", layout: "steps",
    blocks: [
      { label: "NEIGHBOR TRANSFORM", tex: T`\mathbf{r}_u=\sigma\!\left(\mathbf{W}_{\mathrm{pool}}\mathbf{h}_u+\mathbf{b}_{\mathrm{pool}}\right)`, caption: "Learn nonlinear features for every neighbor.", tone: "navy" },
      { label: "ELEMENT-WISE MAX", tex: T`\mathbf{h}_{\mathcal{N}(v)}=\max_{u\in\mathcal{S}(v)}\mathbf{r}_u`, caption: "Select the strongest value in each learned feature dimension.", tone: "teal" },
    ], takeaway: "Pooling is trainable, permutation invariant, and able to select different neighbors by feature."
  },
  38: {
    section: "03 / AGGREGATOR COMPARISON", title: "Aggregator choice is a trade-off", accent: "coral", layout: "grid",
    blocks: [
      { label: "MEAN", tex: T`\frac{1}{|S|}\sum_{u\in S}\mathbf{h}_u`, caption: "Symmetric; no aggregator parameters.", tone: "teal" },
      { label: "LSTM", tex: T`\operatorname{LSTM}(\pi(S))`, caption: "Expressive; order-sensitive.", tone: "coral" },
      { label: "POOLING", tex: T`\max_{u\in S}\sigma(\mathbf{W}\mathbf{h}_u+\mathbf{b})`, caption: "Symmetric; trainable feature selection.", tone: "navy" },
    ], takeaway: "The right aggregator depends on invariance, expressiveness, and computational budget."
  },
  41: {
    section: "04 / LIMITS AND COMPARISON", title: "Inductive scale comes with approximation", accent: "coral", layout: "split",
    blocks: [
      { label: "SAMPLED ESTIMATE", tex: T`\widehat{\boldsymbol{\mu}}_v=\frac{1}{|\mathcal{S}(v)|}\sum_{u\in\mathcal{S}(v)}\mathbf{h}_u`, caption: "Different samples produce different neighborhood estimates.", tone: "coral" },
      { label: "FULL MEAN", tex: T`\boldsymbol{\mu}_v=\frac{1}{|\mathcal{N}(v)|}\sum_{u\in\mathcal{N}(v)}\mathbf{h}_u`, caption: "More complete but potentially expensive for high-degree nodes.", tone: "navy" },
    ], takeaway: "GraphSAGE exchanges exact full-neighborhood computation for bounded stochastic work."
  },
  43: {
    section: "01 / BRIEF ATTENTION PRIMER", title: "Attention is selective aggregation", accent: "teal", layout: "single",
    blocks: [
      { label: "WEIGHTED CONTEXT", tex: T`\mathbf{c}_i=\sum_j\alpha_{ij}\mathbf{v}_j,\qquad\sum_j\alpha_{ij}=1`, caption: "The receiver-dependent coefficients decide which candidate values matter now.", tone: "teal" },
    ], takeaway: "Attention learns the weighting rule before information is aggregated."
  },
  44: {
    section: "01 / BRIEF ATTENTION PRIMER", title: "Q, K and V separate three roles", accent: "navy", layout: "stack",
    blocks: [
      { label: "SCALED DOT-PRODUCT ATTENTION", tex: T`\operatorname{Attention}(\mathbf{Q},\mathbf{K},\mathbf{V})=\operatorname{softmax}\!\left(\frac{\mathbf{Q}\mathbf{K}^{\mathsf T}}{\sqrt{d_k}}\right)\mathbf{V}`, caption: "Queries ask, keys match, and values carry the information to aggregate.", tone: "navy" },
      { label: "ROLE PROJECTIONS", tex: T`\mathbf{Q}=\mathbf{X}\mathbf{W}_Q,\quad\mathbf{K}=\mathbf{X}\mathbf{W}_K,\quad\mathbf{V}=\mathbf{X}\mathbf{W}_V`, caption: "This is a conceptual bridge, not the original GAT scoring equation.", tone: "teal" },
    ], takeaway: "Transformer attention and GAT share selective aggregation but use different compatibility functions."
  },
  45: {
    section: "01 / CONCEPTUAL BRIDGE", title: "GAT borrows attention, not Transformer QKV", accent: "coral", layout: "split",
    blocks: [
      { label: "TRANSFORMER", tex: T`s_{ij}=\frac{\mathbf{q}_i^{\mathsf T}\mathbf{k}_j}{\sqrt{d_k}}`, caption: "Scaled dot-product compatibility.", tone: "navy" },
      { label: "ORIGINAL GAT", tex: T`e_{ij}=\operatorname{LeakyReLU}\!\left(\mathbf{a}^{\mathsf T}[\mathbf{W}\mathbf{h}_i\Vert\mathbf{W}\mathbf{h}_j]\right)`, caption: "Additive compatibility on graph-eligible edges.", tone: "coral" },
    ], takeaway: "The shared idea is learned relevance; the scoring equations are not interchangeable."
  },
  46: {
    section: "02 / GRAPH ATTENTION", title: "The graph is the attention mask", accent: "teal", layout: "single",
    blocks: [
      { label: "MASKED LOGIT", tex: T`\widetilde{e}_{ij}=\begin{cases}e_{ij},&j\in\mathcal{N}(i)\cup\{i\},\\-\infty,&\text{otherwise,}\end{cases}`, caption: "Only self and graph-defined neighbors enter the neighborhood softmax.", tone: "teal" },
    ], takeaway: "Connectivity decides who may speak; attention decides how strongly eligible nodes are heard."
  },
  47: {
    section: "02 / SINGLE-HEAD ALGORITHM", title: "One GAT head repeats four operations", accent: "coral", layout: "steps",
    blocks: [
      { label: "TRANSFORM", tex: T`\mathbf{z}_i=\mathbf{W}\mathbf{h}_i`, caption: "Shared node projection.", tone: "navy" },
      { label: "SCORE", tex: T`e_{ij}=\operatorname{LeakyReLU}\!\left(\mathbf{a}^{\mathsf T}[\mathbf{z}_i\Vert\mathbf{z}_j]\right)`, caption: "Shared additive compatibility.", tone: "coral" },
      { label: "NORMALIZE + AGGREGATE", tex: T`\mathbf{h}_i'=\sigma\!\left(\sum_{j\in\mathcal{N}(i)\cup\{i\}}\alpha_{ij}\mathbf{z}_j\right)`, caption: "Target-dependent weighted message passing.", tone: "teal" },
    ], takeaway: "A GAT layer is message passing with a learned coefficient on every eligible edge."
  },
  48: {
    section: "02 / RUNNING EXAMPLE", title: "Same neighborhood, new weighting rule", accent: "navy", layout: "split",
    blocks: [
      { label: "INPUT FEATURES", tex: T`\mathbf{h}_A=\begin{bmatrix}0.80\\0.10\\0.70\end{bmatrix}`, caption: "Target A retains the same teaching features used earlier.", tone: "navy" },
      { label: "SHARED TRANSFORM", tex: T`\mathbf{z}_A=\mathbf{W}\mathbf{h}_A=\begin{bmatrix}1.50\\0.80\end{bmatrix}`, caption: "Every eligible node is projected by the same shared weight matrix.", tone: "teal" },
    ], takeaway: "The neighborhood is unchanged; GAT replaces structural weights with feature-dependent weights."
  },
  49: {
    section: "02 / NUMERICAL EXAMPLE", title: "Step 1: transform every eligible node", accent: "navy", layout: "single",
    blocks: [
      { label: "SHARED LINEAR MAP", tex: T`\mathbf{z}_j=\mathbf{W}\mathbf{h}_j,\qquad j\in\mathcal{N}(A)\cup\{A\}`, caption: "The same W maps every node into the attention head's output space.", tone: "navy" },
    ], takeaway: "Attention scores transformed feature vectors, not node identities."
  },
  50: {
    section: "02 / NUMERICAL EXAMPLE", title: "Step 2: score each eligible pair", accent: "coral", layout: "stack",
    blocks: [
      { label: "ADDITIVE SCORE", tex: T`e_{Aj}=\operatorname{LeakyReLU}\!\left(\mathbf{a}^{\mathsf T}[\mathbf{z}_A\Vert\mathbf{z}_j]\right)`, caption: "The same attention vector a is reused on every eligible pair.", tone: "coral" },
      { label: "EXAMPLE LOGITS", tex: T`[e_{AA},e_{AB},e_{AC},e_{AD}]=[0.000,\,0.216,\,-1.273,\,0.392]`, caption: "These values are compatibility logits, not probabilities.", tone: "navy" },
    ], takeaway: "A larger logit indicates stronger compatibility before neighborhood normalization."
  },
  51: {
    section: "02 / NUMERICAL EXAMPLE", title: "Step 3: normalize inside the neighborhood", accent: "teal", layout: "stack",
    blocks: [
      { label: "NEIGHBORHOOD SOFTMAX", tex: T`\alpha_{Aj}=\frac{\exp(e_{Aj})}{\sum_{k\in\mathcal{N}(A)\cup\{A\}}\exp(e_{Ak})}`, caption: "Normalization is target-specific and restricted by the graph mask.", tone: "teal" },
      { label: "NORMALIZED COEFFICIENTS", tex: T`[\alpha_{AA},\alpha_{AB},\alpha_{AC},\alpha_{AD}]=[0.25,\,0.31,\,0.07,\,0.37]`, caption: "The four coefficients sum to one.", tone: "coral" },
    ], takeaway: "For this target and head, D contributes most and C contributes least."
  },
  52: {
    section: "02 / NUMERICAL EXAMPLE", title: "Step 4: aggregate the weighted messages", accent: "coral", layout: "stack",
    blocks: [
      { label: "WEIGHTED UPDATE", tex: T`\mathbf{h}_A'=\sigma\!\left(\sum_{j\in\mathcal{N}(A)\cup\{A\}}\alpha_{Aj}\mathbf{z}_j\right)`, caption: "Every transformed message is scaled by its learned coefficient.", tone: "coral" },
      { label: "ILLUSTRATIVE OUTPUT", tex: T`\sum_j\alpha_{Aj}\mathbf{z}_j=\begin{bmatrix}1.557\\0.863\end{bmatrix}`, caption: "The displayed vector is rounded to three decimals.", tone: "teal" },
    ], takeaway: "The new representation is an activated weighted sum of self and neighbor messages."
  },
  53: {
    section: "02 / MATHEMATICAL FORM", title: "The complete layer fits into two equations", accent: "teal", layout: "stack",
    blocks: [
      { label: "ATTENTION COEFFICIENT", tex: T`\alpha_{ij}=\frac{\exp\!\left(\operatorname{LeakyReLU}(\mathbf{a}^{\mathsf T}[\mathbf{W}\mathbf{h}_i\Vert\mathbf{W}\mathbf{h}_j])\right)}{\sum_{k\in\mathcal{N}(i)\cup\{i\}}\exp\!\left(\operatorname{LeakyReLU}(\mathbf{a}^{\mathsf T}[\mathbf{W}\mathbf{h}_i\Vert\mathbf{W}\mathbf{h}_k])\right)}`, caption: "Masked softmax over the target neighborhood.", tone: "teal" },
      { label: "NODE UPDATE", tex: T`\mathbf{h}_i'=\sigma\!\left(\sum_{j\in\mathcal{N}(i)\cup\{i\}}\alpha_{ij}\mathbf{W}\mathbf{h}_j\right)`, caption: "Learned edge weighting followed by message aggregation.", tone: "coral" },
    ], takeaway: "Original GAT remains a local message-passing layer: score, normalize, aggregate, update."
  },
  54: {
    section: "02 / MULTI-HEAD ATTENTION", title: "Hidden heads are concatenated", accent: "teal", layout: "single",
    blocks: [
      { label: "HIDDEN-LAYER CONCATENATION", tex: T`\mathbf{h}_i'=\mathop{\Vert}_{k=1}^{K}\sigma\!\left(\sum_{j\in\mathcal{N}(i)\cup\{i\}}\alpha_{ij}^{(k)}\mathbf{W}^{(k)}\mathbf{h}_j\right)`, caption: "Concatenation preserves the distinct output of every attention head.", tone: "teal" },
    ], takeaway: "Concatenation preserves every head and multiplies the hidden feature width by the number of heads."
  },
  55: {
    section: "02 / MULTI-HEAD ATTENTION", title: "Prediction heads are averaged", accent: "coral", layout: "single",
    blocks: [
      { label: "OUTPUT-LAYER AVERAGE", tex: T`\mathbf{h}_i'=\sigma\!\left(\frac{1}{K}\sum_{k=1}^{K}\sum_{j\in\mathcal{N}(i)\cup\{i\}}\alpha_{ij}^{(k)}\mathbf{W}^{(k)}\mathbf{h}_j\right)`, caption: "Averaging keeps the final class or regression dimension fixed.", tone: "coral" },
    ], takeaway: "Hidden layer: concatenate. Final prediction layer: average."
  },
  59: {
    section: "04 / FEATURES", title: "What GAT adds to message passing", accent: "teal", layout: "split",
    blocks: [
      { label: "NODE TRANSFORM COST", tex: T`\mathcal{O}(|V|FF')`, caption: "Project every node feature vector.", tone: "navy" },
      { label: "EDGE ATTENTION COST", tex: T`\mathcal{O}(|E|F')`, caption: "Score and aggregate messages over graph edges, per head.", tone: "teal" },
    ], takeaway: "Per head, the paper separates node transformation work from edge attention work."
  },
  61: {
    section: "04 / COMPARISON", title: "Three models, one message-passing template", accent: "navy", layout: "grid",
    lead: "All three models instantiate the same receiver-centered update.",
    blocks: [
      { label: "GCN", tex: T`\sum_j\widehat{A}_{ij}\mathbf{h}_j\mathbf{W}`, caption: "Fixed degree-normalized structural weights.", tone: "navy" },
      { label: "GRAPHSAGE", tex: T`\operatorname{AGG}\!\left(\{\mathbf{h}_j:j\in\mathcal{S}(i)\}\right)`, caption: "Sampled learned set aggregation.", tone: "coral" },
      { label: "GAT", tex: T`\sum_j\alpha_{ij}\mathbf{W}\mathbf{h}_j`, caption: "Learned target-dependent edge weights.", tone: "teal" },
    ], takeaway: "The progression is structural normalization, sampled aggregation, then attentive weighting."
  },
};

function FormulaBlock({ block, index }: { block: MathBlock; index: number }) {
  const compact = block.tex.length > 120 ? " is-compact" : block.tex.length > 72 ? " is-medium" : "";
  return (
    <article className={`math-block tone-${block.tone ?? "teal"}${compact}`}>
      <div className="math-block-label"><b>{String(index + 1).padStart(2, "0")}</b><span>{block.label}</span></div>
      <DisplayMath tex={block.tex} />
      {block.caption ? <p>{block.caption}</p> : null}
    </article>
  );
}

export function NativeMathSlide({ number }: { number: number }) {
  const spec = MATH_SLIDES[number];
  if (!spec) return null;

  return (
    <div className={`native-math-slide accent-${spec.accent} layout-${spec.layout ?? "grid"}`}>
      <header>
        <span>{spec.section}</span>
        <h2>{spec.title}</h2>
        {spec.lead ? <p>{spec.lead}</p> : null}
      </header>
      <div className="math-blocks">
        {spec.blocks.map((block, index) => <FormulaBlock block={block} index={index} key={`${block.label}-${index}`} />)}
      </div>
      <div className="math-takeaway">{spec.takeaway}</div>
      <footer><span>Graph Neural Networks | Visual Lecture</span><b>{String(number).padStart(2, "0")}</b></footer>
    </div>
  );
}

export function hasNativeMathSlide(number: number) {
  return Boolean(MATH_SLIDES[number]);
}

export function InlineNotationExample() {
  return <Math tex={T`\mathbf{H}^{(\ell+1)}=\sigma(\widehat{\mathbf{A}}\mathbf{H}^{(\ell)}\mathbf{W}^{(\ell)})`} />;
}
