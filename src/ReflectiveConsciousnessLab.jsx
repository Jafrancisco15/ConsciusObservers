import { useState } from 'react';
import {
  Activity,
  BrainCircuit,
  Eye,
  Gauge,
  GitBranch,
  Play,
  RefreshCw,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import PlainResultPanel from './PlainResultPanel';
import {
  interpretReflectiveResult,
  simulateReflectiveExperiment,
} from './reflectiveModel';
import './reflectiveConsciousness.css';

const DEFAULTS = {
  threat: 0.65,
  egoSalience: 0.7,
  selfObservation: 0.65,
  pause: 0.55,
  perspectiveBreadth: 4,
  noise: 0.85,
  trials: 1800,
  seed: 20260919,
};

const pct = (value, digits = 1) => (value * 100).toFixed(digits) + '%';
const signedPct = (value) => (value >= 0 ? '+' : '') + (value * 100).toFixed(1) + ' pp';

function Slider({ label, value, min = 0, max = 1, step = 0.05, onChange, format = (v) => Number(v).toFixed(2) }) {
  return (
    <label className="control">
      <span><b>{label}</b><em>{format(value)}</em></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Metric({ icon, label, value, note }) {
  return (
    <div className="metric-card reflective-metric">
      <div className="metric-icon">{icon}</div>
      <div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
    </div>
  );
}

export default function ReflectiveConsciousnessLab() {
  const [draft, setDraft] = useState(DEFAULTS);
  const [result, setResult] = useState(() => simulateReflectiveExperiment(DEFAULTS));
  const { metrics } = result;
  const interpretation = interpretReflectiveResult(metrics);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const run = () => setResult(simulateReflectiveExperiment(draft));
  const reset = () => {
    setDraft(DEFAULTS);
    setResult(simulateReflectiveExperiment(DEFAULTS));
  };

  const regimeLabel =
    interpretation.regime === 'reflective'
      ? 'Régimen reflexivo'
      : interpretation.regime === 'reactive'
        ? 'Régimen reactivo'
        : 'Régimen mixto';

  return (
    <section className="reflective-lab">
      <div className="theory-banner reflective-banner">
        <div>
          <span className="eyebrow">Philosophy → metacognition → falsifiable model</span>
          <h2>Autoobservación y estados de consciencia</h2>
          <p>
            Traducimos la analogía de consciencia baja/alta a variables funcionales medibles:
            reactividad, saliencia del yo, pausa antes de actuar, representación de segundo orden,
            amplitud de perspectiva y capacidad de corregir una primera impresión.
          </p>
        </div>
        <div className="reflective-flow" aria-label="Arquitectura del modelo">
          <div><b>Iₜ</b><small>impresión</small></div><i>→</i>
          <div><b>Mₜ</b><small>metaobservador</small></div><i>→</i>
          <div><b>Gₜ</b><small>asentimiento</small></div><i>→</i>
          <div><b>Aₜ</b><small>acción</small></div>
        </div>
      </div>

      <div className="reflective-boundary panel">
        <ShieldCheck size={20}/>
        <div>
          <b>Frontera científica</b>
          <p>
            “Baja” y “alta” son nombres de dos regímenes computacionales inspirados por De Botton y
            la tradición estoica. El laboratorio no identifica esos regímenes con experiencia
            fenomenal y no usa la metáfora reptiliano/neocórtex como neuroanatomía literal.
          </p>
        </div>
      </div>

      <div className="lab-grid">
        <aside className="panel controls-panel reflective-controls">
          <div className="panel-title"><Gauge size={19}/> Parámetros</div>
          <Slider label="Amenaza / urgencia" value={draft.threat} onChange={(v) => update('threat', v)}/>
          <Slider label="Saliencia del yo" value={draft.egoSalience} onChange={(v) => update('egoSalience', v)}/>
          <Slider label="Autoobservación" value={draft.selfObservation} onChange={(v) => update('selfObservation', v)}/>
          <Slider label="Pausa antes de actuar" value={draft.pause} onChange={(v) => update('pause', v)}/>
          <Slider
            label="Perspectivas simuladas"
            value={draft.perspectiveBreadth}
            min={1}
            max={7}
            step={1}
            format={(v) => String(v)}
            onChange={(v) => update('perspectiveBreadth', v)}
          />
          <Slider
            label="Ruido perceptual"
            value={draft.noise}
            min={0.15}
            max={2}
            step={0.05}
            onChange={(v) => update('noise', v)}
          />
          <button className="primary-btn" onClick={run}><Play size={17}/> Ejecutar simulación</button>
          <button className="secondary-btn" onClick={reset}><RefreshCw size={16}/> Restablecer</button>
          <div className="note">
            <Scale size={16}/>
            <span>El control “igual cómputo” recibe las mismas perspectivas extra, pero no observa su propia primera respuesta ni usa una compuerta de asentimiento.</span>
          </div>
        </aside>

        <div className="main-column">
          <div className="metric-strip reflective-strip">
            <Metric icon={<Activity size={18}/>} label="Reactivo" value={pct(metrics.reactiveAccuracy)} note="acierto de la primera impresión"/>
            <Metric icon={<Scale size={18}/>} label="Control igual cómputo" value={pct(metrics.matchedAccuracy)} note="más muestras, sin introspección"/>
            <Metric icon={<BrainCircuit size={18}/>} label="Reflexivo" value={pct(metrics.reflectiveAccuracy)} note="metaobservación + compuerta"/>
          </div>

          <div className="reflective-score-grid">
            <section className="panel reflective-index">
              <span className="eyebrow">Reflective Regulation Index</span>
              <div className="index-number">{metrics.reflectiveRegulationIndex.toFixed(3)}</div>
              <h3>{regimeLabel}</h3>
              <p>
                Índice compuesto de monitorización, corrección, calibración, discriminación de la
                compuerta y beneficio de ampliar perspectiva. No es un “nivel de consciencia”.
              </p>
              <div className="index-track"><i style={{ width: pct(metrics.reflectiveRegulationIndex, 0) }}/></div>
            </section>

            <section className="panel markov-card">
              <div className="panel-title"><GitBranch size={19}/> Dinámica baja ↔ alta</div>
              <div className="markov-row"><span>L → H</span><b>{pct(metrics.pLowToHigh)}</b></div>
              <div className="markov-row"><span>H → L</span><b>{pct(metrics.pHighToLow)}</b></div>
              <div className="markov-stationary">
                <small>ocupación estacionaria del régimen reflexivo</small>
                <strong>{pct(metrics.stationaryHigh)}</strong>
              </div>
              <p className="model-note">
                Es una cadena de Markov hipotética parametrizada por amenaza, pausa, autoobservación
                y perspectiva; no es una estimación biológica.
              </p>
            </section>
          </div>

          <section className="panel">
            <div className="panel-title"><Eye size={19}/> ¿Qué añade realmente la autoobservación?</div>
            <div className="diagnostic-grid">
              <div><span>Skill metacognitivo</span><b>{metrics.metaSkill.toFixed(3)}</b><small>predice cuándo la primera impresión fallará</small></div>
              <div><span>Corrección de errores</span><b>{pct(metrics.correctionRate)}</b><small>impulsos erróneos rescatados</small></div>
              <div><span>Daño por sobrecorrección</span><b>{pct(metrics.harmRate)}</b><small>impulsos correctos estropeados</small></div>
              <div><span>Deliberación</span><b>{pct(metrics.deliberationRate)}</b><small>veces que se abre la compuerta</small></div>
              <div><span>Cambio de respuesta</span><b>{pct(metrics.reversalRate)}</b><small>acción final distinta del impulso</small></div>
              <div><span>Calibración reflexiva</span><b>{metrics.reflectiveCalibration.toFixed(3)}</b><small>confianza alineada con acierto</small></div>
            </div>
          </section>

          <section className="panel comparison-panel">
            <div className="panel-title"><Scale size={19}/> Descomposición causal</div>
            <div className="causal-row">
              <div><span>Beneficio de más perspectivas</span><strong>{signedPct(metrics.perspectiveGain)}</strong></div>
              <p>Control igual cómputo − agente reactivo.</p>
            </div>
            <div className="causal-row">
              <div><span>Beneficio adicional de introspección</span><strong>{signedPct(metrics.introspectionGain)}</strong></div>
              <p>Agente reflexivo − control igual cómputo. Este contraste es el test importante.</p>
            </div>
            <div className="equation-box">
              <code>impresión Iₜ → representación de segundo orden Mₜ → P(asentir|Mₜ, amenaza, pausa) → acción Aₜ</code>
            </div>
          </section>

          <section className="panel falsification-mini">
            <div className="panel-title"><ShieldCheck size={19}/> Qué tendría que fallar para debilitar la hipótesis</div>
            <div className="mini-tests">
              <div><b>01</b><p>Si el control con el mismo cómputo iguala sistemáticamente al modelo reflexivo, “autoobservación” no añade explicación.</p></div>
              <div><b>02</b><p>Si Mₜ no predice errores de Iₜ mejor que la tasa base, no tenemos evidencia funcional de monitorización.</p></div>
              <div><b>03</b><p>Si aumentar autoobservación sólo mejora el índice compuesto pero no los observables independientes, el índice está circularmente definido.</p></div>
            </div>
          </section>

          <PlainResultPanel
            title="¿Qué aprendemos de esta corrida?"
            summary={interpretation.summary}
            analogy="Piensa en dos personas con el mismo tiempo extra para decidir. Una sólo vuelve a mirar el problema; la otra además puede notar que su primera reacción estaba sesgada y decidir si darle asentimiento. Compararlas separa ‘pensar más’ de ‘observarse pensando’."
            takeaway={
              'La hipótesis útil no es que exista una esencia matemática llamada consciencia alta, sino que ciertos estados reflexivos podrían describirse como una capa de segundo orden capaz de monitorizar, modular y corregir procesos de primer orden.'
            }
            points={[
              'Precisión reactiva: ' + pct(metrics.reactiveAccuracy) + '; control igual cómputo: ' + pct(metrics.matchedAccuracy) + '; reflexiva: ' + pct(metrics.reflectiveAccuracy) + '.',
              'Ganancia por perspectiva: ' + signedPct(metrics.perspectiveGain) + '; ganancia específica de introspección: ' + signedPct(metrics.introspectionGain) + '.',
              'Skill metacognitivo: ' + metrics.metaSkill.toFixed(3) + '; calibración reflexiva: ' + metrics.reflectiveCalibration.toFixed(3) + '.',
              'Ocupación estacionaria del régimen reflexivo en el modelo de dos estados: ' + pct(metrics.stationaryHigh) + '.',
            ]}
            caution={interpretation.caution}
          />
        </div>
      </div>
    </section>
  );
}
