# 🌟 SOL - Sistema Inteligente de Recomendação Musical

> **Sistema de Recomendação Musical para Apoio à Saúde Mental**  
> Utilizando Inteligência Artificial e Musicoterapia para promover bem-estar emocional

---

## 📖 Sobre o Projeto

O **SOL** é uma aplicação web inovadora que combina **Inteligência Artificial**, **Lógica Fuzzy** e **Musicoterapia** para oferecer recomendações musicais personalizadas com foco na saúde mental. O sistema analisa o estado emocional do usuário e sugere playlists terapêuticas para auxiliar no manejo de condições como ansiedade e depressão.

### 🎯 Objetivos Principais

- **Personalização Emocional**: Recomendações baseadas no estado emocional atual
- **Acessibilidade**: Plataforma web disponível para todos
- **Musicoterapia**: Aplicação científica da música como ferramenta terapêutica
- **Monitoramento**: Acompanhamento da evolução emocional ao longo do tempo

---

## 🏗️ Arquitetura do Sistema

### **Componentes Principais**

```mermaid
graph TD
    A[👤 Entrada do Usuário] --> B[🧠 Análise Emocional IA]
    B --> C[🎵 Banco Musical Emocional]
    C --> D[🎯 Recomendação Personalizada]
    D --> E[🤖 Interface & Assistente Virtual]
    E --> F[📊 Feedback & Histórico]
    F --> B
```

1. **👤 Entrada do Usuário**: Coleta de dados emocionais e preferências musicais
2. **🧠 Análise Emocional**: Processamento via IA e Lógica Fuzzy
3. **🎵 Banco Musical**: Repositório de músicas classificadas emocionalmente
4. **🎯 Recomendação**: Algoritmos de filtragem colaborativa e baseada em conteúdo
5. **🤖 Interface**: Assistente virtual responsivo e intuitivo
6. **📊 Feedback**: Sistema de aprendizado contínuo

---

## 🔄 Fluxo do Usuário

### **🏠 Área Pública**

```
Landing Page → Usuário Logado? → [Sim] Dashboard
                              → [Não] Login/Cadastro
```

### **🔐 Autenticação**

```
Login: Email + Senha → Validação → Dashboard
Cadastro: Dados Básicos → Seleção de Gênero → Onboarding → Dashboard
```

### **🏡 Área Principal**

```
Dashboard → Menu Principal → [🤖 IA | 📊 Analytics | ⚙️ Config | 🚪 Logout]
```

### **🤖 Assistente IA**

```
Avaliação Emocional → Análise IA → Playlist Personalizada → Feedback → Histórico
```

### **⚙️ Configurações**

```
Painel Config → [👤 Perfil | 🔒 Segurança | 🎨 Preferências | 💳 Conta]
             → Editar Gênero (reutiliza componente do cadastro)
```

---

## 🛠️ Stack Tecnológica

### **Frontend** (`sol-frontend/`)

- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Roteamento**: React Router v7

### **Backend** (`sol-backend/`)

- **Framework**: Next.js 14 (API Routes)
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL 15
- **Autenticação**: JWT + bcryptjs
- **APIs Externas**: Spotify Web API

### **DevOps & Ferramentas**

- **Containerização**: Docker + Docker Compose
- **Administração DB**: pgAdmin
- **Cliente HTTP**: Axios
- **Processamento**: csv-parser

---

## 🚀 Como Executar

### **Pré-requisitos**

- Node.js 18+
- Docker & Docker Compose
- Conta Spotify Developer (para API)

### **1. Clone o Repositório**

```bash
git clone [repo-url]
cd sol-system
```

### **2. Configure as Variáveis de Ambiente**

**Backend** (`sol-backend/.env`):

```env
DATABASE_URL="postgresql://sol_user:sol_pass@localhost:5432/sol_db"
JWT_SECRET="your-jwt-secret-key"
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
```

