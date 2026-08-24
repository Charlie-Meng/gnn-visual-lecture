import { useMemo, useState } from "react";
import { ArrowRight, Check, RefreshCw, TriangleAlert, X } from "lucide-react";
import { ComputationTree, Formula, GraphView, SampleLegend, Vector } from "./components";
import { nodeById, sampleNeighbors } from "./data";
import { matVec, mean, normalize } from "./math";
import type { GraphEdge, NodeId, SceneDefinition } from "./types";

const T = String.raw;

function sampledGraph(root: NodeId, fanout: number, depth: number) {
  const edges: GraphEdge[] = [];
  let frontier: NodeId[] = [root];
  const active = new Set<NodeId>([root]);
  for (let level = 0; level < depth; level += 1) {
    const next: NodeId[] = [];
    frontier.forEach((parent) => {
      sampleNeighbors(parent, fanout).forEach((child) => {
        edges.push({ source: parent, target: child });
        active.add(child);
        next.push(child);
      });
    });
    frontier = next;
  }
  return { edges, active: [...active] };
}

function SettingScene() {
  const [mode, setMode] = useState<"transductive" | "inductive">("transductive");
  const inductive = mode === "inductive";
  return (
    <section className="scene setting-scene">
      <div className="mode-switch setting-switch">
        <button className={!inductive ? "active" : ""} onClick={() => setMode("transductive")}>Transductive</button>
        <button className={inductive ? "active" : ""} onClick={() => setMode("inductive")}>Inductive</button>
      </div>
      <div className="setting-grid">
        <div className="visual-panel graph-panel">
          <div className="panel-label">TRAINING GRAPH</div>
          <GraphView showUnseen={false} selected="A" compact />
          <Formula>{inductive ? "learn shared parameters theta" : "optimize representations tied to this graph"}</Formula>
        </div>
        <div className="visual-panel graph-panel deployment-panel">
          <div className="panel-label">DEPLOYMENT</div>
          <GraphView
            showUnseen
            selected="H"
            compact
            activeNodes={inductive ? ["B", "E"] : []}
            sampledEdges={inductive ? [{ source: "H", target: "B" }, { source: "H", target: "E" }] : []}
            pulse={inductive}
          />
          <div className={`deployment-status ${inductive ? "is-ready" : "is-blocked"}`}>
            {inductive ? <Check /> : <X />}
            <div>
              <b>{inductive ? "Embed unseen node H immediately" : "Node H has no trained representation"}</b>
              <span>{inductive ? "Reuse the learned neighborhood function." : "The fixed training graph no longer matches deployment."}</span>
            </div>
          </div>
        </div>
      </div>
      <Formula accent tex={inductive ? T`\mathbf{h}_H=f_{\boldsymbol{\theta}}\!\left(\mathbf{x}_H,\{\mathbf{x}_u:u\in\mathcal{N}(H)\}\right)` : T`\mathbf{Z}=\{\mathbf{z}_A,\ldots,\mathbf{z}_G\}`} />
    </section>
  );
}

function UnseenNodeScene() {
  const [step, setStep] = useState(0);
  const sampled = step >= 2 ? [{ source: "H", target: "B" }, { source: "H", target: "E" }] as GraphEdge[] : [];
  const labels = ["Train", "New node", "Reuse function"];
  return (
    <section className="scene unseen-scene">
      <div className="step-strip">
        {labels.map((label, index) => <button key={label} className={step === index ? "active" : ""} onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>)}
      </div>
      <div className="scene-two">
        <div className="visual-panel graph-panel">
          <div className="panel-label">EVOLVING GRAPH</div>
          <GraphView showUnseen={step >= 1} selected={step >= 1 ? "H" : "A"} activeNodes={step >= 2 ? ["B", "E"] : []} sampledEdges={sampled} pulse={step >= 2} />
          <SampleLegend />
        </div>
        <div className="visual-panel requirement-panel">
          <div className="panel-label">WHAT INDUCTIVE INFERENCE REQUIRES</div>
          <Requirement active={step >= 0} title="Feature input" text="Use x_v instead of a node-specific lookup." />
          <Requirement active={step >= 1} title="Local structure" text="Read the neighborhood that exists at inference time." />
          <Requirement active={step >= 2} title="Shared function" text="Apply the same learned aggregators to H." />
          <Formula accent>{step < 2 ? "new topology -> new computation" : "same theta, new node, new neighborhood"}</Formula>
        </div>
      </div>
    </section>
  );
}

function Requirement({ active, title, text }: { active: boolean; title: string; text: string }) {
  return <div className={`requirement ${active ? "active" : ""}`}><span>{active ? <Check /> : <ArrowRight />}</span><div><b>{title}</b><p>{text}</p></div></div>;
}

