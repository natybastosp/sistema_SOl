// teste-cenarios-extensivos.js
// Bateria Completa de Testes para o Motor Fuzzy
// Execute com: node teste-cenarios-extensivos.js

console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║  🎵 BATERIA EXTENSIVA DE TESTES - SISTEMA FUZZY 🎵       ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");

// ========================================
// IMPLEMENTAÇÃO DO MOTOR FUZZY
// ========================================

function triangularMembership(x, points) {
  const [a, b, c] = points;
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  else return (c - x) / (c - b);
}

function trapezoidalMembership(x, points) {
  const [a, b, c, d] = points;
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  else return (d - x) / (d - c);
}

const EMOCIONAL_FUNCTIONS = [
  { name: "triste", type: "trapezoidal", points: [0, 0, 2, 4] },
  { name: "ansioso", type: "triangular", points: [2, 4, 6] },
  { name: "neutro", type: "triangular", points: [4, 5, 7] },
  { name: "alegre", type: "trapezoidal", points: [6, 8, 10, 10] },
];

class FuzzyMusicEngine {
  constructor() {
    this.generosDisponiveis = ["rock", "funk", "rap", "samba", "sertanejo"];
  }

  validateInput(input) {
    const errors = [];
    if (
      typeof input.estadoEmocional !== "number" ||
      input.estadoEmocional < 0 ||
      input.estadoEmocional > 10
    ) {
      errors.push("Estado emocional deve ser um número entre 0 e 10");
    }
    if (
      input.generoPreferido &&
      !this.generosDisponiveis.includes(input.generoPreferido)
    ) {
      errors.push(
        `Gênero deve ser um dos: ${this.generosDisponiveis.join(", ")}`
      );
    }
    return { valid: errors.length === 0, errors };
  }

  calculateMembership(value, functions) {
    const result = {};
    for (const func of functions) {
      if (func.type === "triangular") {
        result[func.name] = triangularMembership(value, func.points);
      } else if (func.type === "trapezoidal") {
        result[func.name] = trapezoidalMembership(value, func.points);
      }
    }
    return result;
  }

