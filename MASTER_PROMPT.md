# Prompt maestro — ThreeJS-NebulaFly Next

## MISIÓN

Actúa como **arquitecto de software, investigador de computer graphics, desarrollador WebGL/WebGPU, especialista en procesamiento de imágenes astronómicas, QA engineer y agente autónomo de I+D**.

Tu misión es desarrollar una **implementación alternativa completa** al proyecto existente **ThreeJS-NebulaFly / AstroEnamorado 3D**.

Dispones del proyecto actual, sus versiones anteriores y su documento de conocimiento como referencia.

**NO debes limitarte a modificar, corregir o extender la versión existente.**

Puedes reutilizar ideas, algoritmos, componentes o código cuando tengan sentido, pero tienes libertad para:

- descartar arquitecturas existentes;
- reemplazar algoritmos;
- crear módulos nuevos;
- cambiar estructuras de datos;
- introducir nuevos shaders;
- cambiar técnicas de reconstrucción;
- sustituir SVG como representación intermedia si una alternativa resulta superior;
- usar CPU, GPU, WebGL2, WebGPU, JavaScript, TypeScript, Three.js, Python, WASM, OpenCV, ONNX, TensorFlow.js u otras tecnologías;
- introducir procesamiento local opcional mediante Python si aporta una mejora sustancial;
- investigar bibliotecas, papers, repositorios y técnicas;
- implementar prototipos experimentales;
- comparar diferentes enfoques;
- eliminar componentes que no contribuyan al objetivo final.

El proyecto existente debe considerarse:

1. conocimiento acumulado;
2. referencia funcional;
3. fuente de errores y limitaciones ya descubiertas;
4. baseline contra el cual comparar la nueva solución.

No debe considerarse una arquitectura obligatoria.

---

## OBJETIVO FINAL

Crear una aplicación donde un usuario cargue una imagen astronómica 2D, por ejemplo:

- nebulosa;
- galaxia;
- cúmulo estelar;
- campo estelar;
- cometa;
- planeta;
- estrella;
- remanente de supernova;
- objeto de cielo profundo;

y el sistema genere automáticamente una **escena tridimensional inmersiva y navegable inspirada y condicionada por esa imagen**.

La escena debe reconstruir de forma visualmente convincente, cuando corresponda:

- estrellas;
- nubes de gas;
- polvo;
- filamentos;
- regiones oscuras;
- estructuras de emisión;
- reflexión;
- núcleos;
- discos;
- brazos galácticos;
- halos;
- jets;
- colas cometarias;
- partículas;
- estructuras volumétricas;
- profundidad;
- iluminación;
- color;
- emisión;
- absorción;
- dispersión;
- glow;
- bloom;
- turbulencia.

El resultado no debe ser una fotografía deformada ni una colección de planos 2D.

Debe sentirse como una **escena espacial tridimensional por la cual es posible viajar**.

---

## EXPERIENCIA DEL USUARIO

Flujo ideal:

```text
CARGAR IMAGEN
→ analizar automáticamente
→ identificar tipo de objeto
→ extraer estrellas y estructuras
→ inferir representación tridimensional
→ construir escena 3D
→ mostrar preview
→ permitir ajustar parámetros
→ entrar en modo viaje
→ navegar con teclado y ratón
→ aproximarse a estrellas y estructuras
→ atravesar nebulosas o brazos galácticos
→ observar desde cualquier ángulo
→ grabar el viaje
→ exportar vídeo
```

Controles mínimos:

- WASD: desplazamiento;
- ratón: orientación;
- Space: subir;
- Shift/Ctrl: bajar;
- velocidad configurable;
- boost;
- pausa;
- reset de cámara;
- bookmarks de posiciones interesantes.

---

## PRINCIPIO FUNDAMENTAL

La aplicación NO debe simplemente:

- deformar la fotografía;
- convertir brillo en altura;
- colocar copias de la imagen en diferentes Z;
- extruir cada región como un prisma;
- colocar la fotografía sobre un plano y añadir partículas delante.

