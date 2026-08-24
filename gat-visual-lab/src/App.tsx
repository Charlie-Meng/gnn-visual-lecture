import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  CircleDotDashed,
  GitCompareArrows,
  Network,
  Sigma,
  Waypoints,
} from "lucide-react";
import { Math as TeX } from "./Math";

type Scene = { id: string; kicker: string; title: string; component: ComponentType };

const nodes = [
  { id: "A", label: "Machine Learning", feature: "[0.80, 0.10, 0.70]", z: [1.5, 0.8], x: 290, y: 188 },
  { id: "B", label: "Deep Learning", feature: "[0.90, 0.10, 0.80]", z: [1.7, 0.8], x: 112, y: 78 },
  { id: "C", label: "18th-c. History", feature: "[0.10, 0.90, 0.00]", z: [0.1, 0.9], x: 108, y: 302 },
  { id: "D", label: "Neural Networks", feature: "[0.85, 0.05, 0.90]", z: [1.75, 0.95], x: 476, y: 92 },
  { id: "E", label: "Optimization", feature: "[0.70, 0.20, 0.55]", z: [1.3, 0.7], x: 520, y: 304 },
  { id: "F", label: "Archives", feature: "[0.15, 0.85, 0.05]", z: [0.2, 0.8], x: 282, y: 374 },
];

const alpha = [0.25, 0.31, 0.07, 0.37];
const logits = [0, 0.216, -1.273, 0.392];
const eligible = ["A", "B", "C", "D"];

function fmt(vector: number[]) {
  return `[${vector.map((value) => value.toFixed(3)).join(", ")}]`;
}

function Graph({ weights, masked = false, pulse = false }: { weights?: number[]; masked?: boolean; pulse?: boolean }) {
  const edges: [string, string][] = [["A", "B"], ["A", "C"], ["A", "D"], ["B", "F"], ["C", "F"], ["D", "E"], ["E", "F"]];
  const point = (id: string) => nodes.find((node) => node.id === id)!;
  return (
    <svg className="graph" viewBox="0 0 620 430" role="img" aria-label="Graph centered on node A">
      {edges.map(([from, to]) => {
        const source = point(from); const target = point(to);
        const activeIndex = to === "A" ? eligible.indexOf(from) : from === "A" ? eligible.indexOf(to) : -1;
        const active = activeIndex >= 0;
        const width = weights && active ? 2 + weights[activeIndex] * 16 : active ? 4 : 2;
        return <line key={`${from}-${to}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} className={active ? "edge active" : masked ? "edge masked" : "edge"} style={{ strokeWidth: width }} />;
      })}
      <path d="M 270 164 C 242 113, 337 112, 313 165" className="self-loop" style={{ strokeWidth: weights ? 2 + weights[0] * 16 : 4 }} />
      {pulse && eligible.slice(1).map((id, index) => {
        const source = point(id); const target = point("A");
        return <circle key={id} r="6" className="message" style={{ animationDelay: `${index * 180}ms` }}><animateMotion dur="1.45s" repeatCount="indefinite" path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`} /></circle>;
      })}
      {nodes.map((node) => {
        const isEligible = eligible.includes(node.id);
        return <g key={node.id} className={`node ${node.id === "A" ? "target" : ""} ${masked && !isEligible ? "is-masked" : ""}`} transform={`translate(${node.x} ${node.y})`}>
          <circle r={node.id === "A" ? 34 : 27} />
          <text y="2">{node.id}</text>
          <text className="node-label" y={node.id === "A" ? 53 : 44}>{node.label}</text>
        </g>;
      })}
    </svg>
  );
}

