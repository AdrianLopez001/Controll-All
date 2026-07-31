# Script para iniciar o servidor local JC Eventos (Controll-All)
# Caso o Node.js não esteja instalado, o script baixa a versão portátil (.node) automaticamente.

$nodeDir = Join-Path $PSScriptRoot ".node"
$nodeZip = Join-Path $PSScriptRoot "node.zip"

if (-not (Test-Path $nodeDir)) {
    Write-Host "Node.js portátil não detectado localmente. Baixando Node.js v22.12.0..." -ForegroundColor Cyan
    $url = "https://nodejs.org/dist/v22.12.0/node-v22.12.0-win-x64.zip"
    try {
        Invoke-WebRequest -Uri $url -OutFile $nodeZip -ErrorAction Stop
        Write-Host "Download concluído. Extraindo arquivos..." -ForegroundColor Cyan
        Expand-Archive -Path $nodeZip -DestinationPath $PSScriptRoot -ErrorAction Stop
        Rename-Item -Path (Join-Path $PSScriptRoot "node-v22.12.0-win-x64") -NewName ".node" -ErrorAction Stop
        Remove-Item -Path $nodeZip -ErrorAction SilentlyContinue
        Write-Host "Node.js instalado com sucesso na pasta .node!" -ForegroundColor Green
    } catch {
        Write-Host "Erro ao configurar Node.js: $_" -ForegroundColor Red
        if (Test-Path $nodeZip) { Remove-Item $nodeZip }
        exit 1
    }
}

# Adiciona o diretório do Node.js portátil no PATH temporário desta sessão
$env:Path = "$nodeDir;" + $env:Path

# Limpa node_modules antigo para evitar problemas de compatibilidade de arquitetura/versão
if (Test-Path (Join-Path $PSScriptRoot "node_modules")) {
    Write-Host "Removendo pasta node_modules antiga para atualização..." -ForegroundColor Yellow
    Remove-Item -Path (Join-Path $PSScriptRoot "node_modules") -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $PSScriptRoot "package-lock.json") -Force -ErrorAction SilentlyContinue
}

Write-Host "Instalando dependências do projeto (npm install)..." -ForegroundColor Cyan
& npm install

Write-Host "Iniciando servidor de desenvolvimento local..." -ForegroundColor Green
& npm run dev
