export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const mean = (arr) => arr.reduce((a, b) => a + b, 0) / Math.max(arr.length, 1);

export function std(arr) {
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
}

export function clamp(x, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, x));
}

function worldStates(grid = 12) {
  const out = [];
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      out.push({ x: i / (grid - 1), y: j / (grid - 1) });
    }
  }
  return out;
}

function sourceUtilities(w) {
  return [
    0.08 - 0.12 * w.x,
    2.5 * w.x - 1.25 * w.y - 0.62,
    1.15 * w.x + 0.55 * w.y - 0.72,
  ];
}

function shiftedUtilities(w, shift) {
  const danger = 1.25 + 2.0 * shift;
  const explorationCost = 0.55 + 1.15 * shift;
  return [
    0.1 - 0.05 * w.x,
    1.55 * w.x - danger * w.y - 0.2,
    0.75 * w.x - explorationCost * w.y - 0.2,
  ];
}

function reconstructTruth(encoder, states, symbols) {
  const sums = Array.from({ length: symbols }, () => ({ x: 0, y: 0, n: 0 }));
  encoder.forEach((z, i) => {
    sums[z].x += states[i].x;
    sums[z].y += states[i].y;
    sums[z].n += 1;
  });
  const global = {
    x: mean(states.map((s) => s.x)),
    y: mean(states.map((s) => s.y)),
  };
  const centroids = sums.map((s) =>
    s.n ? { x: s.x / s.n, y: s.y / s.n } : global,
  );
  const mse = mean(
    states.map((s, i) => {
      const c = centroids[encoder[i]];
      return ((s.x - c.x) ** 2 + (s.y - c.y) ** 2) / 2;
    }),
  );
  const baseline = mean(
    states.map((s) => ((s.x - global.x) ** 2 + (s.y - global.y) ** 2) / 2),
  );
  return clamp(1 - mse / Math.max(baseline, 1e-9), -1, 1);
}

function bestPolicyReward(encoder, states, symbols, utilityFn) {
  const bySymbol = Array.from({ length: symbols }, () => []);
  encoder.forEach((z, i) => bySymbol[z].push(i));
  let reward = 0;
  const policy = Array(symbols).fill(0);
  for (let z = 0; z < symbols; z++) {
    if (!bySymbol[z].length) continue;
    const avg = [0, 1, 2].map((a) =>
      mean(bySymbol[z].map((i) => utilityFn(states[i])[a])),
    );
    const action = avg.indexOf(Math.max(...avg));
    policy[z] = action;
    reward += bySymbol[z].reduce(
      (sum, i) => sum + utilityFn(states[i])[action],
      0,
    );
  }
  return { reward: reward / states.length, policy };
}

function initialEncoder(states, symbols, mode, rng) {
  if (mode === "truth") {
    const side = Math.ceil(Math.sqrt(symbols));
    return states.map((s) => {
      const xi = Math.min(side - 1, Math.floor(s.x * side));
      const yi = Math.min(side - 1, Math.floor(s.y * side));
      return (xi * side + yi) % symbols;
    });
  }
  const e = states.map((_, i) => i % symbols);
  for (let i = e.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [e[i], e[j]] = [e[j], e[i]];
  }
  return e;
}

function scoreEncoder(encoder, states, symbols, mode, truthWeight) {
  const fit = bestPolicyReward(encoder, states, symbols, sourceUtilities).reward;
  const truth = reconstructTruth(encoder, states, symbols);
  if (mode === "fitness") return fit;
  if (mode === "truth") return truth;
  return fit + truthWeight * truth;
}