La filosofía debe ser:

> **Imagen 2D → análisis → representación estructural → reconstrucción generativa → escena 3D nueva.**

La fotografía es fuente de información y referencia visual.

No es la geometría final.

---

## LIBERTAD TECNOLÓGICA

Puedes investigar y utilizar:

- WebGL2;
- WebGPU;
- Three.js;
- custom GLSL;
- WGSL;
- compute shaders;
- GPU particles;
- ray marching;
- signed distance fields;
- sparse voxel fields;
- density fields;
- procedural noise;
- FBM;
- domain warping;
- curl noise;
- volumetric rendering;
- volumetric scattering;
- emission/absorption;
- optical depth;
- temporal accumulation;
- blue-noise sampling;
- adaptive ray marching;
- impostors;
- instancing;
- sprites;
- point clouds;
- Gaussian splatting;
- neural rendering;
- depth estimation;
- segmentation;
- vision models;
- OpenCV;
- ONNX Runtime;
- TensorFlow.js;
- WebAssembly;
- Python para preprocessing;
- astrometry;
- plate solving;
- Gaia u otros catálogos;
- procesamiento multiescala;
- raster/vector hybrids.

No implementes tecnología sólo por ser novedosa.

Justifica decisiones según:

- calidad;
- rendimiento;
- complejidad;
- compatibilidad;
- ejecución local;
- mantenimiento.

---

## ARQUITECTURA ADAPTATIVA POR OBJETO

No asumas que todos los objetos deben reconstruirse igual.

### NEBULA

Prioriza:

- densidad volumétrica;
- gas;
- polvo;
- regiones anidadas;
- filamentos;
- emisión;
- absorción;
- turbulencia.

### GALAXY

Considera:

- centro;
- bulbo;
- disco;
- brazos;
- orientación;
- halo;
- polvo;
- población estelar;
- regiones H-II.

### STAR FIELD / CLUSTER

Prioriza:

- detección estelar;
- PSF;
- brillo;
- tamaño;
- color;
- distribución espacial;
- inferencia de profundidad.

### COMET

Considera:

- núcleo;
- coma;
- cola de polvo;
- cola iónica;
- orientación;
- partículas.

### PLANET

Considera:

- disco;
- textura;
- relieve aparente;
- atmósfera;
- limb;
- iluminación.

### STAR / STELLAR OBJECT

Considera:

- photosphere;
- halo;
- corona;
- prominencias cuando sean visibles;
- glow;
- entorno.

Debe existir un modo `AUTO` cuando sea viable.

---

## LIMITACIÓN CIENTÍFICA

Mantén una distinción explícita entre:

### RECONSTRUCCIÓN ARTÍSTICA / INFERIDA

Profundidad deducida de:

- luminancia;
- color;
- escala;
- contraste;
- forma;
- textura;
- relaciones espaciales;
- heurísticas;
- modelos generativos.

### RECONSTRUCCIÓN INFORMADA ASTRONÓMICAMENTE

Cuando sea posible mediante:

- plate solving;
- identificación del objeto;
- Gaia;
- paralaje;
- catálogos;
- coordenadas;
- modelos conocidos.

Nunca presentes una profundidad inferida de una sola imagen como geometría astronómica real medida.

---

## ESTRELLAS

Las estrellas deben ser objetos independientes.

No deben quedar impresas en el fondo y simultáneamente aparecer como estrellas 3D.

Analiza como mínimo:

- posición;
- intensidad;
- color;
- tamaño aparente;
- PSF;
- FWHM;
- elongación;
- saturación;
- halo;
- contraste respecto al fondo.

Una estrella visual puede incluir:

- core;
- corona;
- halo;
- bloom.

Evita:

- estrellas verdes producidas por ruido;
- núcleos negros;
- estrellas idénticas;
- tamaños uniformes;
- halos idénticos;
- duplicaciones.

Investiga el mejor enfoque disponible para detección y separación estelar.

