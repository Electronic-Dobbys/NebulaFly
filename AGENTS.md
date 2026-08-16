# AGENTS.md — ThreeJS-NebulaFly Next

## Mission

Build the best practical system for transforming a 2D astronomical image into an immersive, navigable and recordable 3D experience.

## Golden Rule

Do not deform the photograph to simulate 3D.

Analyze the photograph and construct a new 3D scene from it.

## Repository Boundaries

### READ ONLY

```text
/original
```

Never modify, delete, reformat or migrate the original project.

You may execute it and inspect it as a baseline.

### Development Area

All new implementation goes inside:

```text
/nebula-next
```

Supporting research, reports and decisions may be written to:

```text
/docs
/reports
```

## Autonomous Workflow

For each meaningful milestone:

```text
RESEARCH
→ HYPOTHESIS
→ PROTOTYPE
→ IMPLEMENT
→ RUN
→ TEST
→ CAPTURE
→ MEASURE
→ CRITIQUE
→ IMPROVE
→ REGRESSION TEST
```

Do not stop after documentation or after code merely compiles.

## Decision Policy

For reversible technical decisions:

**DO NOT ASK THE USER.**

Investigate, prototype, benchmark and decide.

Ask only when necessary for:

- irreversible or destructive operations;
- secrets or credentials;
- product decisions that cannot be inferred;
- actions outside the repository that create material external effects.

## Allowed Technical Freedom

You may use or evaluate:

- JavaScript;
- TypeScript;
- Three.js;
- WebGL2;
- WebGPU;
- GLSL;
- WGSL;
- Web Workers;
- OffscreenCanvas;
- WebAssembly;
- Python;
- OpenCV;
- ONNX Runtime;
- TensorFlow.js;
- custom image-processing algorithms;
- ray marching;
- volumetric rendering;
- signed distance fields;
- point clouds;
- Gaussian splatting;
- sparse voxel fields;
- procedural noise;
- FBM;
- domain warping;
- curl noise;
- plate solving;
- astronomical catalogues.

Do not choose technology for novelty. Measure quality, performance, maintainability, browser compatibility and complexity.

## Do Not Reintroduce

Reject solutions that produce:

- stacked image planes;
- rectangular image walls;
- duplicated stars;
- stars embedded in the background and recreated in 3D simultaneously;
- black stellar cores;
- artificial green stars caused by chromatic noise;
- obvious extruded SVG prisms;
- visible polygon triangulation;
- rigid crystal-like nebulae;
- stale resources from a previous input image;
- a simple `depth = luminance` model as the only depth logic;
- obvious side-view collapse;
- unusable inside-the-volume navigation.

## Object-Specific Reconstruction

Do not assume one universal reconstruction algorithm is optimal.

Support specialized pipelines or reconstructors for at least:

- nebula;
- galaxy;
- star field / cluster;
- comet;
- planet;
- stellar object.

Provide an `AUTO` classifier/pipeline selector when practical.

## Scientific Honesty

A single 2D image does not uniquely encode physical 3D structure.

Separate:

- artistic/inferred reconstruction;
- astronomy-informed reconstruction using catalogues, plate solving or known object models.

Never present heuristic depth as measured astronomical distance.

## Diagnostics

When applicable expose:

- original;
- star mask;
- PSF;
- starless;
- segmentation;
- vector/SVG;
- depth;
- density;
- emission;
- dust/absorption;
- filament/structure map;
- frontal render;
- side render;
- interior render.

Diagnostics must be inspectable and preferably exportable.

## Reset Rule

Loading a new input image must invalidate and rebuild all derived state:

- stars;
- PSF;
- starless;
- masks;
- vectors;
- maps;
- geometry;
- density;
- materials;
- textures;
- scene resources.

## QA Artifacts

Every major experiment must create:

```text
/reports/iteration-N.md
```

Include:

- problem;
- hypothesis;
- implementation;
- dataset/input;
- screenshots;
- metrics;
- defects;
- regressions;
- conclusion;
- next experiment.

## Required Evaluation Dimensions

At minimum:

- Front Fidelity;
- Side Coherence;
- Interior Quality;
- Star Fidelity;
- Structural Fidelity;
- Artifact Score;
- Temporal Stability;
- Performance.

## Baseline

Before declaring any major replacement superior:

1. execute the original project;
2. document its actual pipeline;
3. capture representative screenshots;
4. measure performance;
5. record strengths and weaknesses;
6. compare the new implementation against it.

## Git Discipline

Prefer small coherent commits.

Examples:

```text
feat: add volumetric density prototype
test: add frontal SSIM benchmark
perf: adaptive raymarch step size
fix: remove stellar residual contamination
experiment: compare SVG and SDF reconstruction
```

Use branches for risky experiments.

## Definition of Done

A milestone is not complete merely because it compiles.

A meaningful milestone should demonstrate:

- arbitrary image loading;
- automatic processing;
- diagnostics;
- recognizable reconstruction;
- strong frontal relationship with source;
- coherent non-flat side views;
- usable interior travel;
- separated stars/background;
- interactive performance;
- regression tests;
- recorded evidence in `/reports`.
