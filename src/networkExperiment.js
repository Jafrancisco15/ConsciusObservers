import { mulberry32, mean } from './experiments';

const EPS = 1e-12;

function softmax(xs, temperature = 1) {
  const m = Math.max(...xs);
  const e = xs.map((x) => Math.exp((x - m) / Math.max(temperature, 1e-6)));
  const z = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / z);
}

function sample(p, rng) {
  let u = rng();
  for (let i = 0; i < p.length; i++) {
    u -= p[i];
    if (u <= 0) return i;
  }
  return p.length - 1;
}

function entropy(counts) {
  const n = counts.reduce((a, b) => a + b, 0);
  if (!n) return 0;
  return counts.reduce((h, c) => {
    if (!c) return h;
    const p = c / n;
    return h - p * Math.log2(p);
  }, 0);
}

function entropyMap(map) {
  return entropy([...map.values()]);
}

function makeDecisionKernel(states, sharpness, phase) {
  return Array.from({ length: states }, (_, x) => {
    const theta = (2 * Math.PI * x) / states;
    return softmax(Array.from({ length: states }, (_, g) => {
      const phi = (2 * Math.PI * g) / states + phase;
      return sharpness * Math.cos(theta - phi);
    }));
  });
}

function neighborsOf(i, n, topology, directed) {
  if (n <= 1) return [];
  if (topology === 'complete') {
    return Array.from({ length: n }, (_, j) => j).filter((j) => j !== i);
  }
  if (topology === 'line') {
    if (directed) return i > 0 ? [i - 1] : [];
    return [i - 1, i + 1].filter((j) => j >= 0 && j < n);
  }
  // ring: incoming neighbor(s)
  if (directed) return [(i - 1 + n) % n];
  return [(i - 1 + n) % n, (i + 1) % n].filter((v, k, a) => a.indexOf(v) === k);
}

function circularMean(values, states) {
  if (!values.length) return 0;
  let sx = 0, sy = 0;
  values.forEach((v) => {
    const a = (2 * Math.PI * v) / states;
    sx += Math.cos(a); sy += Math.sin(a);
  });
  let a = Math.atan2(sy, sx);
  if (a < 0) a += 2 * Math.PI;
  return Math.round((a / (2 * Math.PI)) * states) % states;
}

function perceptionDistribution(signal, states, coupling, noise) {
  const theta = (2 * Math.PI * signal) / states;
  const uniform = 1 / states;
  const focused = softmax(Array.from({ length: states }, (_, x) => {
    const phi = (2 * Math.PI * x) / states;
    return (coupling / Math.max(noise, 0.03)) * Math.cos(theta - phi);
  }));
  return focused.map((p) => (1 - noise) * p + noise * uniform);
}

function pairMI(history, a, b, states) {
  const joint = Array.from({ length: states }, () => Array(states).fill(0));
  const ca = Array(states).fill(0), cb = Array(states).fill(0);
  history.forEach((row) => { joint[row[a]][row[b]]++; ca[row[a]]++; cb[row[b]]++; });
  const n = history.length;
  let mi = 0;
  for (let x = 0; x < states; x++) for (let y = 0; y < states; y++) {
    const c = joint[x][y];
    if (c) mi += (c / n) * Math.log2((c * n) / Math.max(ca[x] * cb[y], EPS));
  }
  return mi;
}

function detectRecurrence(keys, burnIn = 0) {
  const seen = new Map();
  let shortest = Infinity;
  let recurrences = 0;
  for (let t = burnIn; t < keys.length; t++) {
    const key = keys[t];
    if (seen.has(key)) {
      const d = t - seen.get(key);
      if (d > 0) shortest = Math.min(shortest, d);
      recurrences++;
    }
    seen.set(key, t);
  }
  return { period: Number.isFinite(shortest) ? shortest : null, recurrenceRate: recurrences / Math.max(1, keys.length - burnIn) };
}

/**
 * Computational sandbox inspired by Hoffman & Prakash (2014).
 * In strictCompatibility mode, perception is driven directly by neighbors' action
 * symbols, approximating the compatibility condition A_i = P_j for joined agents.
 * Metrics describe stochastic dynamics only; they are not measures of phenomenal consciousness.
 */
