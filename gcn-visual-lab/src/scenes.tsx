import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { GraphView, MatrixGrid, Formula, Vector } from "./components";
import { imageGrid, kernel, nodeById, nodeIds, nodes } from "./data";
import {
  adjacency,
  convolutionAt,
  featureMatrix,
  gcnForward,
  hiddenWeight,
  hopDistance,
  matrixAddIdentity,
  multiplyMatrices,
  normalizedAdjacency,
  outputWeight,
  pathGraphSpectrum,
  propagateFeatures,
  relu,
  round,
} from "./math";
import type { Matrix, NodeId } from "./types";
import { Math as TeX } from "./Math";

export function GraphScene() {
  const [selected, setSelected] = useState<NodeId>("A");
  const [hop, setHop] = useState(1);
  const distances = hopDistance(selected);
  const a = adjacency();
  const activeCells = nodeIds
    .map((id, index) => [index, nodeIds.indexOf(selected), distances[id]] as const)
    .filter(([, , distance]) => distance === 1)
    .flatMap(([index, selectedIndex]) => [[selectedIndex, index], [index, selectedIndex]] as Array<[number, number]>);
  return (
    <section className="scene scene-two">
      <div className="visual-panel graph-panel">
        <div className="panel-label">GRAPH G = (V, E)</div>
        <GraphView selected={selected} hop={hop} onSelect={setSelected} />
        <div className="legend-line"><span className="dot target" />target <span className="dot neighbor" />within {hop}-hop</div>
      </div>
      <div className="visual-panel matrix-panel">
        <div className="panel-label">THE SAME STRUCTURE AS A MATRIX</div>
        <MatrixGrid values={a} activeRow={nodeIds.indexOf(selected)} activeCells={activeCells} title="Adjacency matrix A" />
        <div className="segmented" aria-label="Neighborhood depth">
          {[0, 1, 2].map((value) => (
            <button key={value} className={hop === value ? "active" : ""} onClick={() => setHop(value)}>{value === 0 ? "node" : `${value}-hop`}</button>
          ))}
        </div>
        <Formula accent>{selected}: {Object.values(distances).filter((value) => value === hop).length} nodes at exactly {hop} hop{hop === 1 ? "" : "s"}</Formula>
      </div>
    </section>
  );
}

export function KernelScene() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { row, col, sum } = convolutionAt(step);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((value) => (value + 1) % 9), 900);
    return () => window.clearInterval(timer);
  }, [playing]);
  return (
    <section className="scene kernel-scene">
      <div className="visual-panel kernel-workbench">
        <div className="panel-label">IMAGE: ONE FIXED 3 x 3 WINDOW</div>
        <div className="grid-pair">
          <div className="pixel-grid image-grid">
            {imageGrid.flatMap((values, y) => values.map((value, x) => (
              <span key={`${y}-${x}`} className={y >= row && y < row + 3 && x >= col && x < col + 3 ? "inside-kernel" : ""}>{value}</span>
            )))}
            <div className="kernel-outline" style={{ transform: `translate(${col * 48}px, ${row * 48}px)` }} />
          </div>
          <span className="operator">*</span>
          <div className="pixel-grid kernel-grid">
            {kernel.flat().map((value, index) => <span key={index}>{value}</span>)}
          </div>
          <span className="operator">=</span>
          <div className="result-cell">{sum}</div>
        </div>
        <div className="transport">
          <button className="icon-button" onClick={() => setPlaying((value) => !value)} title={playing ? "Pause" : "Play"} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause /> : <Play />}</button>
          <input type="range" min="0" max="8" value={step} onChange={(event) => setStep(Number(event.target.value))} aria-label="Kernel position" />
          <span>{step + 1} / 9</span>
        </div>
      </div>
      <div className="visual-panel graph-contrast">
        <div className="panel-label">GRAPH: NO LEFT, RIGHT, UP OR DOWN</div>
        <GraphView selected="A" hop={1} compact />
        <Formula tex="|\mathcal{N}(A)\cup\{A\}|=\deg(A)+1" />
        <p className="claim-line">The receptive field follows edges, not geometry.</p>
      </div>
    </section>
  );
}