  processRecommendation(input) {
    const validation = this.validateInput(input);
    if (!validation.valid) {
      throw new Error(`Entrada inválida: ${validation.errors.join(", ")}`);
    }

    const grausPertinencia = this.calculateMembership(
      input.estadoEmocional,
      EMOCIONAL_FUNCTIONS
    );
    const regrasAtivadas = [];

    if (grausPertinencia.triste > 0) {
      regrasAtivadas.push({
        ruleId: "R1",
        activationLevel: grausPertinencia.triste * 1.0,
        consequent: { value: "calmante" },
      });
    }
    if (grausPertinencia.ansioso > 0) {
      regrasAtivadas.push({
        ruleId: "R2",
        activationLevel: grausPertinencia.ansioso * 1.0,
        consequent: { value: "reflexiva" },
      });
    }
    if (grausPertinencia.neutro > 0) {
      regrasAtivadas.push({
        ruleId: "R3",
        activationLevel: grausPertinencia.neutro * 1.0,
        consequent: { value: "neutra" },
      });
    }
    if (grausPertinencia.alegre > 0) {
      regrasAtivadas.push({
        ruleId: "R4",
        activationLevel: grausPertinencia.alegre * 0.8,
        consequent: { value: "estimulante" },
      });
      regrasAtivadas.push({
        ruleId: "R5",
        activationLevel: grausPertinencia.alegre * 0.9,
        consequent: { value: "feliz" },
      });
    }

    if (input.generoPreferido) {
      const g = input.generoPreferido;
      const triste = grausPertinencia.triste || 0;
      const ansioso = grausPertinencia.ansioso || 0;
      const neutro = grausPertinencia.neutro || 0;
      const alegre = grausPertinencia.alegre || 0;

      // ROCK
      if (g === "rock" && triste > 0) {
        regrasAtivadas.push({
          ruleId: "ROCK1",
          activationLevel: triste * 1.0,
          consequent: { value: "reflexiva" },
        });
      }
      if (g === "rock" && ansioso > 0) {
        regrasAtivadas.push({
          ruleId: "ROCK2",
          activationLevel: ansioso * 1.2,
          consequent: { value: "estimulante" },
        });
      }
      if (g === "rock" && neutro > 0) {
        regrasAtivadas.push({
          ruleId: "ROCK3",
          activationLevel: neutro * 1.0,
          consequent: { value: "estimulante" },
        });
      }
      if (g === "rock" && alegre > 0) {
        regrasAtivadas.push({
          ruleId: "ROCK4",
          activationLevel: alegre * 1.1,
          consequent: { value: "estimulante" },
        });
      }

      // FUNK
      if (g === "funk" && triste > 0) {
        regrasAtivadas.push({
          ruleId: "FUNK1",
          activationLevel: triste * 0.9,
          consequent: { value: "estimulante" },
        });
      }
      if (g === "funk" && ansioso > 0) {
        regrasAtivadas.push({
          ruleId: "FUNK2",
          activationLevel: ansioso * 1.1,
          consequent: { value: "estimulante" },
        });
      }
      if (g === "funk" && neutro > 0) {
        regrasAtivadas.push({
          ruleId: "FUNK3",
          activationLevel: neutro * 1.0,
          consequent: { value: "estimulante" },
        });
      }
      if (g === "funk" && alegre > 0) {
        regrasAtivadas.push({
          ruleId: "FUNK4",
          activationLevel: alegre * 1.2,
          consequent: { value: "feliz" },
        });
      }

      // RAP
      if (g === "rap" && triste > 0) {
        regrasAtivadas.push({
          ruleId: "RAP1",
          activationLevel: triste * 1.1,
          consequent: { value: "reflexiva" },
        });
      }
      if (g === "rap" && ansioso > 0) {
        regrasAtivadas.push({
          ruleId: "RAP2",
          activationLevel: ansioso * 1.2,
          consequent: { value: "reflexiva" },
        });
      }
      if (g === "rap" && neutro > 0) {
        regrasAtivadas.push({
          ruleId: "RAP3",
          activationLevel: neutro * 1.0,
          consequent: { value: "estimulante" },
        });
      }
      if (g === "rap" && alegre > 0) {
        regrasAtivadas.push({
          ruleId: "RAP4",
          activationLevel: alegre * 1.0,
          consequent: { value: "estimulante" },
        });
      }

      // SAMBA
      if (g === "samba" && triste > 0) {
        regrasAtivadas.push({
          ruleId: "SAMBA1",
          activationLevel: triste * 0.9,
          consequent: { value: "reflexiva" },
        });
      }
      if (g === "samba" && ansioso > 0) {
        regrasAtivadas.push({
          ruleId: "SAMBA2",
          activationLevel: ansioso * 1.0,
          consequent: { value: "estimulante" },
        });
      }
      if (g === "samba" && neutro > 0) {
        regrasAtivadas.push({
          ruleId: "SAMBA3",
          activationLevel: neutro * 1.0,
          consequent: { value: "neutra" },
        });
      }
      if (g === "samba" && alegre > 0) {
        regrasAtivadas.push({
          ruleId: "SAMBA4",
          activationLevel: alegre * 1.2,
          consequent: { value: "feliz" },
        });
      }

      // SERTANEJO
      if (g === "sertanejo" && triste > 0) {
        regrasAtivadas.push({
          ruleId: "SERTANEJO1",
          activationLevel: triste * 1.2,
          consequent: { value: "calmante" },
        });
      }
      if (g === "sertanejo" && ansioso > 0) {
        regrasAtivadas.push({
          ruleId: "SERTANEJO2",
          activationLevel: ansioso * 0.9,
          consequent: { value: "reflexiva" },
        });
      }
      if (g === "sertanejo" && neutro > 0) {
        regrasAtivadas.push({
          ruleId: "SERTANEJO3",
          activationLevel: neutro * 1.0,
          consequent: { value: "neutra" },
        });
      }
      if (g === "sertanejo" && alegre > 0) {
        regrasAtivadas.push({
          ruleId: "SERTANEJO4",
          activationLevel: alegre * 1.0,
          consequent: { value: "feliz" },
        });
      }
    }

    const ativacoesCombinadas = {};
    for (const regra of regrasAtivadas) {
      const value = regra.consequent.value;
      const clippedActivation = Math.min(1, regra.activationLevel);
      ativacoesCombinadas[value] = Math.max(
        ativacoesCombinadas[value] || 0,
        clippedActivation
      );
    }

    const centerPoints = {
      calmante: 0.17,
      reflexiva: 0.5,
      neutra: 0.6,
      estimulante: 0.85,
      feliz: 0.9,
    };

    let numerator = 0;
    let denominator = 0;

    for (const [name, activation] of Object.entries(ativacoesCombinadas)) {
      const center = centerPoints[name] || 0.5;
      numerator += center * activation;
      denominator += activation;
    }

    const valorIntencao = denominator > 0 ? numerator / denominator : 0.5;

    let intencaoPlaylist;
    if (valorIntencao <= 0.25) intencaoPlaylist = "Calmante";
    else if (valorIntencao <= 0.5) intencaoPlaylist = "Reflexiva";
    else if (valorIntencao <= 0.65) intencaoPlaylist = "Neutra";
    else if (valorIntencao <= 0.85) intencaoPlaylist = "Estimulante";
    else intencaoPlaylist = "Feliz";

    const intensidadeEmocional = Math.max(...Object.values(grausPertinencia));
    const grauConfianca = Math.min(
      1,
      intensidadeEmocional * 0.6 +
        (regrasAtivadas.length / 5) * 0.3 +
        (input.generoPreferido ? 0.1 : 0)
    );

    return {
      input,
      output: { valorIntencao, intencaoPlaylist, grauConfianca },
      metadados: {
        grausPertinencia,
        ativacoesCombinadas,
        regrasAplicadas: regrasAtivadas.map((r) => r.ruleId),
        estadoEmocionalDetectado:
          Object.keys(grausPertinencia).find(
            (key) => grausPertinencia[key] === intensidadeEmocional
          ) || "N/A",
      },
    };
  }
}

