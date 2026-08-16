$ErrorActionPreference = "Stop"

Write-Host "ThreeJS-NebulaFly Next bootstrap"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git no encontrado."
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Warning "Node.js no encontrado. Instálalo antes de inicializar el frontend."
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Warning "Python no encontrado. Es opcional, pero útil para QA/preprocessing."
}

Write-Host ""
Write-Host "Siguientes pasos:"
Write-Host "1. Copia v10.2 dentro de original/v10.2/"
Write-Host "2. Copia CONOCIMIENTO_PROYECTO.md dentro de original/"
Write-Host "3. Añade imágenes en datasets/"
Write-Host "4. git add ."
Write-Host "5. git commit -m `"chore: initialize ThreeJS-NebulaFly Next workspace`""
Write-Host "6. Abre VS Code y entrega CODEX_START_PROMPT.md a Codex."