const messageSteps = ["self", "collect", "aggregate", "update"] as const;

export function MessageScene() {
  const [selected, setSelected] = useState<NodeId>("A");
  const [step, setStep] = useState(1);
  const nearby = nodeIds.filter((id) => hopDistance(selected)[id] === 1);
  const sourceVectors = [nodeById(selected).features, ...nearby.map((id) => nodeById(id).features)];
  const aggregate = sourceVectors[0].map((_, featureIndex) =>
    sourceVectors.reduce((sum, vector) => sum + vector[featureIndex], 0) / sourceVectors.length,
  );
  const updated = multiplyMatrices([aggregate], hiddenWeight)[0].map((value) => Math.max(0, value));
  return (
    <section className="scene scene-two message-scene">
      <div className="visual-panel graph-panel">
        <div className="panel-label">MESSAGE PASSING</div>
        <GraphView selected={selected} hop={step >= 1 ? 1 : 0} pulse={step === 1} onSelect={setSelected} />
      </div>
      <div className="visual-panel equation-panel">
        <div className="step-strip">
          {messageSteps.map((name, index) => <button key={name} className={step === index ? "active" : ""} onClick={() => setStep(index)}><span>{index + 1}</span>{name}</button>)}
        </div>
        <div className="message-equation">
          <Vector label={`h${selected}`} values={nodeById(selected).features} />
          <span>+</span>
          <span className="sigma">AGG</span>
          <span className="vector-stack">{nearby.map((id) => <Vector key={id} label={`h${id}`} values={nodeById(id).features} />)}</span>
          <span>&rarr;</span>
          <Vector label={`h'${selected}`} values={step >= 3 ? updated : aggregate} />
        </div>
        <Formula accent tex="\mathbf{h}_i'=\operatorname{UPDATE}\!\left(\mathbf{h}_i,\operatorname{AGG}_{j\in\mathcal{N}(i)}\mathbf{h}_j\right)" />
      </div>
    </section>
  );
}

export function SpectralScene() {
  const [cutoff, setCutoff] = useState(1.2);
  const [stage, setStage] = useState(1);
  const spectrum = useMemo(() => pathGraphSpectrum(cutoff), [cutoff]);
  const original = [1, 0.85, -0.35, -0.8, -1];
  const displaySignal = stage < 3 ? original : spectrum.reconstructed;
  return (
    <section className="scene spectral-scene">
      <div className="spectral-flow">
        <div className="spectral-graph">
          <div className="panel-label">GRAPH SIGNAL x</div>
          <svg viewBox="0 0 630 230" role="img" aria-label="Signal on a path graph">
            {[0, 1, 2, 3].map((index) => <line key={index} x1={65 + index * 125} y1="120" x2={190 + index * 125} y2="120" />)}
            {displaySignal.map((value, index) => (
              <g key={index}>
                <circle cx={65 + index * 125} cy="120" r="34" style={{ "--signal": (value + 1) / 2 } as CSSProperties} />
                <text x={65 + index * 125} y="125">{value.toFixed(2)}</text>
              </g>
            ))}
          </svg>
        </div>
        <div className="spectral-arrow">U^T</div>
        <div className="spectrum-bars">
          <div className="panel-label">GRAPH FREQUENCIES</div>
          <div className="bars">
            {spectrum.coefficients.map((value, index) => {
              const shown = stage >= 2 ? spectrum.filteredCoefficients[index] : value;
              return <div key={index}><span style={{ height: `${Math.abs(shown) * 68 + 4}px` }} /><b>lambda{index}</b></div>;
            })}
          </div>
        </div>
        <div className="spectral-arrow">U</div>
        <div className="filter-dial">
          <div className="panel-label">FILTER g(LAMBDA)</div>
          <input type="range" min="0" max="3" step="0.1" value={cutoff} onChange={(event) => { setCutoff(Number(event.target.value)); setStage(3); }} aria-label="Low-pass strength" />
          <strong>{cutoff.toFixed(1)}</strong>
          <span>low-pass strength</span>
        </div>
      </div>
      <div className="step-strip spectral-steps">
        {["signal", "transform", "filter", "reconstruct"].map((name, index) => <button key={name} className={stage === index ? "active" : ""} onClick={() => setStage(index)}><span>{index + 1}</span>{name}</button>)}
      </div>
      <Formula accent tex="g_{\theta}\star_G\mathbf{x}=\mathbf{U}\,g_{\theta}(\boldsymbol{\Lambda})\,\mathbf{U}^{\mathsf T}\mathbf{x}" />
    </section>
  );
}

