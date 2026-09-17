import { ChevronDown, Lightbulb, ShieldCheck } from 'lucide-react';
import './plainResults.css';

export default function PlainResultPanel({ title='¿Qué significa este resultado?', summary, takeaway, analogy, points=[], caution }) {
  return <section className="plain-result panel" aria-label="Resultado explicado en lenguaje sencillo">
    <div className="plain-result-head"><Lightbulb size={22}/><div><span className="eyebrow">Sin jerga científica</span><h3>{title}</h3></div></div>
    <div className="plain-answer"><span>En una frase</span><p>{summary}</p></div>
    {analogy && <div className="plain-analogy"><b>Imagínalo así</b><p>{analogy}</p></div>}
    {takeaway && <div className="plain-takeaway"><b>Entonces, ¿con qué nos quedamos?</b><p>{takeaway}</p></div>}
    {points.length>0 && <details className="plain-details"><summary><ChevronDown size={16}/> Ver los números que sostienen esta explicación</summary><div className="plain-points">{points.map((p,i)=><div key={i}><b>{i+1}</b><span>{p}</span></div>)}</div></details>}
    {caution && <div className="plain-caution"><ShieldCheck size={18}/><p><b>Importante:</b> {caution}</p></div>}
  </section>;
}
