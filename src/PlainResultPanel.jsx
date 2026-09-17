import { Lightbulb, ShieldCheck } from 'lucide-react';
import './plainResults.css';

export default function PlainResultPanel({ title='What does this result mean?', summary, points=[], caution }) {
  return <section className="plain-result panel" aria-label="Plain-language result">
    <div className="plain-result-head"><Lightbulb size={20}/><div><span className="eyebrow">For everyone</span><h3>{title}</h3></div></div>
    <p className="plain-summary">{summary}</p>
    {points.length>0 && <div className="plain-points">{points.map((p,i)=><div key={i}><b>{i+1}</b><span>{p}</span></div>)}</div>}
    {caution && <div className="plain-caution"><ShieldCheck size={17}/><p><b>What it does not prove:</b> {caution}</p></div>}
  </section>;
}
