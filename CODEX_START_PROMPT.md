# First Codex Session Prompt

You are working inside the repository **ThreeJS-NebulaFly Next**.

Read these files first, in this order:

1. `AGENTS.md`
2. `MASTER_PROMPT.md`
3. `README.md`
4. `ARCHITECTURE_NEXT.md`
5. `QA.md`
6. `ROADMAP.md`
7. `DATASETS.md`
8. `original/CONOCIMIENTO_PROYECTO.md` if present

Then inspect all source code under `original/` without modifying it.

Your first objective is **not** to immediately rewrite the application.

Perform the following autonomously:

1. inventory the original project;
2. identify how it is executed;
3. run it if possible;
4. map its actual image-processing and rendering pipeline;
5. identify important defects and technical debt;
6. create a baseline report with screenshots and performance observations;
7. inspect the available datasets;
8. research current technical alternatives;
9. propose 2–4 candidate architectures;
10. create or update `ARCHITECTURE_NEXT.md`;
11. select the most promising architecture based on evidence;
12. create the first minimal prototype under `nebula-next/`;
13. execute it;
14. test it;
15. generate `reports/iteration-001.md`;
16. continue with the next highest-value experiment while a measurable improvement is available.

You have authorization to:

- create and modify files under `nebula-next/`;
- create tests;
- install development dependencies needed by the new implementation;
- execute Node.js/npm tooling;
- execute Python where useful;
- run local development servers;
- use Playwright/Puppeteer or equivalent;
- create screenshots;
- run benchmarks;
- create branches and local commits;
- write documentation and reports.

Do not ask for approval for reversible technical decisions.

Do not modify `original/`.

Do not stop after planning or documentation. Implement, execute, inspect the result, measure it and iterate.

The objective is not to preserve the current implementation.

The objective is:

> Make an astronomical photograph feel like a place the user can enter, navigate and record.
