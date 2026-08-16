#!/usr/bin/env bash
set -e

echo "ThreeJS-NebulaFly Next bootstrap"

command -v git >/dev/null || { echo "Git no encontrado."; exit 1; }

if ! command -v node >/dev/null; then
  echo "Aviso: Node.js no encontrado. Instálalo antes de inicializar el frontend."
fi

if ! command -v python3 >/dev/null; then
  echo "Aviso: Python3 no encontrado. Es opcional, pero útil para QA/preprocessing."
fi

echo
echo "Siguientes pasos:"
echo "1. Copia v10.2 dentro de original/v10.2/"
echo "2. Copia CONOCIMIENTO_PROYECTO.md dentro de original/"
echo "3. Añade imágenes en datasets/"
echo "4. git add ."
echo '5. git commit -m "chore: initialize ThreeJS-NebulaFly Next workspace"'
echo "6. Abre VS Code y entrega CODEX_START_PROMPT.md a Codex."
