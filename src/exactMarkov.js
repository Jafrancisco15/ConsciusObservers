// Exact finite-state laboratory for Hoffman & Prakash (2014), section
// "Dynamics of two conscious agents". State order: |x1 g1 x2 g2>.

export const PAPER_EXAMPLE_1 = [
  ['0000'], ['1111'], ['0101','1010'],
  ['0001','1000','0100','0010'],
  ['0011','1001','1100','0110'],
  ['0111','1011','1101','1110'],
];

export const PAPER_EXAMPLE_2 = [
  ['0000','0100','0110','0111','1111','1011','1001','1000'],
  ['0001','1100','0010','0101','1110','0011','1101','1010'],
];

export function bitsFromIndex(i) {
  return [(i>>3)&1, (i>>2)&1, (i>>1)&1, i&1];
}
export function indexFromBits(b) { return b[0]*8+b[1]*4+b[2]*2+b[3]; }
export function label(i) { return bitsFromIndex(i).join(''); }

// The compatibility wiring of the paper with identity kernels is
// x1' <- g2, g1' <- x1, x2' <- g1, g2' <- x2.
// mask toggles a NOT gate on each of the four otherwise capacity-1 channels.
export function deterministicNextIndex(i, mask=0) {
  const [x1,g1,x2,g2] = bitsFromIndex(i);
  const src = [g2,x1,g1,x2];
  return indexFromBits(src.map((v,k)=>v ^ ((mask>>k)&1)));
}

export function transitionMatrix({mask=0, noise=0}) {
  const n=16;
  return Array.from({length:n},(_,i)=>{
    const target=bitsFromIndex(deterministicNextIndex(i,mask));
    return Array.from({length:n},(_,j)=>{
      const dest=bitsFromIndex(j);
      let p=1;
      for(let k=0;k<4;k++) p*=dest[k]===target[k] ? (1-noise) : noise;
      return p;
    });
  });
}

export function findCycles(mask=0) {
  const visited=new Set(); const cycles=[];
  for(let start=0;start<16;start++) {
    if(visited.has(start)) continue;
    const path=[]; const pos=new Map(); let cur=start;
    while(!pos.has(cur) && !visited.has(cur)) {
      pos.set(cur,path.length); path.push(cur); cur=deterministicNextIndex(cur,mask);
    }
    path.forEach(x=>visited.add(x));
    if(pos.has(cur)) cycles.push(path.slice(pos.get(cur)));
  }
  return cycles.sort((a,b)=>a.length-b.length || a[0]-b[0]);
}

function canonicalCycle(c) {
  const labs=c.map(label); let best=null;
  for(let k=0;k<labs.length;k++) {
    const r=labs.slice(k).concat(labs.slice(0,k)).join('>');
    if(best===null || r<best) best=r;
  }
  return best;
}
function canonicalSet(cycles) { return cycles.map(canonicalCycle).sort().join('|'); }
function paperCanonical(paper) {
  return paper.map(c=>{
    let best=null;
    for(let k=0;k<c.length;k++) {
      const r=c.slice(k).concat(c.slice(0,k)).join('>');
      if(best===null || r<best) best=r;
    }
    return best;
  }).sort().join('|');
}

export function verifyPaperReplication() {
  const c1=findCycles(0), c2=findCycles(2); // bit 1 = flip D1: g1' = NOT x1
  return {
    example1: canonicalSet(c1)===paperCanonical(PAPER_EXAMPLE_1),
    example2: canonicalSet(c2)===paperCanonical(PAPER_EXAMPLE_2),
    cycles1:c1, cycles2:c2,
  };
}

export function entropy(probs) {
  return -probs.reduce((s,p)=>s+(p>0?p*Math.log2(p):0),0);
}

export function stationaryDistribution(P, iterations=5000, tol=1e-13) {
  const n=P.length; let pi=Array(n).fill(1/n);
  for(let t=0;t<iterations;t++) {
    const next=Array(n).fill(0);
    for(let i=0;i<n;i++) for(let j=0;j<n;j++) next[j]+=pi[i]*P[i][j];
    const err=next.reduce((s,x,j)=>s+Math.abs(x-pi[j]),0);
    pi=next; if(err<tol) break;
  }
  return pi;
}

export function matrixMetrics(P) {
  const pi=stationaryDistribution(P);
  const hState=entropy(pi);
  const hRate=pi.reduce((s,p,i)=>s+p*entropy(P[i]),0);
  return {pi, stateEntropy:hState, entropyRate:hRate, predictiveInformation:Math.max(0,hState-hRate)};
}

// For deterministic permutation dynamics, each d-cycle contributes the d roots
// of unity. We also expose an eigenvector support/phase representation.
export function exactPermutationSpectrum(cycles) {
  const modes=[];
  cycles.forEach((cycle,ci)=>{
    const d=cycle.length;
    for(let k=0;k<d;k++) {
      const angle=2*Math.PI*k/d;
      modes.push({
        cycle:ci+1, period:d, k,
        re:Math.cos(angle), im:Math.sin(angle), magnitude:1,
        support:cycle.map((s,r)=>({state:label(s), phase:-2*Math.PI*k*r/d})),
      });
    }
  });
  return modes;
}

// Same state count, exact ring dependency graph, one input/one output per node,
// deterministic entropy, and 1-bit capacity per edge. Only edge polarity changes.
// This is deliberately a strong null: it removes CAT semantics while preserving
// the finite-state computational structure.
export function matchedNullEnsemble() {
  const rows=[];
  for(let mask=0;mask<16;mask++) {
    const cycles=findCycles(mask);
    rows.push({mask, cycleLengths:cycles.map(c=>c.length), fingerprint:cycles.map(c=>c.length).join('-')});
  }
  const counts={}; rows.forEach(r=>counts[r.fingerprint]=(counts[r.fingerprint]||0)+1);
  return {rows, counts, total:rows.length};
}

export function runExactMarkov({example='identity', noise=0}) {
  const mask=example==='flipD1' ? 2 : 0;
  const cycles=findCycles(mask);
  const P=transitionMatrix({mask,noise});
  const metrics=matrixMetrics(P);
  const replication=verifyPaperReplication();
  const nulls=matchedNullEnsemble();
  const fp=cycles.map(c=>c.length).join('-');
  const nullMatch=(nulls.counts[fp]||0)/nulls.total;
  return {mask,P,cycles,metrics,replication,nulls,nullMatch,spectrum:exactPermutationSpectrum(cycles)};
}