**Frontend** (`sol-frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### **3. Suba os Serviços**

```bash
# Banco de dados
docker-compose up -d postgres pgadmin

# Backend
cd sol-backend
npm install
npx prisma migrate dev
npm run dev  # Porta 3001

# Frontend
cd sol-frontend
npm install
npm run dev  # Porta 3000
```

### **4. Acesse a Aplicação**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **pgAdmin**: http://localhost:8080

---

## 📁 Estrutura Atual do Projeto

```
sol-system/
├── 📂 sol-backend/              # Backend API
│   ├── 📂 src/app/api/         # Endpoints da API
│   │   ├── 📁 auth/            # ✅ Autenticação
│   │   ├── 📁 music/           # ✅ Gestão musical
│   │   └── 📁 spotify/         # ✅ Integração Spotify
│   ├── 📂 prisma/              # ✅ Schema do banco
│   └── 📂 data/                # ✅ Datasets musicais
├── 📂 sol-frontend/            # Frontend Web
│   ├── 📂 app/routes/          # Páginas atuais
│   │   ├── 📄 home.tsx         # ✅ Fluxo principal
│   │   └── 📄 sol.tsx          # ❌ Monolítico (refatorar)
│   └── 📂 app/components/      # Componentes atuais
└── 📂 docs/                    # ✅ Documentação acadêmica
```

---

## 🎯 Funcionalidades Implementadas

### **✅ Concluídas**

- [x] Autenticação JWT (registro/login)
- [x] Banco de dados PostgreSQL + Prisma
- [x] Integração Spotify API
- [x] Interface básica de login/cadastro
- [x] Seleção de preferências musicais
- [x] Avaliação emocional básica
- [x] Geração de playlist simples

### **🚧 Em Desenvolvimento**

- [ ] Refatoração da estrutura frontend
- [ ] Implementação do fluxo organizado
- [ ] Sistema de roteamento adequado
- [ ] Componentes reutilizáveis
- [ ] Dashboard interativo

### **📋 Próximas Funcionalidades**

- [ ] Algoritmo de Lógica Fuzzy
- [ ] IA para análise emocional avançada
- [ ] Histórico emocional e gráficos
- [ ] Sistema de feedback inteligente
- [ ] Assistente virtual conversacional
- [ ] PWA (Progressive Web App)

---

## 🔄 Próximos Passos de Refatoração

### **Fase 1: Reorganização Estrutural** ⏳

1. **Criar estrutura modular de componentes**
2. **Implementar roteamento adequado**
3. **Extrair componentes reutilizáveis**
4. **Organizar estado global**

### **Fase 2: Funcionalidades Avançadas**

1. **Implementar Lógica Fuzzy**
2. **Desenvolver IA de análise emocional**
3. **Criar dashboard interativo**
4. **Implementar histórico emocional**

### **Fase 3: Otimização e Deploy**

1. **Testes automatizados**
2. **Otimização de performance**
3. **Deploy em produção**
4. **Monitoramento e analytics**

---

## 🤝 Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

---

## 📚 Documentação Adicional

- **📖 [Artigo Acadêmico](./docs/TCC1_Artigo_SOL.pdf)**: Fundamentação teórica e metodologia
- **🏗️ [Arquitetura do Sistema](./docs/arquitetura.md)**: Detalhes técnicos da arquitetura
- **🎵 [Banco Musical](./docs/banco-musical.md)**: Classificação emocional das músicas
- **🧠 [Lógica Fuzzy](./docs/logica-fuzzy.md)**: Implementação da análise emocional

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

- **Desenvolvimento**: J. A. Pacheco, N. B. Pereira
- **Orientação**: L. T. M. Zoby
- **Co-Orientação**: G. de A. Pinheiro
- **Instituição**: Centro Universitário IESB

---

## 📞 Contato

Para dúvidas ou sugestões sobre o projeto SOL:

- **📧 Email**: [contato@projeto-sol.com]
- **🐙 GitHub**: [link-do-repositorio]
- **📱 Issues**: Use a aba Issues deste repositório

---

<div align="center">

**🌟 Transformando emoções em harmonia através da tecnologia 🎵**

</div>
