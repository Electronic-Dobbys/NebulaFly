# ThreeJS-NebulaFly / AstroEnamorado 3D

## Documento maestro de conocimiento del proyecto

**Actualizado:** 15 de agosto de 2026  
**Objetivo del documento:** conservar en un único archivo el contexto,
decisiones, evolución, problemas, arquitectura y próximos pasos del
proyecto para anexarlo como conocimiento y poder continuar el desarrollo
sin perder lo aprendido.

------------------------------------------------------------------------

## 1. Visión

**ThreeJS-NebulaFly / AstroEnamorado 3D** busca transformar una
astrofotografía 2D de una nebulosa, galaxia u objeto de cielo profundo
en una **representación tridimensional navegable**, ejecutada
principalmente en el navegador con JavaScript, Three.js y WebGL.

No se busca simplemente deformar una fotografía ni simular profundidad
colocando copias de la imagen en diferentes planos Z. El objetivo es
**analizar la fotografía y construir a partir de ella una nueva escena
3D**.

La experiencia final deseada es:

``` text
Cargar astrofotografía
        ↓
Analizar estrellas y nebulosidad
        ↓
Separar estrellas / fondo
        ↓
Reconstruir estrellas 3D
        ↓
Interpretar estructuras de gas o galaxia
        ↓
Construir volumen 3D
        ↓
Entrar en modo viaje
        ↓
Atravesar la nebulosa/galaxia
        ↓
Grabar el recorrido
        ↓
Publicarlo en @astroenamorado
```

La cámara debe poder viajar hacia la nebulosa, entrar en ella, atravesar
nubes de gas, pasar cerca de estrellas y observar la reconstrucción
desde perspectivas que una fotografía 2D no permite.

------------------------------------------------------------------------

## 2. Idea original

La primera idea fue utilizar una astrofotografía de la **Nebulosa de
Orión (M42)** como fuente para inferir:

- posición aparente de las estrellas;
- tamaño;
- color;
- brillo;
- profundidad;
- regiones de nebulosidad;
- brillo del gas;
- regiones oscuras;
- capas de emisión/reflexión.

Se propuso inicialmente usar una imagen en escala de grises de forma
parecida a un mapa de elevación de imágenes satelitales. Esa idea fue
útil como punto de partida, pero posteriormente se comprobó que una
nebulosa necesita un tratamiento **volumétrico**, no un simple height
map.

Desde el comienzo se estableció que la aplicación debía permitir
adjuntar cualquier astrofotografía y no estar limitada a Orión.

------------------------------------------------------------------------

## 3. Tecnologías

Arquitectura actual orientada al navegador:

- HTML
- CSS
- JavaScript
- Three.js
- WebGL
- Canvas 2D para análisis de imagen
- PointerLockControls
- MediaRecorder / `canvas.captureStream()`
- SVG como representación intermedia
- ImageTracerJS para raster → SVG en la versión actual

Se experimentó temporalmente con un backend Python para
StarNet/TensorFlow, pero finalmente se decidió **eliminar el backend** y
mantener la línea de la versión 10: browser-only.

El proyecto normalmente se ejecuta mediante un servidor local, por
ejemplo:

``` text
http://127.0.0.1:5500/index.html
```

------------------------------------------------------------------------

## 4. Principio fundamental: separar la escena

Una de las conclusiones más importantes es que la imagen debe dividirse
en sistemas independientes:

``` text
                  ORIGINAL
                     |
          +----------+----------+
          |                     |
          v                     v
    STAR ANALYSIS          STAR REMOVAL
      PSF mask               STARLESS
          |                     |
          v                     v
    STAR CATALOG        NEBULA/GALAXY ANALYSIS
          |                     |
          v                     v
     STARS 3D             VECTOR / DEPTH
          |                     |
          +----------+----------+
                     |
                     v
                THREE.JS 3D
```

Las estrellas **no deben permanecer impresas en el fondo** si ya existen
como objetos 3D.

------------------------------------------------------------------------

## 5. Evolución del tratamiento de estrellas

### Problemas iniciales

Las primeras versiones generaban estrellas que:

- eran casi todas iguales;
- parecían simples puntos;
- tenían tamaños similares;
- no conservaban bien el color;
- algunas aparecían verdes;
- algunas tenían núcleo negro;
- tenían un glow poco natural;
- podían aparecer repetidas en varios planos Z.