function evolveEncoder({ seed, states, symbols, mode, truthWeight, steps }) {
  const rng = mulberry32(seed + (mode === "truth" ? 1000 : mode === "hybrid" ? 2000 : 0));
  let encoder = initialEncoder(states, symbols, mode, rng);
  let score = scoreEncoder(encoder, states, symbols, mode, truthWeight);
  for (let t = 0; t < steps; t++) {
    const frac = t / Math.max(1, steps - 1);
    const temperature = 0.06 * Math.pow(0.0007 / 0.06, frac);
    const candidate = encoder.slice();
    const i = Math.floor(rng() * candidate.length);
    const old = candidate[i];
    let next = old;
    while (next === old) next = Math.floor(rng() * symbols);
    candidate[i] = next;
    const counts = Array(symbols).fill(0);
    candidate.forEach((z) => (counts[z] += 1));
    if (counts.some((n) => n === 0)) continue;
    const newScore = scoreEncoder(candidate, states, symbols, mode, truthWeight);
    if (newScore >= score || rng() < Math.exp((newScore - score) / Math.max(temperature, 1e-9))) {
      encoder = candidate;
      score = newScore;
    }
  }
  return encoder;
}

export function runFitnessTruthExperiment({
  seed = 7,
  symbols = 4,
  shift = 0.8,
  truthWeight = 0.55,
  steps = 1800,
  replicates = 5,
}) {
  const states = worldStates(11);
  const regimes = ["fitness", "truth", "hybrid"];
  const rows = [];
  const sampleEncoders = {};

  regimes.forEach((mode) => {
    for (let r = 0; r < replicates; r++) {
      const encoder = evolveEncoder({
        seed: seed + r * 31,
        states,
        symbols,
        mode,
        truthWeight,
        steps,
      });
      const source = bestPolicyReward(encoder, states, symbols, sourceUtilities).reward;
      const transfer = bestPolicyReward(
        encoder,
        states,
        symbols,
        (w) => shiftedUtilities(w, shift),
      ).reward;
      const truth = reconstructTruth(encoder, states, symbols);
      rows.push({ mode, source, transfer, truth });
      if (r === 0) sampleEncoders[mode] = encoder;
    }
  });

  const summary = regimes.map((mode) => {
    const sub = rows.filter((x) => x.mode === mode);
    return {
      mode,
      source: mean(sub.map((x) => x.source)),
      sourceSd: std(sub.map((x) => x.source)),
      transfer: mean(sub.map((x) => x.transfer)),
      transferSd: std(sub.map((x) => x.transfer)),
      truth: mean(sub.map((x) => x.truth)),
      truthSd: std(sub.map((x) => x.truth)),
    };
  });

  return { summary, rows, states, sampleEncoders };
}

function normalizeRow(row) {
  const clipped = row.map((x) => Math.max(1e-12, x));
  const s = clipped.reduce((a, b) => a + b, 0);
  return clipped.map((x) => x / s);
}

function softmax(values, temperature = 1) {
  const maxV = Math.max(...values);
  const exp = values.map((v) => Math.exp((v - maxV) / Math.max(temperature, 1e-6)));
  const s = exp.reduce((a, b) => a + b, 0);
  return exp.map((x) => x / s);
}

function sampleCategorical(prob, rng) {
  const u = rng();
  let c = 0;
  for (let i = 0; i < prob.length; i++) {
    c += prob[i];
    if (u <= c) return i;
  }
  return prob.length - 1;
}

function jsDivergence(p, q) {
  const m = p.map((x, i) => (x + q[i]) / 2);
  const kl = (a, b) =>
    a.reduce((s, x, i) => s + (x > 0 ? x * Math.log2(x / Math.max(b[i], 1e-12)) : 0), 0);
  return (kl(p, m) + kl(q, m)) / 2;
}

function makePerceptionKernel({ worldN, experienceN, bias, noise, phase }) {
  const P = [];
  for (let w = 0; w < worldN; w++) {
    const theta = (2 * Math.PI * w) / worldN;
    const scores = [];
    for (let x = 0; x < experienceN; x++) {
      const phi = (2 * Math.PI * x) / experienceN + phase;
      const alignment = Math.cos(theta - phi);
      const interfaceWarp = bias * Math.cos(2 * theta + phi * 0.7);
      scores.push((alignment + interfaceWarp) / Math.max(noise, 0.08));
    }
    P.push(softmax(scores));
  }
  return P;
}

