// teste-integrado.js
// Teste integrado com o sistema fuzzy real
// Execute com: node teste-integrado.js

console.log('🎵 TESTE DO SISTEMA FUZZY INTEGRADO 🎵\n');

// OPÇÃO 1: Se você compilou os arquivos TypeScript para JavaScript
// Descomente as linhas abaixo se você tem os arquivos .js compilados
/*
const { fuzzyEngine } = require('./engine.js');
*/

// OPÇÃO 2: Se você quer usar diretamente os arquivos TypeScript
// Você precisa ter ts-node instalado: npm install -g ts-node
// Descomente as linhas abaixo:
/*
require('ts-node/register');
const { fuzzyEngine } = require('./engine.ts');
*/

// OPÇÃO 3: Para testar sem dependências externas (implementação inline)
// Esta é uma versão simplificada que funciona independentemente

// ========================================
// IMPLEMENTAÇÃO INLINE PARA TESTE
// ========================================

// Funções de pertinência básicas
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

// Definições das funções fuzzy
const EMOCIONAL_FUNCTIONS = [
  { name: 'triste', type: 'trapezoidal', points: [0, 0, 2, 3] },
  { name: 'ansioso', type: 'triangular', points: [2, 4, 6] },
  { name: 'neutro', type: 'triangular', points: [4, 5, 6] },
  { name: 'alegre', type: 'trapezoidal', points: [6, 8, 10, 10] }
];

// Implementação da classe FuzzyMusicEngine
class FuzzyMusicEngine {
  constructor() {
    this.generosDisponiveis = ['Rock', 'Funk', 'MPB', 'Sertanejo'];
  }

