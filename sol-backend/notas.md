# 🎵 Sistema SOL - Sistema Inteligente de Recomendação Musical para Saúde Mental

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-24-2496ED?logo=docker)](https://www.docker.com/)

> Sistema baseado em Inteligência Artificial e Lógica Fuzzy para recomendação musical personalizada com foco na saúde mental, desenvolvido como TCC no Centro Universitário IESB.

## 📋 Sobre o Projeto

O **Sistema SOL** é uma aplicação inovadora que combina inteligência artificial, análise emocional e musicoterapia para auxiliar no tratamento complementar de ansiedade e depressão. O sistema analisa o estado emocional do usuário e recomenda músicas personalizadas baseadas em algoritmos de lógica fuzzy e características emocionais das faixas musicais.

### 🎯 Objetivos

- **Saúde Mental:** Apoio complementar no tratamento de ansiedade e depressão
- **Personalização:** Recomendações musicais adaptadas ao estado emocional
- **Acessibilidade:** Plataforma web gratuita e de fácil acesso
- **Cientificidade:** Baseado em princípios da musicoterapia e neurociência

## 🚀 Status Atual do Projeto

### ✅ **IMPLEMENTADO (70% Completo)**

#### 🏗️ **Infraestrutura Base**

- [x] Docker com PostgreSQL
- [x] Next.js 14 + TypeScript
- [x] Prisma ORM configurado
- [x] Sistema de autenticação JWT
- [x] Middleware de segurança

#### 🗄️ **Banco de Dados**

- [x] **2.184 músicas** com Spotify ID processadas
- [x] **~25 gêneros musicais** categorizados
- [x] **Scores emocionais** (BERT/GPT) por música
- [x] **Características de áudio** do Spotify
- [x] Schema completo (User, Music, EmotionalState, Playlist, Feedback)

#### 🔐 **APIs de Autenticação**

- [x] `POST /api/auth/register` - Registro de usuário
- [x] `POST /api/auth/login` - Login com JWT
- [x] `GET /api/auth/me` - Perfil do usuário (protegido)
- [x] `PUT /api/auth/me` - Atualizar perfil (protegido)

#### 🎵 **APIs de Música**

- [x] `GET /api/music/genres` - Listar gêneros musicais
- [x] `POST /api/music/genres` - Buscar músicas por gênero

### 🔜 **PRÓXIMAS FASES**

- [ ] **Spotify API Integration** (expandir para ~20.000 músicas)
- [ ] **Sistema de Análise Emocional** (questionários + captura)
- [ ] **Lógica Fuzzy** (processamento inteligente)
- [ ] **Sistema de Recomendação** (algoritmos híbridos)
- [ ] **Geração de Playlists** personalizadas
- [ ] **Sistema de Feedback** e aprendizado contínuo

## 🛠️ Tecnologias Utilizadas

### **Backend**

- **Next.js 14** - Framework React full-stack
- **TypeScript** - Tipagem estática
- **Prisma ORM** - Object-Relational Mapping
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **bcryptjs** - Hash de senhas

### **DevOps & Ferramentas**

- **Docker & Docker Compose** - Containerização
- **Axios** - Cliente HTTP
- **csv-parser** - Processamento de CSVs
- **Postman** - Testes de API

### **Dados & IA (Futuro)**

- **Lógica Fuzzy** - Processamento de incertezas
- **Spotify Web API** - Expansão do catálogo
- **Algoritmos de Recomendação** - ML/AI

## 📁 Estrutura do Projeto

```
sol-backend/
├── 📂 src/
│   ├── 📂 app/api/           # API Routes do Next.js
│   │   ├── 📂 auth/          # Endpoints de autenticação
│   │   │   ├── 📁 register/  # POST - Registro
│   │   │   ├── 📁 login/     # POST - Login
│   │   │   └── 📁 me/        # GET/PUT - Perfil
│   │   └── 📂 music/         # Endpoints musicais
│   │       └── 📁 genres/    # GET/POST - Gêneros
│   └── 📂 lib/               # Utilitários
│       ├── 📄 auth.ts        # JWT & validações
│       ├── 📄 prisma.ts      # Cliente Prisma
│       └── 📂 middleware/    # Middlewares
├── 📂 prisma/                # Database
│   ├── 📄 schema.prisma      # Schema do banco
│   └── 📄 seed.js           # População inicial
├── 📂 scripts/               # Scripts utilitários
│   ├── 📄 test-auth-apis.js  # Testes automatizados
│   ├── 📄 check-database.js  # Verificação do banco
│   └── 📄 list-genres.js     # Listar gêneros
├── 📂 data/                  # CSVs de dados
│   ├── 📄 emotion_music_data.csv
│   ├── 📄 emotion_music_data_original.csv
│   └── 📄 musicas_perifericas.csv
├── 📄 docker-compose.yml     # Configuração Docker
├── 📄 .env                   # Variáveis de ambiente
└── 📄 package.json           # Dependências
```

## ⚡ Início Rápido

### 📋 **Pré-requisitos**

- **Node.js** 18+
- **Docker** & **Docker Compose**
- **npm** ou **yarn**

### 🚀 **Instalação Completa (5 minutos)**

```bash
# 1. Clonar repositório
git clone [url-do-repositorio]
cd sol-backend

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Subir banco de dados
npm run docker:up

# 5. Configurar banco
npm run db:generate
npm run db:push
npm run db:seed

# 6. Iniciar servidor
npm run dev
```

### ✅ **Verificar Instalação**

```bash
# Terminal 1 - Servidor
npm run dev

# Terminal 2 - Testes
npm run test:auth
```

**Resultado esperado:**

```
🎉 Testes concluídos!
✅ POST /api/auth/register - Registro de usuário
✅ POST /api/auth/login - Login de usuário
✅ GET /api/auth/me - Informações do usuário
✅ PUT /api/auth/me - Atualização de perfil
✅ GET /api/music/genres - Lista de gêneros
✅ POST /api/music/genres - Músicas por gênero
```

## 📜 Scripts Disponíveis

### 🐳 **Docker & Banco**

```bash
npm run docker:up          # Subir PostgreSQL
npm run docker:down        # Parar containers
npm run docker:logs        # Ver logs do banco
npm run docker:clean       # Limpar containers

npm run db:generate        # Gerar cliente Prisma
npm run db:push           # Aplicar schema
npm run db:seed           # Popular com dados
npm run db:reset          # Resetar banco completo
npm run db:studio         # Interface visual (localhost:5555)
npm run db:check          # Verificar dados
```

### 🧪 **Testes & Desenvolvimento**

```bash
npm run dev               # Servidor desenvolvimento
npm run test:auth         # Testar autenticação
npm run test:debug        # Debug detalhado
npm run db:genres         # Listar gêneros musicais
npm run setup             # Setup completo automatizado
```

### 📊 **Análise de Dados**

```bash
npm run data:analyze      # Analisar CSVs
npm run db:missing-spotify # Ver músicas sem Spotify ID
npm run spotify:example   # Exemplo Spotify API
```

## 🔐 APIs Disponíveis

### **Base URL:** `http://localhost:3000/api`

### 🔑 **Autenticação**

#### **Registrar Usuário**

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123",
  "musicPreferences": ["Rock", "Pop", "MPB"]
}
```

#### **Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@exemplo.com",
  "password": "senha123"
}
```

