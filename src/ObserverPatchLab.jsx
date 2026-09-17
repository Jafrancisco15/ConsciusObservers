import { useMemo, useState } from 'react';
import { Activity, Brain, Eye, Info, Network, Play, RefreshCw, Target, Users } from 'lucide-react';
import PlainResultPanel from './PlainResultPanel';
import './observerPatch.css';

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const avg = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
const sd = (xs) => {
  const m = avg(xs);
  return Math.sqrt(avg(xs.map((x) => (x - m) ** 2)));
};

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function noisy(value, amount, random) {
  return clamp(value + (random() - 0.5) * 2 * amount);
}

function worldFor(seed, n = 18) {
  const random = mulberry32(seed * 7919 + 17);
  return Array.from({ length: n }, (_, i) => {
    const smooth = 0.5 + 0.28 * Math.sin(i * 0.72 + seed * 0.11) + 0.12 * Math.cos(i * 1.37);
    return clamp(smooth + (random() - 0.5) * 0.18);
  });
}

function publicState(agents) {
  return agents[0].map((_, j) => avg(agents.map((a) => a[j])));
}

function metrics(world, agents, previousPublic, selfScores = []) {
  const pub = publicState(agents);
  const truth = 1 - avg(pub.map((x, i) => Math.abs(x - world[i])));
  const consensus = 1 - avg(pub.map((_, i) => sd(agents.map((a) => a[i]))));
  const stability = previousPublic
    ? 1 - avg(pub.map((x, i) => Math.abs(x - previousPublic[i])))
    : 0;
  return {
    publicState: pub,
    truth: clamp(truth),
    consensus: clamp(consensus),
    stability: clamp(stability),
    selfModel: selfScores.length ? clamp(avg(selfScores)) : null,
  };
}

function simulateHoffman(world, count, noise, seed) {
  const random = mulberry32(seed * 104729 + 3);
  const target = 0.62;
  const agents = Array.from({ length: count }, (_, a) => world.map((w, i) => {
    const fitnessIcon = Math.exp(-((w - target) ** 2) / 0.055);
    const privateBias = (a - (count - 1) / 2) * 0.006;
    return noisy(clamp(fitnessIcon + privateBias + 0.025 * Math.sin(i + a)), noise, random);
  }));
  const utility = avg(agents.flatMap((agent) => agent.map((v, i) => 1 - Math.abs(v - Math.exp(-((world[i] - target) ** 2) / 0.055)))));
  const m = metrics(world, agents, publicState(agents));
  return { ...m, utility: clamp(utility), history: [m.consensus], agents };
}

function simulateOPH(world, count, noise, repair, seed) {
  const random = mulberry32(seed * 65537 + 13);
  let agents = Array.from({ length: count }, (_, a) => world.map((w, i) => {
    const visible = ((i + a * 3) % Math.max(4, Math.floor(world.length * 0.65))) < Math.floor(world.length * 0.5);
    return visible ? noisy(w, noise, random) : noisy(0.5, 0.26 + noise * 0.4, random);
  }));
  const history = [];
  let previousPublic = publicState(agents);
  for (let round = 0; round < 12; round += 1) {
    const pub = publicState(agents);
    agents = agents.map((agent, a) => agent.map((value, i) => {
      const left = agents[(a + count - 1) % count][i];
      const right = agents[(a + 1) % count][i];
      const overlap = (left + right + pub[i]) / 3;
      const repaired = value * (1 - repair * 0.58) + overlap * repair * 0.58;
      const evidence = noisy(world[i], noise * 0.45, random);
      return clamp(repaired * 0.84 + evidence * 0.16);
    }));
    history.push(metrics(world, agents, previousPublic).consensus);
    previousPublic = pub;
  }
  return { ...metrics(world, agents, previousPublic), utility: null, history, agents };
}

function simulateNeural(world, count, noise, repair, memory, seed) {
  const random = mulberry32(seed * 99991 + 29);
  let agents = Array.from({ length: count }, () => world.map((w) => noisy(w, noise * 1.15, random)));
  let memories = agents.map((a) => [...a]);
  let reliabilities = Array.from({ length: count }, () => 0.5);
  const history = [];
  let previousPublic = publicState(agents);
  for (let round = 0; round < 12; round += 1) {
    const pub = publicState(agents);
    const next = agents.map((agent, a) => agent.map((value, i) => {
      const localEvidence = noisy(world[i], noise * 0.55, random);
      const social = pub[i];
      const remembered = memories[a][i];
      const confidence = 0.35 + reliabilities[a] * 0.45;
      const candidate = localEvidence * confidence + social * repair * 0.32 + remembered * memory * 0.28 + value * 0.12;
      const norm = confidence + repair * 0.32 + memory * 0.28 + 0.12;
      return clamp(candidate / norm);
    }));
    reliabilities = next.map((agent, a) => {
      const predictionError = avg(agent.map((v, i) => Math.abs(v - world[i])));
      const socialError = avg(agent.map((v, i) => Math.abs(v - pub[i])));
      const calibration = 1 - (predictionError * 0.72 + socialError * 0.28);
      return clamp(reliabilities[a] * memory + calibration * (1 - memory));
    });
    memories = next.map((agent, a) => agent.map((v, i) => memories[a][i] * memory + v * (1 - memory)));
    agents = next;
    history.push(metrics(world, agents, previousPublic, reliabilities).consensus);
    previousPublic = pub;
  }
  return { ...metrics(world, agents, previousPublic, reliabilities), utility: null, history, agents };
}