function QKVScene() {
  const [query, setQuery] = useState(1);
  const tokens = ["Graph", "attention", "networks"];
  const weights = query === 0 ? [0.62, 0.25, 0.13] : query === 1 ? [0.24, 0.54, 0.22] : [0.18, 0.34, 0.48];
  return <section className="scene split-scene">
    <div className="visual-panel qkv-panel">
      <div className="panel-label">One query asks: which values matter?</div>
      <div className="token-row">{tokens.map((token, index) => <button key={token} className={index === query ? "token active" : "token"} onClick={() => setQuery(index)}>{token}</button>)}</div>
      <div className="qkv-flow">
        <div className="qkv-column"><b>Q</b><span>what I seek</span><strong>q<sub>{query + 1}</sub></strong></div>
        <div className="operator">×</div>
        <div className="qkv-column"><b>K</b><span>what I contain</span><strong>k<sub>1..3</sub></strong></div>
        <div className="operator">→</div>
        <div className="qkv-column emphasis"><b>softmax</b><span>normalized relevance</span><strong>{weights.map((w) => w.toFixed(2)).join("  ")}</strong></div>
        <div className="operator">×</div>
        <div className="qkv-column"><b>V</b><span>what I contribute</span><strong>v<sub>1..3</sub></strong></div>
      </div>
      <div className="attention-bars">{tokens.map((token, index) => <div key={token}><span>{token}</span><i><b style={{ width: `${weights[index] * 100}%` }} /></i><strong>{weights[index].toFixed(2)}</strong></div>)}</div>
    </div>
    <aside className="explain-panel">
      <div className="panel-label">Concept only</div>
      <h2>Attention is learned, selective aggregation.</h2>
      <p>A query scores candidates, softmax turns scores into weights, and values are combined by those weights.</p>
      <TeX className="formula" display tex="\operatorname{Attention}(\mathbf{Q},\mathbf{K},\mathbf{V})=\operatorname{softmax}\!\left(\frac{\mathbf{Q}\mathbf{K}^{\mathsf T}}{\sqrt{d_k}}\right)\mathbf{V}" />
      <div className="note-line">GAT keeps the selection idea, but changes the scoring rule.</div>
    </aside>
  </section>;
}

function BridgeScene() {
  return <section className="scene bridge-scene">
    <div className="bridge-column transformer">
      <div className="panel-label">Transformer self-attention</div>
      <h2>Explicit Q, K and V projections</h2>
      <TeX className="formula large" display tex="s_{ij}=\frac{\mathbf{q}_i^{\mathsf T}\mathbf{k}_j}{\sqrt{d_k}}" />
      <div className="mini-flow"><span>Q</span><i>compares with</i><span>K</span><i>weights</i><span>V</span></div>
      <p>Usually every token can compare with every permitted token.</p>
    </div>
    <div className="borrow-arrow"><GitCompareArrows /><b>borrow the idea</b><span>not the exact mechanism</span></div>
    <div className="bridge-column gat">
      <div className="panel-label">Original GAT layer</div>
      <h2>Additive compatibility on graph edges</h2>
      <TeX className="formula large" display tex="e_{ij}=\operatorname{LeakyReLU}\!\left(\mathbf{a}^{\mathsf T}[\mathbf{W}\mathbf{h}_i\Vert\mathbf{W}\mathbf{h}_j]\right)" />
      <div className="mini-flow"><span>Whᵢ</span><i>concatenate</i><span>Whⱼ</span><i>score with</i><span>a</span></div>
      <p>Only node j in the masked neighborhood N(i) is eligible.</p>
    </div>
    <div className="bridge-takeaway">Same principle: learn relevance before aggregation. Different operator: no Transformer-style dot-product QKV.</div>
  </section>;
}

function MaskScene() {
  const [showMask, setShowMask] = useState(true);
  return <section className="scene split-scene">
    <div className="visual-panel graph-panel"><div className="panel-top"><div><div className="panel-label">Target node A</div><b>Neighborhood defines the attention mask</b></div><label className="toggle"><input type="checkbox" checked={showMask} onChange={(event) => setShowMask(event.target.checked)} /><span /> Show mask</label></div><Graph masked={showMask} /></div>
    <aside className="explain-panel">
      <div className="panel-label">Eligible set</div>
      <h2><TeX tex="\mathcal{N}(A)\cup\{A\}=\{A,B,C,D\}" /></h2>
      <div className="mask-list">{nodes.map((node) => <div key={node.id} className={eligible.includes(node.id) ? "eligible" : "blocked"}><b>{node.id}</b><span>{eligible.includes(node.id) ? "finite score" : "−∞ mask"}</span></div>)}</div>
      <TeX className="formula" display tex="\alpha_{ij}=\operatorname{softmax}_{j}(e_{ij}),\qquad j\in\mathcal{N}(i)\cup\{i\}" />
      <div className="note-line">Self-attention includes A itself; non-neighbors E and F cannot contribute in this layer.</div>
    </aside>
  </section>;
}

