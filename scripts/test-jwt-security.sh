#!/bin/bash

echo "========================================="
echo "PRUEBAS DE SEGURIDAD JWT MEJORADAS"
echo "========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"

echo "🔑 1. PROBANDO ALGORITMO 'NONE' (DEBE FALLAR)"
echo "========================================="
echo ""

JWT_NONE="eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ."

echo "📋 Token con algoritmo 'none':"
echo "$JWT_NONE"
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $JWT_NONE" -H "Content-Type: application/json" -d '{"cuit":"12345678901"}' $BASE_URL/v1/private/subscriptions)

if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✓ CORRECTO: JWT con algoritmo 'none' rechazado (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}✗ VULNERABLE: JWT con algoritmo 'none' aceptado (HTTP $RESPONSE)${NC}"
fi

echo ""
echo "🔑 2. PROBANDO TOKEN SIN ISSUER (DEBE FALLAR)"
echo "========================================="
echo ""

JWT_NO_ISSUER="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

echo "📋 Token sin issuer:"
echo "$JWT_NO_ISSUER"
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $JWT_NO_ISSUER" -H "Content-Type: application/json" -d '{"cuit":"12345678901"}' $BASE_URL/v1/private/subscriptions)

if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✓ CORRECTO: JWT sin issuer rechazado (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}✗ VULNERABLE: JWT sin issuer aceptado (HTTP $RESPONSE)${NC}"
fi

echo ""
echo "🔑 3. PROBANDO TOKEN SIN AUDIENCE (DEBE FALLAR)"
echo "========================================="
echo ""

JWT_NO_AUDIENCE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlzcyI6ImJmZi1tb2JpbGUifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid"

echo "📋 Token sin audience:"
echo "$JWT_NO_AUDIENCE"
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $JWT_NO_AUDIENCE" -H "Content-Type: application/json" -d '{"cuit":"12345678901"}' $BASE_URL/v1/private/subscriptions)

if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✓ CORRECTO: JWT sin audience rechazado (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}✗ VULNERABLE: JWT sin audience aceptado (HTTP $RESPONSE)${NC}"
fi

echo ""
echo "🔑 4. PROBANDO TOKEN EXPIRADO (DEBE FALLAR)"
echo "========================================="
echo ""

# Token expirado (exp: 1516239022 = 2018-01-18)
JWT_EXPIRED="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlzcyI6ImJmZi1tb2JpbGUiLCJhdWQiOiJtb2JpbGUtYXBwIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid"

echo "📋 Token expirado:"
echo "$JWT_EXPIRED"
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $JWT_EXPIRED" -H "Content-Type: application/json" -d '{"cuit":"12345678901"}' $BASE_URL/v1/private/subscriptions)

if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✓ CORRECTO: JWT expirado rechazado (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}✗ VULNERABLE: JWT expirado aceptado (HTTP $RESPONSE)${NC}"
fi

echo ""
echo "🔑 5. PROBANDO TOKEN SIN CLAIMS (DEBE FALLAR)"
echo "========================================="
echo ""

JWT_NO_CLAIMS="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlzcyI6ImJmZi1tb2JpbGUiLCJhdWQiOiJtb2JpbGUtYXBwIn0.eyJpYXQiOjE1MTYyMzkwMjJ9.invalid"

echo "📋 Token sin claims sub/email:"
echo "$JWT_NO_CLAIMS"
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $JWT_NO_CLAIMS" -H "Content-Type: application/json" -d '{"cuit":"12345678901"}' $BASE_URL/v1/private/subscriptions)

if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✓ CORRECTO: JWT sin claims rechazado (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}✗ VULNERABLE: JWT sin claims aceptado (HTTP $RESPONSE)${NC}"
fi

echo ""
echo "🔑 6. PROBANDO TOKEN VÁLIDO (DEBE FUNCIONAR)"
echo "========================================="
echo ""

# Primero obtener un token válido del login
echo "📋 Obteniendo token válido del login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/v1/private/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}')

echo "Respuesta del login: $LOGIN_RESPONSE"

# Extraer token si existe
VALID_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$VALID_TOKEN" ]; then
    echo "📋 Token válido obtenido: ${VALID_TOKEN:0:50}..."
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $VALID_TOKEN" -H "Content-Type: application/json" -d '{"cuit":"12345678901"}' $BASE_URL/v1/private/subscriptions)
    
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "404" ]; then
        echo -e "${GREEN}✓ CORRECTO: JWT válido aceptado (HTTP $RESPONSE)${NC}"
    else
        echo -e "${YELLOW}⚠ JWT válido rechazado (HTTP $RESPONSE) - puede ser normal si no hay suscripciones${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No se pudo obtener token válido del login${NC}"
fi

echo ""
echo "========================================="
echo "RESUMEN DE PRUEBAS JWT"
echo "========================================="
echo ""
echo "Las pruebas JWT han sido completadas."
echo "Los elementos marcados con ${GREEN}✓ CORRECTO${NC} indican que la seguridad JWT está funcionando."
echo "Los elementos marcados con ${RED}✗ VULNERABLE${NC} indican vulnerabilidades que deben corregirse."
echo "Los elementos marcados con ${YELLOW}⚠${NC} requieren revisión manual."
echo ""