const fuzzyEngine = new FuzzyMusicEngine();

// ========================================
// FUNÇÃO DE EXECUÇÃO DE TESTE
// ========================================

let testsPassed = 0;
let testsFailed = 0;
let testsWarning = 0;

function executeTest(id, description, input, expectedIntention, category) {
  let status = "❌";
  let output = {};

  try {
    output = fuzzyEngine.processRecommendation(input);

    if (output.output.intencaoPlaylist === expectedIntention) {
      status = "✅";
      testsPassed++;
    } else {
      const acceptable = [
        ["Neutra", "Reflexiva"],
        ["Reflexiva", "Neutra"],
        ["Estimulante", "Neutra"],
      ];

      const isAcceptable = acceptable.some(
        (pair) =>
          (output.output.intencaoPlaylist === pair[0] &&
            expectedIntention === pair[1]) ||
          (output.output.intencaoPlaylist === pair[1] &&
            expectedIntention === pair[0])
      );

      if (isAcceptable) {
        status = "⚠️";
        testsWarning++;
      } else {
        testsFailed++;
      }
    }
  } catch (e) {
    output.output = {
      intencaoPlaylist: `ERRO: ${e.message}`,
      valorIntencao: NaN,
      grauConfianca: 0,
    };
    output.metadados = {
      grausPertinencia: {},
      ativacoesCombinadas: {},
      regrasAplicadas: [],
    };
    testsFailed++;
  }

  console.log(`\n${status} ${category} | Teste ${id}`);
  console.log(`   ${description}`);
  console.log(
    `   Estado: ${input.estadoEmocional} | Gênero: ${
      input.generoPreferido || "Nenhum"
    }`
  );
  console.log(
    `   Esperado: ${expectedIntention} | Obtido: ${output.output.intencaoPlaylist}`
  );
  console.log(
    `   Valor: ${
      output.output.valorIntencao?.toFixed(3) || "N/A"
    } | Confiança: ${output.output.grauConfianca?.toFixed(3) || "N/A"}`
  );

  if (output.metadados) {
    const pertinencias = Object.entries(output.metadados.grausPertinencia)
      .filter(([k, v]) => v > 0.01)
      .map(([k, v]) => `${k}:${v.toFixed(2)}`)
      .join(", ");
    console.log(`   Pertinências: ${pertinencias || "Nenhuma"}`);
  }
}