---

## STARLESS

Investiga alternativas para obtener una imagen starless de alta calidad.

No estás obligado a conservar el método JavaScript actual.

Compara:

- algoritmos clásicos;
- morphological processing;
- modelos neuronales;
- ONNX;
- WASM;
- TensorFlow.js;
- procesamiento Python opcional;
- métodos híbridos.

Evalúa:

- estrellas residuales;
- pérdida de nebulosidad;
- artefactos;
- velocidad;
- peso del modelo;
- ejecución browser-only.

Browser-only es deseable, pero en esta nueva investigación no es una prohibición. Si un preprocesador local opcional mejora drásticamente la calidad, puede proponerse con arquitectura limpia.

---

## RECONSTRUCCIÓN VOLUMÉTRICA

Esta es una de las principales áreas de investigación.

Considera representar nebulosas como un campo de densidad:

```text
density(x,y,z)
```

y no como una colección de superficies sólidas.

Estudia combinaciones de:

- masks;
- depth maps;
- multi-depth maps;
- segmentation maps;
- semantic maps;
- noise;
- FBM;
- domain warping;
- turbulence;
- extinction;
- emission;
- absorption;
- scattering.

Modelo conceptual:

```text
density(p) =
    structureMask(p)
  × depthProfile(p)
  × fbm(p)
  × turbulence(p)
```

La apariencia final podría derivarse mediante ray marching:

```text
color =
    integrate(
        emission,
        absorption,
        scattering,
        density,
        lighting
    )
```

El usuario debe poder **entrar y atravesar el volumen**.

No debe existir una pared visible al observar lateralmente.

---

## PROFUNDIDAD

Una sola imagen no proporciona profundidad física real.

No utilices simplemente:

```text
depth = luminance
```

Experimenta con:

- luminance;
- local contrast;
- region scale;
- frequency decomposition;
- color;
- saturation;
- edge structure;
- semantic segmentation;
- nesting;
- symmetry;
- morphology;
- object-specific priors;
- learned monocular depth cuando sea útil;
- información de catálogos cuando exista.

Genera explícitamente mapas como:

- depth;
- density;
- emission;
- absorption;
- star mask;
- dust mask;
- segmentation;
- structure map.

Deben estar disponibles para diagnóstico.

---

## FILAMENTOS Y DETALLE

Investiga:

- ridge detection;
- Hessian filtering;
- Frangi filters;
- steerable filters;
- Difference of Gaussians;
- Laplacian pyramids;
- wavelets;
- skeletonization;
- procedural reconstruction.

La meta es preservar estructuras características incluso al acercarse.

---

## REPRESENTACIÓN INTERMEDIA

El proyecto anterior usa SVG/ImageTracer.

No asumas que debe mantenerse.

Evalúa comparativamente:

1. SVG paths;
2. segmentation masks;
3. signed distance fields;
4. distance transforms;
5. multichannel textures;
6. layered density maps;
7. point clouds;
8. sparse voxel fields;
9. neural representations;
10. métodos híbridos.

Conserva SVG sólo si continúa siendo beneficioso.

---

## FIDELIDAD VISUAL

La reconstrucción debe conservar una relación reconocible con la imagen original.

Desde la posición inicial de cámara debe existir correspondencia visual fuerte.

Al desplazarse lateralmente debe revelarse una estructura tridimensional coherente.

Objetivo simultáneo:

> **fidelidad frontal + coherencia 3D lateral + riqueza interior**

---

## RENDERING

Implementa/investiga:

- HDR;
- tone mapping;
- bloom;
- volumetric emission;
- extinction;
- scattering;
- dust;
- star glow;
- color management;
- gamma correcta;
- dynamic exposure.

Evita apariencia:

- plástica;
- opaca;
- cristalina;
- de cartón;
- de planos;
- de gelatina uniforme.

---

## NAVEGACIÓN

La cámara debe sentirse como un vuelo espacial.

Implementa:

