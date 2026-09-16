# Conscious Observers Lab

Interactive research sandbox for turning claims from Donald Hoffman's **Interface Theory of Perception (ITP)** and **Conscious Agent Theory (CAT)** into explicit computational models.

The project now separates four experimental questions:

1. **Fitness vs. truth:** does selection favor task-specific interfaces, world-structure-preserving representations, or hybrids?
2. **Observer-relative interfaces:** can different perceptual channels over the same modeled world remain similarly adaptive?
3. **Conscious realism / combination:** what dynamics appear when agents become part of one another's modeled world through directed or undirected joins?
4. **Exact Markov test:** can the published 16-state two-agent dynamics be reproduced exactly, and are its asymptotic signatures distinctive relative to a structurally matched non-semantic Markov null?

## 1. Fitness vs Truth

Three perceptual encoders compete under the same source ecology: fitness-only, truth-preserving, and hybrid. After evolution the ecology changes, the perceptual encoder is frozen, and only the action readout adapts. The lab reports source reward, transfer reward, veridicality, and cross-seed variability.

## 2. Conscious Observer

Implements the Hoffman–Prakash conscious-agent skeleton:

`W --P--> X --D--> G --A--> W'`

`P`, `D`, and `A` are Markov kernels. Two observers can have different perceptual kernels over the same modeled world. The lab measures Jensen–Shannon divergence, adaptive reward difference, experience agreement, and information carried by the W→X channel.

## 3. Conscious Realism

The network laboratory removes the single shared external-world picture and lets other modeled agents supply the signals driving an agent's perceptual channel. It supports 2–6 agents, ring/line/complete topologies, directed or undirected joins, channel noise, coupling strength, decision sharpness, and a compatibility mode approximating the join condition `A_i ≈ P_j`.

It measures synchronization, pairwise mutual information, total correlation, collective predictive information, empirical recurrence, and visited versus possible collective states. The displayed normalized dependence score is **not IIT Φ** and is not presented as a consciousness measure.

## 4. Exact Markov Dynamics

This tab reconstructs the finite-state dynamics in Hoffman & Prakash (2014), section **Dynamics of two conscious agents**. For binary `X₁, G₁, X₂, G₂`, the state space is

`E = X₁ × G₁ × X₂ × G₂`, so `|E| = 2⁴ = 16`.

With identity kernels and the paper's compatibility wiring, the deterministic update is

`x₁' ← g₂, g₁' ← x₁, x₂' ← g₁, g₂' ← x₂`.

The regression suite verifies the exact cycles reported in the paper:

- Example 1: periods `1, 1, 2, 4, 4, 4`;
- Example 2, after changing `D₁` to the bit-flip matrix: two period-8 cycles.

The lab constructs the full 16×16 transition matrix. An optional independent bit-noise parameter extends the published deterministic examples into stochastic robustness tests. It reports stationary state entropy, entropy rate, predictive information, recurrent classes, and the exact noiseless permutation eigenmodes. For a cycle of period `d`, the eigenvalues are the `d` roots of unity and the corresponding eigenvectors have phase support around that recurrent cycle.

### Matched null model

The null deliberately preserves the finite-state computational structure while removing conscious-agent semantics. It keeps:

- the same 16 states;
- the same four binary components;
- the same ring dependency graph `g₂→x₁→g₁→x₂→g₂`;
- one deterministic input and output per component;
- one-bit capacity on every edge;
- deterministic conditional entropy at zero noise.

The null ensemble enumerates all 16 possible identity/NOT polarities on those four edges. This is a stringent comparison: if CAT's cycle structure is common in this matched family, periodicity or recurrence cannot by itself discriminate conscious-agent dynamics from an ordinary coupled Markov network.

For this exact binary ring, the 16 matched nulls split into only two cycle-length fingerprints: eight produce `1-1-2-4-4-4`, and eight produce `8-8`. Thus each of the two published Hoffman examples has a cycle-length fingerprint shared by **50%** of this tightly matched null family. This is a computational result of the implemented finite model, not a claim about consciousness itself.

## Scientific boundary

This application is a model-testing sandbox. Reproducing the published Markov examples validates the implementation of those examples, not the ontological claim that their states are conscious. Likewise, integration, recurrence, synchronization, eigenmodes, or information measures are not by themselves evidence of phenomenal consciousness.

A stronger CAT test requires a distinctive quantitative prediction that is not inherited automatically from the underlying Markov architecture and that can ultimately be connected to independently measured physics, neuroscience, or behavior.

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

- implement the published directed- and undirected-combination kernels explicitly rather than only their coupled dynamics;
- extend exact eigendecomposition to noisy stochastic kernels;
- add graph/SCC visualization of the 16-state transition system;
- test broader matched null families while controlling state count, topology, channel capacity and entropy;
- identify candidate CAT-specific invariants and attempt to falsify them against those nulls;
- connect asymptotic modes to the paper's space-time-chain/harmonic-function construction without assuming the physical interpretation;
- pre-register hypotheses and acceptance criteria before large parameter sweeps.