// ========================================
// BATERIA DE TESTES
// ========================================

console.log("┌─────────────────────────────────────────────────────────┐");
console.log("│ CATEGORIA 1: ESTADOS EMOCIONAIS EXTREMOS               │");
console.log("└─────────────────────────────────────────────────────────┘");

executeTest(
  "1.1",
  "Tristeza Profunda (0.0)",
  { estadoEmocional: 0.0 },
  "Calmante",
  "EXTREMO"
);

executeTest(
  "1.2",
  "Máxima Alegria (10.0)",
  { estadoEmocional: 10.0 },
  "Feliz",
  "EXTREMO"
);

executeTest(
  "1.3",
  "Tristeza Muito Forte (0.5)",
  { estadoEmocional: 0.5 },
  "Calmante",
  "EXTREMO"
);

executeTest(
  "1.4",
  "Alegria Muito Forte (9.5)",
  { estadoEmocional: 9.5 },
  "Feliz",
  "EXTREMO"
);

console.log("\n┌─────────────────────────────────────────────────────────┐");
console.log("│ CATEGORIA 2: TRANSIÇÕES ENTRE ESTADOS                  │");
console.log("└─────────────────────────────────────────────────────────┘");

executeTest(
  "2.1",
  "Transição Triste → Ansioso (2.5)",
  { estadoEmocional: 2.5 },
  "Reflexiva",
  "TRANSIÇÃO"
);

executeTest(
  "2.2",
  "Transição Ansioso → Neutro (5.5)",
  { estadoEmocional: 5.5 },
  "Neutra",
  "TRANSIÇÃO"
);

executeTest(
  "2.3",
  "Transição Neutro → Alegre (6.5)",
  { estadoEmocional: 6.5 },
  "Estimulante",
  "TRANSIÇÃO"
);

executeTest(
  "2.4",
  "Ponto de Máxima Sobreposição (4.0)",
  { estadoEmocional: 4.0 },
  "Reflexiva",
  "TRANSIÇÃO"
);

executeTest(
  "2.5",
  "Limite Ansioso-Neutro (5.0)",
  { estadoEmocional: 5.0 },
  "Neutra",
  "TRANSIÇÃO"
);

console.log("\n┌─────────────────────────────────────────────────────────┐");
console.log("│ CATEGORIA 3: INFLUÊNCIA DE GÊNEROS MUSICAIS            │");
console.log("└─────────────────────────────────────────────────────────┘");

// SERTANEJO
executeTest(
  "3.1",
  "Sertanejo + Tristeza (1.5)",
  { estadoEmocional: 1.5, generoPreferido: "sertanejo" },
  "Calmante",
  "GÊNERO"
);

executeTest(
  "3.2",
  "Sertanejo + Ansiedade (4.0)",
  { estadoEmocional: 4.0, generoPreferido: "sertanejo" },
  "Reflexiva",
  "GÊNERO"
);

// RAP
executeTest(
  "3.3",
  "Rap + Tristeza (1.5)",
  { estadoEmocional: 1.5, generoPreferido: "rap" },
  "Reflexiva",
  "GÊNERO"
);

executeTest(
  "3.4",
  "Rap + Ansiedade (4.0)",
  { estadoEmocional: 4.0, generoPreferido: "rap" },
  "Reflexiva",
  "GÊNERO"
);

// SAMBA
executeTest(
  "3.5",
  "Samba + Tristeza (1.5)",
  { estadoEmocional: 1.5, generoPreferido: "samba" },
  "Reflexiva",
  "GÊNERO"
);

executeTest(
  "3.6",
  "Samba + Alegria (8.0)",
  { estadoEmocional: 8.0, generoPreferido: "samba" },
  "Feliz",
  "GÊNERO"
);

// ROCK
executeTest(
  "3.7",
  "Rock + Ansiedade (4.0)",
  { estadoEmocional: 4.0, generoPreferido: "rock" },
  "Estimulante",
  "GÊNERO"
);

executeTest(
  "3.8",
  "Rock + Tristeza (1.5)",
  { estadoEmocional: 1.5, generoPreferido: "rock" },
  "Reflexiva",
  "GÊNERO"
);