Esto era visual y conceptualmente incorrecto.

### Modelo deseado

Una estrella debe contener al menos:

``` text
        halo exterior
      .-------------.
    .'               '.
   /       glow        \
  |       *****         |
  |      * núcleo *     |
  |       *****         |
   \                   /
    '-----------------'
```

El núcleo debe ser luminoso y del color aproximado de la estrella,
**nunca negro**.

Colores visualmente plausibles:

- azul;
- azul-blanco;
- blanco;
- amarillo-blanco;
- amarillo;
- naranja;
- rojo.

Debe evitarse interpretar ruido cromático como estrellas verdes.

### PSF

Se decidió usar un enfoque más parecido a un análisis de **Point Spread
Function (PSF)**.

Una estrella se diferencia de nebulosidad/ruido mediante propiedades
como:

- concentración luminosa;
- forma circular u ovoide;
- FWHM;
- elongación;
- perfil radial;
- brillo respecto del fondo;
- continuidad espacial.

La aplicación dispone de una salida de diagnóstico **PSF mask**.

Conceptualmente, cada estrella debería terminar representada por datos
como:

``` javascript
{
  x, y, z,
  radius,
  fwhm,
  elongation,
  brightness,
  rgb,
  coreIntensity,
  glowRadius,
  glowIntensity
}
```

### Profundidad estelar

El color de una estrella por sí solo **no permite conocer su distancia
física**.

En el modo artístico/inferido se puede estimar Z usando una combinación
de:

- tamaño aparente;
- brillo;
- PSF;
- color;
- contraste;
- contexto.

Para una futura versión científicamente informada se planteó integrar
plate solving y catálogos, por ejemplo ASTAP/Gaia, para obtener cuando
sea posible:

- identificación;
- coordenadas;
- paralaje;
- magnitud;
- color;
- distancia catalogada.

------------------------------------------------------------------------

## 6. Starless

El fondo debe estar libre de estrellas para evitar duplicaciones.

Se estudió el código y enfoque de **StarNet**:

``` text
https://github.com/nekitmm/starnet
```

Conceptualmente:

``` text
ORIGINAL ≈ STARLESS + STARS
```

y:

``` text
STARS ≈ ORIGINAL - STARLESS
```

Se intentó integrar un backend Python/TensorFlow. En Windows aparecieron
problemas como:

``` text
ERROR: Could not find a version that satisfies
tensorflow<2.18,>=2.15
```

y:

``` text
ModuleNotFoundError: No module named 'numpy'
```

También hubo problemas al intentar scripts Linux desde Git Bash.

Se decidió finalmente:

> eliminar el backend y volver a una arquitectura completamente
> browser-only basada en v10.

Por tanto, el starless actual es una aproximación JavaScript y **todavía
no alcanza la calidad de StarNet**. Mejorarlo sigue siendo una
prioridad.

------------------------------------------------------------------------

## 7. Primer enfoque 3D: capas

Las primeras reconstrucciones utilizaban planos distribuidos en Z.

Frontalmente daban una impresión de profundidad, pero al mirar
lateralmente aparecía el problema:

``` text
| plano |
      | plano |
            | plano |
                  | plano |
```

La nebulosa parecía una pila de cristales pintados.

Además:

- una estrella podía repetirse en varios planos;
- la perspectiva revelaba inmediatamente el truco;
- no se percibía un volumen continuo.

Este enfoque fue descartado como solución final.

------------------------------------------------------------------------

## 8. Extrusión, meshes y esferización

El siguiente enfoque detectó regiones de nebulosidad y las convirtió en
geometría.

Evolución:

``` text
región 2D
   ↓
contorno
   ↓
extrusión
   ↓
mesh
   ↓
suavizado / esferización
   ↓
transparencia + glow + turbulencia
```

La extrusión mejoró la sensación 3D, pero produjo estructuras parecidas
a cilindros o prismas.

La esferización y el suavizado mejoraron considerablemente el resultado,
pero apareció una nueva conclusión:

> Una buena geometría 3D no puede corregir una segmentación 2D
> deficiente.

Por eso el foco pasó a la **vectorización de la nebulosa**.

------------------------------------------------------------------------