export function runNetworkExperiment({
  seed = 41,
  agents = 2,
  states = 4,
  steps = 1800,
  topology = 'ring',
  directed = false,
  coupling = 2.4,
  noise = 0.12,
  sharpness = 3.0,
  strictCompatibility = true,
}) {
  const rng = mulberry32(seed);
  const D = Array.from({ length: agents }, (_, i) => makeDecisionKernel(states, sharpness, i * 0.17));
  let x = Array.from({ length: agents }, () => Math.floor(rng() * states));
  let g = x.map((v, i) => sample(D[i][v], rng));
  const xHistory = [], gHistory = [], keys = [];
  let syncTotal = 0;

  for (let t = 0; t < steps; t++) {
    const nextX = Array(agents).fill(0);
    for (let i = 0; i < agents; i++) {
      const incoming = neighborsOf(i, agents, topology, directed).map((j) => g[j]);
      const signal = incoming.length ? circularMean(incoming, states) : g[i];
      const p = strictCompatibility
        ? perceptionDistribution(signal, states, coupling, noise)
        : perceptionDistribution((signal + i) % states, states, coupling * 0.75, Math.min(0.9, noise + 0.12));
      nextX[i] = sample(p, rng);
    }
    const nextG = nextX.map((v, i) => sample(D[i][v], rng));
    x = nextX; g = nextG;
    xHistory.push(x.slice()); gHistory.push(g.slice());
    keys.push(`${x.join(',')}|${g.join(',')}`);
    const modal = x.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {});
    syncTotal += Math.max(...Object.values(modal)) / agents;
  }

  const burn = Math.floor(steps * 0.25);
  const post = xHistory.slice(burn);
  const joint = new Map();
  post.forEach((row) => joint.set(row.join(','), (joint.get(row.join(',')) || 0) + 1));
  const marginalH = [];
  for (let i = 0; i < agents; i++) {
    const c = Array(states).fill(0); post.forEach((r) => c[r[i]]++); marginalH.push(entropy(c));
  }
  const jointH = entropyMap(joint);
  const totalCorrelation = Math.max(0, marginalH.reduce((a, b) => a + b, 0) - jointH);
  const maxTC = Math.max(EPS, (agents - 1) * Math.log2(states));

  const pairMIs = [];
  for (let i = 0; i < agents; i++) for (let j = i + 1; j < agents; j++) pairMIs.push(pairMI(post, i, j, states));
  const recurrence = detectRecurrence(keys, burn);

  // One-step predictability of the collective state: I(S_t ; S_{t+1}).
  const current = new Map(), next = new Map(), transitions = new Map();
  for (let t = burn; t < xHistory.length - 1; t++) {
    const a = xHistory[t].join(','), b = xHistory[t + 1].join(','), k = `${a}>${b}`;
    current.set(a, (current.get(a) || 0) + 1); next.set(b, (next.get(b) || 0) + 1); transitions.set(k, (transitions.get(k) || 0) + 1);
  }
  const nTrans = Math.max(1, xHistory.length - 1 - burn);
  let predictiveMI = 0;
  transitions.forEach((c, k) => {
    const [a, b] = k.split('>');
    predictiveMI += (c / nTrans) * Math.log2((c * nTrans) / Math.max((current.get(a) || 0) * (next.get(b) || 0), EPS));
  });

  return {
    D,
    xHistory,
    gHistory,
    metrics: {
      synchronization: syncTotal / steps,
      meanPairMI: pairMIs.length ? mean(pairMIs) : 0,
      totalCorrelation,
      normalizedIntegration: Math.min(1, totalCorrelation / maxTC),
      jointEntropy: jointH,
      visitedJointStates: joint.size,
      possibleJointStates: states ** agents,
      recurrenceRate: recurrence.recurrenceRate,
      detectedPeriod: recurrence.period,
      predictiveMI,
    },
    tail: xHistory.slice(-40),
  };
}