function SamplingScene() {
  const [target, setTarget] = useState<NodeId>("A");
  const [fanout, setFanout] = useState(2);
  const [depth, setDepth] = useState(2);
  const sampled = useMemo(() => sampledGraph(target, fanout, depth), [target, fanout, depth]);
  return (
    <section className="scene sample-scene">
      <div className="sample-toolbar">
        <div className="mode-switch"><button className={target === "A" ? "active" : ""} onClick={() => setTarget("A")}>Seen target A</button><button className={target === "H" ? "active" : ""} onClick={() => setTarget("H")}>Unseen target H</button></div>
        <label>Fan-out <input type="range" min="1" max="3" value={fanout} onChange={(event) => setFanout(Number(event.target.value))} /><b>{fanout}</b></label>
        <div className="mode-switch"><button className={depth === 1 ? "active" : ""} onClick={() => setDepth(1)}>1 layer</button><button className={depth === 2 ? "active" : ""} onClick={() => setDepth(2)}>2 layers</button></div>
      </div>
      <div className="sample-grid">
        <div className="visual-panel graph-panel">
          <div className="panel-label">FULL GRAPH</div>
          <GraphView selected={target} showUnseen={target === "H"} activeNodes={sampled.active} sampledEdges={sampled.edges} pulse />
          <SampleLegend />
        </div>
        <div className="visual-panel tree-panel">
          <div className="panel-label">SAMPLED COMPUTATION GRAPH</div>
          <ComputationTree root={target} fanout={fanout} depth={depth} />
          <Formula accent tex={depth > 1 ? T`B_2=1+${fanout}+${fanout}^{2}` : T`B_1=1+${fanout}`} />
        </div>
      </div>
    </section>
  );
}

function AlgorithmScene() {
  const [stage, setStage] = useState(0);
  const steps = ["Sample", "Aggregate", "Concat", "Transform", "Normalize"];
  const self = nodeById("A").features;
  const neighbors = [nodeById("B").features, nodeById("D").features];
  const neighborhood = mean(neighbors);
  const concatenated = [...self, ...neighborhood];
  const transformed = matVec([[0.8, 0.1, 0.7, 0.2], [0.1, 0.9, 0.2, 0.8]], concatenated);
  const output = normalize(transformed);
  return (
    <section className="scene algorithm-scene">
      <div className="step-strip algorithm-steps">
        {steps.map((label, index) => <button key={label} className={stage === index ? "active" : ""} onClick={() => setStage(index)}><span>{index + 1}</span>{label}</button>)}
      </div>
      <div className="algorithm-grid">
        <div className="visual-panel graph-panel">
          <div className="panel-label">TARGET A, FAN-OUT 2</div>
          <GraphView selected="A" showUnseen={false} activeNodes={stage >= 0 ? ["B", "D"] : []} sampledEdges={[{ source: "A", target: "B" }, { source: "A", target: "D" }]} pulse={stage === 0} />
          <SampleLegend />
        </div>
        <div className="visual-panel calculation-panel">
          <div className="panel-label">ONE GRAPHSAGE-MEAN LAYER</div>
          <div className="calculation-flow">
            <Vector label="h_A^(0)" values={self} accent={stage >= 2} />
            <span className="calc-symbol">+</span>
            <div className={`neighbor-stack ${stage >= 1 ? "active" : ""}`}>
              <Vector label="h_B^(0)" values={neighbors[0]} />
              <Vector label="h_D^(0)" values={neighbors[1]} />
            </div>
            <ArrowRight />
            <Vector label="mean" values={neighborhood} accent={stage >= 1} />
          </div>
          <Formula tex={stage < 2 ? T`\mathbf{h}_{\mathcal{N}(A)}=\operatorname{MEAN}\!\left(\{\mathbf{h}_B,\mathbf{h}_D\}\right)=[0.55,\,0.45]` : T`\mathbf{c}_A=\mathbf{h}_A\Vert\mathbf{h}_{\mathcal{N}(A)}=[0.60,\,0.40,\,0.55,\,0.45]`} />
          <div className="transform-row">
            <Vector label="c_A" values={concatenated} accent={stage >= 2} />
            <span className="matrix-operator">W</span><ArrowRight />
            <Vector label="ReLU(W c_A)" values={transformed} accent={stage >= 3} />
            <ArrowRight />
            <Vector label="h_A^(1)" values={output} accent={stage >= 4} />
          </div>
          <Formula accent tex={stage < 4 ? T`\widetilde{\mathbf{h}}_A^{(1)}=\sigma\!\left(\mathbf{W}^{(1)}[\mathbf{h}_A^{(0)}\Vert\mathbf{h}_{\mathcal{N}(A)}^{(1)}]\right)` : T`\mathbf{h}_A^{(1)}=\frac{\widetilde{\mathbf{h}}_A^{(1)}}{\lVert\widetilde{\mathbf{h}}_A^{(1)}\rVert_2}=[0.745,\,0.667]`} />
        </div>
      </div>
    </section>
  );
}

