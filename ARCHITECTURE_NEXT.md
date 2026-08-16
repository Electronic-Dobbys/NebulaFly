# ARCHITECTURE_NEXT.md

Este archivo debe evolucionar con la investigación del agente.

## Objetivo arquitectónico

Separar claramente:

```text
INPUT IMAGE
   │
   ▼
ANALYSIS
   │
   ├─ object classification
   ├─ stars / PSF
   ├─ starless
   ├─ structures
   ├─ dust
   ├─ filaments
   ├─ segmentation
   └─ inferred maps
   │
   ▼
SCENE DESCRIPTION
   │
   ├─ star catalogue
   ├─ density fields
   ├─ emission fields
   ├─ absorption fields
   ├─ depth priors
   └─ object-specific semantics
   │
   ▼
RECONSTRUCTION BACKEND
   │
   ├─ nebula reconstructor
   ├─ galaxy reconstructor
   ├─ cluster reconstructor
   ├─ comet reconstructor
   └─ planet reconstructor
   │
   ▼
GPU RENDERER
   │
   ├─ stars
   ├─ volumetrics
   ├─ postprocessing
   └─ LOD
   │
   ▼
NAVIGATION + RECORDING
```

## Arquitecturas candidatas iniciales

El agente debe medir y revisar estas alternativas, no aceptarlas sin pruebas.

### A. Multichannel 2D analysis + procedural ray marching

Entrada:

- starless;
- segmentation;
- depth;
- density seed;
- emission;
- dust;
- filament map.

GPU:

- campo procedimental 3D condicionado por mapas 2D;
- FBM/domain warping;
- ray marching;
- estrellas independientes.

Fortalezas esperadas:

- buena continuidad volumétrica;
- evita prismas;
- permite recorrer el interior;
- los detalles finos pueden generarse en GPU.

Riesgos:

- coste de ray marching;
- dificultad de mantener fidelidad frontal e interior simultáneamente.

### B. Sparse volume / 3D texture reconstruction

Generar una representación volumétrica discreta a baja/media resolución y enriquecerla proceduralmente.

Fortalezas:

- control explícito de densidad;
- sampling sencillo;
- potencial para compute/WebGPU.

Riesgos:

- memoria;
- generación inicial;
- escalabilidad.

### C. Point / Gaussian representation + volumetric field

Usar puntos/splats para estructuras brillantes y un campo volumétrico para gas difuso.

Fortalezas:

- buena riqueza visual;
- representación dispersa;
- útil para galaxias/cúmulos.

Riesgos:

- posible aspecto de partículas;
- necesidad de solución distinta para gas continuo.

### D. SDF / distance-field hybrid

Usar masks/segmentación para crear distance fields y combinarlos con ruido volumétrico.

Fortalezas:

- bordes controlables;
- operaciones de mezcla;
- máscaras robustas.

Riesgos:

- representación demasiado geométrica si se usa de forma rígida.

## Hipótesis recomendada para primer prototipo

No es una imposición, pero una dirección prometedora es:

```text
Image
→ star separation
→ semantic/multichannel maps
→ 2.5D structural priors
→ 3D procedural density field
→ GPU ray marching
→ independent star renderer
→ postprocessing
```

Para galaxias podría coexistir un reconstructor diferente:

```text
Image
→ nucleus/disc/arm estimation
→ parametric galaxy model
→ dust lanes
→ stellar population splats
→ volumetric halo
```

## Contrato de Scene Description

Investigar un formato interno declarativo, por ejemplo:

```json
{
  "source": {},
  "objectType": "nebula",
  "stars": [],
  "maps": {},
  "regions": [],
  "renderHints": {},
  "navigationHints": {}
}
```

El objetivo es desacoplar análisis y renderer.

## Arquitectura modular sugerida

```text
nebula-next/src/
  app/
  image/
  analysis/
  stars/
  reconstruction/
  volume/
  shaders/
  astronomy/
  render/
  navigation/
  recording/
  diagnostics/
  qa/
  utils/
```

## Decisiones pendientes

El agente debe resolver mediante experimentación:

- TypeScript vs JavaScript;
- Three.js WebGL2 vs WebGPU;
- ray marching full-screen vs bounded volumes;
- 3D textures vs procedural density;
- starless browser vs optional local backend;
- vector/SVG retention vs masks/SDF;
- depth representation;
- temporal accumulation;
- performance/quality modes;
- testing framework;
- browser automation.

Registrar decisiones importantes en `docs/decisions/`.