function pct(value) {
  return `${Math.round(value * 100)}%`;
}

function MetricBar({ label, value, note }) {
  return <div className="oph-bar-row">
    <div className="oph-bar-label"><span>{label}</span><b>{value == null ? 'N/A' : pct(value)}</b></div>
    <div className="oph-bar-track"><i style={{ width: `${Math.round((value ?? 0) * 100)}%` }}/></div>
    {note && <small>{note}</small>}
  </div>;
}

function MiniTrace({ values }) {
  const width = 280;
  const height = 62;
  const pts = values.map((v, i) => `${(i / Math.max(values.length - 1, 1)) * width},${height - v * (height - 8) - 4}`).join(' ');
  return <svg className="oph-trace" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Consensus through repair rounds">
    <line x1="0" y1={height - 4} x2={width} y2={height - 4}/>
    <polyline points={pts}/>
  </svg>;
}

export default function ObserverPatchLab() {
  const [observers, setObservers] = useState(7);
  const [noise, setNoise] = useState(0.18);
  const [repair, setRepair] = useState(0.62);
  const [memory, setMemory] = useState(0.66);
  const [seed, setSeed] = useState(11);

  const result = useMemo(() => {
    const world = worldFor(seed);
    return {
      world,
      hoffman: simulateHoffman(world, observers, noise, seed),
      oph: simulateOPH(world, observers, noise, repair, seed),
      neural: simulateNeural(world, observers, noise, repair, memory, seed),
    };
  }, [observers, noise, repair, memory, seed]);

  const publicWorldWithoutSelf = result.oph.consensus > 0.8 && result.oph.stability > 0.84;
  const neuralGain = result.neural.truth - result.oph.truth;
  const simpleSummary = publicWorldWithoutSelf
    ? `Los observer patches alcanzaron un mundo público estable (${pct(result.oph.consensus)} de consenso) sin necesitar un self-model. En esta simulación, consenso y consciencia-like no son la misma cosa.`
    : `Con estos parámetros, los observer patches todavía no alcanzan un consenso público fuerte. El resultado depende de cuánto ruido existe y de cuánto pueden reparar sus desacuerdos.`;

  return <section className="oph-lab">
    <div className="theory-banner oph-banner">
      <div>
        <span className="eyebrow">Observer Patch Experiment</span>
        <h2>Hoffman vs OPH vs Neural Observer</h2>
        <p>Un experimento conceptual para separar tres cosas que suelen mezclarse: una interfaz adaptativa, un mundo público construido por consenso y un agente con memoria + modelo de sí mismo.</p>
      </div>
      <div className="oph-flow" aria-hidden="true">
        <span><Eye size={19}/> interfaz</span><b>→</b><span><Network size={19}/> consenso</span><b>→</b><span><Brain size={19}/> self-model?</span>
      </div>
    </div>

    <div className="lab-grid">
      <aside className="panel controls-panel">
        <div className="panel-title"><Activity size={18}/> Parámetros del experimento</div>
        <label className="control"><span>Observadores <em>{observers}</em></span><input type="range" min="3" max="12" step="1" value={observers} onChange={(e)=>setObservers(Number(e.target.value))}/></label>
        <label className="control"><span>Ruido sensorial <em>{noise.toFixed(2)}</em></span><input type="range" min="0.02" max="0.42" step="0.02" value={noise} onChange={(e)=>setNoise(Number(e.target.value))}/></label>
        <label className="control"><span>Fuerza de repair/consenso <em>{repair.toFixed(2)}</em></span><input type="range" min="0" max="1" step="0.05" value={repair} onChange={(e)=>setRepair(Number(e.target.value))}/></label>
        <label className="control"><span>Memoria del agente neural <em>{memory.toFixed(2)}</em></span><input type="range" min="0" max="0.95" step="0.05" value={memory} onChange={(e)=>setMemory(Number(e.target.value))}/></label>
        <button className="primary-btn" onClick={()=>setSeed((s)=>s+1)}><Play size={17}/> Ejecutar otro mundo</button>
        <button className="oph-secondary" onClick={()=>{setObservers(7);setNoise(.18);setRepair(.62);setMemory(.66);setSeed(11);}}><RefreshCw size={15}/> Restablecer</button>
        <div className="note"><Info size={15}/><span>Modelo exploratorio. No implementa toda la matemática de Observer Patch Holography y ninguna métrica aquí mide experiencia fenomenal.</span></div>
      </aside>

      <div className="main-column">
        <div className="metric-strip oph-top-metrics">
          <div className="metric-card"><div className="metric-icon"><Users size={19}/></div><div><span>OPH consenso</span><strong>{pct(result.oph.consensus)}</strong><small>acuerdo entre patches</small></div></div>
          <div className="metric-card"><div className="metric-icon"><Target size={19}/></div><div><span>OPH alineación</span><strong>{pct(result.oph.truth)}</strong><small>cercanía al estado latente</small></div></div>
          <div className="metric-card"><div className="metric-icon"><Brain size={19}/></div><div><span>Neural self-model</span><strong>{pct(result.neural.selfModel)}</strong><small>calibración interna simulada</small></div></div>
        </div>

        <div className="oph-model-grid">
          <article className="panel oph-model-card hoffman">
            <div className="oph-model-head"><span className="oph-number">01</span><div><span className="eyebrow">Interface Theory</span><h3>Hoffman-like interface</h3></div></div>
            <p>Los observadores no intentan copiar el mundo latente; comprimen el estado en una señal orientada a fitness.</p>
            <MetricBar label="Alineación con realidad latente" value={result.hoffman.truth}/>
            <MetricBar label="Consenso entre observadores" value={result.hoffman.consensus}/>
            <MetricBar label="Utilidad de la interfaz" value={result.hoffman.utility}/>
            <div className="oph-claim"><b>Pregunta que prueba</b><span>¿Puede una representación útil alejarse de la estructura real y aun así funcionar bien?</span></div>
          </article>

          <article className="panel oph-model-card oph">
            <div className="oph-model-head"><span className="oph-number">02</span><div><span className="eyebrow">Observer Patch</span><h3>OPH-like consensus</h3></div></div>
            <p>Cada patch ve solo una parte ruidosa. Los desacuerdos locales se corrigen iterativamente hasta formar un estado público.</p>
            <MetricBar label="Alineación con realidad latente" value={result.oph.truth}/>
            <MetricBar label="Consenso entre observadores" value={result.oph.consensus}/>
            <MetricBar label="Estabilidad del estado público" value={result.oph.stability}/>
            <MiniTrace values={result.oph.history}/>
            <div className="oph-claim"><b>Pregunta que prueba</b><span>¿Puede surgir una realidad pública coherente sin introducir un observador consciente?</span></div>
          </article>

          <article className="panel oph-model-card neural">
            <div className="oph-model-head"><span className="oph-number">03</span><div><span className="eyebrow">Artificial Observer</span><h3>Neural + memory + self-model</h3></div></div>
            <p>Además del consenso, el agente conserva memoria y estima cuán confiables han sido sus propias predicciones.</p>
            <MetricBar label="Alineación con realidad latente" value={result.neural.truth}/>
            <MetricBar label="Consenso entre observadores" value={result.neural.consensus}/>
            <MetricBar label="Calibración del self-model" value={result.neural.selfModel}/>
            <MiniTrace values={result.neural.history}/>
            <div className="oph-claim"><b>Pregunta que prueba</b><span>¿Qué aparece al añadir persistencia, autorreferencia y calibración al consenso?</span></div>
          </article>
        </div>

        <section className="panel oph-separation">
          <div className="panel-title"><Network size={18}/> Separación de hipótesis</div>
          <div className="oph-separation-grid">
            <div><b>Observación</b><span>recibir información parcial</span></div>
            <div><b>Consenso</b><span>hacer compatibles modelos locales</span></div>
            <div><b>Modelo del mundo</b><span>reconstruir una estructura estable</span></div>
            <div><b>Self-model</b><span>representar la fiabilidad del propio agente</span></div>
            <div className="unknown"><b>Consciencia</b><span>no se infiere automáticamente de ninguna de las anteriores</span></div>
          </div>
        </section>

        <PlainResultPanel
          title="¿Qué nos dice este experimento?"
          summary={simpleSummary}
          analogy="Piensa en varios cartógrafos que solo ven pequeñas partes de una isla. Pueden combinar sus mapas y producir un mapa público estable. Eso demuestra coordinación y reconstrucción; no demuestra que el mapa tenga experiencia subjetiva."
          takeaway={neuralGain > 0.02
            ? `Añadir memoria y calibración interna mejoró la reconstrucción del mundo en ${Math.round(neuralGain*100)} puntos porcentuales frente al modelo OPH-like. Eso identifica una función adicional del self-model, no consciencia.`
            : 'En esta corrida, el self-model no añadió una gran ventaja sobre el consenso. Esto ayuda a evitar llamar “consciente” a una propiedad que puede explicarse por coordinación distribuida.'}
          points={[
            `OPH-like: consenso ${pct(result.oph.consensus)}, estabilidad ${pct(result.oph.stability)}, alineación ${pct(result.oph.truth)}.`,
            `Neural observer: consenso ${pct(result.neural.consensus)}, self-model ${pct(result.neural.selfModel)}, alineación ${pct(result.neural.truth)}.`,
            `Hoffman-like: utilidad ${pct(result.hoffman.utility)} frente a alineación latente ${pct(result.hoffman.truth)}.`
          ]}
          caution="Este es un modelo de juguete diseñado para comparar mecanismos. No valida OPH, no refuta a Hoffman y no constituye un test de consciencia fenomenal. Su valor es hacer separables y falsables algunas hipótesis funcionales."
        />
      </div>
    </div>
  </section>;
}