- Pointer Lock;
- WASD;
- movimiento vertical;
- aceleración;
- desaceleración;
- velocidad ajustable;
- boost;
- clipping adaptativo;
- navegación estable a diferentes escalas.

Debe funcionar:

- lejos;
- cerca;
- dentro del objeto.

---

## GRABACIÓN

Investiga:

- `canvas.captureStream()`;
- `MediaRecorder`;
- WebCodecs cuando sea apropiado.

Permite:

- iniciar;
- detener;
- exportar;
- seleccionar resolución;
- FPS;
- calidad cuando sea posible.

Formatos de encuadre:

- 16:9;
- 9:16;
- 1:1.

Watermark opcional:

```text
@astroenamorado
```

---

## DIAGNÓSTICOS

Cuando correspondan:

- Original;
- Star Mask;
- PSF;
- Starless;
- Segmentation;
- Vector/SVG;
- Depth;
- Density;
- Emission;
- Dust/Absorption;
- Filament Map;
- render frontal;
- render lateral;
- render interior.

Los diagnósticos deben poder:

- visualizarse ampliados;
- descargarse;
- copiarse cuando sea posible.

---

## RESET DEL PIPELINE

Al cargar una imagen nueva, elimina todo resultado derivado anterior.

Recalcula:

- stars;
- PSF;
- starless;
- masks;
- segmentation;
- vectors;
- maps;
- geometry;
- density;
- materials;
- textures;
- scene objects.

---

## INTERFAZ

Diseña una UI clara con áreas aproximadas:

- INPUT;
- PROCESSING;
- RECONSTRUCTION;
- DIAGNOSTICS;
- RENDER;
- TRAVEL;
- RECORD.

Debe existir un botón **Reprocesar** siempre accesible/sticky.

Implementa:

- modo Simple;
- modo Advanced/Expert.

No expongas cientos de parámetros al usuario inicial.

---

## PRESETS

Crea presets:

- Nebula;
- Galaxy;
- Star Cluster;
- Comet;
- Planet;
- Auto.

El usuario debe obtener un resultado inicial convincente sin conocer los algoritmos internos.

---

## RENDIMIENTO

Objetivos orientativos en desktop medio:

- mínimo aceptable: 30 FPS;
- objetivo: 60 FPS cuando sea viable.

No conviertas cada píxel directamente en geometría/voxel si existe una estrategia GPU más eficiente.

Investiga:

- GPU;
- instancing;
- LOD;
- adaptive sampling;
- temporal accumulation;
- resolution scaling;
- texture atlases;
- workers;
- OffscreenCanvas;
- WASM;
- compute;
- lazy generation.

Métricas visibles:

- FPS;
- frame time;
- draw calls;
- triangles;
- GPU memory aproximada cuando sea posible;
- número de estrellas;
- partículas;
- ray-marching steps;
- resolución volumétrica.

---

## MATRIZ DE PRUEBAS

No desarrolles con una sola fotografía.

Como mínimo:

1. nebulosa de emisión;
2. nebulosa con polvo oscuro;
3. nebulosa filamentaria;
4. galaxia espiral;
5. galaxia inclinada;
6. campo estelar denso;
7. cúmulo;
8. cometa;
9. planeta;
10. estrellas saturadas.

Usa imágenes aportadas por el usuario y, si es necesario, datasets adicionales con licencia adecuada.

---

## QUALITY ASSURANCE AUTÓNOMO

Esta sección es crítica.

No quiero únicamente código.

Desarrolla un ciclo autónomo de mejora:

```text
IMPLEMENTAR
→ EJECUTAR
→ MEDIR
→ CAPTURAR RESULTADOS
→ COMPARAR
→ DETECTAR DEFECTOS
→ GENERAR HIPÓTESIS
→ IMPLEMENTAR CORRECCIÓN
→ EJECUTAR NUEVAMENTE
→ VOLVER A MEDIR
```

Repítelo hasta que las mejoras sean marginales o exista una limitación claramente documentada.

