#!/bin/bash

# Script para testar endpoint /api/ai/analyze
# 
# Uso: bash test-fuzzy-api.sh [token]
# Exemplo: bash test-fuzzy-api.sh "seu-jwt-token-aqui"

API_URL="http://localhost:3000"
TOKEN="${1:-mock-token}"

echo "🚀 Testando integração Fuzzy"
echo "📍 URL: $API_URL/api/ai/analyze"
echo "🔐 Token: ${TOKEN:0:20}..."
echo ""

# Teste 1: Muito triste
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Teste 1: Muito triste e com medo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "$API_URL/api/ai/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sadness": 8,
    "joy": 2,
    "anger": 1,
    "fear": 7,
    "surprise": 2
  }' | jq '.'

echo ""
echo ""

# Teste 2: Muito alegre
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Teste 2: Muito alegre e energizado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "$API_URL/api/ai/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sadness": 1,
    "joy": 9,
    "anger": 2,
    "fear": 1,
    "surprise": 3
  }' | jq '.'

echo ""
echo ""

# Teste 3: Equilibrado
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Teste 3: Estado emocional equilibrado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "$API_URL/api/ai/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sadness": 5,
    "joy": 5,
    "anger": 5,
    "fear": 5,
    "surprise": 5
  }' | jq '.'

echo ""
echo ""

# Teste 4: Raivoso
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Teste 4: Raivoso e surpreso"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "$API_URL/api/ai/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sadness": 2,
    "joy": 3,
    "anger": 9,
    "fear": 2,
    "surprise": 8
  }' | jq '.'

echo ""
echo "✅ Testes finalizados!"
