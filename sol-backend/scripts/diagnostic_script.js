const axios = require("axios");
require("dotenv").config();

/**
 * Script de diagnóstico completo para o Sistema SOL
 * Este script verifica sistematicamente cada componente do sistema
 * para identificar onde exatamente está o problema
 */

const BASE_URL = "http://localhost:3000";

// Cores para output no terminal
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Verificação 1: Servidor Next.js está respondendo?
 */
async function verificarServidor() {
  log("\n🔍 VERIFICAÇÃO 1: Status do Servidor Next.js", "blue");
  log("═".repeat(50), "blue");

  try {
    // Tentar acessar a rota raiz
    const response = await axios.get(`${BASE_URL}`, { timeout: 5000 });
    log("✅ Servidor Next.js está respondendo", "green");
    log(`   Status: ${response.status}`, "green");
    return true;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      log("❌ PROBLEMA ENCONTRADO: Servidor não está rodando", "red");
      log('💡 Solução: Execute "npm run dev" em outro terminal', "yellow");
      return false;
    } else if (error.code === "ENOTFOUND") {
      log("❌ PROBLEMA ENCONTRADO: Problemas de DNS/rede", "red");
      log("💡 Verifique sua conexão de internet", "yellow");
      return false;
    } else {
      log(`⚠️  Resposta inesperada do servidor: ${error.message}`, "yellow");
      return true; // Servidor pode estar rodando mas com problema específico
    }
  }
}

/**
 * Verificação 2: Banco de dados está acessível?
 */
async function verificarBancoDados() {
  log("\n🔍 VERIFICAÇÃO 2: Conexão com Banco de Dados", "blue");
  log("═".repeat(50), "blue");

  try {
    // Verificar se a URL do banco está configurada
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      log("❌ PROBLEMA ENCONTRADO: DATABASE_URL não configurada", "red");
      log("💡 Verifique se o arquivo .env tem a linha DATABASE_URL", "yellow");
      return false;
    }

    log("✅ DATABASE_URL encontrada no .env", "green");
    log(`   URL: ${dbUrl.replace(/:[^:]*@/, ":***@")}`, "green"); // Ocultar senha

    // Tentar acessar uma API que usa o banco
    const response = await axios.get(`${BASE_URL}/api/music/genres`, {
      timeout: 10000,
    });

    if (response.data.success) {
      log("✅ Banco de dados está acessível e funcionando", "green");
      log(`   Gêneros encontrados: ${response.data.data.length}`, "green");
      return true;
    } else {
      log("⚠️  API respondeu mas com erro nos dados", "yellow");
      log(`   Resposta: ${JSON.stringify(response.data)}`, "yellow");
      return false;
    }
  } catch (error) {
    log("❌ PROBLEMA ENCONTRADO: Erro na conexão com banco de dados", "red");
    log(`   Erro: ${error.response?.data?.error || error.message}`, "red");
    log("💡 Soluções possíveis:", "yellow");
    log('   1. Execute "npm run docker:up" para subir o PostgreSQL', "yellow");
    log('   2. Execute "npm run db:push" para aplicar o schema', "yellow");
    log(
      "   3. Verifique se as credenciais do banco estão corretas no .env",
      "yellow"
    );
    return false;
  }
}

/**
 * Verificação 3: API de autenticação está funcionando?
 */
async function verificarAPIAutenticacao() {
  log("\n🔍 VERIFICAÇÃO 3: APIs de Autenticação", "blue");
  log("═".repeat(50), "blue");

  try {
    // Primeiro, vamos ver se a API retorna alguma resposta estruturada
    log("📡 Testando endpoint de registro...");

    const testUser = {
      name: "Usuário Diagnóstico",
      email: `diagnostico.${Date.now()}@sol.com`,
      password: "senha123teste",
      musicPreferences: ["Rock", "Pop"],
    };

    const response = await axios.post(
      `${BASE_URL}/api/auth/register`,
      testUser,
      {
        timeout: 15000,
        validateStatus: () => true, // Aceitar qualquer status para análise
      }
    );

    log(`📊 Resposta da API (Status ${response.status}):`, "blue");
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 201 && response.data.success) {
      log("✅ API de registro funcionando perfeitamente!", "green");
      log(`   Usuário criado com ID: ${response.data.data.user.id}`, "green");
      return { success: true, token: response.data.data.token };
    } else if (response.status === 409) {
      log("⚠️  Usuário já existe (isso é normal em testes)", "yellow");
      log("🔄 Tentando fazer login com usuário existente...", "blue");

      // Tentar login
      const loginResponse = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email: testUser.email, password: testUser.password },
        { timeout: 10000, validateStatus: () => true }
      );

      if (loginResponse.status === 200 && loginResponse.data.success) {
        log("✅ Login funcionando perfeitamente!", "green");
        return { success: true, token: loginResponse.data.data.token };
      } else {
        log("❌ Problema no login após registro bem-sucedido", "red");
        log(
          `   Resposta do login: ${JSON.stringify(loginResponse.data)}`,
          "red"
        );
        return { success: false };
      }
    } else {
      log(
        "❌ PROBLEMA ENCONTRADO: API de registro não está funcionando como esperado",
        "red"
      );
      log(`   Status: ${response.status}`, "red");
      log(`   Erro: ${response.data.error || "Erro não especificado"}`, "red");
      return { success: false };
    }
  } catch (error) {
    log("❌ ERRO CRÍTICO: Falha na comunicação com API de autenticação", "red");
    log(`   Erro: ${error.message}`, "red");

    if (error.code === "ECONNREFUSED") {
      log("💡 O servidor parece não estar rodando na porta 3000", "yellow");
    } else if (error.code === "ENOTFOUND") {
      log("💡 Problema de resolução de DNS", "yellow");
    } else if (error.response) {
      log(
        `💡 Servidor respondeu com status ${error.response.status}`,
        "yellow"
      );
      log(`   Dados do erro: ${JSON.stringify(error.response.data)}`, "yellow");
    }

    return { success: false };
  }
}