function CoefficientScene() {
  const [step, setStep] = useState(2);
  const labels = ["Transform", "Score", "Softmax"];
  return <section className="scene coeff-scene">
    <div className="step-strip">{labels.map((label, index) => <button key={label} className={step === index ? "active" : ""} onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>)}</div>
    <div className="coeff-grid">
      <div className="visual-panel graph-panel"><Graph weights={step === 2 ? alpha : undefined} /></div>
      <div className="visual-panel coefficient-table">
        <div className="panel-label">For target A</div>
        <div className="table-head"><span>j</span><span>zⱼ = Whⱼ</span><span>e_Aj</span><span>α_Aj</span></div>
        {eligible.map((id, index) => <div className={step >= 1 ? "table-row active" : "table-row"} key={id}><b>{id}</b><code>{fmt(nodes[index].z)}</code><code className={step >= 1 ? "shown" : "muted-value"}>{step >= 1 ? logits[index].toFixed(3) : "—"}</code><strong className={step === 2 ? "shown" : "muted-value"}>{step === 2 ? alpha[index].toFixed(2) : "—"}</strong></div>)}
        <TeX className="formula" display tex="e_{Aj}=\operatorname{LeakyReLU}\!\left(\mathbf{a}^{\mathsf T}[\mathbf{z}_A\Vert\mathbf{z}_j]\right)" />
      </div>
    </div>
    <div className="scene-callout">Softmax makes the four coefficients comparable and forces them to sum to 1.00.</div>
  </section>;
}

function AggregateScene() {
  const [stage, setStage] = useState(3);
  const stages = ["Transform", "Score", "Normalize", "Aggregate"];
  return <section className="scene aggregate-scene">
    <div className="step-strip">{stages.map((label, index) => <button key={label} className={stage === index ? "active" : ""} onClick={() => setStage(index)}><span>{index + 1}</span>{label}</button>)}</div>
    <div className="aggregate-grid">
      <div className="visual-panel graph-panel"><Graph weights={stage >= 2 ? alpha : undefined} pulse={stage === 3} /></div>
      <div className="math-stack">
        <div className={stage >= 0 ? "math-row active" : "math-row"}><b>1</b><span><TeX tex="\mathbf{z}_j=\mathbf{W}\mathbf{h}_j" /></span><code>A [1.50, 0.80] · B [1.70, 0.80] · C [0.10, 0.90] · D [1.75, 0.95]</code></div>
        <div className={stage >= 1 ? "math-row active" : "math-row"}><b>2</b><span><TeX tex="e_{Aj}=\operatorname{LeakyReLU}(\mathbf{a}^{\mathsf T}[\mathbf{z}_A\Vert\mathbf{z}_j])" /></span><code>[0.000, 0.216, −1.273, 0.392]</code></div>
        <div className={stage >= 2 ? "math-row active" : "math-row"}><b>3</b><span><TeX tex="\alpha_{Aj}=\operatorname{softmax}_{j}(e_{Aj})" /></span><code>[0.25, 0.31, 0.07, 0.37]</code></div>
        <div className={stage >= 3 ? "math-row active result" : "math-row"}><b>4</b><span><TeX tex="\mathbf{h}_A'=\sigma(\sum_j\alpha_{Aj}\mathbf{z}_j)" /></span><code>[1.557, 0.863]</code></div>
      </div>
    </div>
    <div className="scene-callout">D contributes most; C is connected but receives little weight for this target and this head.</div>
  </section>;
}

function MultiHeadScene() {
  const [mode, setMode] = useState<"hidden" | "output">("hidden");
  const heads = [
    { name: "Head 1", weights: [0.25, 0.31, 0.07, 0.37], out: [1.557, 0.863], color: "teal" },
    { name: "Head 2", weights: [0.25, 0.37, 0.06, 0.32], out: [0.924, 1.530], color: "coral" },
    { name: "Head 3", weights: [0.18, 0.22, 0.45, 0.15], out: [0.818, 0.837], color: "navy" },
  ];
  const average = [heads.reduce((sum, h) => sum + h.out[0], 0) / 3, heads.reduce((sum, h) => sum + h.out[1], 0) / 3];
  return <section className="scene multihead-scene">
    <div className="mode-switch"><button className={mode === "hidden" ? "active" : ""} onClick={() => setMode("hidden")}>Hidden layer: concatenate</button><button className={mode === "output" ? "active" : ""} onClick={() => setMode("output")}>Final layer: average</button></div>
    <div className="heads-grid">{heads.map((head) => <div key={head.name} className={`head-panel ${head.color}`}><div className="panel-label">{head.name}</div><div className="head-bars">{eligible.map((id, index) => <div key={id}><b>{id}</b><i><span style={{ width: `${head.weights[index] * 100}%` }} /></i><strong>{head.weights[index].toFixed(2)}</strong></div>)}</div><code>{fmt(head.out)}</code></div>)}</div>
    <div className="combine-row"><span>{mode === "hidden" ? "CONCAT" : "AVERAGE"}</span><div className="combine-vector">{mode === "hidden" ? heads.flatMap((head) => head.out).map((value, index) => <b key={index}>{value.toFixed(3)}</b>) : average.map((value, index) => <b key={index}>{value.toFixed(3)}</b>)}</div></div>
    <div className="scene-callout">Heads can attend to different neighborhood patterns; concatenation preserves diversity, averaging stabilizes final predictions.</div>
  </section>;
}