function AggregatorScene() {
  const [mode, setMode] = useState<"mean" | "lstm" | "pool">("mean");
  const [reverse, setReverse] = useState(false);
  const input = [
    { id: "B", value: [0.9, 0.1] },
    { id: "D", value: [0.2, 0.8] },
    { id: "E", value: [0.1, 0.9] },
  ];
  const ordered = reverse ? [...input].reverse() : input;
  const output = mode === "mean" ? [0.4, 0.6] : mode === "lstm" ? (reverse ? [0.49, 0.58] : [0.62, 0.48]) : [0.95, 0.95, 0.8];
  return (
    <section className="scene aggregator-scene">
      <div className="mode-switch aggregator-switch">
        <button className={mode === "mean" ? "active" : ""} onClick={() => setMode("mean")}>Mean</button>
        <button className={mode === "lstm" ? "active" : ""} onClick={() => setMode("lstm")}>LSTM</button>
        <button className={mode === "pool" ? "active" : ""} onClick={() => setMode("pool")}>Pooling</button>
      </div>
      <div className="aggregator-grid">
        <div className="visual-panel neighbor-inputs">
          <div className="panel-label">UNORDERED NEIGHBOR SET</div>
          <div className="neighbor-chips">
            {ordered.map((item, index) => <div key={item.id} style={{ "--delay": index } as React.CSSProperties}><b>{item.id}</b><Vector values={item.value} /></div>)}
          </div>
          {mode === "lstm" && <button className="reset-button" onClick={() => setReverse((value) => !value)}><RefreshCw />Reverse the random permutation</button>}
          <Formula tex={mode === "mean" ? T`\operatorname{MEAN}\!\left(\{\mathbf{h}_u\}\right)` : mode === "lstm" ? T`\operatorname{LSTM}(${ordered.map((item) => item.id).join(",")})` : T`\max_u\operatorname{MLP}(\mathbf{h}_u)`} />
        </div>
        <div className="visual-panel aggregator-machine">
          <div className="panel-label">AGGREGATOR</div>
          {mode === "mean" && <MeanMachine />}
          {mode === "lstm" && <LstmMachine order={ordered.map((item) => item.id)} />}
          {mode === "pool" && <PoolMachine />}
        </div>
        <div className="visual-panel aggregator-output">
          <div className="panel-label">NEIGHBORHOOD VECTOR</div>
          <Vector label="h_N(A)" values={output} accent />
          <div className="property-list">
            <Property ok={mode !== "lstm"} label="Permutation invariant" />
            <Property ok={mode !== "mean"} label="Trainable aggregation" />
            <Property ok={mode === "pool"} label="Feature-wise selection" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MeanMachine() {
  return <div className="mean-machine"><div>B</div><div>D</div><div>E</div><span>element-wise mean</span><strong>[0.40, 0.60]</strong></div>;
}

function LstmMachine({ order }: { order: string[] }) {
  return <div className="lstm-machine">{order.map((id, index) => <div key={id}><span>{id}</span><b>state {index + 1}</b></div>)}</div>;
}

function PoolMachine() {
  const rows = [[0.95, 0.2, 0.45], [0.3, 0.85, 0.7], [0.2, 0.95, 0.8]];
  return <div className="pool-machine"><div className="pool-rows">{rows.map((row, index) => <Vector key={index} label={`MLP(h_${["B", "D", "E"][index]})`} values={row} />)}</div><span>feature-wise max</span><Vector values={[0.95, 0.95, 0.8]} accent /></div>;
}

function Property({ ok, label }: { ok: boolean; label: string }) {
  return <div className={ok ? "ok" : "warn"}>{ok ? <Check /> : <TriangleAlert />}<span>{label}</span></div>;
}

function ScalingScene() {
  const [s1, setS1] = useState(2);
  const [s2, setS2] = useState(3);
  const [batch, setBatch] = useState(4);
  const perTarget = 1 + s1 + s1 * s2;
  const perBatch = perTarget * batch;
  const fullTwoHop = 1 + 25 + 25 * 24;
  return (
    <section className="scene scaling-scene">
      <div className="scaling-controls visual-panel">
        <div className="panel-label">FIXED FAN-OUT</div>
        <RangeControl label="S1" value={s1} max={4} onChange={setS1} />
        <RangeControl label="S2" value={s2} max={4} onChange={setS2} />
        <RangeControl label="Batch" value={batch} max={8} onChange={setBatch} />
      <Formula accent tex={T`B(1+S_1+S_1S_2)=${batch}\times${perTarget}=${perBatch}`} />
      </div>
      <div className="visual-panel scaling-tree">
        <div className="panel-label">COMPUTATION PER TARGET</div>
        <ComputationTree root="A" fanout={Math.min(s1, 3)} depth={2} />
        <div className="scale-comparison">
          <ScaleBar label="Full 2-hop expansion" value={fullTwoHop} max={fullTwoHop} tone="muted" />
          <ScaleBar label="GraphSAGE sample" value={perTarget} max={fullTwoHop} tone="teal" />
        </div>
      </div>
      <div className="visual-panel scaling-summary">
        <div className="panel-label">WHY SAMPLING MATTERS</div>
        <strong>{perTarget}</strong>
        <span>nodes per target</span>
        <p>Work depends on selected fan-outs, not the target node's full degree.</p>
        <div className="bounded-badge"><Check />mini-batchable</div>
        <div className="bounded-badge"><Check />predictable memory</div>
      </div>
    </section>
  );
}

function RangeControl({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  return <label className="range-control"><span>{label}</span><input type="range" min="1" max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /><b>{value}</b></label>;
}

function ScaleBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const width = Math.max(3, (value / max) * 100);
  return <div className="scale-bar"><span>{label}</span><i><b className={tone} style={{ width: `${width}%` }} /></i><strong>{value}</strong></div>;
}

function LimitationsScene() {
  const [focus, setFocus] = useState<"sample" | "order" | "depth">("sample");
  const sampled = focus === "sample" ? sampledGraph("A", 1, 2) : sampledGraph("A", 2, focus === "depth" ? 1 : 2);
  const messages = {
    sample: { title: "Sampling variance", body: "Different sampled neighbors can produce different embeddings and may omit rare signals." },
    order: { title: "LSTM order sensitivity", body: "A random permutation approximates set processing, but the operator is not inherently symmetric." },
    depth: { title: "Finite receptive field", body: "A fixed K cannot capture dependencies beyond K hops without deeper, more expensive stacks." },
  };
  return (
    <section className="scene limitations-scene">
      <div className="mode-switch limitation-tabs">
        <button className={focus === "sample" ? "active" : ""} onClick={() => setFocus("sample")}>Sampling</button>
        <button className={focus === "order" ? "active" : ""} onClick={() => setFocus("order")}>Ordering</button>
        <button className={focus === "depth" ? "active" : ""} onClick={() => setFocus("depth")}>Depth</button>
      </div>
      <div className="limitations-grid">
        <div className="visual-panel graph-panel">
          <div className="panel-label">LOCAL VIEW</div>
          <GraphView selected="A" showUnseen={false} activeNodes={sampled.active} sampledEdges={sampled.edges} pulse={focus === "sample"} />
          <SampleLegend />
        </div>
        <div className="visual-panel limitation-detail">
          <div className="risk-icon"><TriangleAlert /></div>
          <h2>{messages[focus].title}</h2>
          <p>{messages[focus].body}</p>
          <Formula accent tex={focus === "sample" ? T`\text{efficiency}\;\longleftrightarrow\;\text{information coverage}` : focus === "order" ? T`\operatorname{LSTM}(a,b,c)\neq\operatorname{LSTM}(c,b,a)` : T`\text{receptive-field radius}\le K`} />
          <div className="minor-risks"><span>Neighbor explosion before sampling</span><span>Feature quality is required for unseen nodes</span><span>Static fan-out ignores neighbor importance</span></div>
        </div>
      </div>
      <div className="comparison-table">
        <div><b>Model</b><b>Neighborhood</b><b>Inference</b><b>Edge weighting</b></div>
        <div><strong>GCN</strong><span>all neighbors</span><span>fixed-graph setup</span><span>degree normalized</span></div>
        <div className="highlight"><strong>GraphSAGE</strong><span>sampled neighbors</span><span>inductive function</span><span>aggregator defined</span></div>
        <div><strong>GAT</strong><span>all / sampled</span><span>shared attention</span><span>learned per edge</span></div>
      </div>
    </section>
  );
}

export const scenes: SceneDefinition[] = [
  { id: "setting", kicker: "01 / LEARNING SETTING", title: "Transductive or inductive?", component: SettingScene },
  { id: "unseen", kicker: "02 / THE NEW PROBLEM", title: "What happens when a new node arrives?", component: UnseenNodeScene },
  { id: "sample", kicker: "03 / GRAPH SAMPLE", title: "Sample a bounded computation graph", component: SamplingScene },
  { id: "algorithm", kicker: "04 / AND AGGREGATE", title: "Build one embedding step by step", component: AlgorithmScene },
  { id: "aggregators", kicker: "05 / AGGREGATOR CHOOSING", title: "Three ways to compress a neighbor set", component: AggregatorScene },
  { id: "scaling", kicker: "06 / LARGE GRAPHS", title: "Fixed fan-out makes work predictable", component: ScalingScene },
  { id: "limits", kicker: "07 / LIMITS AND COMPARISON", title: "Efficiency introduces new trade-offs", component: LimitationsScene },
];
