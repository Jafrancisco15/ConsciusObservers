import { useMemo, useState } from 'react';
import { ShieldQuestion, RefreshCw } from 'lucide-react';
import { runFalsification } from './catFalsification';
import './catFalsification.css';

const fmt=n=>Number(n).toFixed(3);
const labels={predictive:'Predictive information',stateEntropy:'State entropy',entropyRate:'Entropy rate',selfTransition:'Self-transition',active:'Active states'};

function Comparison({title,data}){
  return <div className="fals-card">
    <h3>{title}</h3>
    <p className="muted">n = {data.n} · exact cycle-fingerprint matches: <b>{data.fingerprintMatches}</b></p>
    <div className="fals-table">
      <div className="fals-row head"><span>Statistic</span><span>CAT</span><span>Null μ ± σ</span><span>Null ≥ CAT</span></div>
      {Object.entries(data.comparison).map(([k,v])=><div className="fals-row" key={k}>
        <span>{labels[k]}</span><span>{fmt(v.cat)}</span><span>{fmt(v.mean)} ± {fmt(v.sd)}</span><span>{fmt(v.percentile)}%</span>
      </div>)}
    </div>
  </div>
}

export default function CATFalsificationLab(){
  const [noise,setNoise]=useState(.02); const [samples,setSamples]=useState(1000); const [seed,setSeed]=useState(2026); const [nonce,setNonce]=useState(0);
  const result=useMemo(()=>runFalsification({noise:Number(noise),samples:Number(samples),seed:Number(seed)+nonce}),[noise,samples,seed,nonce]);
  const strictRate=100*result.strict.fingerprintMatches/result.strict.n;
  const broadRate=100*result.broad.fingerprintMatches/result.broad.n;
  return <section className="lab-section">
    <div className="lab-title"><div><span className="eyebrow">Matched-null challenge</span><h2>CAT Falsification</h2><p>Ask whether a proposed signature of Conscious Agent Theory survives comparison with ordinary finite Markov dynamics rather than merely appearing impressive in isolation.</p></div><ShieldQuestion size={38}/></div>

    <div className="fals-controls">
      <label>Transition noise ε <b>{Number(noise).toFixed(2)}</b><input type="range" min="0" max="0.25" step="0.01" value={noise} onChange={e=>setNoise(e.target.value)}/></label>
      <label>Broad-null samples<input type="number" min="100" max="10000" step="100" value={samples} onChange={e=>setSamples(e.target.value)}/></label>
      <label>Seed<input type="number" value={seed} onChange={e=>setSeed(e.target.value)}/></label>
      <button className="run-button" onClick={()=>setNonce(n=>n+1)}><RefreshCw size={16}/> Resample broad null</button>
    </div>

    <div className="fals-banner">
      <div><small>CAT reference periods</small><strong>{result.cat.periods.join(' · ')}</strong></div>
      <div><small>Same fingerprint · strict null</small><strong>{fmt(strictRate)}%</strong></div>
      <div><small>Same fingerprint · broad null</small><strong>{fmt(broadRate)}%</strong></div>
    </div>

    <div className="fals-grid">
      <Comparison title="Strict matched null" data={result.strict}/>
      <Comparison title="Broad permutation null" data={result.broad}/>
    </div>

    <div className="fals-card hypothesis">
      <h3>Discrimination rule</h3>
      <p><b>H₀:</b> the statistic follows from generic coupled finite-state Markov dynamics. <b>H₁:</b> CAT's construction imposes a quantitative restriction not reproduced by matched null systems.</p>
      <p>A candidate CAT signature becomes interesting only when its null-tail probability remains small after matching the relevant dimensionality, topology, stochasticity and information capacity. This tab therefore treats recurrence, periodicity, synchronization and harmonic-looking modes as hypotheses to control for—not as evidence of consciousness.</p>
    </div>

    <div className="fals-card boundary"><h3>Next bridge to physics</h3><p>The next test should construct the spacetime-chain/harmonic-function mapping side by side for CAT and null chains, then compare which mathematical ingredients actually generate plane-wave-like eigenmodes. If the same mapping works generically, the wave-function resemblance is not CAT-specific. If CAT imposes an independently testable restriction, that restriction becomes the target prediction.</p></div>
  </section>
}
