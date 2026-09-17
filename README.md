# Conscious Observers Lab

Interactive research sandbox for turning claims from Donald Hoffman's **Interface Theory of Perception (ITP)** and **Conscious Agent Theory (CAT)** into explicit computational models and matched-null tests.

The app contains eight laboratories:

1. **Fitness vs Truth** — evolve compressed perceptual encoders and test transfer after an ecological shift.
2. **Conscious Observer** — compare observer-relative `P(X|W)` channels, reward and information.
3. **Conscious Realism** — couple multiple finite agents and measure synchronization, dependence, predictive information and recurrence.
4. **Hoffman vs OPH** — compare a fitness-oriented interface, an Observer Patch Holography-inspired consensus process, and an artificial observer with memory/self-calibration. This is a conceptual comparison, not a reproduction of the full OPH formalism.
5. **Exact Markov** — reproduce the published 16-state two-agent examples and compare their cycle structure with a tightly matched non-semantic Markov family.
6. **CAT Falsification** — compare proposed CAT signatures against strict and broad finite-state null ensembles.
7. **Physics Bridge** — construct spacetime-chain harmonic modes for CAT and controls side by side and ask whether plane-wave-like mathematics is CAT-specific.
8. **Massive Null Search** — stress-test CAT fingerprints against up to 100,000 Monte Carlo controls and an exact combinatorial census over all `16! = 20,922,789,888,000` permutation systems.

Every tab ends with a Spanish **plain-language result**. The first thing shown is a one-sentence interpretation; technical measurements are hidden under an optional “see the numbers” disclosure. Where useful, the panel adds an everyday analogy and a direct statement of what the experiment does and does not support.

## Core conscious-agent formalism

The observer laboratory uses the Hoffman–Prakash skeleton

`W --P--> X --D--> G --A--> W'`

where `P`, `D`, and `A` are Markov kernels. The network laboratories study coupled finite-state versions of these objects without assuming that simulated states possess phenomenal consciousness.

## Hoffman vs OPH experiment

The new comparison deliberately separates five concepts that are often collapsed into one another:

`observation → consensus → world model → self-model → consciousness ?`

The Hoffman-like condition maps latent environmental states into a compressed fitness-oriented interface. The OPH-like condition gives observers only partial noisy patches and lets local disagreement-repair produce a public state. The neural-observer condition adds memory and an explicit estimate of the observer's own predictive reliability.

The experiment reports latent-world alignment, inter-observer consensus, stability of the public state, interface utility, and self-model calibration. A stable public world can therefore emerge in the model without assigning phenomenal consciousness to the patches. Conversely, better self-calibration is treated as an additional functional capacity rather than evidence of subjective experience.

This module is inspired by the architectural idea of observer patches in FloatingPragma's **Observer Patch Holography** project: https://github.com/FloatingPragma/observer-patch-holography. It does **not** implement OPH's complete axioms, Lean formalization, continuum limits, or physical claims.

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

This is a model-testing sandbox. Statistical integration, recurrence, synchronization, information measures, eigenmodes, rarity, harmonic resemblance, consensus, self-calibration and world-model stability are not by themselves evidence of phenomenal consciousness. The scientific target is a distinctive quantitative prediction that survives appropriately matched alternatives and can ultimately be tested against independent physics, neuroscience or behavioral data.

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
- FloatingPragma. **Observer Patch Holography.** https://github.com/FloatingPragma/observer-patch-holography

## Next research milestones

- replace the OPH-like toy repair rule with a closer executable abstraction of explicit observer-patch axioms and compare both versions;
- add matched controls that achieve consensus without self-models and self-models without consensus;
- implement the published directed- and undirected-combination kernels explicitly;
- extend exact eigendecomposition to noisy stochastic kernels;
- search automatically for candidate CAT-specific invariants while correcting for multiple comparisons;
- build tighter nulls that preserve more of CAT's causal and information-theoretic constraints;
- connect surviving candidate invariants to independently measurable physical or neuroscientific observables;
- preregister hypotheses and acceptance criteria before large parameter sweeps.