function EvidenceScene() {
  const [dataset, setDataset] = useState<"transductive" | "ppi">("transductive");
  return <section className="scene evidence-scene">
    <div className="mode-switch"><button className={dataset === "transductive" ? "active" : ""} onClick={() => setDataset("transductive")}>Citation networks</button><button className={dataset === "ppi" ? "active" : ""} onClick={() => setDataset("ppi")}>Unseen PPI graphs</button></div>
    {dataset === "transductive" ? <>
      <div className="dataset-intro"><div><div className="panel-label">Transductive node classification</div><h2>Cora · Citeseer · Pubmed</h2><p>Nodes are papers, edges are citations, labels are topics.</p></div><div className="architecture">8 attention heads × 8 features<br /><span>→ one output head</span></div></div>
      <div className="benchmark-grid">{[["Cora",81.5,83.0],["Citeseer",70.3,72.5],["Pubmed",79.0,79.0]].map(([name,gcn,gat]) => <div className="benchmark" key={name as string}><b>{name}</b><div><span>GCN</span><i><em style={{ width: `${Number(gcn)}%` }} /></i><strong>{gcn}%</strong></div><div className="gat-result"><span>GAT</span><i><em style={{ width: `${Number(gat)}%` }} /></i><strong>{gat}%</strong></div></div>)}</div>
    </> : <>
      <div className="dataset-intro"><div><div className="panel-label">Inductive multi-label classification</div><h2>24 PPI graphs</h2><p>Train, validation and test contain disjoint graphs; each graph averages 2,372 nodes.</p></div><div className="architecture">4 heads → 4 heads<br /><span>→ 6 averaged output heads</span></div></div>
      <div className="ppi-results">{[["GraphSAGE*",0.768],["Const-GAT",0.934],["GAT",0.973]].map(([name,value]) => <div key={name as string} className={name === "GAT" ? "best" : ""}><span>{name}</span><i><b style={{ width: `${Number(value) * 100}%` }} /></i><strong>{Number(value).toFixed(3)}</strong></div>)}</div>
    </>}
    <div className="scene-callout">The original paper matched or improved state of the art across all four benchmarks; PPI is the clearest inductive test.</div>
  </section>;
}

function LimitsScene() {
  const [degree, setDegree] = useState(24);
  const [heads, setHeads] = useState(8);
  const edgeWork = degree * heads;
  return <section className="scene limits-scene">
    <div className="limits-controls visual-panel">
      <div className="panel-label">Stress the layer</div>
      <label><span>Neighborhood degree</span><input type="range" min="4" max="128" value={degree} onChange={(event) => setDegree(Number(event.target.value))} /><strong>{degree}</strong></label>
      <label><span>Attention heads</span><input type="range" min="1" max="16" value={heads} onChange={(event) => setHeads(Number(event.target.value))} /><strong>{heads}</strong></label>
      <div className="work-meter"><span>Edge-head score evaluations</span><b>{edgeWork}</b><i><em style={{ width: `${Math.min(100, edgeWork / 12)}%` }} /></i></div>
      <TeX className="formula" display tex="\text{local work}\propto|E_{\mathrm{batch}}|\,K" />
    </div>
    <div className="limits-list">
      <div><CircleDotDashed /><b>Selective</b><p>Unlike GCN, neighbors need not receive structurally fixed weights.</p></div>
      <div><Waypoints /><b>Inductive</b><p>Shared edge scoring does not require an eigenbasis or a fixed node identity.</p></div>
      <div><Activity /><b>Local</b><p>One layer still sees only one-hop neighbors; depth brings familiar smoothing and optimization issues.</p></div>
      <div><Sigma /><b>Competitive</b><p>Softmax forces high-degree neighbors to compete for a fixed unit mass.</p></div>
      <div><BrainCircuit /><b>Not automatically explanatory</b><p>A large coefficient is a learned routing weight, not guaranteed causal evidence.</p></div>
      <div><BarChart3 /><b>Potentially expensive</b><p>Full-neighborhood, multi-head scoring can be costly on large or dense graphs.</p></div>
    </div>
    <div className="comparison-strip"><span><b>GCN</b> fixed normalized weights</span><span><b>GraphSAGE</b> sampled learned aggregator</span><span><b>GAT</b> learned edge-wise weights</span></div>
  </section>;
}