const gcnStages = ["A", "A + I", "degree", "normalize", "aggregate", "transform"];

export function GcnLayerScene() {
  const [stage, setStage] = useState(3);
  const [selected, setSelected] = useState<NodeId>("A");
  const raw = adjacency();
  const self = matrixAddIdentity(raw);
  const degree = self.map((row) => row.reduce((sum, value) => sum + value, 0));
  const normalized = normalizedAdjacency();
  const aggregate = multiplyMatrices(normalized, featureMatrix);
  const transformed = relu(multiplyMatrices(aggregate, hiddenWeight));
  const displayed: Matrix = stage === 0 ? raw : stage < 3 ? self : normalized;
  const activeRow = nodeIds.indexOf(selected);
  return (
    <section className="scene gcn-layer-scene">
      <div className="step-strip">
        {gcnStages.map((name, index) => <button key={name} className={stage === index ? "active" : ""} onClick={() => setStage(index)}><span>{index + 1}</span>{name}</button>)}
      </div>
      <div className="gcn-workbench">
        <div className="visual-panel graph-panel">
          <div className="panel-label">STRUCTURE</div>
          <GraphView selected={selected} hop={stage >= 4 ? 1 : 0} pulse={stage === 4} selfLoops={stage >= 1} onSelect={setSelected} compact />
        </div>
        <div className="visual-panel matrix-panel compact-matrix">
          <div className="panel-label">PROPAGATION OPERATOR</div>
          <MatrixGrid values={displayed} activeRow={activeRow} format={(value) => stage >= 3 ? value.toFixed(2) : value.toFixed(0)} />
          {stage === 2 && <div className="degree-row">D~ = diag({degree.join(", ")})</div>}
        </div>
        <div className="visual-panel vector-panel">
          <div className="panel-label">TARGET NODE {selected}</div>
          <Vector label="x" values={featureMatrix[activeRow]} />
          <span className="flow-arrow">&rarr;</span>
          <Vector label="A^x" values={aggregate[activeRow]} />
          <span className="flow-arrow">&rarr;</span>
          <Vector label="h'" values={transformed[activeRow]} />
        </div>
      </div>
      <Formula accent tex="\mathbf{H}^{(\ell+1)}=\sigma\!\left(\widetilde{\mathbf{D}}^{-1/2}\widetilde{\mathbf{A}}\widetilde{\mathbf{D}}^{-1/2}\mathbf{H}^{(\ell)}\mathbf{W}^{(\ell)}\right)" />
    </section>
  );
}