  validateInput(input) {
    const errors = [];
    
    if (typeof input.estadoEmocional !== 'number') {
      errors.push('Estado emocional deve ser um número');
    } else if (input.estadoEmocional < 0 || input.estadoEmocional > 10) {
      errors.push('Estado emocional deve estar entre 0 e 10');
    }

    if (input.generoPreferido !== undefined) {
      if (!this.generosDisponiveis.includes(input.generoPreferido)) {
        errors.push(`Gênero deve ser um dos: ${this.generosDisponiveis.join(', ')}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  calculateMembership(value, functions) {
    const result = {};
    
    for (const func of functions) {
      if (func.type === 'triangular') {
        result[func.name] = triangularMembership(value, func.points);
      } else if (func.type === 'trapezoidal') {
        result[func.name] = trapezoidalMembership(value, func.points);
      }
    }
    
    return result;
  }

  processRecommendation(input) {
    // Validação
    const validation = this.validateInput(input);
    if (!validation.valid) {
      throw new Error(`Entrada inválida: ${validation.errors.join(', ')}`);
    }

    // 1. Fuzzificação
    const grausPertinencia = this.calculateMembership(input.estadoEmocional, EMOCIONAL_FUNCTIONS);
    
    // 2. Estado dominante
    let maxValue = 0;
    let estadoDominante = 'neutro';
    for (const [state, value] of Object.entries(grausPertinencia)) {
      if (value > maxValue) {
        maxValue = value;
        estadoDominante = state;
      }
    }

    // 3. Aplicação das regras (simplificada)
    const regrasAtivadas = [];
    
    // Regras base
    if (grausPertinencia.triste > 0) {
      regrasAtivadas.push({
        ruleId: 'R1',
        activationLevel: grausPertinencia.triste,
        consequent: { variable: 'intencao_playlist', value: 'calmante' }
      });
    }
    
    if (grausPertinencia.ansioso > 0) {
      regrasAtivadas.push({
        ruleId: 'R2',
        activationLevel: grausPertinencia.ansioso,
        consequent: { variable: 'intencao_playlist', value: 'reflexiva' }
      });
    }
    
    if (grausPertinencia.neutro > 0) {
      regrasAtivadas.push({
        ruleId: 'R3',
        activationLevel: grausPertinencia.neutro,
        consequent: { variable: 'intencao_playlist', value: 'neutra' }
      });
    }
    
    if (grausPertinencia.alegre > 0) {
      regrasAtivadas.push({
        ruleId: 'R4',
        activationLevel: grausPertinencia.alegre * 0.8,
        consequent: { variable: 'intencao_playlist', value: 'estimulante' }
      });
      regrasAtivadas.push({
        ruleId: 'R5',
        activationLevel: grausPertinencia.alegre * 0.9,
        consequent: { variable: 'intencao_playlist', value: 'feliz' }
      });
    }

    // Regras de gênero
    if (input.generoPreferido) {
      if (input.generoPreferido === 'Sertanejo' && grausPertinencia.triste > 0) {
        regrasAtivadas.push({
          ruleId: 'G3',
          activationLevel: grausPertinencia.triste * 1.1,
          consequent: { variable: 'intencao_playlist', value: 'calmante' }
        });
      }
      
      if (input.generoPreferido === 'Funk' && grausPertinencia.alegre > 0) {
        regrasAtivadas.push({
          ruleId: 'G2',
          activationLevel: grausPertinencia.alegre * 1.2,
          consequent: { variable: 'intencao_playlist', value: 'estimulante' }
        });
      }
      
      if (input.generoPreferido === 'Rock' && grausPertinencia.ansioso > 0) {
        regrasAtivadas.push({
          ruleId: 'G4',
          activationLevel: grausPertinencia.ansioso * 1.0,
          consequent: { variable: 'intencao_playlist', value: 'estimulante' }
        });
      }
      
      if (input.generoPreferido === 'MPB' && grausPertinencia.triste > 0) {
        regrasAtivadas.push({
          ruleId: 'G1',
          activationLevel: grausPertinencia.triste * 0.7,
          consequent: { variable: 'intencao_playlist', value: 'reflexiva' }
        });
      }
    }

    // 4. Combinação das ativações
    const ativacoesCombinadas = {};
    for (const regra of regrasAtivadas) {
      const value = regra.consequent.value;
      const currentLevel = ativacoesCombinadas[value] || 0;
      ativacoesCombinadas[value] = Math.max(currentLevel, regra.activationLevel);
    }

    // 5. Defuzzificação (simplificada)
    const centerPoints = {
      'calmante': 0.1,
      'reflexiva': 0.5,
      'neutra': 0.6,
      'estimulante': 0.8,
      'feliz': 0.9
    };

    let numerator = 0;
    let denominator = 0;
    
    for (const [name, activation] of Object.entries(ativacoesCombinadas)) {
      const center = centerPoints[name] || 0.5;
      numerator += center * activation;
      denominator += activation;
    }

    const valorIntencao = denominator > 0 ? numerator / denominator : 0.5;

    // 6. Interpretação
    let intencaoPlaylist;
    if (valorIntencao <= 0.25) intencaoPlaylist = 'Calmante';
    else if (valorIntencao <= 0.45) intencaoPlaylist = 'Reflexiva';
    else if (valorIntencao <= 0.65) intencaoPlaylist = 'Neutra';
    else if (valorIntencao <= 0.85) intencaoPlaylist = 'Estimulante';
    else intencaoPlaylist = 'Feliz';

    // 7. Confiança
    const intensidadeEmocional = Math.max(...Object.values(grausPertinencia));
    const grauConfianca = Math.min(1, 
      (intensidadeEmocional * 0.6) + 
      (regrasAtivadas.length / 5 * 0.3) + 
      (input.generoPreferido ? 0.1 : 0)
    );

    // 8. Descrição
    const descricoes = {
      'Calmante': 'Músicas suaves e relaxantes para acalmar',
      'Reflexiva': 'Músicas para introspecção e reflexão',
      'Neutra': 'Músicas equilibradas para o dia a dia',
      'Estimulante': 'Músicas energéticas para motivar',
      'Feliz': 'Músicas alegres e positivas'
    };

    let descricao = descricoes[intencaoPlaylist] || 'Playlist personalizada';
    if (input.generoPreferido) {
      descricao += ` no estilo ${input.generoPreferido}`;
    }

    // 9. Filtros emocionais (simplificados)
    const filtrosMusica = this.getEmotionalCriteria(intencaoPlaylist.toLowerCase());

    return {
      input,
      output: {
        valorIntencao,
        intencaoPlaylist,
        grauConfianca,
        detalhes: {
          grausPertinencia,
          ativacoesRegras: regrasAtivadas,
          generoEspecifico: !!input.generoPreferido,
          regrasGeneroAplicadas: regrasAtivadas.filter(r => r.ruleId.startsWith('G')).map(r => r.ruleId)
        }
      },
      descricao,
      generoRecomendado: input.generoPreferido || 'Misto (todos os gêneros)',
      scoreConfianca: grauConfianca,
      filtrosMusica,
      metadados: {
        regrasAplicadas: regrasAtivadas.length,
        temRegrasGenero: regrasAtivadas.some(r => r.ruleId.startsWith('G')),
        estadoEmocionalDetectado: estadoDominante,
        intensidadeEmocional: Math.round(intensidadeEmocional * 100) / 100
      }
    };
  }

  getEmotionalCriteria(intention) {
    const criteria = {
      calmante: { maxRaiva: 3, maxEnergia: 0.5, minValencia: 0.3, maxTristeza: 5 },
      reflexiva: { maxRaiva: 4, minTristeza: 3, maxEnergia: 0.6, maxAlegria: 6 },
      neutra: { maxRaiva: 5, maxAlegria: 7, maxTristeza: 6, minValencia: 0.4, maxValencia: 0.7 },
      estimulante: { minEnergia: 0.7, minAlegria: 6, maxTristeza: 4, minValencia: 0.5 },
      feliz: { minAlegria: 7, minValencia: 0.6, maxTristeza: 3, maxMedo: 3 }
    };
    
    return criteria[intention] || {};
  }
}

// ========================================
// EXECUÇÃO DO TESTE
// ========================================

// Cria uma instância do motor de recomendação
const fuzzyEngine = new FuzzyMusicEngine();

// Define a entrada para o teste
const input = {
  estadoEmocional: 8.5, // Estado bem "Alegre"
  generoPreferido: 'Funk' // Gênero Funk
};

console.log(`--- Testando o motor com a entrada ---`);
console.log(`Estado Emocional: ${input.estadoEmocional}`);
console.log(`Gênero Preferido: ${input.generoPreferido || 'Não especificado'}\n`);

try {
  // Processa a recomendação
  const recomendacao = fuzzyEngine.processRecommendation(input);

  // Imprime o resultado no console
  console.log('--- Resultado da Recomendação ---');
  console.log(`Intenção da Playlist: ${recomendacao.output.intencaoPlaylist}`);
  console.log(`Valor da Intenção (0-1): ${recomendacao.output.valorIntencao.toFixed(3)}`);
  console.log(`Confiança da Recomendação: ${recomendacao.output.grauConfianca.toFixed(3)}`);
  console.log(`Descrição da Playlist: ${recomendacao.descricao}`);

  console.log('\n--- Detalhes Técnicos ---');
  console.log('Graus de Pertinência Fuzzificados:');
  Object.entries(recomendacao.output.detalhes.grausPertinencia).forEach(([key, value]) => {
    console.log(`  ${key}: ${value.toFixed(3)}`);
  });

  console.log('\nAtivações de Regras:');
  recomendacao.output.detalhes.ativacoesRegras.forEach(regra => {
    console.log(`  ${regra.ruleId}: ${regra.activationLevel.toFixed(3)} → ${regra.consequent.value}`);
  });

  console.log('\nFiltros Emocionais Gerados:');
  Object.entries(recomendacao.filtrosMusica).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  console.log('\n--- Metadados ---');
  console.log(`Estado emocional detectado: ${recomendacao.metadados.estadoEmocionalDetectado}`);
  console.log(`Intensidade emocional: ${(recomendacao.metadados.intensidadeEmocional * 100).toFixed(1)}%`);
  console.log(`Regras aplicadas: ${recomendacao.metadados.regrasAplicadas}`);
  console.log(`Tem regras de gênero: ${recomendacao.metadados.temRegrasGenero ? 'SIM' : 'NÃO'}`);
  console.log(`Regras de gênero: ${recomendacao.output.detalhes.regrasGeneroAplicadas.join(', ') || 'Nenhuma'}`);

  console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');

} catch (error) {
  console.log(`❌ ERRO: ${error.message}`);
}