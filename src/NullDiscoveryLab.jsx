import { useMemo, useState } from 'react';
import { Database, RefreshCw, Search, Waves } from 'lucide-react';
import { runNullDiscovery } from './nullDiscovery';
import PlainResultPanel from './PlainResultPanel';
import './nullDiscovery.css';

const pct=(x,d=3)=>(100*x).toFixed(d)+'%';
const integer=x=>Number(x).toLocaleString('es-ES');

export default function NullDiscoveryLab(){
  const [example,setExample]=useState('identity');
  const [samples,setSamples]=useState(20000);
  const [seed,setSeed]=useState(8675309);
  const [nonce,setNonce]=useState(0);
  const r=useMemo(()=>runNullDiscovery({example,samples,seed:Number(seed)+nonce}),[example,samples,seed,nonce]);
  const everyday=r.exactBroadProbability<.01
    ? `Si mezclamos al azar todas las formas posibles de conectar 16 estados, el patrón exacto de CAT aparece solo ${pct(r.exactBroadProbability,4)} de las veces. Pero cuando comparamos con sistemas que conservan la misma estructura básica que CAT, aparece el 50%. Eso cambia la lectura: el patrón parece especial solo frente a controles demasiado generales.`
    : `El patrón de CAT aparece ${pct(r.exactBroadProbability,3)} de las veces entre todos los patrones de permutación posibles y 50% en el control estructuralmente emparejado. No es una firma exclusiva de CAT.`;
  return <section className="discovery-wrap">
    <section className="theory-banner discovery-banner"><div><span className="eyebrow">Large null search · specificity stress test</span><h2>¿Qué queda de CAT después de compararlo con muchísimos sistemas ordinarios?</h2><p>En vez de escoger un solo control, este laboratorio compara el patrón CAT con miles de permutaciones aleatorias y, para el fingerprint de ciclos, calcula además la frecuencia exacta sobre las 16! permutaciones posibles.</p></div><div className="discovery-big"><b>16! = 20,922,789,888,000</b><span>controles posibles en el censo matemático</span></div></section>

    <div className="discovery-grid"><aside className="panel discovery-controls"><div className="panel-title"><Search size={18}/><span>Búsqueda</span></div><label className="select-control"><b>Referencia CAT</b><select value={example} onChange={e=>setExample(e.target.value)}><option value="identity">Ejemplo 1 · identidad</option><option value="flipD1">Ejemplo 2 · D₁ invertido</option></select></label><label className="control"><span><b>Muestra Monte Carlo</b><em>{integer(samples)}</em></span><input type="range" min="1000" max="100000" step="1000" value={samples} onChange={e=>setSamples(Number(e.target.value))}/></label><label className="number-control"><b>Semilla</b><input type="number" value={seed} onChange={e=>setSeed(e.target.value)}/></label><button className="primary-btn" onClick={()=>setNonce(n=>n+1)}><RefreshCw size={17}/> Nueva muestra</button><p className="discovery-help">La simulación llega hasta 100,000 controles para mantener la página fluida. El fingerprint exacto no necesita simular millones: usamos combinatoria para contar todo el espacio de 16! permutaciones.</p></aside>

    <main className="discovery-main"><div className="discovery-metrics"><div><small>Patrón CAT</small><strong>{r.catFingerprint}</strong><span>longitudes de ciclo</span></div><div><small>Control amplio · exacto</small><strong>{pct(r.exactBroadProbability,4)}</strong><span>{integer(r.exactBroadCount)} de 16!</span></div><div><small>Control bien emparejado</small><strong>50.0%</strong><span>8 de 16 variantes</span></div><div><small>Forma armónica</small><strong>{pct(r.harmonicRate,1)}</strong><span>en permutaciones</span></div></div>

    <section className="panel discovery-meaning"><div className="panel-title"><Database size={18}/><span>La comparación que cambia la interpretación</span></div><div className="control-ladder"><div><b>1. Control demasiado amplio</b><strong>{pct(r.exactBroadProbability,4)}</strong><p>Pregunta: “¿Qué tan raro es este patrón entre cualquier permutación de 16 estados?”</p></div><div><b>2. Control con estructura equivalente</b><strong>50.0%</strong><p>Pregunta más exigente: “¿Sigue siendo raro si el control conserva la misma arquitectura causal básica?”</p></div><div><b>3. Propiedad tipo onda</b><strong>100%</strong><p>En una permutación finita siempre hay ciclos y modos de Fourier. Por eso esta propiedad, tomada sola, es genérica en esta familia.</p></div></div></section>

    <section className="panel discovery-sample"><div className="panel-title"><Waves size={18}/><span>Chequeo Monte Carlo</span></div><p>En la muestra actual de <b>{integer(r.n)}</b> controles, <b>{integer(r.matches)}</b> reprodujeron exactamente el fingerprint CAT: {pct(r.monteCarloMatch,3)}. La frecuencia exacta calculada sobre todo el espacio es {pct(r.exactBroadProbability,4)}.</p><div className="fingerprints">{r.topFingerprints.map(x=><div key={x.fp}><span>{x.fp}</span><i><b style={{width:`${Math.max(2,100*x.rate/(r.topFingerprints[0]?.rate||1))}%`}}/></i><em>{pct(x.rate,2)}</em></div>)}</div></section>

    <PlainResultPanel title="Resultado sin jerga" summary={everyday} analogy="Es como evaluar si una llave es especial. Compararla con millones de objetos al azar puede hacerla parecer rarísima. La comparación justa es con otras llaves del mismo tipo. Si muchas de esas también abren la cerradura, abrirla no era la característica exclusiva que buscábamos." takeaway="La propiedad más llamativa hasta ahora —los modos tipo onda— aparece también en controles ordinarios. El patrón exacto de ciclos puede ser raro frente a controles generales, pero no frente a controles que conservan la misma estructura de CAT." points={[`Muestra ejecutada: ${integer(r.n)} sistemas aleatorios.`,`Frecuencia exacta del fingerprint CAT entre las 16! permutaciones: ${pct(r.exactBroadProbability,4)}.`,`Frecuencia del mismo fingerprint en el control estructuralmente emparejado: 50%.`,`Disponibilidad de modos armónicos en la familia de permutaciones: 100%.`]} caution="Que un patrón sea raro frente a un control amplio no lo convierte en evidencia de consciencia. El control debe conservar todas las características conocidas que podrían producir el efecto sin recurrir a CAT."/>
    </main></div>
  </section>;
}
