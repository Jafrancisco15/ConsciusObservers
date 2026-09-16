// Matched-null falsification engine for finite binary observer networks.
// This tests whether a proposed CAT statistic is exceptional relative to
// ordinary coupled Markov systems with matched state dimension/topology.

const bit = (n, k) => (n >> k) & 1;
const stateBits = n => [bit(n,3), bit(n,2), bit(n,1), bit(n,0)];
const idx = b => (b[0]<<3)|(b[1]<<2)|(b[2]<<1)|b[3];

function entropy(p){
  return -p.reduce((s,x)=> x>0 ? s+x*Math.log2(x) : s,0);
}

function stationary(T, steps=1200){
  let p=Array(16).fill(1/16);
  for(let k=0;k<steps;k++){
    const q=Array(16).fill(0);
    for(let i=0;i<16;i++) for(let j=0;j<16;j++) q[j]+=p[i]*T[i][j];
    p=q;
  }
  return p;
}

function metrics(T){
  const pi=stationary(T);
  const h=entropy(pi);
  let rate=0;
  for(let i=0;i<16;i++) rate += pi[i]*entropy(T[i]);
  const predictive=Math.max(0,h-rate);
  let self=0;
  for(let i=0;i<16;i++) self += pi[i]*T[i][i];
  const active=pi.filter(x=>x>1e-7).length;
  return {stateEntropy:h, entropyRate:rate, predictive, selfTransition:self, active};
}

function deterministicMap(flips=[0,0,0,0]){
  const out=[];
  for(let s=0;s<16;s++){
    const [x1,g1,x2,g2]=stateBits(s);
    out[s]=idx([g2^flips[0], x1^flips[1], g1^flips[2], x2^flips[3]]);
  }
  return out;
}

function matrixFromMap(map, noise=0){
  return map.map(target=>{
    const row=Array(16).fill(noise/15);
    row[target]=1-noise;
    return row;
  });
}

function cycles(map){
  const seenGlobal=new Set(); const periods=[];
  for(let s=0;s<16;s++){
    if(seenGlobal.has(s)) continue;
    const local=new Map(); let cur=s; let t=0;
    while(!local.has(cur) && !seenGlobal.has(cur)){
      local.set(cur,t++); seenGlobal.add(cur); cur=map[cur];
    }
    if(local.has(cur)) periods.push(t-local.get(cur));
  }
  return periods.sort((a,b)=>a-b);
}

function randomPermutation(rng){
  const a=[...Array(16).keys()];
  for(let i=15;i>0;i--){ const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}

export function runFalsification({noise=0.02, samples=1000, seed=2026}={}){
  // CAT reference: Hoffman-Prakash Example-1-compatible identity channels.
  const catMap=deterministicMap([0,0,0,0]);
  const catT=matrixFromMap(catMap,noise);
  const cat={...metrics(catT), periods:cycles(catMap)};

  // Strict matched null: enumerate all 16 polarity variants on same directed cycle.
  const strict=[];
  for(let mask=0;mask<16;mask++){
    const flips=[0,1,2,3].map(k=>(mask>>k)&1);
    const map=deterministicMap(flips);
    strict.push({mask, flips, periods:cycles(map), ...metrics(matrixFromMap(map,noise))});
  }

  // Broad null: arbitrary deterministic 16-state bijections. This preserves state
  // count and deterministic channel entropy, but intentionally relaxes CAT topology.
  const rng=mulberry32(seed); const broad=[];
  for(let k=0;k<samples;k++){
    const map=randomPermutation(rng);
    broad.push({periods:cycles(map), ...metrics(matrixFromMap(map,noise))});
  }

  const stats=['predictive','stateEntropy','entropyRate','selfTransition','active'];
  const compare=arr=>Object.fromEntries(stats.map(key=>{
    const vals=arr.map(x=>x[key]);
    const ge=vals.filter(v=>v>=cat[key]-1e-12).length;
    const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
    const variance=vals.reduce((a,b)=>a+(b-mean)**2,0)/Math.max(1,vals.length-1);
    return [key,{cat:cat[key],mean,sd:Math.sqrt(variance),percentile:100*ge/vals.length}];
  }));

  const fp=JSON.stringify(cat.periods);
  return {
    cat,
    strict:{n:strict.length, fingerprintMatches:strict.filter(x=>JSON.stringify(x.periods)===fp).length, comparison:compare(strict)},
    broad:{n:broad.length, fingerprintMatches:broad.filter(x=>JSON.stringify(x.periods)===fp).length, comparison:compare(broad)},
    interpretation:'A statistic discriminates CAT only if it remains unusual under appropriately matched null families. Similarity to a quantum or harmonic form alone is not sufficient.'
  };
}
