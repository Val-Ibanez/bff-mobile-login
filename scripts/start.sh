#!/bin/bash

# Script de inicio para BFF Mobile Login API

echo "🚀 Iniciando BFF Mobile Login API..."

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado. Copiando desde config.env..."
    cp config.env .env
fi

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Compilar el proyecto
echo "🔨 Compilando proyecto..."
npm run build

# Iniciar el servidor
echo "🌟 Iniciando servidor..."
npm run start:prod