export function ClassificationScene() {
  const [selected, setSelected] = useState<NodeId>("A");
  const result = useMemo(() => gcnForward(), []);
  const index = nodeIds.indexOf(selected);
  return (
    <section className="scene classification-scene">
      <div className="classification-main">
        <div className="visual-panel graph-panel">
          <div className="panel-label">SEMI-SUPERVISED NODE CLASSIFICATION</div>
          <GraphView selected={selected} hop={2} probabilities={result.probabilities} onSelect={setSelected} compact />
          <div className="label-legend"><span className="labeled" />labeled for loss <span className="unlabeled" />unlabeled prediction</div>
        </div>
        <div className="forward-pipeline">
          <div><b>X</b><span>7 x 2</span></div><i>&rarr;</i>
          <div><b>GCN</b><span><TeX tex="\widehat{\mathbf{A}}\mathbf{X}\mathbf{W}^{(0)}" /></span></div><i>&rarr;</i>
          <div><b>ReLU</b><span>hidden</span></div><i>&rarr;</i>
          <div><b>GCN</b><span><TeX tex="\widehat{\mathbf{A}}\mathbf{H}^{(1)}\mathbf{W}^{(1)}" /></span></div><i>&rarr;</i>
          <div><b>softmax</b><span>2 classes</span></div>
        </div>
      </div>
      <div className="probability-panel">
        <div className="probability-title">Node {selected} prediction</div>
        <div className="prob-row"><span>Class 0</span><i><b style={{ width: `${result.probabilities[index][0] * 100}%` }} /></i><strong>{(result.probabilities[index][0] * 100).toFixed(1)}%</strong></div>
        <div className="prob-row class-one"><span>Class 1</span><i><b style={{ width: `${result.probabilities[index][1] * 100}%` }} /></i><strong>{(result.probabilities[index][1] * 100).toFixed(1)}%</strong></div>
        <Formula>Loss is evaluated only on labeled nodes; propagation uses the full graph.</Formula>
      </div>
    </section>
  );
}

export function LimitationsScene() {
  const [layers, setLayers] = useState(5);
  const [heterophily, setHeterophily] = useState(false);
  const values = useMemo(() => propagateFeatures(layers, heterophily), [layers, heterophily]);
  const variance = values.reduce((sum, row) => sum + (row[0] - row[1]) ** 2, 0) / values.length;
  return (
    <section className="scene limitation-scene">
      <div className="visual-panel limitation-graph">
        <div className="panel-label">AFTER {layers} GCN LAYERS</div>
        <GraphView selected="A" hop={0} values={values} compact heterophily={heterophily} />
        <div className="mix-legend"><span>class 0 signal</span><i /><span>class 1 signal</span></div>
      </div>
      <div className="limitation-controls">
        <div className="control-row"><label htmlFor="layers">Layers</label><input id="layers" type="range" min="0" max="10" value={layers} onChange={(event) => setLayers(Number(event.target.value))} /><strong>{layers}</strong></div>
        <div className="mode-switch" role="group" aria-label="Graph assumption">
          <button className={!heterophily ? "active" : ""} onClick={() => setHeterophily(false)}>Homophily</button>
          <button className={heterophily ? "active" : ""} onClick={() => setHeterophily(true)}>Heterophily</button>
        </div>
        <div className="variance-meter"><span>feature separation</span><i><b style={{ width: `${Math.min(100, variance * 120)}%` }} /></i><strong>{round(variance, 3)}</strong></div>
        <div className="limitation-claims">
          <div><b>Oversmoothing</b><span>Deep propagation makes node representations converge.</span></div>
          <div><b>Homophily bias</b><span>Connected nodes are not always semantically similar.</span></div>
          <div><b>Full-batch coupling</b><span>The original GCN depends on the observed graph.</span></div>
          <div><b>Fixed edge weights</b><span>Degree normalization cannot learn neighbor importance.</span></div>
        </div>
        <button className="reset-button" onClick={() => { setLayers(0); setHeterophily(false); }}><RotateCcw /> Reset</button>
      </div>
    </section>
  );
}

export const scenes = [
  { id: "graph", title: "What is a graph?", kicker: "01 / STRUCTURE", component: GraphScene },
  { id: "kernel", title: "Convolution needs a neighborhood", kicker: "02 / CONVOLUTION", component: KernelScene },
  { id: "message", title: "Edges define where messages travel", kicker: "03 / MESSAGE PASSING", component: MessageScene },
  { id: "spectral", title: "Graph Fourier bases make convolution possible", kicker: "04 / SPECTRAL VIEW", component: SpectralScene },
  { id: "layer", title: "GCN turns spectral theory into local propagation", kicker: "05 / GCN LAYER", component: GcnLayerScene },
  { id: "classification", title: "Two GCN layers produce node predictions", kicker: "06 / CLASSIFICATION", component: ClassificationScene },
  { id: "limits", title: "Repeated averaging creates clear failure modes", kicker: "07 / LIMITATIONS", component: LimitationsScene },
] as const;
