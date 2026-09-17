import { findCycles, deterministicNextIndex } from './exactMarkov';

function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function randomPermutation(seed){const rng=mulberry32(seed);const a=[...Array(16).keys()];for(let i=15;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function cyclesFromMap(map){const done=new Set(),out=[];for(let s=0;s<map.length;s++){if(done.has(s))continue;const pos=new Map(),path=[];let x=s;while(!pos.has(x)&&!done.has(x)){pos.set(x,path.length);path.push(x);x=map[x];}path.forEach(v=>done.add(v));if(pos.has(x))out.push(path.slice(pos.get(x)));}return out.sort((a,b)=>a.length-b.length||a[0]-b[0]);}

function harmonicModes(cycles){
  const modes=[];
  cycles.forEach((cycle,ci)=>{
    const d=cycle.length;
    for(let k=0;k<d;k++){
      const omega=2*Math.PI*k/d;
      // f(delta)=exp(-i omega delta), lambda=exp(-i omega).
      // g(delta,n)=lambda^(-n) f(delta) is harmonic on the spacetime chain.
      let maxResidual=0;
      for(let delta=0;delta<d;delta++){
        const next=(delta+1)%d;
        const phaseHere=-omega*delta;
        const phaseNext=-omega*next + omega; // n=1 versus n=0
        const dr=Math.cos(phaseNext)-Math.cos(phaseHere);
        const di=Math.sin(phaseNext)-Math.sin(phaseHere);
        maxResidual=Math.max(maxResidual,Math.hypot(dr,di));
      }
      modes.push({cycle:ci+1,period:d,k,omega,wavelength:k===0?Infinity:d/Math.max(1,k),residual:maxResidual});
    }
  });
  return modes;
}

function summarize(cycles){
  const modes=harmonicModes(cycles); const nontrivial=modes.filter(m=>m.k>0);
  return {cycles,periods:cycles.map(c=>c.length),modes,nontrivialModes:nontrivial.length,maxResidual:nontrivial.length?Math.max(...nontrivial.map(m=>m.residual)):0,meanResidual:nontrivial.length?nontrivial.reduce((s,m)=>s+m.residual,0)/nontrivial.length:0};
}

export function runPhysicsBridge({example='identity',nullType='matched',nullMask=5,seed=31415}={}){
  const catMask=example==='flipD1'?2:0;
  const catCycles=findCycles(catMask);
  let nullMap, nullLabel;
  if(nullType==='matched'){
    nullMap=Array.from({length:16},(_,i)=>deterministicNextIndex(i,nullMask));
    nullLabel=`matched polarity mask ${nullMask}`;
  }else{
    nullMap=randomPermutation(seed);
    nullLabel=`random 16-state permutation · seed ${seed}`;
  }
  const cat=summarize(catCycles), nullModel=summarize(cyclesFromMap(nullMap));
  const tolerance=1e-10;
  const catWave=cat.maxResidual<tolerance, nullWave=nullModel.maxResidual<tolerance;
  return {
    cat,null:nullModel,nullLabel,tolerance,catWave,nullWave,
    specificity: catWave && !nullWave ? 'candidate' : 'not-specific',
    conclusion: catWave && nullWave
      ? 'Both CAT and the non-conscious Markov control generate exact spacetime harmonic modes. In this finite periodic setting, the plane-wave form follows from Markov-cycle spectral mathematics and is not specific to conscious-agent semantics.'
      : catWave
        ? 'The CAT chain has exact harmonic modes while this selected control does not. This is only a candidate difference and must survive a broader matched-null ensemble.'
        : 'The selected CAT construction does not satisfy the exact harmonic-mode check under the current implementation.'
  };
}
