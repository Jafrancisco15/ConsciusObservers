import { useMemo, useState } from "react";
import {
  Activity,
  Atom,
  BrainCircuit,
  ChevronRight,
  Eye,
  FlaskConical,
  Gauge,
  Info,
  Network,
  Play,
  RefreshCw,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  makeHeatmapCells,
  runFitnessTruthExperiment,
  runObserverExperiment,
} from "./experiments";

const fmt = (x, digits = 3) => Number(x).toFixed(digits);

function Slider({ label, value, onChange, min, max, step, suffix = "" }) {
  return (
    <label className="control">
      <span>
        <b>{label}</b>
        <em>{value}{suffix}</em>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="metric-card">
      <div className="metric-icon"><Icon size={18} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  );
}

function Bar({ value, max = 1, label, sublabel }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar-row">
      <div className="bar-label"><span>{label}</span><b>{sublabel ?? fmt(value)}</b></div>
      <div className="bar-track"><i style={{ width: `${width}%` }} /></div>
    </div>
  );
}

function RegimeCard({ item }) {
  const names = {
    fitness: "Fitness interface",
    truth: "Truth model",
    hybrid: "Hybrid model",
  };
  const descriptions = {
    fitness: "Optimizes only reward in the current ecology.",
    truth: "Optimizes reconstruction of the latent world state.",
    hybrid: "Balances adaptive reward and retained world structure.",
  };
  const maxReward = Math.max(0.5, item.source, item.transfer);
  return (
    <article className={`regime-card regime-${item.mode}`}>
      <div className="regime-head">
        <div>
          <span className="eyebrow">{item.mode}</span>
          <h3>{names[item.mode]}</h3>
        </div>
        <span className="dot" />
      </div>
      <p>{descriptions[item.mode]}</p>
      <Bar value={item.source} max={maxReward} label="Source ecology" sublabel={fmt(item.source)} />
      <Bar value={item.transfer} max={maxReward} label="After ecological shift" sublabel={fmt(item.transfer)} />
      <Bar value={Math.max(0, item.truth)} max={1} label="Veridicality" sublabel={fmt(item.truth)} />
      <div className="sd-line">σ transfer {fmt(item.transferSd)} · σ truth {fmt(item.truthSd)}</div>
    </article>
  );
}

function FitnessTruthLab() {
  const [seed, setSeed] = useState(7);
  const [symbols, setSymbols] = useState(4);
  const [shift, setShift] = useState(0.8);
  const [truthWeight, setTruthWeight] = useState(0.55);
  const [steps, setSteps] = useState(1800);
  const [runNonce, setRunNonce] = useState(0);

  const result = useMemo(
    () => runFitnessTruthExperiment({ seed: seed + runNonce, symbols, shift, truthWeight, steps, replicates: 5 }),
    [seed, symbols, shift, truthWeight, steps, runNonce],
  );

  const bestTransfer = [...result.summary].sort((a, b) => b.transfer - a.transfer)[0];
  const bestTruth = [...result.summary].sort((a, b) => b.truth - a.truth)[0];
  const bestSource = [...result.summary].sort((a, b) => b.source - a.source)[0];

  return (
    <div className="lab-grid">
      <section className="panel controls-panel">
        <div className="panel-title"><Gauge size={18} /><span>Experimental controls</span></div>
        <Slider label="Perceptual symbols" value={symbols} onChange={setSymbols} min={2} max={9} step={1} />
        <Slider label="Ecological shift" value={shift} onChange={setShift} min={0} max={1} step={0.05} />
        <Slider label="Truth pressure λ" value={truthWeight} onChange={setTruthWeight} min={0} max={1.2} step={0.05} />
        <Slider label="Evolution steps" value={steps} onChange={setSteps} min={500} max={3500} step={250} />
        <Slider label="Seed" value={seed} onChange={setSeed} min={1} max={99} step={1} />
        <button className="primary-btn" onClick={() => setRunNonce((n) => n + 1)}><Play size={17} /> Run new population</button>
        <div className="note"><Info size={16} /><p>The perceptual encoder is frozen after evolution. Only the tiny action readout is allowed to adapt after the ecology changes. That isolates what the representation retained.</p></div>
      </section>

      <section className="main-column">
        <div className="metric-strip">
          <MetricCard icon={Activity} label="Best source reward" value={bestSource.mode} detail={fmt(bestSource.source)} />
          <MetricCard icon={RefreshCw} label="Best transfer" value={bestTransfer.mode} detail={fmt(bestTransfer.transfer)} />
          <MetricCard icon={Eye} label="Most world structure" value={bestTruth.mode} detail={fmt(bestTruth.truth)} />
        </div>

        <div className="cards-grid">
          {result.summary.map((item) => <RegimeCard key={item.mode} item={item} />)}
        </div>

        <section className="panel hypothesis-panel">
          <div className="panel-title"><FlaskConical size={18} /><span>What would count as evidence?</span></div>
          <div className="hypothesis-grid">
            <div>
              <span className="tag">Strong interface prediction</span>
              <h4>Fitness can discard truth without paying later.</h4>
              <p>Fitness-only encoders should retain less objective structure while preserving equal or superior adaptive performance across changing ecologies.</p>
            </div>
            <div>
              <span className="tag">Structural-realist counterprediction</span>
              <h4>Reusable world structure becomes adaptive.</h4>
              <p>As environments and goals change, representations that preserve latent structure should transfer more reliably even when they were not optimized for the new task.</p>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}

function Heatmap({ matrix, title, xLabel = "Experience X", yLabel = "World W" }) {
  const cells = makeHeatmapCells(matrix);
  const cols = matrix[0]?.length || 1;
  return (
    <div className="heatmap-card">
      <div className="heatmap-title"><span>{title}</span><small>{yLabel} → {xLabel}</small></div>
      <div className="heatmap" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cells.flatMap((row, r) => row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className="heat-cell"
            title={`W${r} → X${c}: ${fmt(cell.value)}`}
            style={{ opacity: 0.18 + cell.norm * 0.82 }}
          />
        )))}
      </div>
    </div>
  );
}