## 9. Vectorización de la nebulosa

La prueba con la **Nebulosa Estatua de la Libertad** fue especialmente
importante.

La vectorización automática interna era demasiado pobre. Una versión
vectorizada/calzada en alta fidelidad con Illustrator conservaba mucho
mejor:

- filamentos;
- regiones cromáticas;
- cavidades;
- grandes estructuras;
- regiones oscuras;
- estructuras anidadas;
- bordes complejos.

Se decidió adoptar SVG como representación intermedia:

``` text
Astrofotografía
      ↓
Starless
      ↓
Vectorización
      ↓
SVG
      ↓
Paths / regiones
      ↓
Análisis estructural
      ↓
Volumen 3D
```

El SVG puede conservar:

- paths;
- colores;
- regiones cerradas;
- jerarquía espacial;
- contornos;
- estructura.

------------------------------------------------------------------------

## 10. ImageTracerJS

En **v10.2** se incorporó **ImageTracerJS 1.2.6** como vectorizador
raster → SVG principal.

Motivación: el algoritmo legacy de clusters simplificaba demasiado
nebulosas y galaxias.

Pipeline v10.2:

``` text
Original
   ↓
PSF
   ↓
Star mask
   ↓
Starless automático
   ↓
ImageTracerJS
   ↓
SVG multicolor
   ↓
Shapes / regiones
   ↓
Gas procedural 3D
```

Controles incorporados:

- método de vectorización;
- detalle SVG;
- regiones pequeñas a omitir;
- cantidad de colores;
- modo legacy para comparación.

Actualmente ImageTracer se carga desde CDN/jsDelivr. Una mejora futura
es incluirlo localmente para que el proyecto sea completamente
autónomo/offline.

------------------------------------------------------------------------

## 11. Artículo 2D Space Scene ProcGen

Se estudió:

``` text
https://wwwtyro.net/2016/10/22/2D-space-scene-procgen.html
```

La idea más valiosa para el proyecto fue dejar de pensar cada forma
detectada como el sólido final.

Nueva interpretación:

``` text
SVG path
   ↓
dominio / máscara
   ↓
volumen base
   ↓
densidad procedural
   ↓
ruido multiescala
   ↓
turbulencia
   ↓
opacidad / emisión
   ↓
nube 3D
```

Es decir:

> **SVG no debería significar “prisma extruido”; debería describir dónde
> y cómo puede existir el gas.**

Este concepto es una de las direcciones principales del proyecto.

------------------------------------------------------------------------

## 12. Modelo actual de nebulosa

Cada región puede aportar información como:

``` javascript
{
  contour,
  area,
  centroid,
  meanColor,
  brightness,
  opacity,
  emission,
  depth,
  thickness,
  turbulence,
  glow
}
```

Las regiones pequeñas y densas pueden actuar como estructuras internas.

Las regiones grandes y difusas pueden envolverlas.

Se descartó ordenar todo simplemente como:

``` text
objeto 1 -> Z=-60
objeto 2 -> Z=-40
objeto 3 -> Z=-20
```

Se busca algo más parecido a:

``` text
       nube exterior
    .----------------.
   /                  \
  |     nube media     |
  |   .------------.   |
  |   | nube densa |   |
  |   '------------'   |
   \                  /
    '----------------'
```

------------------------------------------------------------------------

## 13. Plano Starless

Se mantiene un plano con la imagen starless para dar continuidad visual.

Pero debe poder ajustarse:

- Z;
- opacidad;
- visibilidad.

No debe parecer una pared rectangular evidente.

A largo plazo podría reemplazarse por una representación de fondo
volumétrica de baja frecuencia.

------------------------------------------------------------------------

## 14. Problemas de triangulación

En algunas versiones aparecieron rectas, triángulos y artefactos que
dañaban la escena.

Posibles causas:

- triangulación de polígonos;
- paths abiertos;
- auto-intersecciones;
- unión incorrecta de bordes;
- simplificación excesiva;
- transparencias revelando triángulos internos.

Esto reforzó la idea de no utilizar cada path como un sólido rígido.

------------------------------------------------------------------------

## 15. Turbulencia y densidad

El gas interestelar no debe tener superficies perfectamente lisas.

La turbulencia debería afectar:

