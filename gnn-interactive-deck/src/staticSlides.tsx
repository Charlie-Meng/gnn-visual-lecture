import type { CSSProperties, ReactNode } from "react";
import {
  Activity,
  BrainCircuit,
  Database,
  Eye,
  Gauge,
  Layers3,
  Network,
  ScanLine,
  Shuffle,
  TextCursorInput,
  Waypoints,
} from "lucide-react";
import { DisplayMath } from "./Math";

type Accent = "navy" | "coral" | "teal" | "yellow";

const STATIC_SLIDES = new Set([1, 2, 6, 10, 19, 20, 21, 22, 26, 27, 34, 39, 40, 42, 56, 57, 58, 60, 62]);

function Footer({ number, source }: { number: number; source?: string }) {
  return (
    <footer className="static-footer">
      <span>{source ?? "Graph Neural Networks | Visual Lecture"}</span>
      <b>{String(number).padStart(2, "0")}</b>
    </footer>
  );
}

function Frame({
  number,
  section,
  title,
  accent = "teal",
  children,
  takeaway,
  source,
  className = "",
}: {
  number: number;
  section: string;
  title: string;
  accent?: Accent;
  children: ReactNode;
  takeaway?: string;
  source?: string;
  className?: string;
}) {
  return (
    <div className={`native-static-slide accent-${accent} ${className}`}>
      <header className="static-header">
        <span>{section}</span>
        <h2>{title}</h2>
      </header>
      <div className="static-content">{children}</div>
      {takeaway ? <div className="static-takeaway">{takeaway}</div> : null}
      <Footer number={number} source={source} />
    </div>
  );
}

const graphNodes = [
  { id: "A", x: 300, y: 190 },
  { id: "B", x: 140, y: 78 },
  { id: "C", x: 480, y: 82 },
  { id: "D", x: 120, y: 322 },
  { id: "E", x: 486, y: 315 },
  { id: "F", x: 292, y: 382 },
];
const graphEdges = [["A", "B"], ["A", "C"], ["A", "D"], ["A", "E"], ["B", "C"], ["B", "F"], ["D", "E"], ["E", "F"]];

function GraphDiagram({ variant = "plain", label = true }: { variant?: "plain" | "smooth" | "hetero" | "weighted" | "unseen"; label?: boolean }) {
  const point = (id: string) => graphNodes.find((node) => node.id === id)!;
  return (
    <svg className={`static-graph graph-${variant}`} viewBox="0 0 600 440" role="img" aria-label={`${variant} graph diagram`}>
      {graphEdges.map(([from, to], index) => {
        const a = point(from); const b = point(to);
        const weight = variant === "weighted" && from === "A" ? [7, 3, 5, 10][index % 4] : 2;
        const hetero = variant === "hetero" && [1, 3, 6].includes(index);
        return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ strokeWidth: weight }} className={hetero ? "hetero-edge" : ""} />;
      })}
      {variant === "unseen" ? <line x1="486" y1="315" x2="565" y2="220" className="new-edge" /> : null}
      {graphNodes.map((node, index) => (
        <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
          <circle r={node.id === "A" ? 34 : 26} className={variant === "smooth" ? `smooth-${index % 2}` : node.id === "A" ? "target-node" : ""} />
          {label ? <text y="2">{node.id}</text> : null}
        </g>
      ))}
      {variant === "unseen" ? <g className="unseen-node" transform="translate(565 220)"><circle r="29" /><text y="2">H</text></g> : null}
    </svg>
  );
}

function SectionBackdrop({ variant }: { variant: "gcn" | "sage" | "gat" }) {
  return (
    <div className={`section-backdrop variant-${variant}`} aria-hidden="true">
      <GraphDiagram variant={variant === "sage" ? "unseen" : variant === "gat" ? "weighted" : "plain"} label={false} />
      {variant === "gcn" ? <div className="spectral-bars"><i /><i /><i /><i /><i /></div> : null}
    </div>
  );
}

