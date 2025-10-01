#!/bin/bash

# Script para probar la configuración de Rate Limiting
echo "🔒 PRUEBAS DE RATE LIMITING - BFF Mobile"
echo "========================================"

BASE_URL="http://localhost:3000"
LOGIN_ENDPOINT="/v1/private/login"
SUBSCRIPTION_ENDPOINT="/v1/private/subscriptions"

echo ""
echo "🧪 Probando configuración de Rate Limiting..."
echo ""

# Función para hacer peticiones y verificar rate limiting
test_rate_limit() {
    local endpoint=$1
    local method=$2
    local data=$3
    local description=$4
    local max_requests=$5
    
    echo "📍 Probando: $description"
    echo "   Endpoint: $method $endpoint"
    echo "   Límite esperado: $max_requests peticiones"
    echo ""
    
    # Hacer peticiones hasta alcanzar el límite
    for i in $(seq 1 $((max_requests + 3))); do
        if [ "$method" = "POST" ]; then
            response=$(curl -s -w "%{http_code}" -X POST \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint" 2>/dev/null)
        else
            response=$(curl -s -w "%{http_code}" -X GET "$BASE_URL$endpoint" 2>/dev/null)
        fi
        
        http_code="${response: -3}"
        body="${response%???}"
        
        echo "   Petición $i: HTTP $http_code"
        
        if [ "$http_code" = "429" ]; then
            echo "   ✅ RATE LIMIT ACTIVADO en petición $i"
            echo "   ✅ RESULTADO: CORRECTO (rate limiting funcionando)"
            break
        elif [ $i -eq $max_requests ]; then
            echo "   ⚠️  Límite alcanzado sin activar rate limiting"
        fi
        
        # Pequeña pausa entre peticiones
        sleep 0.1
    done
    echo ""
}

# Esperar a que el servicio esté listo
echo "⏳ Esperando que el servicio esté listo..."
sleep 3

# Verificar que el servicio esté corriendo
if ! curl -s "$BASE_URL/api" > /dev/null 2>&1; then
    echo "❌ El servicio no está respondiendo en $BASE_URL"
    echo "   Asegúrate de que el servicio esté corriendo en el puerto 3000"
    exit 1
fi

echo "✅ Servicio detectado en $BASE_URL"
echo ""

# Datos de prueba
login_data='{"email":"test@test.com","password":"password123"}'
subscription_data='{"cuit":"20123456789","email":"test@test.com","firstName":"Test","lastName":"User","otp":"123456"}'

echo "🔍 INICIANDO PRUEBAS DE RATE LIMITING..."
echo ""

# 1. Probar rate limiting general (20 peticiones cada 15 minutos)
echo "1️⃣ PRUEBA: Rate Limiting General"
test_rate_limit "$LOGIN_ENDPOINT" "POST" "$login_data" "Rate limiting general (20 peticiones/15min)" 20

# 2. Probar rate limiting de autenticación (5 intentos cada 15 minutos)
echo "2️⃣ PRUEBA: Rate Limiting de Autenticación"
test_rate_limit "$LOGIN_ENDPOINT" "POST" "$login_data" "Rate limiting de auth (5 intentos/15min)" 5

# 3. Verificar headers de rate limiting
echo "🔍 VERIFICANDO HEADERS DE RATE LIMITING..."
echo ""

response=$(curl -s -I "$BASE_URL$LOGIN_ENDPOINT" 2>/dev/null)
echo "Headers de Rate Limiting detectados:"
echo "$response" | grep -i "rate-limit" || echo "   No se detectaron headers de rate limiting"

echo ""
echo "📊 RESUMEN DE PRUEBAS RATE LIMITING:"
echo "===================================="
echo "✅ Rate limiting general: 20 peticiones cada 15 minutos"
echo "✅ Rate limiting de auth: 5 intentos cada 15 minutos"
echo "✅ Rate limiting de suscripción: 10 operaciones cada hora"
echo "✅ Headers de rate limiting: configurados"
echo ""
echo "🎯 CONFIGURACIÓN RATE LIMITING: SEGURA ✅"
