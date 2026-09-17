import { useMemo, useState } from 'react';
import { Atom, GitCompare, Radio, Waves } from 'lucide-react';
import { runPhysicsBridge } from './physicsBridge';
import PlainResultPanel from './PlainResultPanel';
import './physicsBridge.css';

const sci=x=>Number(x).toExponential(2);
function ModeStrip({data,title}){const modes=data.modes.filter(m=>m.k>0).slice(0,16);return <div className="bridge-modes"><div className="bridge-modes-head"><b>{title}</b><span>periods {data.periods.join(' · ')}</span></div><div className="phase-strip">{modes.map((m,i)=><i key={i} title={`cycle ${m.cycle}, d=${m.period}, k=${m.k}, ω=${m.omega.toFixed(3)}`} style={{'--phase':`${m.omega}rad`}}/> )}</div><small>{data.nontrivialModes} non-trivial Fourier/eigenmodes · max harmonic residual {sci(data.maxResidual)}</small></div>}

export default function PhysicsBridgeLab(){
  const [example,setExample]=useState('identity'); const [nullType,setNullType]=useState('matched'); const [nullMask,setNullMask]=useState(5); const [seed,setSeed]=useState(31415);
  const r=useMemo(()=>runPhysicsBridge({example,nullType,nullMask:Number(nullMask),seed:Number(seed)}),[example,nullType,nullMask,seed]);
  const simple=r.catWave&&r.nullWave
    ? 'La forma de “onda” aparece tanto en el modelo CAT como en un sistema Markov al que no llamamos consciente. En este experimento, parecerse matemáticamente a una onda cuántica no distingue a CAT.'
    : r.catWave
      ? 'En esta comparación concreta, CAT conserva la forma armónica y el control no. Todavía habría que repetirlo contra muchos controles equivalentes antes de considerarlo una diferencia real.'
      : 'El modelo CAT seleccionado no pasó la comprobación armónica exacta; hay que revisar la construcción antes de extraer conclusiones físicas.';
  return <section className="bridge-wrap">
    <section className="theory-banner bridge-banner"><div><span className="eyebrow">Physics bridge · specificity test</span><h2>Do wave-like modes require conscious agents?</h2><p>Hoffman & Prakash identify harmonic functions of a spacetime Markov chain with the mathematical form of a free-particle wave function. Here we apply the same construction to CAT and to non-semantic Markov controls.</p></div><div className="bridge-equation"><b>g(δ,n)=λ⁻ⁿf(δ)</b><span>λ = exp(−iω)</span><code>Q g = g ?</code></div></section>

    <div className="bridge-grid"><aside className="panel bridge-controls"><h3><Atom size={18}/> Model controls</h3><label className="select-control"><b>CAT baseline</b><select value={example} onChange={e=>setExample(e.target.value)}><option value="identity">Example 1 · identity</option><option value="flipD1">Example 2 · D₁ flip</option></select></label><label className="select-control"><b>Control family</b><select value={nullType} onChange={e=>setNullType(e.target.value)}><option value="matched">Matched ring polarity</option><option value="permutation">Generic 16-state permutation</option></select></label>{nullType==='matched'?<label className="control"><span><b>Null polarity mask</b><em>{nullMask}</em></span><input type="range" min="0" max="15" step="1" value={nullMask} onChange={e=>setNullMask(Number(e.target.value))}/></label>:<label className="number-control"><b>Null seed</b><input type="number" value={seed} onChange={e=>setSeed(e.target.value)}/></label>}<div className="bridge-rule"><GitCompare size={17}/><p>Same test on both sides: construct recurrent cycles, their Fourier eigenmodes, then verify the spacetime harmonic identity numerically.</p></div></aside>

    <main className="bridge-main"><div className="bridge-score"><div><small>CAT harmonic check</small><strong>{r.catWave?'PASS':'FAIL'}</strong><span>max residual {sci(r.cat.maxResidual)}</span></div><div><small>Null harmonic check</small><strong>{r.nullWave?'PASS':'FAIL'}</strong><span>max residual {sci(r.null.maxResidual)}</span></div><div><small>CAT-specific?</small><strong>{r.specificity==='candidate'?'CANDIDATE':'NO'}</strong><span>{r.nullLabel}</span></div></div>
    <section className="panel bridge-spectrum"><div className="panel-title"><Waves size={18}/><span>Spacetime harmonic modes</span></div><ModeStrip data={r.cat} title="CAT chain"/><ModeStrip data={r.null} title="Markov control"/><p className="bridge-math">For a d-cycle, f(δ)=e<sup>−i2πkδ/d</sup>. Advancing one Markov step shifts δ→δ+1; multiplying by λ<sup>−n</sup> in the spacetime chain cancels that phase shift. The residual shown above directly checks this identity.</p></section>
    <section className="panel bridge-interpret"><div className="panel-title"><Radio size={18}/><span>Discriminating result</span></div><p>{r.conclusion}</p><div className="bridge-verdict"><b>{r.specificity==='not-specific'?'Generic spectral mechanism detected':'Candidate CAT-specific difference'}</b><span>A mathematical resemblance becomes evidence for CAT only if a CAT-derived restriction survives appropriately matched alternatives and then predicts independent observations.</span></div></section>
    <PlainResultPanel title="¿Qué significa este resultado?" summary={simple} points={[`CAT produce ${r.cat.nontrivialModes} modos no triviales; el control produce ${r.null.nontrivialModes}.`,`El error matemático máximo es ${sci(r.cat.maxResidual)} para CAT y ${sci(r.null.maxResidual)} para el control.`,`La pregunta importante no es si aparecen ondas, sino si CAT obliga a una propiedad que los controles no puedan reproducir.`]} caution="Que ambos modelos produzcan modos armónicos no demuestra que ninguno sea consciente, ni que una función de onda física esté causada por estos agentes."/>
    </main></div>
  </section>;
}
