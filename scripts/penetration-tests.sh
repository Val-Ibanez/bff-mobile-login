#!/bin/bash

echo "========================================="
echo "PRUEBAS DE PENETRACIÓN - BFF MOBILE"
echo "========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo "🔍 1. VERIFICANDO HEADERS DE SEGURIDAD"
echo "========================================="
echo ""

echo "📋 Headers de seguridad detectados:"
HEADERS=$(curl -sI $BASE_URL | grep -E "(X-|Strict-|Content-Security|Referrer-Policy|Origin-Agent-Cluster|Cross-Origin)")
echo "$HEADERS"
echo ""

# Verificar headers críticos
if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    echo -e "${GREEN}✓ X-Content-Type-Options presente${NC}"
else
    echo -e "${RED}✗ X-Content-Type-Options ausente${NC}"
fi

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✓ X-Frame-Options presente${NC}"
else
    echo -e "${RED}✗ X-Frame-Options ausente${NC}"
fi

if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
    echo -e "${GREEN}✓ Strict-Transport-Security presente${NC}"
else
    echo -e "${RED}✗ Strict-Transport-Security ausente${NC}"
fi

if echo "$HEADERS" | grep -q "Content-Security-Policy"; then
    echo -e "${GREEN}✓ Content-Security-Policy presente${NC}"
else
    echo -e "${RED}✗ Content-Security-Policy ausente${NC}"
fi

echo ""
echo "🌐 2. VERIFICANDO CORS"
echo "========================================="
echo ""

echo "📋 Probando CORS desde origen malicioso:"
CORS_RESPONSE=$(curl -sI -H "Origin: http://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS $BASE_URL/v1/private/login)
  
if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${RED}✗ VULNERABILIDAD: CORS permite orígenes no autorizados${NC}"
    echo "$CORS_RESPONSE" | grep "Access-Control-Allow-Origin"
else
    echo -e "${GREEN}✓ CORS configurado correctamente${NC}"
fi

echo ""
echo "🚦 3. VERIFICANDO RATE LIMITING"
echo "========================================="
echo ""

echo "📋 Enviando 15 peticiones rápidas..."
SUCCESS_COUNT=0
for i in {1..15}; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/v1/private/login \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"test"}')
    
    if [ "$RESPONSE" = "429" ]; then
        echo -e "${GREEN}✓ Rate limiting activado en petición $i (HTTP 429)${NC}"
        break
    elif [ $i -eq 15 ]; then
        echo -e "${YELLOW}⚠ Rate limiting no se activó después de 15 peticiones${NC}"
    fi
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
done

echo "Peticiones exitosas antes de rate limit: $SUCCESS_COUNT"
echo ""

echo "🔓 4. VERIFICANDO VALIDACIÓN DE ENTRADA - XSS"
echo "========================================="
echo ""

echo "📋 Intentando XSS en email:"
XSS_RESPONSE=$(curl -s -X POST $BASE_URL/v1/private/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>@test.com","password":"test"}')

if echo "$XSS_RESPONSE" | grep -q "script"; then
    echo -e "${RED}✗ VULNERABILIDAD: Script no sanitizado en respuesta${NC}"
else
    echo -e "${GREEN}✓ XSS bloqueado correctamente${NC}"
fi

echo ""
echo "💉 5. VERIFICANDO VALIDACIÓN DE ENTRADA - SQL INJECTION"
echo "========================================="
echo ""

echo "📋 Intentando SQL Injection en password:"
SQL_RESPONSE=$(curl -s -X POST $BASE_URL/v1/private/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test'\'' OR 1=1 --"}')

if echo "$SQL_RESPONSE" | grep -q "accessToken"; then
    echo -e "${RED}✗ VULNERABILIDAD CRÍTICA: SQL Injection posible${NC}"
else
    echo -e "${GREEN}✓ SQL Injection bloqueado${NC}"
fi

echo ""
echo "🍃 6. VERIFICANDO VALIDACIÓN DE ENTRADA - NoSQL INJECTION"
echo "========================================="
echo ""

echo "📋 Intentando NoSQL Injection:"
NOSQL_RESPONSE=$(curl -s -X POST $BASE_URL/v1/private/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":{"$ne":null}}')

if echo "$NOSQL_RESPONSE" | grep -q "accessToken"; then
    echo -e "${RED}✗ VULNERABILIDAD CRÍTICA: NoSQL Injection posible${NC}"
else
    echo -e "${GREEN}✓ NoSQL Injection bloqueado${NC}"
fi

echo ""
echo "🔑 7. VERIFICANDO VALIDACIÓN JWT"
echo "========================================="
echo ""

echo "📋 Probando JWT con algoritmo 'none':"
JWT_NONE="eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."
JWT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $JWT_NONE" $BASE_URL/v1/private/subscriptions)

if [ "$JWT_RESPONSE" = "401" ] || [ "$JWT_RESPONSE" = "403" ]; then
    echo -e "${GREEN}✓ JWT con algoritmo 'none' rechazado (HTTP $JWT_RESPONSE)${NC}"
else
    echo -e "${RED}✗ VULNERABILIDAD CRÍTICA: JWT con algoritmo 'none' aceptado (HTTP $JWT_RESPONSE)${NC}"
fi

echo ""
echo "📊 8. VERIFICANDO ENDPOINTS EXPUESTOS"
echo "========================================="
echo ""

echo "📋 Endpoints en Swagger:"
SWAGGER_RESPONSE=$(curl -s $BASE_URL/api-json)
if echo "$SWAGGER_RESPONSE" | grep -q "paths"; then
    echo -e "${GREEN}✓ Swagger disponible en /api${NC}"
    echo "$SWAGGER_RESPONSE" | jq -r '.paths | keys[]' 2>/dev/null || echo "No se pudo parsear JSON"
else
    echo -e "${YELLOW}⚠ Swagger no disponible${NC}"
fi

echo ""
echo "✅ 9. VERIFICANDO VALIDACIÓN DE DATOS"
echo "========================================="
echo ""

echo "📋 Probando creación de cuenta con datos inválidos:"
INVALID_DATA_RESPONSE=$(curl -s -X POST $BASE_URL/v1/private/accounts \
  -H "Content-Type: application/json" \
  -d '{"cuit":"123","email":"invalid","password":"short"}')

if echo "$INVALID_DATA_RESPONSE" | grep -q "validation\|error\|message"; then
    echo -e "${GREEN}✓ Validación de datos funcionando${NC}"
else
    echo -e "${RED}✗ Validación de datos débil o ausente${NC}"
fi

echo ""
echo "========================================="
echo "RESUMEN DE PRUEBAS DE PENETRACIÓN"
echo "========================================="
echo ""
echo "Las pruebas han sido completadas. Revisa los resultados arriba."
echo "Los elementos marcados con ${RED}✗${NC} requieren atención inmediata."
echo "Los elementos marcados con ${YELLOW}⚠${NC} deben ser revisados."
echo "Los elementos marcados con ${GREEN}✓${NC} están configurados correctamente."
echo ""

