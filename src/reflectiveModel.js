export function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random) {
  let u = 0;
  let v = 0;
  while (u === 0) u = random();
  while (v === 0) v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function binaryAction(score) {
  return score >= 0 ? 1 : -1;
}

function accuracy(rows, key) {
  return mean(rows.map((row) => (row[key] === row.truth ? 1 : 0)));
}

function brier(values, outcomes) {
  return mean(values.map((value, index) => (value - outcomes[index]) ** 2));
}

export function simulateReflectiveExperiment(input = {}) {
  const params = {
    threat: clamp(input.threat ?? 0.65),
    egoSalience: clamp(input.egoSalience ?? 0.7),
    selfObservation: clamp(input.selfObservation ?? 0.65),
    pause: clamp(input.pause ?? 0.55),
    perspectiveBreadth: Math.max(1, Math.min(7, Math.round(input.perspectiveBreadth ?? 4))),
    noise: Math.max(0.15, Math.min(2, input.noise ?? 0.85)),
    trials: Math.max(250, Math.min(6000, Math.round(input.trials ?? 1800))),
    seed: Math.round(input.seed ?? 20260919),
  };

  const random = mulberry32(params.seed);
  const rows = [];

  for (let i = 0; i < params.trials; i += 1) {
    const truth = random() < 0.5 ? -1 : 1;
    const baseEvidence = truth + normal(random) * params.noise;
    const distractor = random() < 0.5 ? -1 : 1;
    const emotionalBias =
      distractor * params.threat * params.egoSalience * 1.7 +
      normal(random) * 0.12 * params.threat;

    const impulseScore = baseEvidence + emotionalBias;
    const impulse = binaryAction(impulseScore);
    const impulseConfidence =
      0.5 + 0.5 * sigmoid(Math.abs(impulseScore) - 0.65 + 0.55 * params.threat);

    let perspectiveSum = baseEvidence;
    for (let k = 1; k < params.perspectiveBreadth; k += 1) {
      perspectiveSum += truth + normal(random) * params.noise;
    }
    const perspectiveEvidence = perspectiveSum / params.perspectiveBreadth;

    // Equal-compute control: it gets the same extra samples, but no representation
    // of its own initial impulse/confidence and no assent gate.
    const matchedScore = perspectiveEvidence + emotionalBias;
    const matched = binaryAction(matchedScore);

    // Second-order observer: estimates whether the first-order impulse is unreliable.
    const conflict = -impulse * perspectiveEvidence;
    const uncertainty = Math.exp(-Math.abs(perspectiveEvidence));
    const predictedImpulseError = sigmoid(
      -1.15 +
        2.65 * params.selfObservation * conflict +
        1.2 * params.selfObservation * uncertainty +
        0.65 * params.threat * params.egoSalience,
    );

    // Stoic-inspired assent gate: the first impression is not automatically action.
    const gateProbability = sigmoid(
      -1.75 +
        3.1 * params.pause +
        2.4 * params.selfObservation +
        0.45 * Math.log1p(params.perspectiveBreadth) +
        2.2 * (predictedImpulseError - 0.5) -
        2.15 * params.threat * params.egoSalience,
    );
    const deliberated = random() < gateProbability;

    // Observation reduces the weight of self-protective bias instead of adding
    // privileged information about the hidden truth.
    const residualBias = emotionalBias * (1 - 0.82 * params.selfObservation);
    const reflectiveScore = deliberated
      ? perspectiveEvidence + residualBias
      : impulseScore;
    const reflective = binaryAction(reflectiveScore);
    const reflectiveConfidence = deliberated
      ? 0.5 + 0.5 * sigmoid(Math.abs(reflectiveScore) - 0.6)
      : impulseConfidence;

    rows.push({
      truth,
      impulse,
      matched,
      reflective,
      impulseConfidence,
      reflectiveConfidence,
      predictedImpulseError,
      gateProbability,
      deliberated,
    });
  }

  const reactiveAccuracy = accuracy(rows, 'impulse');
  const matchedAccuracy = accuracy(rows, 'matched');
  const reflectiveAccuracy = accuracy(rows, 'reflective');

  const impulseErrors = rows.map((row) => (row.impulse === row.truth ? 0 : 1));
  const metaPredictions = rows.map((row) => row.predictedImpulseError);
  const errorBaseRate = mean(impulseErrors);
  const metaBrier = brier(metaPredictions, impulseErrors);
  const nullBrier = brier(rows.map(() => errorBaseRate), impulseErrors);
  const metaSkill = nullBrier > 1e-9 ? clamp(1 - metaBrier / nullBrier, -1, 1) : 0;

  const reactiveCorrect = rows.map((row) => (row.impulse === row.truth ? 1 : 0));
  const reflectiveCorrect = rows.map((row) => (row.reflective === row.truth ? 1 : 0));
  const reactiveCalibration = clamp(
    1 - brier(rows.map((row) => row.impulseConfidence), reactiveCorrect) / 0.25,
  );
  const reflectiveCalibration = clamp(
    1 - brier(rows.map((row) => row.reflectiveConfidence), reflectiveCorrect) / 0.25,
  );

  const wrongImpulseRows = rows.filter((row) => row.impulse !== row.truth);
  const rightImpulseRows = rows.filter((row) => row.impulse === row.truth);
  const correctionRate = wrongImpulseRows.length
    ? mean(wrongImpulseRows.map((row) => (row.reflective === row.truth ? 1 : 0)))
    : 0;
  const harmRate = rightImpulseRows.length
    ? mean(rightImpulseRows.map((row) => (row.reflective !== row.truth ? 1 : 0)))
    : 0;

  const gateWrong = wrongImpulseRows.length
    ? mean(wrongImpulseRows.map((row) => row.gateProbability))
    : 0;
  const gateRight = rightImpulseRows.length
    ? mean(rightImpulseRows.map((row) => row.gateProbability))
    : 0;
  const gateDiscrimination = clamp(0.5 + (gateWrong - gateRight));

  const deliberationRate = mean(rows.map((row) => (row.deliberated ? 1 : 0)));
  const reversalRate = mean(rows.map((row) => (row.reflective !== row.impulse ? 1 : 0)));
  const perspectiveGain = matchedAccuracy - reactiveAccuracy;
  const introspectionGain = reflectiveAccuracy - matchedAccuracy;
  const correctionNet = clamp(correctionRate - harmRate);

  // This is deliberately named Reflective Regulation Index, not a consciousness score.
  // It aggregates functional observables and makes no phenomenal claim.
  const reflectiveRegulationIndex = clamp(
    0.3 * clamp((metaSkill + 1) / 2) +
      0.25 * correctionNet +
      0.2 * reflectiveCalibration +
      0.15 * gateDiscrimination +
      0.1 * clamp(0.5 + perspectiveGain * 2),
  );

  // Two-state Markov analogy for state occupancy. These transitions are hypotheses,
  // not biological estimates.
  const pLowToHigh = sigmoid(
    -2 +
      2.7 * params.pause +
      2.2 * params.selfObservation +
      0.45 * Math.log1p(params.perspectiveBreadth) -
      2.35 * params.threat * params.egoSalience,
  );
  const pHighToLow = sigmoid(
    -2.25 +
      3 * params.threat * params.egoSalience -
      1.45 * params.pause -
      0.85 * params.selfObservation,
  );
  const stationaryHigh =
    pLowToHigh + pHighToLow > 0 ? pLowToHigh / (pLowToHigh + pHighToLow) : 0.5;

  return {
    params,
    metrics: {
      reactiveAccuracy,
      matchedAccuracy,
      reflectiveAccuracy,
      metaSkill,
      reactiveCalibration,
      reflectiveCalibration,
      correctionRate,
      harmRate,
      deliberationRate,
      reversalRate,
      gateDiscrimination,
      perspectiveGain,
      introspectionGain,
      reflectiveRegulationIndex,
      pLowToHigh,
      pHighToLow,
      stationaryHigh,
    },
  };
}

export function interpretReflectiveResult(metrics) {
  const rri = metrics.reflectiveRegulationIndex;
  const matchedDelta = metrics.introspectionGain;
  const regime =
    rri >= 0.68
      ? 'reflective'
      : rri <= 0.45
        ? 'reactive'
        : 'mixed';

  let summary;
  if (matchedDelta > 0.015) {
    summary =
      'La autoobservación aporta una mejora funcional incluso frente a un control con el mismo presupuesto de cómputo.';
  } else if (matchedDelta < -0.015) {
    summary =
      'En esta configuración, autoobservarse no mejora el rendimiento frente al control de igual cómputo y puede introducir costo de deliberación.';
  } else {
    summary =
      'La mayor parte de la mejora se explica por procesar más perspectivas, no por la autoobservación en sí.';
  }

  return {
    regime,
    summary,
    caution:
      'El índice mide regulación reflexiva en este modelo. No mide experiencia subjetiva, qualia ni demuestra que un sistema sea consciente.',
  };
}