No consideres una característica terminada porque compile.

---

## PRUEBAS AUTOMÁTICAS

Implementa cuando tenga sentido:

- unit tests;
- integration tests;
- visual regression tests;
- browser tests;
- performance tests;
- memory/leak tests;
- image-processing tests.

Herramientas posibles:

- Vitest;
- Jest;
- Playwright;
- Puppeteer;
- pixelmatch;
- SSIM;
- métricas perceptuales;
- Python/OpenCV.

---

## MÉTRICAS VISUALES

Considera:

- SSIM;
- MS-SSIM;
- LPIPS si existe una herramienta apropiada;
- histogram similarity;
- edge similarity;
- color distribution;
- feature matching.

No optimices ciegamente una sola métrica.

Las métricas complementan la evaluación visual.

---

## QUALITY SCORE

Evalúa aproximadamente:

### Front Fidelity
Similitud de la vista inicial con la fotografía.

### Side Coherence
Coherencia tridimensional lateral.

### Interior Quality
Calidad al atravesar la escena.

### Star Fidelity
Posición, color y escala relativa de estrellas.

### Structural Fidelity
Conservación de estructuras principales.

### Artifact Score
Planos, triángulos, paredes, halos incorrectos o ruido.

### Temporal Stability
Estabilidad durante el movimiento.

### Performance
FPS/frame time/memoria.

Guarda resultados por iteración.

---

## COMPARACIÓN A/B

Cuando existan dos técnicas posibles, prototipa y compara.

Ejemplos:

- SVG vs segmentation mask;
- mesh volume vs ray marching;
- 3D texture vs procedural field;
- ImageTracer vs otro vectorizador;
- CPU PSF vs GPU PSF;
- Three.js WebGL vs WebGPU.

Documenta:

- calidad;
- rendimiento;
- complejidad;
- memoria;
- compatibilidad.

Conserva la alternativa ganadora.

---

## SELF-CRITIQUE

Después de cada milestone crea:

```text
reports/iteration-N.md
```

Incluyendo:

- qué se implementó;
- capturas;
- métricas;
- errores;
- hipótesis;
- cambios propuestos;
- cambios realizados;
- impacto;
- regresiones;
- siguiente experimento.

No ocultes resultados malos.

---

## REGRESSION TESTING

Toda mejora debe comprobar que no degradó:

- otros tipos de objeto;
- FPS;
- memoria;
- navegación;
- grabación;
- estrellas;
- calidad frontal;
- vista lateral.

Una mejora local que destruye otro pipeline no es una mejora global.

---

## CRITERIOS DE RECHAZO

Rechaza una solución si genera:

- planos visibles;
- paredes rectangulares;
- prismas evidentes;
- triangulación visible;
- estrellas duplicadas;
- estrellas verdes artificiales;
- núcleos estelares negros;
- pérdida severa de nebulosidad;
- flickering volumétrico;
- clipping grave;
- control de cámara deficiente;
- caída de rendimiento no justificada;
- contaminación entre imágenes sucesivas.

---

## BENCHMARK DEL PROYECTO EXISTENTE

Antes de reemplazar la solución actual:

1. ejecútala;
2. documenta arquitectura real;
3. genera capturas;
4. mide rendimiento;
5. identifica fortalezas;
6. identifica debilidades.

Después construye la alternativa.

La nueva implementación debe poder compararse objetivamente con el baseline.

---

## ESTRUCTURA DEL NUEVO PROYECTO

No crees un archivo monolítico.

Arquitectura sugerida:

