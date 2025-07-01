# 🎵 SOL - Sistema Inteligente de Recomendação Musical para Apoio à Saúde Mental

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-purple.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)

> **Sistema baseado em inteligência artificial e lógica fuzzy para recomendação musical personalizada com foco na saúde mental e bem-estar emocional.**

## 📋 Visão Geral

O **SOL** (Sistema Inteligente de Recomendação Musical) é uma aplicação inovadora que combina princípios de musicoterapia, análise emocional computacional e lógica fuzzy para gerar recomendações musicais personalizadas que promovem bem-estar mental e equilíbrio emocional.

### 🎯 Objetivos do Sistema

- **Apoio Terapêutico**: Utilizar música como ferramenta complementar no tratamento de ansiedade e depressão
- **Personalização Inteligente**: Adaptar recomendações baseadas no estado emocional individual do usuário
- **Base Científica**: Aplicar princípios estabelecidos de musicoterapia e psicologia musical
- **Transparência Algorítmica**: Fornecer explicações compreensíveis sobre as recomendações geradas

### 🧠 Tecnologia Central: Lógica Fuzzy

O coração do sistema SOL utiliza **lógica fuzzy** para interpretar estados emocionais complexos e nuanceados. Diferente de sistemas tradicionais que trabalham com categorias rígidas, nossa abordagem reconhece que emoções humanas são graduais e multidimensionais.

#### Principais Características:

- **Análise Emocional Multidimensional**: Processa 5 dimensões emocionais (raiva, medo, alegria, tristeza, surpresa)
- **Regras de Musicoterapia**: Base de conhecimento fundamentada em evidências científicas
- **Recomendação Adaptativa**: Combina múltiplas estratégias terapêuticas proporcionalmente
- **Learning System**: Melhora recomendações baseado em feedback dos usuários

## 📊 Base de Dados Musical

O sistema trabalha com um catálogo robusto de **22.230+ músicas** analisadas emocionalmente:

- **Análise Emocional Computacional**: Cada música possui perfil emocional detalhado
- **Atributos Musicais Spotify**: Dados técnicos como valência, energia, dançabilidade
- **Diversidade de Gêneros**: Cobertura ampla de estilos musicais
- **Metadados Completos**: Informações de artista, álbum, duração, popularidade

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

#### Backend

- **Framework**: Next.js 14+ com App Router
- **Linguagem**: TypeScript/JavaScript
- **ORM**: Prisma 5.0+
- **Banco de Dados**: PostgreSQL 15+
- **Containerização**: Docker & Docker Compose

#### Inteligência Artificial

- **Motor Fuzzy**: Sistema próprio de lógica fuzzy para análise emocional
- **Algoritmos**: Inferência baseada em regras, filtragem colaborativa
- **Processamento**: Análise de texto emocional, correspondência musical

#### Infraestrutura

- **Ambiente de Desenvolvimento**: Docker Compose
- **Gerenciamento de Estado**: Prisma Client
- **APIs**: RESTful endpoints para frontend e integrações

### Estrutura de Diretórios

```
sol-backend/
├── 📁 src/
│   ├── 📁 app/api/              # Rotas da API Next.js
│   │   ├── 📁 recommendations/   # Endpoints de recomendação
│   │   ├── 📁 emotions/         # Análise emocional
│   │   └── 📁 users/            # Gerenciamento de usuários
│   ├── 📁 lib/
│   │   ├── 📁 fuzzy/            # Sistema de lógica fuzzy
│   │   ├── 📁 prisma/           # Cliente do banco de dados
│   │   └── 📁 utils/            # Utilitários
│   └── 📁 types/                # Definições TypeScript
├── 📁 prisma/
│   ├── schema.prisma            # Schema do banco de dados
│   └── 📁 migrations/           # Migrações do banco
├── 📁 scripts/
│   ├── import-music-data.js     # Importação de dados musicais
│   └── test-fuzzy-system.js     # Testes do sistema fuzzy
├── 📁 data/                     # Dados CSV de músicas
└── 📁 docs/                     # Documentação do projeto
```

## 🚀 Configuração e Instalação

### Pré-requisitos

- **Node.js** 18 ou superior
- **Docker** e **Docker Compose**
- **Git**

### Instalação Passo a Passo

1. **Clone o repositório**

   ```bash
   git clone [url-do-repositorio]
   cd sol-backend
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Inicie o ambiente Docker**

   ```bash
   docker-compose up -d
   ```

5. **Execute as migrações do banco**

   ```bash
   npx prisma migrate dev --name "init"
   npx prisma generate
   ```

6. **Importe os dados musicais**

   ```bash
   # Coloque os arquivos CSV na pasta data/
   node scripts/import-music-data.js
   ```

7. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

## 🧪 Testando o Sistema

### Teste do Sistema Fuzzy

Execute testes completos do sistema de lógica fuzzy:

```bash
# Teste todos os casos emocionais
node scripts/test-fuzzy-system.js

