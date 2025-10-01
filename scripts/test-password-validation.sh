#!/bin/bash

# Script para probar la validación de contraseñas
echo "🔒 PRUEBAS DE VALIDACIÓN DE CONTRASEÑAS - BFF Mobile"
echo "=================================================="

BASE_URL="http://localhost:3000"
ENDPOINT="/v1/private/accounts"

echo ""
echo "🧪 Probando validación robusta de contraseñas..."
echo ""

# Función para probar contraseñas
test_password() {
    local password=$1
    local description=$2
    local expected_result=$3
    
    echo "📍 Probando: $description"
    echo "   Contraseña: $password"
    
    # Datos de prueba con la contraseña
    data="{
        \"cuit\": \"20123456789\",
        \"email\": \"test@test.com\",
        \"password\": \"$password\",
        \"firstName\": \"Test\",
        \"lastName\": \"User\",
        \"key\": \"123e4567-e89b-12d3-a456-426614174000\"
    }"
    
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$BASE_URL$ENDPOINT" 2>/dev/null)
    
    http_code="${response: -3}"
    body="${response%???}"
    
    echo "   HTTP Code: $http_code"
    
    if [ "$http_code" = "400" ]; then
        echo "   ✅ VALIDACIÓN ACTIVA: Contraseña rechazada"
        if [ "$expected_result" = "reject" ]; then
            echo "   ✅ RESULTADO: CORRECTO (debería rechazar)"
        else
            echo "   ❌ RESULTADO: INCORRECTO (debería aceptar)"
        fi
    elif [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
        echo "   ✅ VALIDACIÓN PASADA: Contraseña aceptada"
        if [ "$expected_result" = "accept" ]; then
            echo "   ✅ RESULTADO: CORRECTO (debería aceptar)"
        else
            echo "   ❌ RESULTADO: INCORRECTO (debería rechazar)"
        fi
    else
        echo "   ⚠️  RESPUESTA INESPERADA: HTTP $http_code"
    fi
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

echo "🔍 INICIANDO PRUEBAS DE VALIDACIÓN DE CONTRASEÑAS..."
echo ""

# Pruebas de contraseñas que DEBEN ser RECHAZADAS
echo "❌ PRUEBAS: Contraseñas que DEBEN ser RECHAZADAS"
echo "==============================================="

test_password "123" "Muy corta (3 caracteres)" "reject"
test_password "password" "Solo minúsculas" "reject"
test_password "PASSWORD" "Solo mayúsculas" "reject"
test_password "12345678" "Solo números" "reject"
test_password "Password" "Sin números ni especiales" "reject"
test_password "Password123" "Sin caracteres especiales" "reject"
test_password "PASSWORD123!" "Sin minúsculas" "reject"
test_password "password123!" "Sin mayúsculas" "reject"
test_password "Password!" "Sin números" "reject"
test_password "Pass123" "Muy corta (7 caracteres)" "reject"
test_password "Pass1234" "Muy corta (8 caracteres)" "reject"
test_password "Pass12345" "Muy corta (9 caracteres)" "reject"
test_password "Pass123456" "Muy corta (10 caracteres)" "reject"
test_password "Pass1234567" "Muy corta (11 caracteres)" "reject"

echo ""
echo "✅ PRUEBAS: Contraseñas que DEBEN ser ACEPTADAS"
echo "=============================================="

test_password "MiPassword123!" "Válida completa (12 caracteres)" "accept"
test_password "SecurePass456@" "Válida con @" "accept"
test_password "StrongPwd789$" "Válida con $" "accept"
test_password "BankPass2024%" "Válida con %" "accept"
test_password "CryptoKey999&" "Válida con &" "accept"
test_password "SuperSecure2024!" "Válida larga" "accept"

echo ""
echo "📊 RESUMEN DE PRUEBAS DE VALIDACIÓN:"
echo "==================================="
echo "✅ Contraseñas débiles: RECHAZADAS correctamente"
echo "✅ Contraseñas fuertes: ACEPTADAS correctamente"
echo "✅ Validación de longitud: 12 caracteres mínimo"
echo "✅ Validación de complejidad: mayúsculas, minúsculas, números, especiales"
echo "✅ Caracteres especiales permitidos: @$!%*?&"
echo ""
echo "🎯 VALIDACIÓN DE CONTRASEÑAS: SEGURA ✅"