/**
 * Verificação 4: Configurações do ambiente
 */
async function verificarConfiguracoes() {
  log("\n🔍 VERIFICAÇÃO 4: Configurações do Ambiente", "blue");
  log("═".repeat(50), "blue");

  const configsEssenciais = [
    "DATABASE_URL",
    "JWT_SECRET",
    "SPOTIFY_CLIENT_ID",
    "SPOTIFY_CLIENT_SECRET",
  ];

  let todasConfiguradas = true;

  configsEssenciais.forEach((config) => {
    if (process.env[config]) {
      log(`✅ ${config}: Configurado`, "green");
    } else {
      log(`❌ ${config}: NÃO CONFIGURADO`, "red");
      todasConfiguradas = false;
    }
  });

  if (todasConfiguradas) {
    log("\n✅ Todas as configurações essenciais estão presentes", "green");
  } else {
    log(
      "\n❌ PROBLEMA ENCONTRADO: Configurações faltando no arquivo .env",
      "red"
    );
    log(
      "💡 Verifique se o arquivo .env está na raiz do projeto com todas as variáveis",
      "yellow"
    );
  }

  return todasConfiguradas;
}

/**
 * Função principal de diagnóstico
 */
async function executarDiagnosticoCompleto() {
  log("🏥 DIAGNÓSTICO COMPLETO DO SISTEMA SOL", "blue");
  log("=".repeat(60), "blue");
  log(
    "Este diagnóstico verificará cada componente do sistema sistematicamente\n",
    "blue"
  );

  const resultados = {
    servidor: false,
    bancoDados: false,
    autenticacao: false,
    configuracoes: false,
  };

  // Executar verificações em sequência
  resultados.configuracoes = await verificarConfiguracoes();
  resultados.servidor = await verificarServidor();

  if (resultados.servidor) {
    resultados.bancoDados = await verificarBancoDados();
    const authResult = await verificarAPIAutenticacao();
    resultados.autenticacao = authResult.success;
  } else {
    log(
      "\n⏭️  Pulando verificações de banco e autenticação (servidor não está rodando)",
      "yellow"
    );
  }

  // Relatório final
  log("\n📋 RELATÓRIO FINAL DO DIAGNÓSTICO", "blue");
  log("═".repeat(60), "blue");

  const status = (ok) => (ok ? "✅ OK" : "❌ PROBLEMA");
  log(
    `Configurações do ambiente: ${status(resultados.configuracoes)}`,
    resultados.configuracoes ? "green" : "red"
  );
  log(
    `Servidor Next.js: ${status(resultados.servidor)}`,
    resultados.servidor ? "green" : "red"
  );
  log(
    `Banco de dados: ${status(resultados.bancoDados)}`,
    resultados.bancoDados ? "green" : "red"
  );
  log(
    `APIs de autenticação: ${status(resultados.autenticacao)}`,
    resultados.autenticacao ? "green" : "red"
  );

  const problemasEncontrados = Object.values(resultados).filter(
    (r) => !r
  ).length;

  if (problemasEncontrados === 0) {
    log("\n🎉 SISTEMA TOTALMENTE FUNCIONAL!", "green");
    log("Todos os componentes estão operando corretamente.", "green");
    log(
      "O erro anterior pode ter sido temporário ou já foi resolvido.",
      "green"
    );
  } else {
    log(`\n⚠️  ${problemasEncontrados} problema(s) encontrado(s)`, "yellow");
    log("\n📝 PLANO DE AÇÃO RECOMENDADO:", "blue");

    if (!resultados.configuracoes) {
      log("1. 🔧 Configurar variáveis de ambiente no arquivo .env", "yellow");
    }
    if (!resultados.servidor) {
      log('2. 🚀 Iniciar o servidor com "npm run dev"', "yellow");
    }
    if (!resultados.bancoDados) {
      log(
        '3. 🗄️  Configurar banco de dados com "npm run docker:up" e "npm run db:push"',
        "yellow"
      );
    }
    if (!resultados.autenticacao) {
      log(
        "4. 🔐 Verificar APIs de autenticação após resolver problemas anteriores",
        "yellow"
      );
    }
  }

  log(
    "\n💡 Após resolver os problemas, execute novamente: node scripts/test-spotify-api.js",
    "blue"
  );
}

// Executar diagnóstico se chamado diretamente
if (require.main === module) {
  executarDiagnosticoCompleto().catch((error) => {
    log(`\n💥 Erro inesperado durante diagnóstico: ${error.message}`, "red");
    console.error(error);
  });
}

module.exports = { executarDiagnosticoCompleto };