function makeDecisionKernel({ experienceN, actionN, decisiveness, phase }) {
  return Array.from({ length: experienceN }, (_, x) => {
    const scores = Array.from({ length: actionN }, (_, g) => {
      const tx = (2 * Math.PI * x) / experienceN;
      const tg = (2 * Math.PI * g) / actionN + phase;
      return Math.cos(tx - tg) * decisiveness;
    });
    return softmax(scores, 0.8);
  });
}

function transitionWorld(w, action, worldN, actionN) {
  const direction = action < actionN / 2 ? 1 : -1;
  const stride = 1 + (action % Math.max(1, Math.floor(actionN / 2)));
  return (w + direction * stride + worldN) % worldN;
}

function rewardForWorldAction(w, g, worldN, actionN) {
  const target = Math.floor((w / worldN) * actionN) % actionN;
  const d = Math.min((g - target + actionN) % actionN, (target - g + actionN) % actionN);
  return 1 - d / Math.max(1, actionN / 2);
}

export function runObserverExperiment({
  seed = 17,
  worldN = 12,
  experienceN = 6,
  actionN = 4,
  biasA = 0.25,
  biasB = 0.8,
  noise = 0.28,
  decisiveness = 2.2,
  steps = 500,
}) {
  const rngA = mulberry32(seed);
  const rngB = mulberry32(seed + 999);
  const P1 = makePerceptionKernel({ worldN, experienceN, bias: biasA, noise, phase: 0 });
  const P2 = makePerceptionKernel({ worldN, experienceN, bias: biasB, noise, phase: Math.PI / 5 });
  const D1 = makeDecisionKernel({ experienceN, actionN, decisiveness, phase: 0 });
  const D2 = makeDecisionKernel({ experienceN, actionN, decisiveness, phase: Math.PI / 8 });

  let w1 = 0;
  let w2 = Math.floor(worldN / 3);
  let rewardA = 0;
  let rewardB = 0;
  let agreement = 0;
  const trajectory = [];

  for (let t = 0; t < steps; t++) {
    const x1 = sampleCategorical(P1[w1], rngA);
    const x2 = sampleCategorical(P2[w2], rngB);
    const g1 = sampleCategorical(D1[x1], rngA);
    const g2 = sampleCategorical(D2[x2], rngB);
    rewardA += rewardForWorldAction(w1, g1, worldN, actionN);
    rewardB += rewardForWorldAction(w2, g2, worldN, actionN);
    if (x1 === x2) agreement += 1;
    trajectory.push({ t, w1, x1, g1, w2, x2, g2 });
    w1 = transitionWorld(w1, g1, worldN, actionN);
    w2 = transitionWorld(w2, g2, worldN, actionN);
  }

  const divergence = mean(P1.map((p, w) => jsDivergence(p, P2[w])));
  const channelCapacityProxy = (P) => {
    const avg = Array(experienceN).fill(0);
    P.forEach((row) => row.forEach((v, i) => (avg[i] += v / worldN)));
    let mi = 0;
    P.forEach((row) => {
      row.forEach((v, i) => {
        if (v > 0) mi += (1 / worldN) * v * Math.log2(v / Math.max(avg[i], 1e-12));
      });
    });
    return mi;
  };

  return {
    P1,
    P2,
    D1,
    D2,
    trajectory,
    metrics: {
      observerDivergence: divergence,
      rewardA: rewardA / steps,
      rewardB: rewardB / steps,
      experienceAgreement: agreement / steps,
      informationA: channelCapacityProxy(P1),
      informationB: channelCapacityProxy(P2),
    },
  };
}

export function makeHeatmapCells(matrix) {
  const flat = matrix.flat();
  const max = Math.max(...flat);
  const min = Math.min(...flat);
  return matrix.map((row) =>
    row.map((value) => ({
      value,
      norm: (value - min) / Math.max(max - min, 1e-9),
    })),
  );
}
