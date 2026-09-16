import { useMemo, useState } from 'react';
import { Atom, CheckCircle2, FlaskConical, GitCompare, Orbit, Sigma, XCircle } from 'lucide-react';
import { runExactMarkov, label } from './exactMarkov';
import './exactMarkov.css';

const f=(x,n=3)=>Number(x).toFixed(n);

function Cycle({cycle,i}) {
  return <div className="cycle"><b>C{i+1}</b><span>{cycle.map(s=>`|${label(s)}〉`).join(' → ')}</span><em>period {cycle.length}</em></div>;
}
function Status({ok,children}) { return <div className={`rep-status ${ok?'ok':'bad'}`}>{ok?<CheckCircle2 size={18}/>:<XCircle size={18}/>}<span>{children}</span><b>{ok?'PASS':'FAIL'}</b></div>; }

export default function ExactMarkovLab(){
  const [example,setExample]=useState('identity');
  const [noise,setNoise]=useState(0);
  const r=useMemo(()=>runExactMarkov({example,noise}),[example,noise]);
  const m=r.metrics;
  const fingerprints=Object.entries(r.nulls.counts).sort((a,b)=>a[0].localeCompare(b[0]));
  const uniqueModes=r.spectrum.filter((x,i,a)=>a.findIndex(y=>Math.abs(y.re-x.re)<1e-8&&Math.abs(y.im-x.im)<1e-8)===i);

  return <div className="exact-wrap">
    <section className="theory-banner exact-banner">
      <div><span className="eyebrow">Exact finite-state test · Hoffman & Prakash 2014</span><h2>16-state Markov dynamics + matched null</h2><p>We reconstruct the published two-agent binary system exactly, enumerate its absorbing cycles, derive the deterministic spectrum, then compare it with a coupled Markov null that preserves state count, ring connectivity, deterministic entropy and one-bit edge capacity.</p></div>
      <div className="state-formula"><b>E = X₁ × G₁ × X₂ × G₂</b><span>|E| = 2⁴ = 16</span><code>|x₁ g₁ x₂ g₂〉</code></div>
    </section>

    <div className="exact-grid">
      <aside className="panel exact-controls">
        <div className="panel-title"><FlaskConical size={18}/><span>Exact model</span></div>
        <label className="select-control"><b>Published dynamics</b><select value={example} onChange={e=>setExample(e.target.value)}><option value="identity">Example 1 · all identity kernels</option><option value="flipD1">Example 2 · D₁ bit-flip</option></select></label>
        <label className="control"><span><b>Independent channel noise ε</b><em>{f(noise,2)}</em></span><input type="range" min="0" max="0.2" step="0.01" value={noise} onChange={e=>setNoise(Number(e.target.value))}/></label>
        <div className="note"><Atom size={16}/><p>At ε=0 the chain is the deterministic system printed in the paper. Noise is an extension for robustness testing; it is not part of the published examples.</p></div>
      </aside>

      <section className="exact-main">
        <div className="exact-metrics">
          <div><span>Absorbing cycles</span><strong>{r.cycles.length}</strong><small>{r.cycles.map(c=>c.length).join(', ')} periods</small></div>
          <div><span>Stationary H(E)</span><strong>{f(m.stateEntropy)} bits</strong><small>uniform-start stationary law</small></div>
          <div><span>Entropy rate</span><strong>{f(m.entropyRate)} bits</strong><small>H(Eₜ₊₁|Eₜ)</small></div>
          <div><span>Predictive information</span><strong>{f(m.predictiveInformation)} bits</strong><small>H(E) − entropy rate</small></div>
        </div>

        <section className="panel replication-card">
          <div className="panel-title"><CheckCircle2 size={18}/><span>Published-result regression test</span></div>
          <Status ok={r.replication.example1}>Example 1 reproduces periods 1, 1, 2, 4, 4, 4 and the exact published cycles.</Status>
          <Status ok={r.replication.example2}>Example 2 reproduces the two exact period-8 cycles after flipping D₁.</Status>
          <p className="boundary">The paper reports these finite-state asymptotics explicitly. Reproducing them validates our implementation of this particular dynamical example; it does not validate the ontological claim that the states are conscious.</p>
        </section>

        <section className="panel cycles-card"><div className="panel-title"><Orbit size={18}/><span>Current deterministic recurrent classes</span></div>{r.cycles.map((c,i)=><Cycle key={i} cycle={c} i={i}/>)}</section>

        <section className="panel null-card">
          <div className="panel-title"><GitCompare size={18}/><span>CAT vs structurally matched Markov null</span></div>
          <p>The null keeps the same four binary variables and the same ring dependency <code>g₂→x₁→g₁→x₂→g₂</code>. Every edge remains a deterministic bijective one-bit channel. We enumerate all 16 possible identity/NOT edge polarities without assigning conscious-agent semantics.</p>
          <div className="null-bars">{fingerprints.map(([fp,n])=><div key={fp}><span>period fingerprint {fp}</span><b>{n}/16 · {f(100*n/16,1)}%</b><i style={{width:`${100*n/16}%`}}/></div>)}</div>
          <div className="null-result"><strong>{f(r.nullMatch*100,1)}%</strong><p>of the matched-null family has the <b>same cycle-length fingerprint</b> as the selected Hoffman example.</p></div>
          <p className="boundary"><b>Discriminating implication:</b> if the published cycle structure is common under this matched non-semantic Markov family, recurrence/periodicity alone cannot distinguish CAT from the null. A CAT-specific empirical prediction must add constraints not shared by this computational structure.</p>
        </section>

        <section className="panel spectrum-card">
          <div className="panel-title"><Sigma size={18}/><span>Exact deterministic eigenmodes</span></div>
          <p>For a deterministic permutation chain, each period-d recurrent cycle contributes the d roots of unity. The associated eigenvectors live on that cycle with phase advancing by 2πk/d.</p>
          <div className="mode-grid">{uniqueModes.map((z,i)=><div key={i}><b>λ = {f(z.re,2)} {z.im>=0?'+':'−'} {f(Math.abs(z.im),2)}i</b><span>|λ|={f(z.magnitude,1)}</span><small>from period {z.period}</small></div>)}</div>
          {noise>0 && <p className="boundary">The displayed roots are the exact ε=0 baseline spectrum. With ε&gt;0, the transition matrix above is exact but these permutation eigenmodes are shown only as the noiseless reference.</p>}
        </section>
      </section>
    </div>
  </div>;
}