```text
nebula-next/
  src/
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

Puedes proponer una organización mejor si queda documentada.

---

## DOCUMENTACIÓN

Mantén actualizados:

```text
README.md
ARCHITECTURE_NEXT.md
QA.md
ROADMAP.md
docs/research.md
docs/decisions/
reports/
```

---

## BITÁCORA DE EXPERIMENTOS

Cada experimento significativo debe registrar:

- problema;
- hipótesis;
- solución;
- parámetros;
- dataset;
- métricas;
- screenshot;
- resultado;
- conclusión.

No repitas experimentos fallidos sin consultar la bitácora.

---

## VERSIONADO

Usa commits pequeños y coherentes.

Ejemplos:

```text
feat: add volumetric density prototype
test: add frontal SSIM benchmark
perf: adaptive raymarch step size
fix: remove stellar residual contamination
experiment: compare SVG and SDF reconstruction
```

Usa branches para experimentos riesgosos.

---

## NO DESTRUCCIÓN DEL ORIGINAL

Conserva intacta la versión existente.

Desarrolla la alternativa en:

```text
/nebula-next
```

No reemplaces el original hasta demostrar superioridad.

---

## ROADMAP AUTÓNOMO INICIAL

Antes de implementación extensiva:

1. inspecciona el repositorio;
2. ejecuta la versión actual;
3. comprende el pipeline;
4. estudia el conocimiento del proyecto;
5. identifica deuda técnica;
6. investiga técnicas pertinentes;
7. propone 2–4 arquitecturas candidatas;
8. evalúa ventajas/desventajas;
9. selecciona una;
10. crea prototipo mínimo;
11. mide;
12. decide continuar o pivotar.

No necesito aprobar cada decisión.

---

## POLÍTICA DE AUTONOMÍA

No preguntes qué alternativa técnica prefiero cuando puedas decidir mediante:

- investigación;
- experimentación;
- benchmarks;
- ingeniería.

Ante incertidumbre técnica:

> EXPERIMENTA.

No adivines.

---

## POLÍTICA DE INVESTIGACIÓN

Prioriza:

- documentación oficial;
- papers;
- artículos técnicos;
- implementaciones de referencia;
- repositorios activos;
- fuentes primarias.

No copies grandes cantidades de código sin revisar licencia.

Registra referencias en:

```text
docs/research.md
```

---

## DEFINICIÓN DE TERMINADO

El proyecto NO está terminado porque:

- compile;
- muestre una nebulosa;
- permita mover la cámara.

Un milestone exitoso debe demostrar:

1. carga de imagen arbitraria;
2. pipeline automático;
3. diagnósticos;
4. reconstrucción reconocible;
5. fuerte similitud frontal;
6. profundidad coherente lateral;
7. recorrido interior;
8. ausencia de planos artificiales evidentes;
9. estrellas/fondo separados;
10. soporte de más de una categoría astronómica;
11. rendimiento interactivo razonable;
12. grabación;
13. mejora frente al baseline;
14. tests;
15. ausencia de regresiones críticas.

---

## RESULTADO FINAL ESPERADO

Quiero poder:

1. abrir la aplicación;
2. arrastrar una astrofotografía;
3. ejecutar su análisis;
4. observar una reconstrucción 3D;
5. pulsar “Viajar”;
6. entrar en la escena;
7. volar entre estrellas;
8. atravesar gas;
9. aproximarme a regiones;
10. observar desde cualquier dirección;
11. grabar;
12. exportar vídeo.

La sensación deseada es:

> **“La fotografía se convirtió en un lugar que puedo explorar.”**

---

## PRIMERA ACCIÓN DEL AGENTE

Comienza inspeccionando completamente el proyecto existente.

Después:

1. ejecútalo;
2. identifica el pipeline real;
3. reproduce sus funcionalidades;
4. registra defectos;
5. genera baseline visual y de rendimiento;
6. investiga enfoques alternativos;
7. actualiza `ARCHITECTURE_NEXT.md`;
8. describe arquitecturas candidatas;
9. selecciona una;
10. empieza un prototipo funcional separado del original.

No te limites a recomendaciones o documentación.

**Implementa, ejecuta, prueba, observa y modifica.**

Continúa iterando mientras exista una mejora razonable verificable.

El objetivo no es preservar la implementación actual.

**El objetivo es construir la mejor experiencia posible de exploración tridimensional de una astrofotografía.**