- bordes;
- densidad;
- opacidad;
- emisión;
- profundidad local;
- distribución de partículas.

Una evolución lógica es usar ruido fractal:

``` text
FBM =
    noise(p)
  + 0.5 * noise(2p)
  + 0.25 * noise(4p)
  + ...
```

El detalle debe surgir proceduralmente, no exclusivamente de la cantidad
de polígonos.

------------------------------------------------------------------------

## 16. Glow y emisión

Las zonas brillantes de nebulosa no deben parecer plástico transparente.

Conceptualmente:

``` javascript
emissionColor = sampledRegionColor;
emissionStrength = luminance * userEmission;
```

Las zonas intensas pueden alimentar Bloom/postprocessing.

En estrellas también deben separarse:

``` text
core
corona
halo
bloom
```

El glow no debe ser idéntico para todas.

------------------------------------------------------------------------

## 17. Galaxias

Al cargar una galaxia se descubrió un bug importante: el proyecto
conservaba recursos preestablecidos de IC434 y no recalculaba
correctamente:

- estrellas;
- PSF;
- starless;
- vectorización.

Esto fue corregido en **v10.1 ProcGen AutoReset**.

Al cargar una nueva imagen debe ejecutarse:

``` text
Nueva imagen
    ↓
RESET completo
    ↓
PSF
    ↓
Star mask
    ↓
Starless
    ↓
Vector
    ↓
Posterizado
    ↓
Reconstrucción
```

También existe la posibilidad de descartar manualmente starless/SVG
externos.

------------------------------------------------------------------------

## 18. Nebulosa y galaxia no deberían procesarse igual

### Nebulosa

Tiene:

- gas irregular;
- polvo;
- cavidades;
- filamentos;
- emisión;
- reflexión;
- bordes difusos;
- estructuras anidadas.

### Galaxia

Tiene:

- núcleo;
- bulbo;
- disco;
- brazos;
- halo;
- regiones H-II;
- polvo;
- población estelar.

Por ello una arquitectura futura debería contemplar:

``` text
AUTO
NEBULA
GALAXY
STAR_FIELD
```

Una galaxia probablemente requiera una reconstrucción estructural
específica, no sólo vectorización genérica.

------------------------------------------------------------------------

## 19. Diagnósticos

Las salidas intermedias actuales son:

``` text
Original
Starless
PSF mask
Vector SVG
Posterizado
```

En v10.2 se hicieron **clicables**.

Cada diagnóstico puede:

- abrirse ampliado;
- copiarse al portapapeles;
- guardarse como PNG.

Esto permite compartir directamente las etapas del procesamiento para
analizar dónde se introduce un error.

Regla importante:

> Antes de intentar arreglar el render 3D, verificar las imágenes
> intermedias.

Ejemplos:

``` text
PSF incorrecta
→ estrellas incorrectas

Starless incorrecto
→ estrellas fantasma en nebulosa

SVG incorrecto
→ geometría/volumen incorrectos

SVG correcto + 3D incorrecto
→ problema del volume builder
```

------------------------------------------------------------------------

## 20. Botón Reprocesar

La gran cantidad de parámetros hacía incómodo desplazarse hacia arriba
para reconstruir.

En v10.2 se dejó:

``` text
↻ Reprocesar imagen actual
```

como control **sticky/fijo** en la parte superior del panel.

Este comportamiento debe conservarse.

------------------------------------------------------------------------

## 21. Navegación

La aplicación utiliza navegación de viaje:

``` text
WASD       mover
ratón      mirar
Espacio    subir
Shift      bajar
ESC        liberar Pointer Lock
```

Existe el concepto/botón:

``` text
Entrar en modo viaje
```

Las vistas laterales e interiores son esenciales para detectar defectos
que una vista frontal oculta.

------------------------------------------------------------------------

## 22. Grabación

Desde el inicio se solicitó grabar el recorrido.

Tecnología:

``` javascript
canvas.captureStream()
MediaRecorder
```

Objetivo:

``` text
iniciar grabación
→ viajar por escena
→ detener
→ guardar vídeo
→ publicar en @astroenamorado
```

La marca `@astroenamorado` puede mostrarse sobre la escena.

------------------------------------------------------------------------

## 23. Errores históricos que no deben reintroducirse

