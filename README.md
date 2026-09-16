# Conscious Observers Lab

Interactive research sandbox for turning claims from Donald Hoffman's **Interface Theory of Perception (ITP)** and **Conscious Agent Theory (CAT)** into explicit computational models.

The project separates three experimental questions:

1. **Fitness vs. truth:** does selection favor task-specific interfaces, world-structure-preserving representations, or hybrids?
2. **Observer-relative interfaces:** can different perceptual channels over the same modeled world remain similarly adaptive?
3. **Conscious realism / combination:** what dynamics appear when agents become part of one another's modeled world through directed or undirected joins?

## 1. Fitness vs Truth

Three perceptual encoders compete under the same source ecology: fitness-only, truth-preserving, and hybrid. After evolution the ecology changes, the perceptual encoder is frozen, and only the action readout adapts. The lab reports source reward, transfer reward, veridicality, and cross-seed variability.

## 2. Conscious Observer

Implements the Hoffman–Prakash conscious-agent skeleton:

`W --P--> X --D--> G --A--> W'`

`P`, `D`, and `A` are Markov kernels. Two observers can have different perceptual kernels over the same modeled world. The lab measures Jensen–Shannon divergence, adaptive reward difference, experience agreement, and information carried by the W→X channel.

## 3. Conscious Realism

The network laboratory removes the single shared external-world picture and lets other modeled agents supply the signals driving an agent's perceptual channel. It supports 2–6 agents, ring/line/complete topologies, directed or undirected joins, channel noise, coupling strength, decision sharpness, and a compatibility mode approximating the join condition `A_i ≈ P_j`.

It measures:

- synchronization of experience states,
- mean pairwise mutual information,
- **total correlation** of the collective state as a non-factorizability measure,
- one-step collective predictive information `I(S_t ; S_{t+1})`,
- empirical recurrence and shortest observed recurrence distance,
- visited versus possible joint experience states.

The displayed normalized dependence score is **not IIT Φ** and is not presented as a consciousness measure. It quantifies statistical dependence only.

### Relation to Hoffman & Prakash (2014)

Their formalism allows conscious agents to be joined in directed and undirected graphs and gives constructive combination theorems. The present simulation explores consequences of coupled finite-state stochastic agents. A conventional Markov network can also synchronize, recur, and develop mutual information, so these outcomes alone do **not** discriminate conscious realism from ordinary stochastic dynamics.

## Scientific boundary

This application is a model-testing sandbox. It can test mathematical consequences of explicit assumptions, but by itself cannot establish that consciousness is ontologically fundamental, that physical reality is made of conscious agents, that simulated agents have phenomenal experience, or that spacetime emerges from conscious agents.

A scientifically stronger test needs a distinctive quantitative prediction derived from CAT/ITP that differs from an appropriate physical or computational null model and can be compared with independently measured data.

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

- construct the exact finite transition matrix for the two-agent join and calculate recurrent classes, absorbing sets, periods, stationary distributions, and eigenspectrum rather than inferring them only from trajectories;
- reproduce the 2-state asymptotic examples reported by Hoffman & Prakash as regression tests;
- implement explicit directed- and undirected-combination kernels from the published constructions;
- compare each CAT network against matched generic coupled-Markov null models;
- test whether any proposed CAT-specific statistic survives that null comparison;
- evolve neural perceptual encoders across many changing ecologies;
- pre-register hypotheses and acceptance criteria before large parameter sweeps.
