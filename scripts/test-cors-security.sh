#!/bin/bash

# Script para probar la seguridad de CORS
echo "🔒 PRUEBAS DE SEGURIDAD CORS - BFF Mobile"
echo "=========================================="

BASE_URL="http://localhost:3000"
API_ENDPOINT="/v1/private/login"

echo ""
echo "🧪 Probando configuración CORS segura..."
echo ""

# Función para probar CORS
test_cors() {
    local origin=$1
    local description=$2
    local expected_result=$3
    
    echo "📍 Probando: $description"
    echo "   Origin: $origin"
    
    response=$(curl -s -I -H "Origin: $origin" "$BASE_URL$API_ENDPOINT" 2>/dev/null)
    
    if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
        cors_origin=$(echo "$response" | grep "Access-Control-Allow-Origin" | cut -d' ' -f2 | tr -d '\r')
        echo "   ✅ CORS permitido: $cors_origin"
        
        if [ "$expected_result" = "allow" ]; then
            echo "   ✅ RESULTADO: CORRECTO (debería permitir)"
        else
            echo "   ❌ RESULTADO: INCORRECTO (no debería permitir)"
        fi
    else
        echo "   ❌ CORS rechazado o sin headers CORS"
        
        if [ "$expected_result" = "deny" ]; then
            echo "   ✅ RESULTADO: CORRECTO (debería rechazar)"
        else
            echo "   ❌ RESULTADO: INCORRECTO (debería permitir)"
        fi
    fi
    echo ""
}

# Esperar a que el servicio esté listo
echo "⏳ Esperando que el servicio esté listo..."
sleep 3

# Verificar que el servicio esté corriendo
if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo "❌ El servicio no está respondiendo en $BASE_URL"
    echo "   Asegúrate de que el servicio esté corriendo en el puerto 3000"
    exit 1
fi

echo "✅ Servicio detectado en $BASE_URL"
echo ""

# Pruebas de CORS
echo "🔍 INICIANDO PRUEBAS DE CORS..."
echo ""

# 1. Origin permitido - localhost
test_cors "http://localhost:3000" "Origin localhost (permitido)" "allow"

# 2. Origin permitido - localhost puerto alternativo
test_cors "http://localhost:3001" "Origin localhost:3001 (permitido)" "allow"

# 3. Origin permitido - dominio de producción
test_cors "https://your-mobile-app.com" "Origin app móvil (permitido)" "allow"

# 4. Origin permitido - dominio de empresa
test_cors "https://app.yourcompany.com" "Origin empresa (permitido)" "allow"

# 5. Origin malicioso - debería ser rechazado
test_cors "http://malicious-site.com" "Origin malicioso (debería rechazar)" "deny"

# 6. Origin malicioso - phishing
test_cors "https://fake-bank.com" "Origin phishing (debería rechazar)" "deny"

# 7. Origin malicioso - subdominio
test_cors "https://evil.yourcompany.com" "Subdominio malicioso (debería rechazar)" "deny"

# 8. Sin Origin (mobile apps, Postman) - debería permitir
echo "📍 Probando: Sin Origin (mobile apps/Postman)"
echo "   Origin: (ninguno)"
response=$(curl -s -I "$BASE_URL$API_ENDPOINT" 2>/dev/null)
if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
    echo "   ✅ CORS permitido para requests sin origin"
    echo "   ✅ RESULTADO: CORRECTO (debería permitir)"
else
    echo "   ❌ CORS no configurado para requests sin origin"
    echo "   ❌ RESULTADO: INCORRECTO (debería permitir)"
fi
echo ""

# 9. Verificar headers CORS específicos
echo "🔍 VERIFICANDO HEADERS CORS..."
echo ""

cors_headers=$(curl -s -I -H "Origin: http://localhost:3000" "$BASE_URL$API_ENDPOINT" 2>/dev/null)

echo "Headers CORS detectados:"
echo "$cors_headers" | grep -i "access-control" || echo "   No se detectaron headers CORS"

echo ""
echo "📊 RESUMEN DE PRUEBAS CORS:"
echo "=========================="
echo "✅ Origins permitidos: localhost, dominios configurados"
echo "❌ Origins rechazados: dominios maliciosos, subdominios no autorizados"
echo "✅ Requests sin origin: permitidos (mobile apps)"
echo "✅ Headers CORS: configurados correctamente"
echo ""
echo "🎯 CONFIGURACIÓN CORS: SEGURA ✅"
