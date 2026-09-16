import { useMemo, useState } from 'react';
import { Activity, GitBranch, Info, Network, RefreshCw, Sparkles, Waves } from 'lucide-react';
import { runNetworkExperiment } from './networkExperiment';
import './network.css';

const f = (x, d = 3) => Number(x).toFixed(d);

function Slider({ label, value, set, min, max, step }) {
  return <label className="control"><span><b>{label}</b><em>{value}</em></span><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} /></label>;
}

function Metric({ label, value, detail }) {
  return <div className="network-metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function NetworkDiagram({ agents, directed, topology }) {
  const nodes = Array.from({ length: agents }, (_, i) => i);
  return <div className="agent-network" aria-label="agent interaction graph">
    <svg viewBox="0 0 500 300" role="img">
      {nodes.flatMap((i) => {
        const ai = (2 * Math.PI * i) / agents - Math.PI / 2;
        const x1 = 250 + 105 * Math.cos(ai), y1 = 150 + 105 * Math.sin(ai);
        const targets = topology === 'complete' ? nodes.filter(j => j !== i && (directed || j > i)) : [((i + 1) % agents)];
        return targets.map((j) => {
          if (topology === 'line' && i === agents - 1) return null;
          const aj = (2 * Math.PI * j) / agents - Math.PI / 2;
          const x2 = 250 + 105 * Math.cos(aj), y2 = 150 + 105 * Math.sin(aj);
          return <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} className={directed ? 'edge directed' : 'edge'} />;
        });
      })}
      {nodes.map((i) => {
        const a = (2 * Math.PI * i) / agents - Math.PI / 2;
        const x = 250 + 105 * Math.cos(a), y = 150 + 105 * Math.sin(a);
        return <g key={i}><circle cx={x} cy={y} r="25" className="agent-node" /><text x={x} y={y + 5} textAnchor="middle">C{i + 1}</text></g>;
      })}
    </svg>
  </div>;
}

function StateRaster({ tail, states }) {
  if (!tail.length) return null;
  const agents = tail[0].length;
  return <div className="raster-wrap"><div className="raster-label">Last 40 collective experience states</div><div className="state-raster" style={{ gridTemplateColumns: `repeat(${tail.length}, 1fr)` }}>
    {Array.from({ length: agents }, (_, i) => tail.map((row, t) => <i key={`${i}-${t}`} title={`C${i + 1}, t-${tail.length - t}: X${row[i]}`} style={{ opacity: 0.18 + 0.82 * (row[i] + 1) / states }} />))}
  </div></div>;
}