``` text
controls.getObject is not a function
```

por diferencias de API de PointerLockControls.

``` text
Failed to resolve module specifier "three"
```

por imports/rutas de módulos.

``` text
Unexpected token ','
```

error sintáctico generado en una versión.

``` text
disposeDeep is not defined
```

función utilizada sin estar definida.

Otros defectos ya identificados:

- estrellas repetidas en planos;
- núcleo estelar negro;
- estrellas verdes artificiales;
- todas las estrellas iguales;
- starless con estrellas residuales;
- geometría como cristales apilados;
- geometría como cilindros/prismas;
- líneas rectas por triangulación;
- vectorización demasiado simple;
- recursos de IC434 contaminando imágenes nuevas.

------------------------------------------------------------------------

## 24. Versiones relevantes

### Etapas iniciales

- carga de imagen;
- Three.js;
- Pointer Lock;
- grabación;
- capas Z;
- estrellas repetidas.

### Etapa depth map

- mapa de profundidad;
- capas de gas;
- separación parcial.

### Etapa PSF

- detección de estrellas;
- tamaño;
- color;
- glow.

### Etapa meshes

- regiones;
- contornos;
- extrusión;
- problemas de paredes/triangulación.

### Etapa esferizada

- suavizado;
- volumen;
- turbulencia;
- glow;
- anidamiento.

### v10 ProcGen

- regreso a browser-only;
- ideas del artículo 2D Space Scene ProcGen;
- formas usadas como guía para gas procedural;
- eliminación del backend.

### v10.1 ProcGen AutoReset

- reset completo al cargar una nueva imagen;
- no conservar recursos de demos anteriores;
- recalcular PSF/starless/vector.

### v10.2 ImageTracer

- ImageTracerJS 1.2.6;
- raster → SVG de mayor fidelidad;
- controles de detalle;
- modo legacy;
- diagnósticos clicables;
- copiar/guardar diagnóstico;
- Reprocesar sticky.

------------------------------------------------------------------------

## 25. Arquitectura objetivo

``` text
                   ┌─────────────────────┐
                   │   Astrofotografía   │
                   └──────────┬──────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Image Analyzer    │
                    └─────────┬─────────┘
                              │
             ┌────────────────┴────────────────┐
             │                                 │
      ┌──────▼──────┐                   ┌──────▼──────┐
      │ PSF / Stars │                   │ Star Removal│
      └──────┬──────┘                   └──────┬──────┘
             │                                 │
      ┌──────▼──────┐                   ┌──────▼──────┐
      │ Star Catalog│                   │  Starless   │
      └──────┬──────┘                   └──────┬──────┘
             │                                 │
      ┌──────▼──────┐                   ┌──────▼──────┐
      │ Stars 3D    │                   │ Vector / SVG│
      │ core + glow │                   └──────┬──────┘
      └──────┬──────┘                          │
             │                          ┌──────▼──────┐
             │                          │Region/Depth │
             │                          └──────┬──────┘
             │                                 │
             │                          ┌──────▼──────┐
             │                          │Volume Builder│
             │                          │ProcGen/Gas   │
             │                          └──────┬──────┘
             │                                 │
             └───────────────┬─────────────────┘
                             │
                     ┌───────▼────────┐
                     │ THREE.js Scene │
                     └───────┬────────┘
                             │
                   ┌─────────▼──────────┐
                   │ Fly / Camera / Video│
                   └────────────────────┘
```

------------------------------------------------------------------------

## 26. Modularización futura

Conviene dividir `app.js` progresivamente:

``` text
src/
  main.js

  image/
    loader.js
    preprocessing.js
    psf.js
    starRemoval.js
    vectorizer.js
    posterize.js

  astronomy/
    plateSolve.js
    catalog.js
    starPhysics.js

  reconstruction/
    depth.js
    nebulaRegions.js
    galaxyModel.js
    volumeBuilder.js
    proceduralGas.js

  render/
    scene.js
    stars.js
    nebula.js
    shaders.js
    camera.js

  ui/
    controls.js
    diagnostics.js
    presets.js

  video/
    recorder.js
```

------------------------------------------------------------------------

## 27. Próximo salto: volumen real

El siguiente gran avance visual probablemente sea dejar de depender
tanto de meshes y avanzar hacia **volume rendering / ray marching**.

