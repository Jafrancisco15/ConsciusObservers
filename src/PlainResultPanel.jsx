import { Lightbulb, ShieldCheck } from 'lucide-react';
import './plainResults.css';

export default function PlainResultPanel({ title='¿Qué significa este resultado?', summary, points=[], caution }) {
  return <section className="plain-result panel" aria-label="Resultado explicado en lenguaje sencillo">
    <div className="plain-result-head"><Lightbulb size={20}/><div><span className="eyebrow">En palabras simples</span><h3>{title}</h3></div></div>
    <p className="plain-summary">{summary}</p>
    {points.length>0 && <div className="plain-points">{points.map((p,i)=><div key={i}><b>{i+1}</b><span>{p}</span></div>)}</div>}
    {caution && <div className="plain-caution"><ShieldCheck size={17}/><p><b>Lo que esto no demuestra:</b> {caution}</p></div>}
  </section>;
}