function KernelDiagram() {
  return (
    <div className="kernel-diagram">
      <div className="kernel-node"><span>W</span><small>world</small></div>
      <div className="kernel-arrow"><b>P</b><ChevronRight /></div>
      <div className="kernel-node"><span>X</span><small>experience</small></div>
      <div className="kernel-arrow"><b>D</b><ChevronRight /></div>
      <div className="kernel-node"><span>G</span><small>action</small></div>
      <div className="kernel-arrow"><b>A</b><ChevronRight /></div>
      <div className="kernel-node"><span>W′</span><small>new world</small></div>
    </div>
  );
}

function ObserverLab() {
  const [seed, setSeed] = useState(17);
  const [worldN, setWorldN] = useState(12);
  const [experienceN, setExperienceN] = useState(6);
  const [biasA, setBiasA] = useState(0.25);
  const [biasB, setBiasB] = useState(0.8);
  const [noise, setNoise] = useState(0.28);
  const [decisiveness, setDecisiveness] = useState(2.2);
  const [steps, setSteps] = useState(500);
  const [nonce, setNonce] = useState(0);

  const result = useMemo(() => runObserverExperiment({
    seed: seed + nonce,
    worldN,
    experienceN,
    actionN: 4,
    biasA,
    biasB,
    noise,
    decisiveness,
    steps,
  }), [seed, nonce, worldN, experienceN, biasA, biasB, noise, decisiveness, steps]);

  const m = result.metrics;
  const fitnessGap = Math.abs(m.rewardA - m.rewardB);

  return (
    <div className="observer-wrap">
      <section className="theory-banner">
        <div>
          <span className="eyebrow">Hoffman & Prakash conscious-agent formalism</span>
          <h2>Observer as a closed probabilistic loop</h2>
          <p>This tab implements the mathematical skeleton of a conscious agent using Markov kernels for perception <b>P</b>, decision <b>D</b>, and action <b>A</b>. It tests consequences of observer-relative interfaces; it does not assume the simulation itself is phenomenally conscious.</p>
        </div>
        <KernelDiagram />
      </section>

      <div className="lab-grid observer-grid">
        <section className="panel controls-panel">
          <div className="panel-title"><BrainCircuit size={18} /><span>Observer controls</span></div>
          <Slider label="World states |W|" value={worldN} onChange={setWorldN} min={6} max={18} step={1} />
          <Slider label="Experience states |X|" value={experienceN} onChange={setExperienceN} min={3} max={10} step={1} />
          <Slider label="Observer A interface warp" value={biasA} onChange={setBiasA} min={0} max={1.5} step={0.05} />
          <Slider label="Observer B interface warp" value={biasB} onChange={setBiasB} min={0} max={1.5} step={0.05} />
          <Slider label="Perceptual noise" value={noise} onChange={setNoise} min={0.08} max={0.8} step={0.02} />
          <Slider label="Decision sharpness" value={decisiveness} onChange={setDecisiveness} min={0.5} max={4} step={0.1} />
          <Slider label="Interaction steps" value={steps} onChange={setSteps} min={100} max={1500} step={100} />
          <Slider label="Seed" value={seed} onChange={setSeed} min={1} max={99} step={1} />
          <button className="primary-btn" onClick={() => setNonce((n) => n + 1)}><Sparkles size={17} /> Resample observers</button>
        </section>

        <section className="main-column">
          <div className="metric-strip observer-metrics">
            <MetricCard icon={Network} label="Observer divergence" value={fmt(m.observerDivergence)} detail="mean JS divergence" />
            <MetricCard icon={Scale} label="Fitness gap" value={fmt(fitnessGap)} detail="|reward A − B|" />
            <MetricCard icon={Eye} label="Experience agreement" value={`${fmt(m.experienceAgreement * 100, 1)}%`} detail="same X state" />
          </div>

          <div className="heatmap-grid">
            <Heatmap matrix={result.P1} title="Observer A · P(X | W)" />
            <Heatmap matrix={result.P2} title="Observer B · P(X | W)" />
          </div>

          <section className="panel observer-results">
            <div className="panel-title"><Atom size={18} /><span>Operational tests</span></div>
            <div className="test-list">
              <div className="test-item">
                <span>1</span>
                <div><h4>Observer-relative experience</h4><p>Hold the world state fixed and compare P(X|W) between observers. A non-zero divergence demonstrates different interfaces over the same modeled world.</p></div>
                <b>{fmt(m.observerDivergence)}</b>
              </div>
              <div className="test-item">
                <span>2</span>
                <div><h4>Adaptive equivalence despite perceptual disagreement</h4><p>If observer divergence is high while the reward gap remains small, two very different experiential codes can remain similarly adaptive.</p></div>
                <b>{fmt(fitnessGap)}</b>
              </div>
              <div className="test-item">
                <span>3</span>
                <div><h4>Information carried by the perception channel</h4><p>Mutual-information proxy for the W→X channel. Different channel capacities can coexist with similar task success.</p></div>
                <b>A {fmt(m.informationA)} · B {fmt(m.informationB)}</b>
              </div>
            </div>
          </section>

          <section className="panel falsifiability-panel">
            <div className="panel-title"><FlaskConical size={18} /><span>What this can and cannot test</span></div>
            <p><b>Can test:</b> mathematical consequences of observer-specific perceptual kernels, compression, disagreement, adaptive equivalence, channel capacity, and composition rules in a controlled model.</p>
            <p><b>Cannot by itself test:</b> whether consciousness is ontologically fundamental, whether a simulated agent has phenomenal experience, or whether the physical universe is literally composed of conscious agents. Those require distinctive empirical predictions connecting CAT to observed physics or neuroscience.</p>
          </section>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("fitness");
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <div className="brand-mark"><Eye size={21} /></div>
          <div><b>Conscious Observers</b><span>Computational consciousness laboratory</span></div>
        </div>
        <div className="status-pill"><i /> live simulation</div>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">From philosophical claim to falsifiable model</span>
          <h1>What does evolution preserve: <em>truth</em>, <em>fitness</em>, or an observer-specific interface?</h1>
          <p>Explore computational experiments inspired by Interface Theory of Perception and Conscious Agent Theory. The goal is not to assume Hoffman is right, but to make the claims precise enough to fail.</p>
        </section>

        <nav className="tabs" aria-label="Experiments">
          <button className={tab === "fitness" ? "active" : ""} onClick={() => setTab("fitness")}><FlaskConical size={17} /> Fitness vs Truth</button>
          <button className={tab === "observer" ? "active" : ""} onClick={() => setTab("observer")}><Eye size={17} /> Conscious Observer</button>
        </nav>

        {tab === "fitness" ? <FitnessTruthLab /> : <ObserverLab />}
      </main>

      <footer>
        <p>Research sandbox · Models are explanatory simulations, not evidence of phenomenal consciousness.</p>
      </footer>
    </div>
  );
}
