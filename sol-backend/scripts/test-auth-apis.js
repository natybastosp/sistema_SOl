const axios = require("axios");

// Configuração base
const BASE_URL = "http://localhost:3000";
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dados de teste
const testUser = {
  name: "Usuário Teste API",
  email: "teste.api@exemplo.com",
  password: "senha123",
  musicPreferences: ["Rock", "Pop", "MPB"],
};

let userToken = null;

async function testAPI() {
  console.log("🧪 Iniciando testes das APIs de autenticação...\n");

  try {
    // Teste 1: Verificar se servidor está rodando
    console.log("1️⃣ Verificando se servidor está online...");
    try {
      await api.get("/api/auth/register");
      console.log("✅ Servidor online e respondendo\n");
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        console.log("❌ Servidor não está rodando!");
        console.log("💡 Execute: npm run dev");
        return;
      }
      console.log("✅ Servidor online (resposta esperada)\n");
    }

    // Teste 2: Registro de usuário
    console.log("2️⃣ Testando registro de usuário...");
    try {
      const registerResponse = await api.post("/api/auth/register", testUser);
      console.log("✅ Usuário registrado com sucesso");
      console.log(`   Nome: ${registerResponse.data.data.user.name}`);
      console.log(`   Email: ${registerResponse.data.data.user.email}`);
      console.log(
        `   Token: ${registerResponse.data.data.token.substring(0, 20)}...`
      );
      userToken = registerResponse.data.data.token;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log("⚠️  Usuário já existe, tentando login...");
      } else {
        console.log(
          "❌ Erro no registro:",
          error.response?.data?.error || error.message
        );
      }
    }

    // Teste 3: Login de usuário
    console.log("\n3️⃣ Testando login de usuário...");
    try {
      const loginResponse = await api.post("/api/auth/login", {
        email: testUser.email,
        password: testUser.password,
      });
      console.log("✅ Login realizado com sucesso");
      console.log(`   Nome: ${loginResponse.data.data.user.name}`);
      console.log(`   Email: ${loginResponse.data.data.user.email}`);
      console.log(
        `   Token: ${loginResponse.data.data.token.substring(0, 20)}...`
      );
      userToken = loginResponse.data.data.token;
    } catch (error) {
      console.log(
        "❌ Erro no login:",
        error.response?.data?.error || error.message
      );
    }

    if (!userToken) {
      console.log("\n❌ Não foi possível obter token. Parando testes.");
      return;
    }

    // Teste 4: Acessar informações do usuário autenticado
    console.log("\n4️⃣ Testando acesso com token...");
    try {
      const meResponse = await api.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      console.log("✅ Informações do usuário obtidas com sucesso");
      console.log(`   ID: ${meResponse.data.data.id}`);
      console.log(`   Nome: ${meResponse.data.data.name}`);
      console.log(
        `   Preferências: ${meResponse.data.data.musicPreferences.join(", ")}`
      );
      console.log(
        `   Estados emocionais: ${meResponse.data.data.stats.totalEmotionalStates}`
      );
      console.log(`   Playlists: ${meResponse.data.data.stats.totalPlaylists}`);
    } catch (error) {
      console.log(
        "❌ Erro ao acessar /me:",
        error.response?.data?.error || error.message
      );
    }

    // Teste 5: Testar acesso sem token (deve falhar)
    console.log("\n5️⃣ Testando acesso sem token (deve falhar)...");
    try {
      await api.get("/api/auth/me");
      console.log("❌ ERRO: Acesso permitido sem token!");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Acesso negado corretamente (sem token)");
      } else {
        console.log(
          "❌ Erro inesperado:",
          error.response?.data?.error || error.message
        );
      }
    }

    // Teste 6: Atualizar perfil do usuário
    console.log("\n6️⃣ Testando atualização de perfil...");
    try {
      const updateResponse = await api.put(
        "/api/auth/me",
        {
          name: "Usuário Teste Atualizado",
          musicPreferences: ["Jazz", "Blues", "Classical"],
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      console.log("✅ Perfil atualizado com sucesso");
      console.log(`   Nome: ${updateResponse.data.data.name}`);
      console.log(
        `   Novas preferências: ${updateResponse.data.data.musicPreferences.join(
          ", "
        )}`
      );
    } catch (error) {
      console.log(
        "❌ Erro ao atualizar perfil:",
        error.response?.data?.error || error.message
      );
    }

    // Teste 7: Buscar gêneros musicais
    console.log("\n7️⃣ Testando busca de gêneros musicais...");
    try {
      const genresResponse = await api.get("/api/music/genres");
      console.log("✅ Gêneros musicais obtidos com sucesso");
      console.log(
        `   Total de gêneros: ${genresResponse.data.data.total.genres}`
      );
      console.log(
        `   Total de músicas: ${genresResponse.data.data.total.musics}`
      );
      console.log(
        `   Top 3 gêneros: ${genresResponse.data.data.topGenres
          .slice(0, 3)
          .map((g) => g.name)
          .join(", ")}`
      );
    } catch (error) {
      console.log(
        "❌ Erro ao buscar gêneros:",
        error.response?.data?.error || error.message
      );
    }

    // Teste 8: Buscar músicas de um gênero específico
    console.log("\n8️⃣ Testando busca de músicas por gênero...");
    try {
      const genreMusicsResponse = await api.post("/api/music/genres", {
        genre: "Rock",
        limit: 5,
      });
      console.log("✅ Músicas do gênero Rock obtidas com sucesso");
      console.log(
        `   Total de músicas Rock: ${genreMusicsResponse.data.data.pagination.total}`
      );
      if (genreMusicsResponse.data.data.musics.length > 0) {
        console.log(
          `   Exemplo: "${genreMusicsResponse.data.data.musics[0].name}" - ${genreMusicsResponse.data.data.musics[0].artist}`
        );
      }
    } catch (error) {
      console.log(
        "❌ Erro ao buscar músicas do gênero:",
        error.response?.data?.error || error.message
      );
    }

    console.log("\n🎉 Testes concluídos!");
    console.log("\n📋 Resumo dos endpoints testados:");
    console.log("✅ POST /api/auth/register - Registro de usuário");
    console.log("✅ POST /api/auth/login - Login de usuário");
    console.log("✅ GET /api/auth/me - Informações do usuário");
    console.log("✅ PUT /api/auth/me - Atualização de perfil");
    console.log("✅ GET /api/music/genres - Lista de gêneros");
    console.log("✅ POST /api/music/genres - Músicas por gênero");
  } catch (error) {
    console.error("\n❌ Erro geral nos testes:", error.message);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