#### **Perfil do Usuário** (Protegido)

```http
GET /api/auth/me
Authorization: Bearer {jwt_token}
```

### 🎵 **Música**

#### **Listar Gêneros**

```http
GET /api/music/genres
```

#### **Músicas por Gênero**

```http
POST /api/music/genres
Content-Type: application/json

{
  "genre": "Rock",
  "limit": 10,
  "offset": 0
}
```

## 📊 Dados do Sistema

### 🎵 **Catálogo Musical Atual**

- **2.184 músicas** processadas (com Spotify ID)
- **~25 gêneros** diferentes (Rock, Pop, MPB, Jazz, etc.)
- **Scores emocionais** por música (BERT/GPT):
  - Tristeza, Alegria, Raiva, Medo, Surpresa (0-1)
- **Características de áudio** (Spotify):
  - Danceability, Energy, Valence, Acousticness

### 📈 **Potencial de Expansão**

- **~20.000 músicas adicionais** identificadas nos CSVs
- **Spotify API** pode encontrar IDs faltantes
- **Expansão automática** do catálogo planejada

## 🔧 Configuração de Ambiente

### 📄 **Arquivo .env**

```bash
# Database
DATABASE_URL="postgresql://sol_user:sol_password@localhost:5432/sol_database?schema=public"

# JWT Configuration
JWT_SECRET="seu_jwt_secret_super_seguro_aqui"
JWT_EXPIRES_IN="7d"

# Spotify API (futuro)
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
PORT=3000
```

### 🐳 **Docker Compose**

- **PostgreSQL 15:** Porta 5432
- **pgAdmin:** http://localhost:8080
  - Email: `admin@sol.com`
  - Senha: `admin123`

## 🧪 Testando com Postman

### 📥 **Importar Coleção**

1. Criar nova coleção "SOL API"
2. Base URL: `http://localhost:3000`
3. Configurar Authorization: Bearer Token

### 🔄 **Fluxo de Teste**