Conceptualmente:

``` glsl
density =
    regionMask(p)
  * fractalNoise(p)
  * turbulence(p)
  * depthProfile(p);
```

y:

``` glsl
emission =
    density
  * nebulaColor
  * emissionStrength;
```

Ventajas:

- gas atravesable;
- sin paredes poligonales;
- profundidad continua;
- filamentos;
- cavidades;
- iluminación volumétrica;
- integración de múltiples regiones.

------------------------------------------------------------------------

## 28. SVG como campo, no como sólido

Dirección recomendada:

``` text
SVG != objeto sólido final
SVG = descripción estructural
```

Un path puede definir:

- máscara;
- campo de influencia;
- densidad;
- distribución de partículas;
- color;
- emisión;
- absorción;
- límites aproximados.

Ejemplo:

``` text
región roja brillante
        ↓
máscara espacial
        ↓
gas H-alpha aproximado
        ↓
densidad + FBM
        ↓
emisión roja/magenta
```

Una región oscura puede convertirse en polvo absorbente en vez de una
superficie negra.

------------------------------------------------------------------------

## 29. Depth map

El brillo no debe convertirse mecánicamente en Z.

Una profundidad heurística puede combinar:

``` text
depth =
    a * luminance
  + b * colorFeature
  + c * regionScale
  + d * localContrast
  + e * nestingLevel
  + f * semanticClass
```

Ejemplos:

- halos grandes/difusos pueden envolver;
- regiones compactas pueden ocupar zonas internas;
- polvo oscuro puede situarse delante de emisión;
- reflexión azul puede recibir reglas diferentes a emisión roja.

------------------------------------------------------------------------

## 30. Limitación científica

Una astrofotografía es una proyección 2D. No contiene suficiente
información para recuperar de forma única la geometría física 3D real.

Por ello conviene distinguir:

### Modo artístico / inferido

Basado en:

- brillo;
- color;
- PSF;
- bordes;
- vectorización;
- heurísticas;
- procedural generation.

### Modo astrométrico / catálogo

Futuro, basado además en:

- plate solving;
- Gaia;
- paralajes;
- magnitudes;
- coordenadas;
- información conocida del objeto.

Nunca se debe presentar una profundidad puramente inferida desde la
fotografía como si fuera una medición astronómica real.

------------------------------------------------------------------------

## 31. Rendimiento

Las astrofotografías pueden contener millones de píxeles. No debe
intentarse convertir cada píxel en un voxel.

Enfoque:

``` text
imagen original
     ↓
resolución de análisis
     ↓
estructuras principales
     ↓
detalle procedural generado en GPU
```

El detalle debe surgir de shaders, ruido y campos volumétricos.

Posible LOD:

``` text
Lejos:
  starless + volumen simplificado

Medio:
  regiones volumétricas + estrellas

Cerca:
  ruido + partículas + filamentos

Dentro:
  ray marching local + polvo + glow
```

------------------------------------------------------------------------

## 32. Criterios visuales de éxito

### Vista frontal

Debe recordar fuertemente a la fotografía original.

### Vista lateral

No debe revelar placas rectangulares ni una pila de capas.

### Interior

Debe sentirse gas alrededor de la cámara.

### Estrellas

Deben mantener distribución, tamaño relativo y color aproximado.

### Fondo

No debe duplicar estrellas 3D.

### Nubes

Deben ser translúcidas, heterogéneas y volumétricas.

### Movimiento

La estructura debe mantener coherencia al atravesarla.

------------------------------------------------------------------------

## 33. Pruebas recomendadas

Cada versión importante debería probarse con:

- M42 / Orión;
- IC434 / Cabeza de Caballo;
- Estatua de la Libertad;
- una galaxia espiral;
- un campo estelar denso;
- estrellas saturadas;
- regiones oscuras prominentes.

Capturar siempre que sea posible:

``` text
Original
Starless
PSF mask
Vector SVG
Posterizado
Depth
Density
Vista frontal 3D
Vista lateral 3D
Vista interior
```

------------------------------------------------------------------------

## 34. Métricas futuras

### PSF

- número de estrellas;
- FWHM medio;
- elongación;
- distribución de tamaños.

### Starless

- residuo estelar;
- pérdida de nebulosidad.

