# Conscious Observers Lab

Interactive research sandbox for turning claims about perception, observation, metacognition and consciousness into explicit computational models and matched-null tests.

The app contains eight laboratories:

1. **Fitness vs Truth** — evolve compressed perceptual encoders and test transfer after an ecological shift.
2. **Conscious Observer** — compare observer-relative `P(X|W)` channels, reward and information.
3. **Self-Observation** — translate “lower/higher consciousness” and Stoic assent into a second-order monitoring model with a tightly matched shuffled-monitor control.
4. **Conscious Realism** — couple multiple finite agents and measure synchronization, dependence, predictive information and recurrence.
5. **Exact Markov** — reproduce the published 16-state two-agent examples and compare their cycle structure with a tightly matched non-semantic Markov family.
6. **CAT Falsification** — compare proposed CAT signatures against strict and broad finite-state null ensembles.
7. **Physics Bridge** — construct spacetime-chain harmonic modes for CAT and controls side by side and ask whether plane-wave-like mathematics is CAT-specific.
8. **Massive Null Search** — stress-test CAT fingerprints against up to 100,000 Monte Carlo controls and an exact combinatorial census over all `16! = 20,922,789,888,000` permutation systems.

Every tab ends with a Spanish **plain-language result**. The first thing shown is a one-sentence interpretation; technical measurements are hidden under an optional “see the numbers” disclosure. Where useful, the panel adds an everyday analogy and a direct statement of what the experiment does and does not support.

## Core conscious-agent formalism

The observer laboratory uses the Hoffman–Prakash skeleton

`W --P--> X --D--> G --A--> W'`

where `P`, `D`, and `A` are Markov kernels. The network laboratories study coupled finite-state versions of these objects without assuming that simulated states possess phenomenal consciousness.

## Reflective self-observation model

The Self-Observation lab treats “lower” and “higher” consciousness as **functional regime labels**, not as established biological levels or direct measurements of phenomenal consciousness.

The computational skeleton is

`impression I_t → second-order monitor M_t → assent gate G_t → action A_t`.

The model compares three agents on the same trials:

- **Reactive** — acts from the first-order impression.
- **Matched shuffled-monitor control** — receives the same extra perspectives, the same bias-reduction transform and the same distribution of assent-gate probabilities, but those probabilities are reassigned across trials so they no longer track that trial’s own likely error.
- **Reflective** — uses a second-order estimate of whether its first impulse is likely to be wrong, then probabilistically pauses, withholds assent or revises the response.

The main quantities are:

- first-order accuracy;
- metacognitive skill for predicting errors in the initial impulse;
- confidence calibration;
- correction rate and overcorrection harm;
- deliberation and response-reversal rates;
- generic-regulation gain: `accuracy(matched control) - accuracy(reactive)`;
- introspection-targeting gain: `accuracy(reflective) - accuracy(matched control)`.

The last contrast is deliberately central: because the matched control has the same information, bias-reduction mechanism and pause-probability distribution, any remaining advantage depends on whether regulation is targeted to the system’s own estimated error. If the matched control equals the reflective model, the self-observation hypothesis adds no explanatory power in this task.

A **Reflective Regulation Index (RRI)** combines monitoring, correction, calibration, gate discrimination and perspective benefit for visualization. It is explicitly **not a consciousness score**.

The tab also includes a two-state Markov analogy,

`L ↔ H`,

whose transition probabilities depend on threat, ego salience, pause, self-observation and perspective breadth. Its stationary occupancy is a property of this toy model only; it is not a biological estimate.

### Philosophical and scientific interpretation

The philosophical inspiration combines:

- the School of Life / Alain de Botton distinction between reactive, self-protective “lower consciousness” and less ego-bound, perspective-taking “higher consciousness”;
- the Stoic distinction between an initial impression and assent, especially in Epictetus and Seneca;
- modern metacognition, where a system estimates uncertainty or performance in its own cognitive processes;
- higher-order approaches, where a first-order state can itself become the object of a second-order representation.

The popular “reptilian brain versus neocortex” language sometimes used in discussions of higher consciousness is treated here as metaphor, not as accepted neuroanatomical mechanism.

## Exact Markov replication

For binary `X₁, G₁, X₂, G₂`, the published two-agent state space is

