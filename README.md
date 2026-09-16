# Conscious Observers Lab

Interactive research sandbox for turning claims from Donald Hoffman's **Interface Theory of Perception (ITP)** and **Conscious Agent Theory (CAT)** into explicit computational models.

The project deliberately separates three questions:

1. **Fitness vs. truth:** when perception is a severe information bottleneck, does selection favor task-specific interfaces, world-structure-preserving representations, or hybrids?
2. **Observer-relative interfaces:** can two observers use different perceptual channels over the same modeled world while remaining similarly adaptive?
3. **Conscious Agent Theory:** what follows mathematically when an observer is modeled as a loop of Markov kernels for perception, decision, and action?

## Experiments

### 1. Fitness vs Truth

Three perceptual encoders compete under the same source ecology:

- **Fitness interface** — optimized only for current reward.
- **Truth model** — optimized to retain latent structure of the modeled world.
- **Hybrid model** — combines current reward with structural fidelity.

After evolution, the ecology changes. The perceptual encoder is frozen while only a small action readout is allowed to adapt. This tests whether the representation retained reusable world structure.

The experiment reports source reward, transfer reward, veridicality, and cross-seed variability.

### 2. Conscious Observer

This tab implements the mathematical skeleton used by Hoffman & Prakash for a conscious agent:

`W --P--> X --D--> G --A--> W'`

where:

- `W` = world states
- `X` = experience states
- `G` = action states
- `P(X|W)` = perceptual Markov kernel
- `D(G|X)` = decision Markov kernel
- `A(W'|G)` = action/world transition kernel

Two observers can have different perceptual kernels over the same modeled world. The lab measures:

- Jensen-Shannon divergence between observer interfaces
- adaptive reward difference
- experience-state agreement
- a mutual-information proxy for the perception channel

A useful pattern to look for is **high perceptual divergence with a low fitness gap**: distinct interfaces that support similarly successful behavior.

## Scientific boundary

This application is a **model-testing sandbox**, not evidence that a browser simulation is conscious. It can test mathematical and evolutionary consequences of particular assumptions. By itself it cannot establish that:

- consciousness is ontologically fundamental,
- physical reality is made of conscious agents,
- simulated agents have phenomenal experience,
- spacetime emerges from conscious agents.

Those stronger claims need distinctive predictions that connect CAT/ITP to independently measured physics, neuroscience, or behavior.

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

- evolve neural rather than discrete perceptual encoders
- sample hundreds of changing ecologies rather than a single transfer task
- estimate mutual information against separable latent causes
- add explicit representation complexity/energy costs
- implement directed and undirected joins of conscious agents
- compare predictions against alternative observer models
- pre-register hypotheses and acceptance criteria before large sweeps