const scenes: Scene[] = [
  { id: "qkv", kicker: "01 / Attention primer", title: "Q, K and V make selective aggregation explicit", component: QKVScene },
  { id: "bridge", kicker: "01 / Conceptual bridge", title: "GAT borrows attention, not Transformer QKV", component: BridgeScene },
  { id: "mask", kicker: "02 / Graph attention", title: "The graph defines who may receive attention", component: MaskScene },
  { id: "coefficients", kicker: "02 / One attention head", title: "Learn one normalized coefficient per eligible edge", component: CoefficientScene },
  { id: "aggregate", kicker: "02 / Numerical example", title: "Use learned weights to aggregate transformed features", component: AggregateScene },
  { id: "multihead", kicker: "02 / Multi-head attention", title: "Multiple heads stabilize and diversify the update", component: MultiHeadScene },
  { id: "evidence", kicker: "03 / Empirical evidence", title: "The original GAT was tested in both learning settings", component: EvidenceScene },
  { id: "limits", kicker: "04 / Features and limitations", title: "Attention changes weighting, not every GNN constraint", component: LimitsScene },
];

const icons = [BrainCircuit, GitCompareArrows, Network, CircleDotDashed, Sigma, Waypoints, BarChart3, Activity];

export default function App() {
  const params = useMemo(() => new URLSearchParams(
    (window as Window & { __VISUAL_LAB_PARAMS__?: string }).__VISUAL_LAB_PARAMS__ ?? window.location.search,
  ), []);
  const initial = Math.max(0, scenes.findIndex((scene) => scene.id === params.get("scene")));
  const [sceneIndex, setSceneIndex] = useState(initial);
  const clean = params.get("clean") === "1";
  const scene = scenes[sceneIndex];
  const SceneComponent = scene.component;
  useEffect(() => { const url = new URL(window.location.href); url.searchParams.set("scene", scene.id); window.history.replaceState({}, "", url); }, [scene.id]);
  const move = (direction: number) => setSceneIndex((value) => Math.max(0, Math.min(scenes.length - 1, value + direction)));
  return <main className={`app-shell ${clean ? "is-clean" : ""}`}>
    <header className="app-header">
      <div className="brand-mark"><Network /></div><div className="brand-copy"><b>GAT Visual Lab</b><span>Graph Attention Networks · ICLR 2018</span></div>
      {!clean && <nav className="scene-nav" aria-label="Visualization chapters">{scenes.map((item,index) => { const Icon = icons[index]; return <button key={item.id} className={sceneIndex === index ? "active" : ""} onClick={() => setSceneIndex(index)} title={item.title} aria-label={item.title}><Icon /><span>{index + 1}</span></button>; })}</nav>}
      <div className="chapter-count">{String(sceneIndex + 1).padStart(2,"0")} / {String(scenes.length).padStart(2,"0")}</div>
    </header>
    <section className="scene-heading"><span>{scene.kicker}</span><h1>{scene.title}</h1></section>
    <SceneComponent />
    {!clean && <footer className="scene-footer"><button className="icon-button" onClick={() => move(-1)} disabled={sceneIndex === 0} title="Previous chapter"><ChevronLeft /></button><div className="progress-track"><span style={{ width: `${((sceneIndex + 1) / scenes.length) * 100}%` }} /></div><button className="icon-button" onClick={() => move(1)} disabled={sceneIndex === scenes.length - 1} title="Next chapter"><ChevronRight /></button></footer>}
  </main>;
}
