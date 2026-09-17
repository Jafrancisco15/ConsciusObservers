# Conscious Observers Lab

Interactive research sandbox for turning claims from Donald Hoffman's **Interface Theory of Perception (ITP)** and **Conscious Agent Theory (CAT)** into explicit computational models and matched-null tests.

The app contains six laboratories:

1. **Fitness vs Truth** — evolve compressed perceptual encoders and test transfer after an ecological shift.
2. **Conscious Observer** — compare observer-relative `P(X|W)` channels, reward and information.
3. **Conscious Realism** — couple multiple finite agents and measure synchronization, dependence, predictive information and recurrence.
4. **Exact Markov** — reproduce the published 16-state two-agent examples and compare their cycle structure with a tightly matched non-semantic Markov family.
5. **CAT Falsification** — compare proposed CAT signatures against strict and broad finite-state null ensembles.
6. **Physics Bridge** — construct spacetime-chain harmonic modes for CAT and controls side by side and ask whether plane-wave-like mathematics is actually CAT-specific.

Every tab ends with a **plain-language results panel in Spanish** that explains the current numerical result, highlights the most important measurements, and states what the experiment does *not* establish.

## Core conscious-agent formalism

The observer laboratory uses the Hoffman–Prakash skeleton

`W --P--> X --D--> G --A--> W'`

where `P`, `D`, and `A` are Markov kernels. The network laboratories study coupled finite-state versions of these objects without assuming that simulated states possess phenomenal consciousness.

## Exact Markov replication

For binary `X₁, G₁, X₂, G₂`, the published two-agent state space is

`E = X₁ × G₁ × X₂ × G₂`, with `|E| = 2⁴ = 16`.

With identity kernels and the paper's compatibility wiring, the deterministic update is

`x₁' ← g₂, g₁' ← x₁, x₂' ← g₁, g₂' ← x₂`.

The regression test verifies the exact published cycles: Example 1 has periods `1, 1, 2, 4, 4, 4`; changing `D₁` to the bit-flip matrix yields two period-8 cycles. Reproducing these dynamics validates this implementation, not the ontology of conscious realism.

### Matched null

A strict null preserves the 16 states, four binary components, ring dependency `g₂→x₁→g₁→x₂→g₂`, deterministic one-bit edges and zero-noise conditional entropy while removing conscious-agent semantics. Enumerating all 16 identity/NOT edge polarities yields two fingerprints: eight systems produce `1-1-2-4-4-4` and eight produce `8-8`. Thus each published cycle-length fingerprint is shared by 50% of this tightly matched family.

The CAT Falsification tab adds a broad permutation null and reports where CAT statistics fall relative to the null distribution. These are exploratory computational comparisons; small tail rates are candidate signals requiring stronger controls and preregistration, not confirmations of CAT.

## Physics Bridge

Hoffman & Prakash (2014) connect eigenfunctions of the agent Markov kernel to harmonic functions of an associated spacetime chain and note that these harmonic functions can take the same mathematical form as a free-particle wave function. The Physics Bridge applies the same construction to CAT and non-semantic controls.

For a recurrent cycle of period `d`, the lab constructs Fourier modes

`f(δ) = exp(-i 2πkδ/d)`

and the spacetime function

`g(δ,n) = λ^(-n) f(δ)`.

It then checks the harmonic identity numerically on both sides. If matched ordinary Markov chains generate the same exact harmonic structure, wave-like form alone is not a CAT-specific discriminator. A stronger bridge to physics would need an additional CAT-derived restriction that survives null comparison and predicts independent observations.

## Scientific boundary

This is a model-testing sandbox. Statistical integration, recurrence, synchronization, information measures, eigenmodes and harmonic resemblance are not by themselves evidence of phenomenal consciousness. The scientific target is a distinctive quantitative prediction that is not inherited automatically from generic Markov structure and can ultimately be tested against independent physics, neuroscience or behavioral data.

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

## Next research milestones

- implement the published directed- and undirected-combination kernels explicitly;
- extend exact eigendecomposition to noisy stochastic kernels;
- compare the Physics Bridge over large matched ensembles rather than one control at a time;
- search for CAT-specific invariants while correcting for multiple comparisons;
- connect candidate invariants to independently measurable physical or neuroscientific observables;
- preregister hypotheses and acceptance criteria before large parameter sweeps.
