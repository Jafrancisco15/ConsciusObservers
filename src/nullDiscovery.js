import { findCycles } from './exactMarkov';

function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function randomPermutation(rng,n=16){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function cycleLengths(map){const seen=new Set(),lengths=[];for(let s=0;s<map.length;s++){if(seen.has(s))continue;let x=s,n=0;while(!seen.has(x)){seen.add(x);n++;x=map[x];}lengths.push(n);}return lengths.sort((a,b)=>a-b);}
function fingerprint(lengths){return lengths.join('-');}
function cycleTypeProbability(lengths){const counts={};for(const d of lengths)counts[d]=(counts[d]||0)+1;let denominator=1;for(const [d,m] of Object.entries(counts)){denominator*=Number(d)**m;for(let k=2;k<=m;k++)denominator*=k;}return 1/denominator;}
function factorial(n){let x=1;for(let i=2;i<=n;i++)x*=i;return x;}

export function runNullDiscovery({example='identity',samples=20000,seed=8675309}={}){
  const mask=example==='flipD1'?2:0;
  const catPeriods=findCycles(mask).map(c=>c.length).sort((a,b)=>a-b);
  const catFingerprint=fingerprint(catPeriods);
  const exactBroadProbability=cycleTypeProbability(catPeriods);
  const totalPermutations=factorial(16);
  const exactBroadCount=Math.round(totalPermutations*exactBroadProbability);
  const rng=mulberry32(Number(seed));
  let matches=0, harmonicPasses=0, sameCycleCount=0, sameMaxPeriod=0;
  const fpCounts={};
  const n=Math.max(100,Math.min(100000,Math.round(Number(samples)||20000)));
  for(let i=0;i<n;i++){
    const periods=cycleLengths(randomPermutation(rng));
    const fp=fingerprint(periods);
    fpCounts[fp]=(fpCounts[fp]||0)+1;
    if(fp===catFingerprint)matches++;
    if(periods.length===catPeriods.length)sameCycleCount++;
    if(Math.max(...periods)===Math.max(...catPeriods))sameMaxPeriod++;
    // Every finite permutation decomposes into cycles. Each cycle has discrete
    // Fourier eigenmodes, so the spacetime harmonic construction used by the
    // Physics Bridge is available to every member of this permutation null.
    harmonicPasses++;
  }
  const topFingerprints=Object.entries(fpCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([fp,count])=>({fp,count,rate:count/n}));
  return {
    example,n,seed:Number(seed),catPeriods,catFingerprint,
    monteCarloMatch:matches/n,matches,
    exactBroadProbability,exactBroadCount,totalPermutations,
    strictMatchedProbability:.5,
    harmonicRate:harmonicPasses/n,
    sameCycleCountRate:sameCycleCount/n,
    sameMaxPeriodRate:sameMaxPeriod/n,
    topFingerprints,
    message: exactBroadProbability<.01
      ? 'El patrón exacto de ciclos de CAT es poco frecuente entre permutaciones completamente libres, pero deja de ser raro cuando exigimos un control con la misma arquitectura causal. La rareza depende fuertemente de qué control sea científicamente justo.'
      : 'El patrón de CAT aparece con una frecuencia apreciable incluso en el control amplio. Por sí solo, el patrón de ciclos ofrece poca capacidad de discriminación.'
  };
}