function SectionCover({ number, kicker, model, question, answer, variant }: { number: number; kicker: string; model: string; question: string; answer: string; variant: "gcn" | "sage" | "gat" }) {
  return (
    <div className={`native-section-cover cover-${variant}`}>
      <SectionBackdrop variant={variant} />
      <div className="cover-scrim" />
      <div className="cover-copy">
        <span>{kicker}</span>
        <h2>{model}</h2>
        <i />
        <h3>{question}</h3>
        <p>{answer}</p>
      </div>
      <Footer number={number} />
    </div>
  );
}

type BarDatum = { name: string; values: Array<{ label: string; value: number; color: string }> };

function BarChart({ data, max = 100, legend }: { data: BarDatum[]; max?: number; legend: Array<{ label: string; color: string }> }) {
  return (
    <div className="native-bar-chart">
      <div className="bar-groups">
        {data.map((group) => (
          <div className="bar-group" key={group.name}>
            <strong>{group.name}</strong>
            <div>
              {group.values.map((item) => (
                <span className="bar-row" key={`${group.name}-${item.label}`}>
                  <i style={{ width: `${(item.value / max) * 100}%`, background: item.color }} />
                  <b>{item.value}</b>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="bar-axis"><span>0</span><span>{max / 2}</span><span>{max}</span></div>
      <div className="bar-legend">{legend.map((item) => <span key={item.label}><i style={{ background: item.color }} />{item.label}</span>)}</div>
    </div>
  );
}

function TitleSlide() {
  return (
    <div className="native-title-slide">
      <div className="title-visual" aria-hidden="true">
        <GraphDiagram variant="weighted" />
        <div className="matrix-ghost">{Array.from({ length: 49 }, (_, index) => <i className={index % 8 === 0 || index % 6 === 0 ? "on" : ""} key={index} />)}</div>
      </div>
      <div className="title-scrim" />
      <div className="title-copy">
        <span>GRAPH NEURAL NETWORKS</span>
        <h1>Three answers to one<br />message-passing question</h1>
        <i />
        <h3>GCN · GraphSAGE · GAT</h3>
        <p>From graph structure to normalized, sampled, and attentive aggregation</p>
      </div>
      <Footer number={1} />
    </div>
  );
}

function RoadmapSlide() {
  const models = [
    { name: "GCN", question: "How should graph structure weight neighbors?", answer: "Fixed normalized propagation", accent: "navy", n: "1" },
    { name: "GraphSAGE", question: "How can the function generalize to unseen nodes?", answer: "Sample and aggregate", accent: "coral", n: "2" },
    { name: "GAT", question: "Which eligible neighbors should matter most?", answer: "Learned edge-wise attention", accent: "teal", n: "3" },
  ];
  return (
    <Frame number={2} section="THE COMMON THREAD" title="One template, three aggregation decisions" accent="yellow" className="roadmap-slide">
      <div className="common-equation"><DisplayMath tex="\mathbf{h}_i'=\text{self information}+\text{aggregated neighbor information}" /></div>
      <div className="roadmap-columns">{models.map((model) => <article className={`roadmap-item tone-${model.accent}`} key={model.name}><header><b>{model.n}</b><h3>{model.name}</h3></header><p>{model.question}</p><strong>{model.answer}</strong></article>)}</div>
    </Frame>
  );
}

function TopologySlide() {
  const rows = [
    { label: "IMAGE", idea: "fixed 2D grid", detail: "same size and order", icon: <ScanLine />, tone: "teal" },
    { label: "SEQUENCE", idea: "ordered positions", detail: "previous / next tokens", icon: <TextCursorInput />, tone: "navy" },
    { label: "GRAPH", idea: "irregular topology", detail: "variable degree, unordered", icon: <Waypoints />, tone: "coral" },
  ];
  return <Frame number={6} section="03 / WHY GRAPHS ARE DIFFERENT" title="Graphs have no fixed spatial neighborhood" accent="coral" takeaway="On a graph, the receptive field must follow edges instead of coordinates."><div className="topology-rows">{rows.map((row) => <div className={`topology-row tone-${row.tone}`} key={row.label}><span>{row.icon}<b>{row.label}</b></span><i /><h3>{row.idea}</h3><p>{row.detail}</p></div>)}</div></Frame>;
}

const gcnEvidence = [
  ["Citeseer", "3,327", "4,732", "6", "3.6%"],
  ["Cora", "2,708", "5,429", "7", "5.2%"],
  ["Pubmed", "19,717", "44,338", "3", "0.3%"],
  ["NELL", "65,755", "266,144", "210", "0.1%"],
];

function GcnDatasetSlide() {
  return <Frame number={19} section="06 / PAPER EVIDENCE" title="Citations add signal beyond document words" accent="coral" takeaway="GCN combines document features with citation structure." source="Kipf & Welling, Table 1 and Section 5.1"><div className="evidence-intro"><h3>Each node is a document; each edge is a citation link.</h3><p>Training uses every feature vector but only a small labeled subset.</p></div><div className="table-and-stat"><table className="native-table"><thead><tr><th>Dataset</th><th>Nodes</th><th>Edges</th><th>Classes</th><th>Label rate</th></tr></thead><tbody>{gcnEvidence.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table><aside className="big-stat coral-stat"><b>20</b><strong>labeled nodes<br />per class</strong><span>citation datasets</span></aside></div></Frame>;
}

function GcnResultsSlide() {
  const data: BarDatum[] = [
    { name: "NELL", values: [{ label: "Planetoid*", value: 61.9, color: "#cbd3d3" }, { label: "GCN", value: 66, color: "#087e72" }] },
    { name: "Pubmed", values: [{ label: "Planetoid*", value: 77.2, color: "#cbd3d3" }, { label: "GCN", value: 79, color: "#087e72" }] },
    { name: "Cora", values: [{ label: "Planetoid*", value: 75.7, color: "#cbd3d3" }, { label: "GCN", value: 81.5, color: "#087e72" }] },
    { name: "Citeseer", values: [{ label: "Planetoid*", value: 64.7, color: "#cbd3d3" }, { label: "GCN", value: 70.3, color: "#087e72" }] },
  ];
  return <Frame number={20} section="06 / PAPER EVIDENCE" title="One propagation rule improved accuracy and speed" accent="coral" takeaway="The renormalized operator performed strongly across four benchmark graphs." source="Kipf & Welling, Table 2"><div className="chart-and-stat"><BarChart data={data} max={90} legend={[{ label: "Planetoid*", color: "#cbd3d3" }, { label: "GCN", color: "#087e72" }]} /><aside><div className="big-stat coral-stat"><b>4 s</b><span>Cora convergence time</span></div><h3>Planetoid*: 13 s</h3><p>same hardware and paper implementations</p></aside></div></Frame>;
}

function GcnLimitsSlide() {
  return <Frame number={21} section="07 / LIMITATIONS" title="Repeated averaging exposes GCN's limits" accent="coral" source="Paper limitations + later GNN literature framing"><div className="dual-limit"><article><h3>Depth</h3><GraphDiagram variant="smooth" /><div><b>Oversmoothing</b><span>representations converge with depth</span><b>Full-batch coupling</b><span>original training sees the fixed graph</span></div></article><article><h3>Graph assumption</h3><GraphDiagram variant="hetero" /><div><b>Homophily bias</b><span>edges may connect dissimilar nodes</span><b>Fixed edge weights</b><span>degree normalization is not learned</span></div></article></div></Frame>;
}

function SageInputsSlide() {
  const items = [{ icon: <Database />, name: "Node features", detail: "Available for the unseen target" }, { icon: <Network />, name: "Current local structure", detail: "Edges define the neighborhood now" }, { icon: <BrainCircuit />, name: "Shared parameters", detail: "Learned once and reused" }];
  return <Frame number={26} section="01 / THE SOLUTION SHAPE" title="Inductive inference needs three reusable inputs" accent="coral" takeaway="Features, current local structure, and shared parameters are sufficient to embed an unseen node."><div className="inputs-layout"><div className="inputs-graph"><GraphDiagram variant="unseen" /></div><div className="inputs-list">{items.map((item) => <article key={item.name}>{item.icon}<div><b>{item.name}</b><p>{item.detail}</p></div></article>)}<div className="inputs-equation"><DisplayMath tex="\mathbf{h}_H=f_{\boldsymbol{\theta}}\!\left(\mathbf{x}_H,\{\mathbf{x}_u:u\in\mathcal{N}(H)\}\right)" /></div></div></div></Frame>;
}

function SageNameSlide() {
  return <Frame number={27} section="02 / THE NAME IS THE ALGORITHM" title="Graph SAmple and aggreGatE" accent="coral" source="Hamilton, Ying & Leskovec, Figure 1 and Algorithm 1"><div className="name-word"><span>SA</span><b>MPLE</b><span>AGGRE</span><em>GATE</em></div><div className="name-steps"><article><b>1</b><p>Select a bounded neighbor set</p></article><i>→</i><article><b>2</b><p>Compress it into one vector</p></article></div><div className="name-equation"><DisplayMath tex="\operatorname{sample}\mathcal{N}_S(v)\;\longrightarrow\;\operatorname{aggregate}\{\mathbf{h}_u:u\in\mathcal{N}_S(v)\}\;\longrightarrow\;\operatorname{update}\mathbf{h}_v" /></div></Frame>;
}

function UnorderedSlide() {
  return <Frame number={34} section="03 / AGGREGATOR CHOOSING" title="An aggregator receives an unordered set" accent="coral" takeaway="Ideal aggregators are permutation invariant, trainable, and expressive." source="GraphSAGE, Section 3.3"><p className="set-lead">The graph does not define a canonical first neighbor.</p><div className="order-demo"><article><span>ORDER 1</span><div><b>B</b><b>D</b><b>E</b></div></article><Shuffle /><article><span>ORDER 2</span><div><b>E</b><b>B</b><b>D</b></div></article></div><div className="invariance-rows"><article className="good"><b>SYMMETRIC</b><DisplayMath tex="\operatorname{AGG}(\{B,D,E\})=\operatorname{AGG}(\{E,B,D\})" /></article><article className="bad"><b>ORDER-SENSITIVE</b><DisplayMath tex="\operatorname{LSTM}(B,D,E)\neq\operatorname{LSTM}(E,B,D)" /></article></div></Frame>;
}

function SageBenchmarksSlide() {
  const rows = [["Citation", "paper subject", "unseen nodes", "evolving document graph"], ["Reddit", "post community", "unseen nodes", "time-based graph evolution"], ["PPI", "protein functions", "unseen graphs", "different biological graphs"]];
  return <Frame number={39} section="04 / PAPER EVIDENCE" title="Every benchmark tests inductive generalization" accent="coral" takeaway="PPI is the strongest inductive test: the model predicts on entirely unseen graphs." source="GraphSAGE, Section 4"><div className="table-and-stat benchmark-table"><table className="native-table"><thead><tr><th>Dataset</th><th>Prediction target</th><th>Inductive split</th><th>Paper setting</th></tr></thead><tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table><aside className="big-stat coral-stat"><b>K = 2</b><strong>S1 = 25<br />S2 = 10</strong><span>reported experiment fan-outs</span></aside></div></Frame>;
}

function SageResultsSlide() {
  const data: BarDatum[] = [
    { name: "PPI", values: [{ label: "SAGE-GCN", value: 50, color: "#cbd3d3" }, { label: "SAGE-mean", value: 59.8, color: "#244b67" }, { label: "SAGE-LSTM", value: 61.2, color: "#e46445" }, { label: "SAGE-pool", value: 60, color: "#087e72" }] },
    { name: "Reddit", values: [{ label: "SAGE-GCN", value: 93, color: "#cbd3d3" }, { label: "SAGE-mean", value: 95, color: "#244b67" }, { label: "SAGE-LSTM", value: 95.4, color: "#e46445" }, { label: "SAGE-pool", value: 94.8, color: "#087e72" }] },
    { name: "Citation", values: [{ label: "SAGE-GCN", value: 77.2, color: "#cbd3d3" }, { label: "SAGE-mean", value: 82, color: "#244b67" }, { label: "SAGE-LSTM", value: 83.2, color: "#e46445" }, { label: "SAGE-pool", value: 83.9, color: "#087e72" }] },
  ];
  return <Frame number={40} section="04 / PAPER EVIDENCE" title="Trainable aggregators beat the GCN-like variant" accent="coral" takeaway="The result is not only accuracy: inductive inference avoids optimization for every new node." source="GraphSAGE, Table 1 and Section 4.3"><div className="chart-and-stat"><BarChart data={data} max={120} legend={[{ label: "SAGE-GCN", color: "#cbd3d3" }, { label: "SAGE-mean", color: "#244b67" }, { label: "SAGE-LSTM", color: "#e46445" }, { label: "SAGE-pool", color: "#087e72" }]} /><aside><div className="big-stat coral-stat"><b>100–500×</b><span>DeepWalk slower at test time</span></div><h3>K &gt; 2</h3><p>0–5% marginal gain<br />10–100× runtime</p></aside></div></Frame>;
}

function GatDesignSlide() {
  const columns = [{ label: "TRANSDUCTIVE", title: "Citation networks", sub: "Cora · Citeseer · Pubmed", tone: "navy", rows: [["GRAPH", "One graph per dataset"], ["TASK", "Single-label node classification"], ["TEST", "Known graph; labels withheld"], ["MODEL", "8 heads × 8 features → output"]] }, { label: "INDUCTIVE", title: "Protein interactions", sub: "24 PPI graphs", tone: "teal", rows: [["GRAPH", "20 train · 2 validation · 2 test"], ["TASK", "121-label node classification"], ["TEST", "Entire test graphs unseen"], ["MODEL", "4 heads → 4 heads → 6 averaged"]] }];
  return <Frame number={56} section="03 / EMPIRICAL DESIGN" title="The paper tests both learning settings" accent="coral" takeaway="PPI is the stronger inductive claim because every test graph is absent during training." source="Graph Attention Networks, Section 3"><div className="design-columns">{columns.map((col) => <article className={`tone-${col.tone}`} key={col.label}><span>{col.label}</span><h3>{col.title}</h3><h4>{col.sub}</h4>{col.rows.map(([a, b]) => <div key={a}><b>{a}</b><p>{b}</p></div>)}</article>)}</div></Frame>;
}

function GatCitationSlide() {
  const data: BarDatum[] = [{ name: "Cora", values: [{ label: "GCN", value: 81.5, color: "#cbd3d3" }, { label: "GAT", value: 83, color: "#087e72" }] }, { name: "Citeseer", values: [{ label: "GCN", value: 70.3, color: "#cbd3d3" }, { label: "GAT", value: 72.5, color: "#087e72" }] }, { name: "Pubmed", values: [{ label: "GCN", value: 79, color: "#cbd3d3" }, { label: "GAT", value: 79, color: "#087e72" }] }];
  return <Frame number={57} section="03 / TRANSDUCTIVE EVIDENCE" title="Citation networks: gains are selective" accent="teal" takeaway="Attention improved Cora and Citeseer while matching GCN on Pubmed."><div className="gat-evidence"><BarChart data={data} max={90} legend={[{ label: "GCN", color: "#cbd3d3" }, { label: "GAT", color: "#087e72" }]} /><aside>{[["CORA", "83.0 ± 0.7%", "GCN: 81.5%"], ["CITESEER", "72.5 ± 0.7%", "GCN: 70.3%"], ["PUBMED", "79.0 ± 0.3%", "GCN: 79.0%"]].map((row) => <div key={row[0]}><span>{row[0]}</span><b>{row[1]}</b><p>{row[2]}</p></div>)}</aside></div></Frame>;
}

function GatPpiSlide() {
  const values = [{ name: "GraphSAGE*", value: 0.768, note: "Best modified GraphSAGE reported by the GAT authors." }, { name: "Const-GAT", value: 0.934, note: "Same architecture with equal neighbor importance." }, { name: "GAT", value: 0.973, note: "Learned attention on disjoint test graphs." }];
  return <Frame number={58} section="03 / INDUCTIVE EVIDENCE" title="PPI: attention transfers to unseen graphs" accent="teal" takeaway="The strongest evidence for learned neighbor importance is GAT versus Const-GAT under the same architecture."><div className="ppi-evidence"><div className="ppi-bars">{values.map((item, index) => <article key={item.name}><span>{item.name}</span><i><b style={{ width: `${item.value * 100}%` }} /></i><strong>{item.value.toFixed(3)}</strong><p>{item.note}</p><em className={index === 2 ? "best" : ""} /></article>)}</div><aside><Network /><b>24 disjoint graphs</b><p>Micro-F1 on unseen protein-interaction graphs</p></aside></div></Frame>;
}

function GatLimitsSlide() {
  const items = [{ label: "SCALE", title: "Full-neighborhood × multi-head cost", detail: "Degree × heads multiplies edge work.", icon: <Gauge /> }, { label: "DEPTH", title: "Still local message passing", detail: "Long-range context needs deeper stacking.", icon: <Layers3 /> }, { label: "MEANING", title: "Weight ≠ explanation", detail: "A large coefficient is not causal proof.", icon: <Eye /> }];
  return <Frame number={60} section="04 / LIMITATIONS" title="Attention does not remove every GNN constraint" accent="teal" takeaway="GAT improves the weighting function; it does not solve scale, depth, or interpretability by itself."><div className="gat-limit-layout"><div className="gat-stress"><GraphDiagram variant="weighted" /><div><span>Neighborhood degree</span><i><b style={{ width: "74%" }} /></i><span>Attention heads</span><i><b style={{ width: "52%" }} /></i><strong>edge work grows with both controls</strong></div></div><div className="gat-limit-list">{items.map((item) => <article key={item.label}>{item.icon}<div><span>{item.label}</span><b>{item.title}</b><p>{item.detail}</p></div></article>)}</div></div></Frame>;
}

function SynthesisSlide() {
  const items = [{ n: "1", name: "GCN", verb: "NORMALIZE", text: "Use graph structure to define stable weights.", tone: "navy" }, { n: "2", name: "GraphSAGE", verb: "SAMPLE + AGGREGATE", text: "Learn a function that transfers to unseen entities.", tone: "coral" }, { n: "3", name: "GAT", verb: "ATTEND", text: "Learn which eligible messages matter for each target.", tone: "teal" }];
  return <Frame number={62} section="FINAL SYNTHESIS" title="The progression is in the aggregation rule" accent="teal"><div className="synthesis-flow">{items.map((item, index) => <div className="synthesis-unit" key={item.name}><article className={`tone-${item.tone}`}><header><b>{item.n}</b><h3>{item.name}</h3></header><span>{item.verb}</span><p>{item.text}</p></article>{index < items.length - 1 ? <i>→</i> : null}</div>)}</div><div className="synthesis-close">All three models are message passing; they make different compromises about structure, scale, and selectivity.</div></Frame>;
}

export function NativeStaticSlide({ number }: { number: number }) {
  switch (number) {
    case 1: return <TitleSlide />;
    case 2: return <RoadmapSlide />;
    case 6: return <TopologySlide />;
    case 10: return <SectionCover number={10} kicker="PART I / GRAPH CONVOLUTIONAL NETWORKS" model="GCN" question="How can a graph use a convolution-like operator?" answer="Answer: approximate spectral convolution with stable normalized propagation." variant="gcn" />;
    case 19: return <GcnDatasetSlide />;
    case 20: return <GcnResultsSlide />;
    case 21: return <GcnLimitsSlide />;
    case 22: return <SectionCover number={22} kicker="PART II / INDUCTIVE REPRESENTATION LEARNING" model="GraphSAGE" question="What if the node or graph did not exist during training?" answer="Answer: learn a reusable function that samples and aggregates." variant="sage" />;
    case 26: return <SageInputsSlide />;
    case 27: return <SageNameSlide />;
    case 34: return <UnorderedSlide />;
    case 39: return <SageBenchmarksSlide />;
    case 40: return <SageResultsSlide />;
    case 42: return <SectionCover number={42} kicker="PART III / GRAPH ATTENTION NETWORKS" model="GAT" question="What if connected neighbors should not count equally?" answer="Answer: learn a target-dependent coefficient for every eligible edge." variant="gat" />;
    case 56: return <GatDesignSlide />;
    case 57: return <GatCitationSlide />;
    case 58: return <GatPpiSlide />;
    case 60: return <GatLimitsSlide />;
    case 62: return <SynthesisSlide />;
    default: return null;
  }
}

export function hasNativeStaticSlide(number: number) {
  return STATIC_SLIDES.has(number);
}

export function staticSlideStyle(accent: string): CSSProperties {
  return { "--static-accent": accent } as CSSProperties;
}