1. **Registrar** usuário (`POST /api/auth/register`)
2. **Copiar token** da resposta
3. **Configurar** Authorization com token
4. **Testar** rotas protegidas (`GET /api/auth/me`)

## 🐛 Troubleshooting

### ❌ **Problemas Comuns**

#### **Docker não sobe**

```bash
# Verificar se Docker está rodando
sudo systemctl start docker

# Limpar containers antigos
npm run docker:clean
npm run docker:up
```

#### **Erro de porta 5432 em uso**

```bash
# Parar PostgreSQL local
sudo systemctl stop postgresql

# Ou usar porta diferente no docker-compose.yml
ports: ["5433:5432"]
```

#### **Banco não conecta**

```bash
# Verificar containers
docker ps

# Testar conexão
npm run db:test

# Recriar banco
npm run db:reset
```

#### **APIs retornam erro 500**

```bash
# Verificar logs do servidor
# Terminal onde roda npm run dev

# Verificar se tabelas existem
npm run db:push

# Testar conexão
npm run db:check
```

#### **Testes falhando**

```bash
# Debug detalhado
npm run test:debug

# Verificar se servidor está rodando
curl http://localhost:3000/api/auth/register
```

### 🔍 **Comandos de Debug**

```bash
# Status completo do sistema
docker ps && npm run db:check

# Verificar estrutura de arquivos
find src/app/api -name "*.ts" -type f

# Testar conexão simples
npm run db:test

# Ver logs do PostgreSQL
npm run docker:logs
```

## 👥 Equipe

### 🎓 **Desenvolvedoras**

- **Juliana Alves Pacheco** - Graduanda em Engenharia da Computação
- **Natália Bastos Pereira** - Graduanda em Engenharia da Computação

### 👨‍🏫 **Orientadores**

- **Prof. Dr. Gilson de Assis Pinheiro** - Psicologia
- **Profa. Dra. Leticia Zoby** - Engenharia Elétrica

### 🏫 **Instituição**

**Centro Universitário IESB** - Brasília/DF  
Coordenação de Engenharia/Ciência da Computação

## 📚 Referências Científicas

- **Gonçalves et al. (2021)** - Musicoterapia no cuidado clínico
- **UBAM (2021)** - Definições de musicoterapia
- **OMS (2023)** - Dados sobre saúde mental global
- **Spotify Web API** - Características de áudio musicais

## 🗺️ Roadmap

### 🎯 **Fase 2: Spotify Integration** (Próximo)

- [ ] Configurar credenciais Spotify Developer
- [ ] APIs de busca musical em tempo real
- [ ] Expansão automática do catálogo
- [ ] Sistema de cache inteligente

### 🎯 **Fase 3: Análise Emocional**

- [ ] Questionários de autoavaliação
- [ ] APIs de captura emocional
- [ ] Histórico emocional do usuário
- [ ] Dashboard de acompanhamento

### 🎯 **Fase 4: Lógica Fuzzy**

- [ ] Sistema de inferência fuzzy
- [ ] Processamento de incertezas emocionais
- [ ] Algoritmos de tomada de decisão
- [ ] Regras de negócio inteligentes

### 🎯 **Fase 5: Recomendação Inteligente**

- [ ] Algoritmos híbridos (colaborativo + conteúdo)
- [ ] Machine Learning para personalização
- [ ] Geração automática de playlists
- [ ] Sistema de feedback contínuo

## 📄 Licença

Este projeto é desenvolvido como **Trabalho de Conclusão de Curso (TCC)** no Centro Universitário IESB e destina-se a fins acadêmicos e de pesquisa em saúde mental e tecnologia.

## 🤝 Contribuição

Este é um projeto acadêmico em desenvolvimento. Para sugestões ou colaborações acadêmicas, entre em contato com a equipe através da instituição.

---

## 🚀 Como Continuar o Desenvolvimento

### ✅ **Checklist Antes de Desenvolver**

```bash
# 1. Verificar ambiente
npm run docker:up && npm run db:test

# 2. Subir servidor
npm run dev

# 3. Testar sistema
npm run test:auth
```

### 🎯 **Próximos Passos Sugeridos**

1. **Testar sistema atual** com `npm run test:auth`
2. **Escolher próxima fase:**
   - **A)** Spotify API Integration
   - **B)** Sistema de Análise Emocional
   - **C)** Lógica Fuzzy + Recomendação

### 📞 **Suporte**

- **Documentação:** `API_DOCUMENTATION.md`
- **Scripts:** `npm run` para ver todos os comandos
- **Logs:** `npm run docker:logs` para debug

---

**🎵 Sistema SOL - Transformando música em bem-estar através da tecnologia! 🚀**
