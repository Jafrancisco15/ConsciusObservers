import { useState } from 'react';
import { Eye, FlaskConical, Network, Orbit, ShieldQuestion } from 'lucide-react';
import { FitnessTruthLab, ObserverLab } from './CoreLabs';
import ConsciousNetwork from './ConsciousNetwork';
import ExactMarkovLab from './ExactMarkovLab';
import CATFalsificationLab from './CATFalsificationLab';

export default function App() {
  const [tab, setTab] = useState('fitness');
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <div className="brand-mark"><Eye size={21}/></div>
          <div><b>Conscious Observers</b><span>Computational consciousness laboratory</span></div>
        </div>
        <div className="status-pill"><i/> live simulation</div>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">From philosophical claim to falsifiable model</span>
          <h1>What does evolution preserve: <em>truth</em>, <em>fitness</em>, or an observer-specific interface?</h1>
          <p>Explore computational experiments inspired by Interface Theory of Perception and Conscious Agent Theory. The aim is not to assume Hoffman is right, but to make specific mathematical claims precise enough to test and compare against alternatives.</p>
        </section>

        <nav className="tabs" aria-label="Experiments">
          <button className={tab==='fitness'?'active':''} onClick={()=>setTab('fitness')}><FlaskConical size={17}/> Fitness vs Truth</button>
          <button className={tab==='observer'?'active':''} onClick={()=>setTab('observer')}><Eye size={17}/> Conscious Observer</button>
          <button className={tab==='network'?'active':''} onClick={()=>setTab('network')}><Network size={17}/> Conscious Realism</button>
          <button className={tab==='exact'?'active':''} onClick={()=>setTab('exact')}><Orbit size={17}/> Exact Markov</button>
          <button className={tab==='falsification'?'active':''} onClick={()=>setTab('falsification')}><ShieldQuestion size={17}/> CAT Falsification</button>
        </nav>

        {tab==='fitness' && <FitnessTruthLab/>}
        {tab==='observer' && <ObserverLab/>}
        {tab==='network' && <ConsciousNetwork/>}
        {tab==='exact' && <ExactMarkovLab/>}
        {tab==='falsification' && <CATFalsificationLab/>}
      </main>

      <footer><p>Research sandbox · Statistical integration, recurrence, synchronization or harmonic resemblance are not by themselves evidence of phenomenal consciousness.</p></footer>
    </div>
  );
}
