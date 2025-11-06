#!/bin/bash

# 🎵 Script de Automação Completa
# Executa todas as etapas de enriquecimento e seed

echo "🎵 =========================================="
echo "   SOL - Script de Enriquecimento Completo"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na pasta sol-backend${NC}"
    exit 1
fi

# Verificar variáveis de ambiente
if [ -z "$SPOTIFY_CLIENT_ID" ] || [ -z "$SPOTIFY_CLIENT_SECRET" ]; then
    echo -e "${RED}❌ Erro: SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET não configurados${NC}"
    echo "Configure seu .env e tente novamente"
    exit 1
fi

echo -e "${GREEN}✅ Variáveis de ambiente OK${NC}"
echo ""

# Etapa 1: Enriquecer dados
echo -e "${YELLOW}📊 ETAPA 1: Enriquecendo dados musicais...${NC}"
echo "Isto pode levar 15-30 minutos..."
echo ""

npm run data:enrich
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao enriquecer dados${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Enriquecimento concluído${NC}"
echo ""

# Etapa 2: Mesclar dados
echo -e "${YELLOW}🔄 ETAPA 2: Mesclando dados...${NC}"
echo ""

npm run data:merge
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao mesclar dados${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Mesclagem concluída${NC}"
echo ""

# Etapa 3: Seed do banco
echo -e "${YELLOW}💾 ETAPA 3: Populando banco de dados...${NC}"
echo ""

npm run db:seed
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao popular banco${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Seed concluída${NC}"
echo ""

# Etapa 4: Verificação
echo -e "${YELLOW}✅ ETAPA 4: Verificando resultado...${NC}"
echo ""

npm run db:check

echo ""
echo -e "${GREEN}🎉 =========================================="
echo "   ENRIQUECIMENTO CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo ""
echo "📊 Sistema pronto com ~17k músicas!"
echo "🚀 Execute: npm run dev"
echo -e "==========================================${NC}"