export default function ConsciousNetwork() {
  const [agents, setAgents] = useState(2);
  const [states, setStates] = useState(4);
  const [steps, setSteps] = useState(1800);
  const [coupling, setCoupling] = useState(2.4);
  const [noise, setNoise] = useState(0.12);
  const [sharpness, setSharpness] = useState(3);
  const [topology, setTopology] = useState('ring');
  const [directed, setDirected] = useState(false);
  const [strict, setStrict] = useState(true);
  const [seed, setSeed] = useState(41);
  const [nonce, setNonce] = useState(0);

  const r = useMemo(() => runNetworkExperiment({ seed: seed + nonce, agents, states, steps, topology, directed, coupling, noise, sharpness, strictCompatibility: strict }), [seed, nonce, agents, states, steps, topology, directed, coupling, noise, sharpness, strict]);
  const m = r.metrics;

  return <div className="network-lab">
    <section className="theory-banner network-banner"><div><span className="eyebrow">Conscious realism · interacting agents</span><h2>When does a network behave like a collective observer?</h2><p>Here the modeled “world” of an agent is supplied by other agents. We test the dynamics of directed and undirected joins, recurrence, synchronization and statistical non-factorizability. These are mathematical properties of the Hoffman–Prakash formalism, not a consciousness detector.</p></div><div className="equation-stack"><b>C₁ ↔ C₂ ↔ … ↔ Cₙ</b><span>Xᵢ → Dᵢ → Gᵢ → Pⱼ → Xⱼ</span></div></section>

    <div className="lab-grid observer-grid">
      <section className="panel controls-panel">
        <div className="panel-title"><GitBranch size={18}/><span>Network controls</span></div>
        <Slider label="Agents" value={agents} set={setAgents} min={2} max={6} step={1}/>
        <Slider label="States per agent" value={states} set={setStates} min={2} max={7} step={1}/>
        <Slider label="Interaction steps" value={steps} set={setSteps} min={400} max={4000} step={200}/>
        <Slider label="Coupling" value={coupling} set={setCoupling} min={0.2} max={5} step={0.1}/>
        <Slider label="Channel noise" value={noise} set={setNoise} min={0.01} max={0.8} step={0.01}/>
        <Slider label="Decision sharpness" value={sharpness} set={setSharpness} min={0.3} max={6} step={0.1}/>
        <Slider label="Seed" value={seed} set={setSeed} min={1} max={99} step={1}/>
        <label className="select-control"><span>Topology</span><select value={topology} onChange={(e)=>setTopology(e.target.value)}><option value="ring">Ring</option><option value="line">Line</option><option value="complete">Complete graph</option></select></label>
        <label className="toggle-control"><input type="checkbox" checked={directed} onChange={(e)=>setDirected(e.target.checked)}/><span>Directed joins</span></label>
        <label className="toggle-control"><input type="checkbox" checked={strict} onChange={(e)=>setStrict(e.target.checked)}/><span>Compatibility mode Aᵢ ≈ Pⱼ</span></label>
        <button className="primary-btn" onClick={()=>setNonce(n=>n+1)}><RefreshCw size={17}/> Resample dynamics</button>
      </section>

      <section className="main-column">
        <div className="network-metrics">
          <Metric label="Synchronization" value={`${f(m.synchronization*100,1)}%`} detail="modal experience agreement"/>
          <Metric label="Pair information" value={`${f(m.meanPairMI)} bits`} detail="mean pairwise mutual information"/>
          <Metric label="Collective dependence" value={`${f(m.totalCorrelation)} bits`} detail="total correlation"/>
          <Metric label="Predictive memory" value={`${f(m.predictiveMI)} bits`} detail="I(Sₜ ; Sₜ₊₁)"/>
        </div>

        <div className="network-visuals"><NetworkDiagram agents={agents} directed={directed} topology={topology}/><StateRaster tail={r.tail} states={states}/></div>

        <section className="panel combination-panel"><div className="panel-title"><Sparkles size={18}/><span>Combination diagnostics</span></div><div className="diagnostic-grid">
          <div><span>Normalized dependence</span><strong>{f(m.normalizedIntegration)}</strong><p>0 means the empirical joint experience distribution factorizes; larger values mean the agents' states cannot be described as statistically independent. This is not IIT Φ.</p></div>
          <div><span>Joint state repertoire</span><strong>{m.visitedJointStates} / {m.possibleJointStates}</strong><p>Number of collective experience states visited after burn-in versus the Cartesian state space available to the network.</p></div>
          <div><span>Recurrence</span><strong>{f(m.recurrenceRate*100,1)}%</strong><p>Fraction of post-burn-in collective states that revisit a previously observed full network state.</p></div>
          <div><span>Shortest observed recurrence</span><strong>{m.detectedPeriod ?? '—'}</strong><p>Empirical recurrence distance in simulation steps. With stochastic kernels this is not automatically a true Markov-chain period.</p></div>
        </div></section>

        <section className="panel hypothesis-panel"><div className="panel-title"><Waves size={18}/><span>What are we testing?</span></div><div className="hypothesis-grid"><div><span className="tag">Hoffman–Prakash construction</span><h4>Joined agents can be represented as a new agent.</h4><p>The 2014 formalism proves directed and undirected join constructions under specified compatibility conditions. Here we inspect the resulting dynamics rather than assuming that mathematical combination establishes phenomenal subject-combination.</p></div><div><span className="tag">Empirical challenge</span><h4>Find a distinctive observable consequence.</h4><p>The stronger scientific target is a prediction that differs from ordinary coupled Markov systems. High synchronization or mutual information alone cannot establish conscious realism because conventional stochastic networks can produce both.</p></div></div></section>

        <div className="note network-note"><Info size={16}/><p><b>Interpretation rule:</b> this laboratory can test the internal mathematical consequences of a conscious-agent model. Evidence for the ontology would require a uniquely derived prediction that survives comparison with alternative physical or computational models.</p></div>
      </section>
    </div>
  </div>;
}