### Vector

- cantidad de paths;
- error raster vs SVG;
- cobertura;
- complejidad;
- vértices.

### Render

- FPS;
- draw calls;
- triángulos;
- memoria GPU;
- partículas;
- pasos de ray marching.

------------------------------------------------------------------------

## 35. Prioridades siguientes

1.  Validar ImageTracer con varias nebulosas y galaxias.
2.  Mejorar starless browser-only.
3.  Mejorar clasificación PSF y color estelar.
4.  Evitar estrellas verdes falsas.
5.  Crear tratamiento diferente para nebulosas y galaxias.
6.  Generar mapas explícitos de Depth y Density.
7.  Utilizar SVG como máscara/campo en vez de simple mesh.
8.  Implementar volumen procedural continuo.
9.  Investigar ray marching.
10. Mejorar Bloom y emisión.
11. Integrar opcionalmente plate solving/catálogos.
12. Crear presets automáticos según tipo de objeto.
13. Optimizar LOD/rendimiento.
14. Mejorar exportación de vídeo para redes sociales.

------------------------------------------------------------------------

## 36. Reglas para continuar el proyecto

Un agente/LLM que continúe el desarrollo debe respetar estas decisiones:

1.  **No volver a múltiples copias de la imagen en planos Z.**
2.  Separar estrellas y nebulosa.
3.  Mantener un fondo starless.
4.  Las estrellas necesitan PSF, tamaño, color, núcleo luminoso y glow.
5.  No generar estrellas verdes por ruido cromático.
6.  El SVG es una representación intermedia importante.
7.  La vectorización debe conservar estructuras complejas.
8.  No convertir cada path simplemente en un prisma.
9.  Usar paths como dominios para gas procedural/volumétrico.
10. Preferir estructuras anidadas a un orden lineal en Z.
11. Las nubes requieren transparencia, emisión, glow y turbulencia.
12. La escena debe funcionar desde vistas frontales, laterales e
    interiores.
13. Mantener diagnósticos accesibles y copiables.
14. Mantener `Reprocesar` sticky.
15. Resetear derivados al cargar una nueva imagen.
16. Nebulosas y galaxias probablemente necesitan pipelines diferentes.
17. Mantener browser-only salvo decisión explícita de cambiar
    arquitectura.
18. Verificar PSF/Starless/SVG antes de intentar compensar errores en
    3D.
19. El objetivo central es **viajar por la reconstrucción**, no sólo
    producir una imagen estática.
20. El recorrido debe poder grabarse como vídeo.

------------------------------------------------------------------------

## 37. Referencias estudiadas

### 2D Space Scene ProcGen

``` text
https://wwwtyro.net/2016/10/22/2D-space-scene-procgen.html
```

Aporte al proyecto: procedural generation, ruido y enriquecimiento de
estructuras espaciales.

### StarNet

``` text
https://github.com/nekitmm/starnet
```

Aporte conceptual: separación especializada entre estrellas y
fondo/starless.

### ImageTracerJS

Usado desde v10.2 para raster → SVG de mayor fidelidad.

------------------------------------------------------------------------

## 38. Estado actual resumido

Actualmente el proyecto:

- funciona en navegador;
- carga astrofotografías;
- genera PSF mask;
- genera una aproximación starless;
- modela estrellas 3D;
- aplica glow;
- vectoriza la imagen starless;
- usa ImageTracerJS en v10.2;
- acepta SVG como fuente estructural;
- genera gas procedural;
- permite navegar;
- posee infraestructura de grabación;
- muestra diagnósticos;
- permite abrir/copiar/guardar diagnósticos;
- mantiene Reprocesar accesible;
- resetea recursos al cambiar de imagen.

Áreas todavía abiertas:

- starless de mayor calidad;
- color/PSF estelar más robusto;
- verdadera profundidad volumétrica;
- ray marching;
- tratamiento específico de galaxias;
- integración astrométrica opcional.

------------------------------------------------------------------------

# Principio rector

> **No queremos deformar una fotografía para que parezca 3D; queremos
> analizar la fotografía y utilizarla para construir una nueva escena
> tridimensional navegable.**

Ese principio debe guiar las siguientes versiones de **ThreeJS-NebulaFly
/ AstroEnamorado 3D**.
