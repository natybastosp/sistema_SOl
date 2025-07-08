# 🔐 API de Autenticação - Sistema SOL

## 📋 Resumo dos Endpoints

| Método | Endpoint             | Descrição              | Auth Required |
| ------ | -------------------- | ---------------------- | ------------- |
| POST   | `/api/auth/register` | Registrar novo usuário | ❌            |
| POST   | `/api/auth/login`    | Fazer login            | ❌            |
| GET    | `/api/auth/me`       | Obter info do usuário  | ✅            |
| PUT    | `/api/auth/me`       | Atualizar perfil       | ✅            |
| GET    | `/api/music/genres`  | Listar gêneros         | ❌            |
| POST   | `/api/music/genres`  | Músicas por gênero     | ❌            |

## 🔑 Autenticação

### Formato do Token

```
Authorization: Bearer {jwt_token}
```

### Como obter o token

1. Registrar usuário em `/api/auth/register` ou
2. Fazer login em `/api/auth/login`
3. Usar o `token` retornado no header `Authorization`

---

## 📝 Endpoints Detalhados

### 1. Registrar Usuário

**POST** `/api/auth/register`

```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "minhasenha123",
  "musicPreferences": ["Rock", "Pop", "MPB"]
}
```

**Resposta de Sucesso (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "musicPreferences": ["Rock", "Pop", "MPB"],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Usuário registrado com sucesso"
}
```

**Erros Possíveis:**

- `400`: Dados inválidos
- `409`: Email já existe

---

### 2. Fazer Login

**POST** `/api/auth/login`

```json
{
  "email": "joao@exemplo.com",
  "password": "minhasenha123"
}
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "musicPreferences": ["Rock", "Pop", "MPB"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Login realizado com sucesso"
}
```

**Erros Possíveis:**

- `400`: Email/senha obrigatórios
- `401`: Credenciais inválidas

---

### 3. Obter Informações do Usuário

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "musicPreferences": ["Rock", "Pop", "MPB"],
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "stats": {
      "totalEmotionalStates": 5,
      "totalPlaylists": 3,
      "totalFeedbacks": 2
    },
    "lastEmotionalState": {
      "sadness": 3.0,
      "joy": 7.0,
      "anger": 2.0,
      "fear": 4.0,
      "surprise": 5.0,
      "createdAt": "2025-01-15T09:30:00Z"
    }
  }
}
```

**Erros Possíveis:**

- `401`: Token inválido/expirado
- `404`: Usuário não encontrado

---

### 4. Atualizar Perfil

**PUT** `/api/auth/me`

**Headers:**

```
Authorization: Bearer {token}
```

**Body:**

```json
{
  "name": "João Silva Santos",
  "musicPreferences": ["Jazz", "Blues", "Classical"]
}
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "João Silva Santos",
    "email": "joao@exemplo.com",
    "musicPreferences": ["Jazz", "Blues", "Classical"],
    "updatedAt": "2025-01-15T11:30:00Z"
  },
  "message": "Perfil atualizado com sucesso"
}
```

---

### 5. Listar Gêneros Musicais

**GET** `/api/music/genres`

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "total": {
      "genres": 25,
      "musics": 2184,
      "averageMusicsPerGenre": 87
    },
    "topGenres": [
      {
        "name": "Rock",
        "musicCount": 450,
        "percentage": 21
      },
      {
        "name": "Pop",
        "musicCount": 380,
        "percentage": 17
      }
    ],
    "genreNames": ["Rock", "Pop", "MPB", "Jazz", "..."],
    "userPreferences": ["Rock", "Pop"] // se autenticado
  }
}
```

---

### 6. Buscar Músicas por Gênero

**POST** `/api/music/genres`

**Body:**

```json
{
  "genre": "Rock",
  "limit": 10,
  "offset": 0
}
```

**Resposta de Sucesso (200):**

```json
{
  "success": true,
  "data": {
    "genre": "Rock",
    "musics": [
      {
        "id": "music_id",
        "spotifyId": "4u7EnebtmKWzUH433cf5Qv",
        "name": "Bohemian Rhapsody",
        "artist": "Queen",
        "album": "A Night At The Opera",
        "duration": 355000,
        "genre": "Rock",
        "sadnessScore": 0.3,
        "joyScore": 0.8,
        "angerScore": 0.4,
        "fearScore": 0.2,
        "surpriseScore": 0.9,
        "danceability": 0.468,
        "energy": 0.581,
        "valence": 0.279
      }
    ],
    "pagination": {
      "total": 450,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## 🧪 Testando com Postman

### 1. Criar Coleção

1. Abra o Postman
2. Crie nova coleção "SOL API"
3. Configure Base URL: `http://localhost:3000`

### 2. Configurar Autenticação

1. Registre um usuário
2. Copie o `token` da resposta
3. Configure Authorization Type: "Bearer Token"
4. Cole o token

### 3. Requests de Exemplo

**Registro:**

- Method: POST
- URL: `{{base_url}}/api/auth/register`
- Body: raw JSON (exemplo acima)

**Login:**

- Method: POST
- URL: `{{base_url}}/api/auth/login`
- Body: raw JSON

**Perfil:**

- Method: GET
- URL: `{{base_url}}/api/auth/me`
- Authorization: Bearer Token

---

## 🛠️ Comandos Úteis

```bash
# Iniciar servidor
npm run dev

# Testar todas as APIs automaticamente
npm run test:auth

# Ver banco de dados
npm run db:studio

# Ver gêneros disponíveis
npm run db:genres
```

---

## 🔍 Solução de Problemas

### Erro 401 - Unauthorized

- Verificar se o token está correto
- Verificar se o header Authorization está presente
- Token pode ter expirado (7 dias)

### Erro 500 - Internal Server Error

- Verificar se o banco de dados está rodando
- Verificar logs do servidor
- Verificar variáveis de ambiente

### Banco não conecta

```bash
npm run docker:up
npm run db:push
```

### Recriar tudo do zero

```bash
npm run db:reset
npm run test:auth
```
