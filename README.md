# 🎵 Sistema SOL

## 📁 Estrutura do Projeto

```
sol-backend/
├── README.md                    # Documentação principal
├── requirements.txt             # Dependências Python
├── .env                        # Variáveis de ambiente
├── .env.example               # Exemplo de configuração
├── main.py                    # Servidor FastAPI principal
├──
├── app/
│   ├── __init__.py
│   ├── config.py              # Configurações da aplicação
│   ├── database.py            # Conexão PostgreSQL
│   │
│   ├── core/                  # Núcleo da IA
│   │   ├── __init__.py
│   │   ├── fuzzy_system.py    # Sistema de Lógica Fuzzy
│   │   ├── music_processor.py # Processamento dos CSVs
│   │   └── recommender.py     # Engine de recomendação
│   │
│   ├── models/                # Modelos Prisma/SQLAlchemy
│   │   ├── __init__.py
│   │   └── schemas.py         # Schemas Pydantic
│   │
│   ├── api/                   # Rotas da API
│   │   ├── __init__.py
│   │   ├── emotions.py        # Análise emocional
│   │   ├── recommendations.py # Recomendações
│   │   └── health.py         # Health check
│   │
│   └── utils/                 # Utilitários
│       ├── __init__.py
│       └── helpers.py
│
├── data/                      # Datasets
│   ├── emotion_music_data.csv
│   ├── emotion_music_data_original.csv
│   └── musicas_perifericas.csv
│
├── prisma/                    # Configuração Prisma
│   ├── schema.prisma          # Schema do banco
│   └── migrations/           # Migrações
│
├── tests/                     # Testes
│   ├── test_fuzzy.py
│   ├── test_api.py
│   └── test_recommender.py
│
└── docs/                      # Documentação
    ├── API.md                 # Documentação da API
    ├── FUZZY.md              # Como funciona o sistema fuzzy
    └── DEPLOYMENT.md         # Como fazer deploy
```

## 🚀 Configuração Inicial

### 1. Instalar Dependências

```bash
# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac

# Instalar dependências Python
pip install -r requirements.txt

# Instalar Prisma (Node.js necessário)
npm install prisma @prisma/client
npx prisma generate
```

### 2. Configurar Banco PostgreSQL

```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Criar banco e usuário
sudo -u postgres psql
```

```sql
CREATE DATABASE sol_db;
CREATE USER sol_user WITH PASSWORD 'sol_password_123';
GRANT ALL PRIVILEGES ON DATABASE sol_db TO sol_user;
ALTER USER sol_user CREATEDB;
\q
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar configurações
nano .env
```

## 🧠 Sistema de Lógica Fuzzy

### Como Funciona

O sistema fuzzy converte **emoções humanas** (escala 1-10) em **características musicais** (escala 0-1):

```
Entrada: {anxiety: 8, depression: 5, joy: 3}
         ↓ [Sistema Fuzzy]
Saída:   {valence: 0.3, energy: 0.2, relaxation: 0.8}
         ↓ [Busca no Dataset]
Resultado: Músicas relaxantes e positivas
```

### Regras Fuzzy Implementadas

1. **Alta Ansiedade** → Música relaxante (baixa energia, alta valência)
2. **Alta Depressão** → Música energética e positiva
3. **Baixa Alegria** → Música motivacional
4. **Alto Estresse** → Música muito calma
5. **Baixa Energia** → Música estimulante

## 📊 Processamento dos Datasets

### Datasets Utilizados

1. **Principal**: `emotion_music_data.csv` (22.230 músicas)

   - Emoções: Raiva, Medo, Alegria, Tristeza, Surpresa
   - Metadados: Nome, Artista, Gênero

2. **Complementar**: `musicas_perifericas.csv` (2.184 músicas)

   - Características Spotify: valência, energia, danceabilidade
   - Dados técnicos: tempo, acústica, instrumentalidade

3. **Validação**: `emotion_music_data_original.csv`
   - Emoções processadas por BERT e GPT

### Pipeline de Processamento

```python
CSV → Limpeza → Normalização → Classificação Terapêutica → Banco
```

## 🔌 APIs Disponíveis

### 1. Análise Emocional

```http
POST /api/emotions/analyze
Content-Type: application/json

{
  "user_id": "123",
  "emotions": {
    "anxiety_level": 8,
    "depression_level": 5,
    "joy_level": 3,
    "stress_level": 7,
    "energy_level": 4
  },
  "context": "antes do trabalho"
}
```

### 2. Gerar Recomendações

```http
POST /api/recommendations/generate
Content-Type: application/json

{
  "session_id": "abc-123",
  "preferences": [
    {"genre": "rock", "level": 8},
    {"genre": "pop", "level": 6}
  ],
  "num_songs": 10
}
```

### 3. Health Check

```http
GET /api/health
```

## 🧪 Testando o Sistema

```bash
# Testar sistema fuzzy
python -m pytest tests/test_fuzzy.py -v

# Testar API
python -m pytest tests/test_api.py -v

# Testar com Postman
# Importar collection: docs/SOL_Postman_Collection.json
```

## 📈 Monitoramento

### Logs Estruturados

- Sistema fuzzy: `logs/fuzzy.log`
- API requests: `logs/api.log`
- Recomendações: `logs/recommendations.log`

### Métricas Importantes

- Tempo de resposta da API
- Acurácia das recomendações
- Taxa de satisfação do usuário
- Performance do sistema fuzzy

## 🔧 Comandos Úteis

```bash
# Iniciar servidor desenvolvimento
uvicorn main:app --reload --port 8000

# Aplicar migrações Prisma
npx prisma migrate dev

# Resetar banco de dados
npx prisma migrate reset

# Visualizar banco (Prisma Studio)
npx prisma studio

# Executar testes
pytest -v

# Gerar relatório de cobertura
pytest --cov=app tests/
```

## 📚 Documentação Adicional

- **[API.md](docs/API.md)** - Documentação completa da API
- **[FUZZY.md](docs/FUZZY.md)** - Detalhes do sistema fuzzy
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Como fazer deploy

## 🎯 Próximos Passos

1. ✅ Configurar ambiente
2. ✅ Implementar sistema fuzzy
3. ⏳ Processar datasets
4. ⏳ Criar engine de recomendação
5. ⏳ Implementar APIs
6. ⏳ Testes e validação

---

**Desenvolvido com ❤️ para transformar música em terapia através da IA**
