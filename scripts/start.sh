#!/bin/bash

echo "🚀 Iniciando BFF Mobile Login API..."

if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado. Copiando desde config.env..."
    cp config.env .env
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo "🔨 Compilando proyecto..."
npm run build

echo "🌟 Iniciando servidor..."
npm run start:prod

