# DATASETS.md

El usuario aportará imágenes de prueba.

## Estructura

```text
datasets/
  nebula/
  galaxy/
  cluster/
  starfield/
  comet/
  planet/
```

## Dataset mínimo recomendado

### Nebula

Idealmente 3–5 imágenes:

- nebulosa de emisión;
- nebulosa con polvo oscuro;
- nebulosa filamentaria;
- una con estrellas muy brillantes;
- una con gran rango dinámico.

Ejemplos conceptuales:

- M42 / Orión;
- IC434 / Cabeza de Caballo;
- NGC 3576 / Estatua de la Libertad;
- remanente filamentario.

### Galaxy

2–4 imágenes:

- espiral frontal;
- espiral inclinada;
- galaxia con dust lanes claras;
- núcleo brillante.

### Cluster

1–3 imágenes:

- cúmulo abierto;
- cúmulo globular;
- estrellas de distintos colores y tamaños.

### Starfield

- campo denso;
- estrellas saturadas;
- fondo con nebulosidad débil.

### Comet

- núcleo/coma claros;
- cola de polvo;
- si es posible cola iónica.

### Planet

- planeta con detalle superficial;
- planeta con atmósfera/limb;
- idealmente distintas fases/iluminación.

## Resoluciones

Guardar preferentemente:

- original de alta resolución;
- una copia de trabajo 2048 px lado mayor;
- opcional 1024 px para tests rápidos.

No reescalar destructivamente el original.

## Nombres

Usar nombres simples:

```text
m42_01.tif
m42_01.png
ngc3576_01.jpg
galaxy_spiral_01.png
cluster_globular_01.png
```

## Metadata opcional

Se puede acompañar cada imagen con JSON:

```json
{
  "id": "m42_01",
  "category": "nebula",
  "object": "M42",
  "source": "user",
  "notes": "bright core, strong H-alpha, dense stars"
}
```

## Licencias

Si se añaden imágenes externas:

- registrar origen;
- registrar licencia;
- evitar material que no permita uso en el repositorio.

## Golden images

Seleccionar 1 imagen representativa por categoría como `golden`.

Las golden images se usarán para:

- regresión visual;
- benchmarking;
- comparación entre arquitecturas;
- control de cambios.