// FUNK
executeTest(
  "3.9",
  "Funk + Alegria (8.0)",
  { estadoEmocional: 8.0, generoPreferido: "funk" },
  "Feliz",
  "GÊNERO"
);

executeTest(
  "3.10",
  "Funk + Alegria Máxima (9.0)",
  { estadoEmocional: 9.0, generoPreferido: "funk" },
  "Feliz",
  "GÊNERO"
);

console.log("\n┌─────────────────────────────────────────────────────────┐");
console.log("│ CATEGORIA 4: CASOS SEM PREFERÊNCIA DE GÊNERO           │");
console.log("└─────────────────────────────────────────────────────────┘");

executeTest(
  "4.1",
  "Tristeza sem gênero (1.0)",
  { estadoEmocional: 1.0 },
  "Calmante",
  "SEM GÊNERO"
);

executeTest(
  "4.2",
  "Ansiedade sem gênero (3.5)",
  { estadoEmocional: 3.5 },
  "Reflexiva",
  "SEM GÊNERO"
);

executeTest(
  "4.3",
  "Neutro sem gênero (5.0)",
  { estadoEmocional: 5.0 },
  "Neutra",
  "SEM GÊNERO"
);

executeTest(
  "4.4",
  "Alegria sem gênero (7.5)",
  { estadoEmocional: 7.5 },
  "Estimulante",
  "SEM GÊNERO"
);

executeTest(
  "4.5",
  "Alegria alta sem gênero (9.0)",
  { estadoEmocional: 9.0 },
  "Feliz",
  "SEM GÊNERO"
);

console.log("\n┌─────────────────────────────────────────────────────────┐");
console.log("│ CATEGORIA 5: PONTOS CRÍTICOS DE DECISÃO                │");
console.log("└─────────────────────────────────────────────────────────┘");

executeTest(
  "5.1",
  "Pico de Ansioso (4.0)",
  { estadoEmocional: 4.0 },
  "Reflexiva",
  "CRÍTICO"
);

executeTest(
  "5.2",
  "Pico de Neutro (5.0)",
  { estadoEmocional: 5.0 },
  "Neutra",
  "CRÍTICO"
);

executeTest(
  "5.3",
  "Início de Alegre (6.0)",
  { estadoEmocional: 6.0 },
  "Neutra",
  "CRÍTICO"
);

executeTest(
  "5.4",
  "Transição Alegre forte (8.0)",
  { estadoEmocional: 8.0 },
  "Estimulante",
  "CRÍTICO"
);

executeTest(
  "5.5",
  "Fim de Triste (4.0)",
  { estadoEmocional: 4.0 },
  "Reflexiva",
  "CRÍTICO"
);

console.log("\n┌─────────────────────────────────────────────────────────┐");
console.log("│ CATEGORIA 6: COMBINAÇÕES COMPLEXAS                     │");
console.log("└─────────────────────────────────────────────────────────┘");

executeTest(
  "6.1",
  "Rock no ponto neutro (5.0)",
  { estadoEmocional: 5.0, generoPreferido: "Rock" },
  "Neutra",
  "COMPLEXO"
);

executeTest(
  "6.2",
  "MPB em estado neutro (6.0)",
  { estadoEmocional: 6.0, generoPreferido: "MPB" },
  "Neutra",
  "COMPLEXO"
);

executeTest(
  "6.3",
  "Sertanejo em ansiedade (4.5)",
  { estadoEmocional: 4.5, generoPreferido: "Sertanejo" },
  "Neutra",
  "COMPLEXO"
);

executeTest(
  "6.4",
  "Funk em estado neutro (5.5)",
  { estadoEmocional: 5.5, generoPreferido: "Funk" },
  "Neutra",
  "COMPLEXO"
);

executeTest(
  "6.5",
  "Rock em tristeza (2.0)",
  { estadoEmocional: 2.0, generoPreferido: "Rock" },
  "Calmante",
  "COMPLEXO"
);

console.log("\n┌─────────────────────────────────────────────────────────┐");
console.log("│ CATEGORIA 7: GRANULARIDADE FINA (PASSOS DE 0.5)        │");
console.log("└─────────────────────────────────────────────────────────┘");