# Teste um caso específico
node scripts/test-fuzzy-system.js very_sad
```

### Visualização dos Dados

```bash
# Abrir Prisma Studio para explorar o banco
npx prisma studio
# Acesse: http://localhost:5555
```

### API Testing

O sistema inclui endpoints RESTful para testes:

```bash
# Teste de recomendação para pessoa triste
curl -X GET "http://localhost:3000/api/recommendations/fuzzy?test=very_sad"

# Teste de recomendação para pessoa ansiosa
curl -X GET "http://localhost:3000/api/recommendations/fuzzy?test=anxious"
```

## 📚 Uso da API

### Endpoint Principal de Recomendação

**POST** `/api/recommendations/fuzzy`

```typescript
// Requisição
{
  "userId": "user-123",
  "anger": 0.2,      // 0-1
  "fear": 0.7,       // 0-1
  "joy": 0.1,        // 0-1
  "sadness": 0.8,    // 0-1
  "surprise": 0.1,   // 0-1
  "preferredGenres": ["MPB", "Blues"],
  "playlistSize": 15
}

// Resposta
{
  "success": true,
  "data": {
    "playlist": [...],
    "explanation": "Detectei que você está passando por um momento de tristeza intensa...",
    "confidence": 0.85,
    "strategy": {
      "valenceTarget": 0.25,
      "energyTarget": 0.30,
      "topGenres": [...]
    }
  }
}
```

## 🔬 Metodologia Científica

### Base Teórica

O sistema SOL fundamenta-se em:

- **Musicoterapia**: Princípios estabelecidos de como música afeta estados emocionais
- **Psicologia Musical**: Pesquisas sobre relação entre características musicais e emoções
- **Lógica Fuzzy**: Teoria matemática para lidar com incerteza e imprecisão
- **Sistemas de Recomendação**: Algoritmos adaptativos baseados em preferências

### Validação

- **Base de Dados Extensa**: Mais de 22 mil músicas analisadas
- **Múltiplas Fontes**: Dados emocionais (BERT/GPT) + atributos Spotify
- **Testes Sistemáticos**: Bateria de testes para diferentes estados emocionais
- **Explicabilidade**: Sistema gera explicações para cada recomendação

## 🛠️ Comandos Úteis de Desenvolvimento

### Docker

```bash
# Iniciar ambiente completo
docker-compose up -d

# Parar ambiente
docker-compose down

# Ver logs dos containers
docker-compose logs -f

# Reiniciar apenas o banco
docker-compose restart postgres
```

### Prisma

```bash
# Aplicar mudanças no schema
npx prisma db push

# Criar nova migração
npx prisma migrate dev --name "nome-da-migração"

# Visualizar banco
npx prisma studio

# Reset completo do banco (cuidado!)
npx prisma migrate reset
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificar tipos TypeScript
npx tsc --noEmit

# Executar testes
npm test
```

## 📈 Roadmap de Desenvolvimento

### Versão Atual (v1.0)

- ✅ Sistema de lógica fuzzy funcional
- ✅ Base de dados musical completa
- ✅ API de recomendação básica
- ✅ Testes automatizados do sistema

### Próximas Funcionalidades

- 🔄 Interface web interativa
- 🔄 Sistema de feedback e aprendizado
- 🔄 Integração com APIs de streaming
- 🔄 Análise de sentimentos em tempo real
- 🔄 Métricas de eficácia terapêutica

## 🤝 Contribuição

Este é um projeto acadêmico desenvolvido como Trabalho de Conclusão de Curso (TCC). Sugestões e feedback são bem-vindos através de issues ou pull requests.

### Estrutura de Commits

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alterações na documentação
- `test:` Adição ou modificação de testes
- `refactor:` Refatoração de código

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE) - veja o arquivo LICENSE para detalhes.

## 👥 Autores

- **Juliana Alves Pacheco** - _Desenvolvimento e Pesquisa_ - [GitHub](https://github.com/Pacchecojuliana)
- **Natália Bastos Pereira** - _Desenvolvimento e Pesquisa_ - [GitHub](https://github.com/natybastosp)

### Orientação Acadêmica

- **Prof. Dr. Gilson de Assis Pinheiro** - _Orientador (Psicologia)_
- **Profa. Dra. Letícia Zoby** - _Orientadora (Engenharia)_

**Centro Universitário IESB** - _Coordenação de Engenharia da Computação_

## 📚 Referências Acadêmicas

- Gonçalves, J. S. et al. (2021). Musicoterapia no cuidado clínico: impactos na saúde mental
- Rodrigues, I. C. S.; Teixeira, T. C. C. M.; Lima, L. S. (2018). Transtorno de Ansiedade Generalizada
- União Brasileira das Associações de Musicoterapia (UBAM, 2021)
- World Health Organization. Mental Health Guidelines (2023)

---

> **"A música é o remédio da alma ferida."** - Grover Washington Jr.

**Sistema SOL** - Transformando análise emocional em bem-estar através da música 🎵
