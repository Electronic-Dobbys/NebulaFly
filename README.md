# ThreeJS-NebulaFly Next

Repositorio inicial para desarrollar una alternativa autónoma a **ThreeJS-NebulaFly / AstroEnamorado 3D**.

## Objetivo

Transformar una astrofotografía 2D en una escena 3D inmersiva, navegable y grabable.

La fotografía no debe deformarse simplemente para "parecer 3D". Debe analizarse y utilizarse como fuente para construir una escena nueva con estrellas, gas, polvo, emisión, absorción, estructuras volumétricas y profundidad inferida.

## Organización del repositorio

```text
ThreeJS-NebulaFly-Next/
├─ AGENTS.md
├─ MASTER_PROMPT.md
├─ CODEX_START_PROMPT.md
├─ ARCHITECTURE_NEXT.md
├─ QA.md
├─ ROADMAP.md
├─ DATASETS.md
├─ README.md
├─ .gitignore
├─ scripts/
│  ├─ bootstrap.ps1
│  └─ bootstrap.sh
├─ docs/
│  ├─ research.md
│  └─ decisions/
│     └─ README.md
├─ reports/
│  └─ README.md
├─ datasets/
│  ├─ nebula/
│  ├─ galaxy/
│  ├─ cluster/
│  ├─ starfield/
│  ├─ comet/
│  └─ planet/
├─ original/
│  └─ README.md
└─ nebula-next/
   ├─ README.md
   ├─ src/
   │  ├─ app/
   │  ├─ image/
   │  ├─ analysis/
   │  ├─ stars/
   │  ├─ reconstruction/
   │  ├─ volume/
   │  ├─ shaders/
   │  ├─ astronomy/
   │  ├─ render/
   │  ├─ navigation/
   │  ├─ recording/
   │  ├─ diagnostics/
   │  ├─ qa/
   │  └─ utils/
   └─ tests/
```

## Antes de iniciar Codex

1. Crea un repositorio Git vacío, por ejemplo `ThreeJS-NebulaFly-Next`.
2. Copia el contenido de este paquete a ese repositorio.
3. Copia la versión actual de ThreeJS-NebulaFly v10.2 dentro de `original/v10.2/`.
4. Copia el documento maestro de conocimiento dentro de `original/CONOCIMIENTO_PROYECTO.md`.
5. Añade tus imágenes de prueba según `DATASETS.md`.
6. Haz el primer commit.
7. Clona o abre el repositorio en Visual Studio Code.
8. Inicia Codex desde el repositorio.
9. Entrégale como primer mensaje el contenido de `CODEX_START_PROMPT.md`.

## Comandos Git sugeridos

```bash
git init
git add .
git commit -m "chore: initialize ThreeJS-NebulaFly Next research workspace"
git branch -M main
git remote add origin <TU_URL_GIT>
git push -u origin main
```

Luego:

```bash
git clone <TU_URL_GIT>
cd ThreeJS-NebulaFly-Next
code .
```

## Regla de seguridad del proyecto

`original/` es **READ ONLY**.

El agente puede leerlo, ejecutarlo y usarlo como baseline, pero no debe modificarlo.

Toda implementación nueva debe realizarse dentro de:

```text
nebula-next/
```

## Documentos principales

- `MASTER_PROMPT.md`: misión completa.
- `AGENTS.md`: reglas permanentes para Codex.
- `CODEX_START_PROMPT.md`: prompt corto para comenzar la primera sesión.
- `ARCHITECTURE_NEXT.md`: arquitectura candidata y decisiones.
- `QA.md`: ciclo autónomo de pruebas y mejora.
- `ROADMAP.md`: etapas de investigación/desarrollo.
- `DATASETS.md`: cómo preparar imágenes de prueba.
- `docs/research.md`: investigación técnica.
- `docs/decisions/`: ADRs/decisiones.
- `reports/`: resultados por iteración.

## Principio rector

> No queremos deformar una fotografía para que parezca 3D; queremos analizarla y utilizarla para construir una nueva escena tridimensional navegable.