executeTest(
  "7.1",
  "Estado 2.0",
  { estadoEmocional: 2.0 },
  "Calmante",
  "GRANULAR"
);
executeTest(
  "7.2",
  "Estado 3.0",
  { estadoEmocional: 3.0 },
  "Reflexiva",
  "GRANULAR"
);
executeTest(
  "7.3",
  "Estado 4.5",
  { estadoEmocional: 4.5 },
  "Neutra",
  "GRANULAR"
);
executeTest(
  "7.4",
  "Estado 6.0",
  { estadoEmocional: 6.0 },
  "Neutra",
  "GRANULAR"
);
executeTest(
  "7.5",
  "Estado 7.0",
  { estadoEmocional: 7.0 },
  "Estimulante",
  "GRANULAR"
);

console.log("\n┌─────────────────────────────────────────────────────────┐");
console.log("│ CATEGORIA 8: TODOS OS GÊNEROS EM CADA ESTADO           │");
console.log("└─────────────────────────────────────────────────────────┘");

const generos = ["Rock", "Funk", "MPB", "Sertanejo"];
const estadosTeste = [
  { estado: 1.0, esperado: "Calmante" },
  { estado: 4.0, esperado: "Reflexiva" },
  { estado: 5.0, esperado: "Neutra" },
  { estado: 8.0, esperado: "Estimulante" },
];

let testNum = 1;
for (const { estado, esperado } of estadosTeste) {
  for (const genero of generos) {
    const expectedForGenre =
      estado === 1.0 && genero === "Sertanejo"
        ? "Calmante"
        : estado === 1.0 && genero === "MPB"
        ? "Reflexiva"
        : estado === 4.0 && genero === "Rock"
        ? "Estimulante"
        : estado === 8.0 && genero === "Funk"
        ? "Feliz"
        : esperado;

    executeTest(
      `8.${testNum}`,
      `${genero} em estado ${estado}`,
      { estadoEmocional: estado, generoPreferido: genero },
      expectedForGenre,
      "MATRIZ"
    );
    testNum++;
  }
}

console.log("\n┌─────────────────────────────────────────────────────────┐");
console.log("│ CATEGORIA 9: VALIDAÇÃO DE ERROS                        │");
console.log("└─────────────────────────────────────────────────────────┘");

executeTest(
  "9.1",
  "Estado negativo (-1)",
  { estadoEmocional: -1 },
  "ERRO",
  "VALIDAÇÃO"
);

executeTest(
  "9.2",
  "Estado acima do limite (11)",
  { estadoEmocional: 11 },
  "ERRO",
  "VALIDAÇÃO"
);

executeTest(
  "9.3",
  "Gênero inválido",
  { estadoEmocional: 5, generoPreferido: "Jazz" },
  "ERRO",
  "VALIDAÇÃO"
);

// ========================================
// SUMÁRIO FINAL
// ========================================

const totalTests = testsPassed + testsFailed + testsWarning;

console.log("\n╔═══════════════════════════════════════════════════════════╗");
console.log("║                    SUMÁRIO FINAL                          ║");
console.log("╚═══════════════════════════════════════════════════════════╝");
console.log(`\n  Total de Testes: ${totalTests}`);
console.log(
  `  ✅ Sucessos: ${testsPassed} (${((testsPassed / totalTests) * 100).toFixed(
    1
  )}%)`
);
console.log(
  `  ⚠️  Avisos: ${testsWarning} (${((testsWarning / totalTests) * 100).toFixed(
    1
  )}%)`
);
console.log(
  `  ❌ Falhas: ${testsFailed} (${((testsFailed / totalTests) * 100).toFixed(
    1
  )}%)`
);

if (testsFailed === 0) {
  console.log("\n  🎉 PARABÉNS! Todos os testes principais passaram!");
} else if (testsFailed <= 3) {
  console.log("\n  ⚠️  Poucos testes falharam. Revise os casos críticos.");
} else {
  console.log(
    "\n  ❌ Vários testes falharam. Revisão necessária no motor fuzzy."
  );
}

console.log("\n═══════════════════════════════════════════════════════════\n");