`E = X₁ × G₁ × X₂ × G₂`, with `|E| = 2⁴ = 16`.

With identity kernels and the paper's compatibility wiring, the deterministic update is

`x₁' ← g₂, g₁' ← x₁, x₂' ← g₁, g₂' ← x₂`.

The regression test verifies the published cycles: Example 1 has periods `1, 1, 2, 4, 4, 4`; changing `D₁` to the bit-flip matrix yields two period-8 cycles. Reproducing these dynamics validates this implementation, not the ontology of conscious realism.

### Matched null

A strict null preserves the 16 states, four binary components, ring dependency `g₂→x₁→g₁→x₂→g₂`, deterministic one-bit edges and zero-noise conditional entropy while removing conscious-agent semantics. Enumerating all 16 identity/NOT edge polarities yields two fingerprints: eight systems produce `1-1-2-4-4-4` and eight produce `8-8`. Thus each published cycle-length fingerprint is shared by 50% of this tightly matched family.

## Physics Bridge

For a recurrent cycle of period `d`, the lab constructs Fourier modes

`f(δ) = exp(-i 2πkδ/d)`

and the spacetime function

`g(δ,n) = λ^(-n) f(δ)`.

The same harmonic construction is applied to CAT and non-semantic controls. In a finite permutation, every state belongs to a cycle and every cycle admits discrete Fourier eigenmodes, so harmonic/plane-wave-like form alone is generic within this null family.

## Massive Null Search

The broad null consists of all permutations of 16 states. Instead of trying to simulate trillions of systems, the app uses the exact cycle-type counting formula. For cycle lengths with multiplicities `m_d`, the probability of that cycle fingerprint under a uniformly random permutation is

`P = 1 / ∏(d^(m_d) m_d!)`.

For the two CAT reference examples this gives:

- `1-1-2-4-4-4`: exact broad-null probability `1/1536 ≈ 0.065104%`;
- `8-8`: exact broad-null probability `1/128 = 0.78125%`.

The same fingerprints occur in **50%** of the much tighter architecture-matched null. This contrast is scientifically important: a pattern can look rare against a very broad control yet be common once the alternative preserves the causal structure capable of generating it. The tab also runs a seeded Monte Carlo sample of 1,000–100,000 permutations as a numerical cross-check of the exact combinatorial result.

## Scientific boundary

This is a model-testing sandbox. Statistical integration, recurrence, synchronization, information measures, metacognitive regulation, eigenmodes, rarity and harmonic resemblance are not by themselves evidence of phenomenal consciousness. The scientific target is a distinctive quantitative prediction that survives appropriately matched alternatives and can ultimately be tested against independent neuroscience, behavioral or physical data.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Main references

- Hoffman, D. D. & Prakash, C. (2014). **Objects of consciousness.** *Frontiers in Psychology, 5*, 577. https://doi.org/10.3389/fpsyg.2014.00577
- Prentner, R. & Hoffman, D. D. (2024). **Interfacing consciousness.** *Frontiers in Psychology, 15*, 1429376. https://doi.org/10.3389/fpsyg.2024.1429376
- Seth, A. K. & Bayne, T. (2022). **Theories of consciousness.** *Nature Reviews Neuroscience, 23*, 439–452.
- Fleming, S. M. (2026). **Towards an integrative neuroscience of metacognition.** *Nature Reviews Neuroscience*.
- Stanford Encyclopedia of Philosophy: **Epictetus** and **Seneca**, sections on impressions and assent.
- The School of Life. **On Higher Consciousness**. Philosophical inspiration only; not treated as a neuroscientific theory.

## Next research milestones

- fit the self-observation parameters to behavioral confidence/error-correction datasets rather than hand-picked values;
- compare the reflective model with additional matched controls, including generic recurrent computation without self-model access;
- test whether metacognitive skill predicts correction across out-of-distribution contexts;
- preregister thresholds for a specific introspection advantage before parameter sweeps;
- implement the published directed- and undirected-combination CAT kernels explicitly;
- extend exact eigendecomposition to noisy stochastic kernels;
- search automatically for candidate CAT-specific invariants while correcting for multiple comparisons;
- build tighter nulls that preserve more of CAT's causal and information-theoretic constraints;
- connect surviving candidate invariants to independently measurable physical or neuroscientific observables.
