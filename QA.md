# QA.md — Ciclo autónomo de calidad

## Filosofía

La calidad no se valida porque el código compile.

Cada iteración debe producir evidencia.

## Loop de mejora

```text
Implementar
→ Ejecutar
→ Capturar
→ Medir
→ Comparar
→ Detectar defectos
→ Formular hipótesis
→ Corregir
→ Repetir
→ Regression test
```

## Métricas mínimas

### Front Fidelity

Comparar render inicial con imagen objetivo:

- SSIM;
- histograma;
- diferencia de color;
- edge similarity;
- feature similarity cuando sea viable.

### Star Fidelity

- cantidad de estrellas;
- error de posición;
- error de color;
- tamaños relativos;
- residuos de estrellas en starless;
- falsos positivos cromáticos.

### Structural Fidelity

- conservación de filamentos;
- regiones principales;
- cavidades;
- polvo oscuro;
- bordes relevantes.

### Side Coherence

Checklist automática/semi-automática:

- ¿hay planos visibles?
- ¿hay paredes rectangulares?
- ¿la distribución en Z tiene continuidad?
- ¿se observan polígonos/triangulación?

### Interior Quality

- continuidad volumétrica;
- densidad no uniforme;
- ausencia de paredes;
- detalle local;
- estabilidad temporal.

### Performance

Medir:

- FPS medio;
- p1/p5 de FPS;
- frame time;
- draw calls;
- triangles;
- cantidad de estrellas;
- ray-marching steps;
- resolución de volumen;
- uso de memoria aproximado;
- tiempo de procesamiento inicial.

## Quality Score sugerido

Escala 0–100.

Ejemplo inicial:

```text
Front Fidelity       25%
Structural Fidelity  20%
Side Coherence       15%
Interior Quality     15%
Star Fidelity        10%
Temporal Stability    5%
Artifact Score        5%
Performance           5%
```

Los pesos pueden ajustarse y deben documentarse.

## Visual regression

Crear cámaras estándar:

- FRONT;
- LEFT;
- RIGHT;
- TOP;
- OBLIQUE;
- INTERIOR_01;
- INTERIOR_02.

Guardar screenshots por versión.

Ejemplo:

```text
reports/assets/iteration-001/m42/front.png
reports/assets/iteration-001/m42/side-left.png
reports/assets/iteration-001/m42/interior-01.png
```

## Regression Gate

Una mejora no debe aceptarse si causa una degradación significativa no justificada en:

- otra categoría astronómica;
- FPS;
- estabilidad;
- star detection;
- starless;
- navegación;
- grabación;
- fidelidad frontal.

## A/B experiments

Formato:

```text
Experiment:
A: ...
B: ...

Dataset:
...

Metrics:
...

Visual notes:
...

Winner:
...

Reason:
...
```

## Reporte obligatorio

Cada iteración:

```text
reports/iteration-NNN.md
```

Plantilla mínima:

```markdown
# Iteration NNN

## Goal
## Hypothesis
## Changes
## Dataset
## Commands executed
## Automated tests
## Visual captures
## Metrics
## Defects found
## Regressions
## Conclusion
## Next experiment
```

## Criterios de rechazo inmediatos

- planos Z visibles;
- paredes rectangulares;
- prismas SVG;
- triángulos evidentes;
- estrellas duplicadas;
- core estelar negro;
- estrellas verdes falsas;
- starless severamente destructivo;
- flicker;
- clipping grave;
- recursos de imagen anterior;
- navegación inestable;
- pérdida importante de FPS sin beneficio visual medible.
