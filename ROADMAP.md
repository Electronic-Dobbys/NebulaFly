# ROADMAP.md

Este roadmap es orientativo. Codex puede cambiar el orden si los experimentos justifican otra prioridad.

## Fase 0 — Baseline

- inspeccionar `original/`;
- documentar dependencias;
- ejecutar v10.2;
- capturar diagnósticos;
- medir rendimiento;
- identificar fortalezas y defectos;
- crear `reports/baseline.md`.

## Fase 1 — Harness experimental

Construir primero las herramientas que permiten comparar:

- loader de datasets;
- cámaras estándar;
- screenshot automation;
- performance capture;
- SSIM/edge metrics;
- report generator;
- visual regression.

Objetivo: evitar desarrollo “a ojo” sin feedback reproducible.

## Fase 2 — Nueva separación de imagen

Investigar:

- estrellas;
- PSF;
- starless;
- segmentación;
- dust/filament maps;
- object classification.

Crear métricas de estas etapas.

## Fase 3 — Prototype Bake-off

Probar al menos 2–4 opciones:

- procedural ray marching;
- sparse volume;
- SDF hybrid;
- point/Gaussian hybrid.

Usar datasets pequeños y cámaras estándar.

## Fase 4 — Nebula Reconstructor v1

Objetivo:

- fuerte fidelidad frontal;
- lateral sin placas;
- recorrido interior;
- densidad/emisión/absorción;
- estrellas independientes.

## Fase 5 — Star Renderer v2

Mejorar:

- PSF;
- core;
- corona;
- halos;
- color;
- saturación;
- distribución Z;
- instancing;
- LOD.

## Fase 6 — Galaxy Pipeline

Modelo específico:

- nucleus;
- bulge;
- disc;
- arms;
- dust;
- halo;
- star population;
- H-II regions.

No forzar el pipeline de nebulosa.

## Fase 7 — Cluster / Starfield

Priorizar precisión estelar y profundidad aparente.

## Fase 8 — Comet

- nucleus;
- coma;
- dust tail;
- ion tail;
- partículas;
- dinámica aparente.

## Fase 9 — Planet

- sphere reconstruction;
- albedo;
- atmosphere;
- limb;
- illumination;
- optional relief.

## Fase 10 — UX

- simple mode;
- expert mode;
- presets;
- diagnostics;
- reprocess sticky;
- progress/status;
- error handling.

## Fase 11 — Travel

- pointer lock;
- acceleration;
- boost;
- speed scaling;
- adaptive clipping;
- bookmarks;
- camera presets.

## Fase 12 — Recording

- MediaRecorder;
- captureStream;
- 16:9;
- 9:16;
- 1:1;
- watermark;
- quality/FPS controls.

## Fase 13 — Optimization

- LOD;
- adaptive ray marching;
- temporal accumulation;
- worker pipeline;
- OffscreenCanvas;
- resolution scaling;
- GPU profiling.

## Fase 14 — Optional Astronomy-Informed Mode

- plate solving;
- Gaia/catalogue integration;
- known-object hints;
- explicit distinction between inferred and catalogued depth.
