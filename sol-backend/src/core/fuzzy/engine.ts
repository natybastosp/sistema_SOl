/**
 * Motor de inferência fuzzy para sistema de recomendação musical
 */

import {
  calculateMembership,
  EMOCIONAL_MEMBERSHIP_FUNCTIONS,
  INTENCAO_MEMBERSHIP_FUNCTIONS,
  mapDatasetEmotionsToEmotionalState
} from './membership';

import {
  applyFuzzyRules,
  combineRuleActivations,
  getEmotionalCriteriaForIntention,
  evaluateMusicalEmotionalFit,
  CONTEXTUAL_RULES,
  type RuleActivation,
  type EmotionalCriteria
} from './rules';

import {
  defuzzifyCentroid,
  interpretIntention,
  type DefuzzificationResult
} from './defuzzify';

export interface FuzzyInput {
  estadoEmocional: number; // 0-10
  generoPreferido?: string;
  contexto?: {
    hora?: number; // 0-23
    diaSemana?: number; // 0-6 (0=domingo)
    ambiente?: 'casa' | 'trabalho' | 'exercicio' | 'transporte';
  };
}

export interface FuzzyOutput {
  valorIntencao: number; // 0-1
  intencaoPlaylist: string;
  grauConfianca: number; // 0-1
  detalhes: {
    grausPertinencia: Record<string, number>;
    ativacoesRegras: RuleActivation[];
    criteriosEmocionais: EmotionalCriteria;
  };
}

export interface PlaylistRecommendation {
  input: FuzzyInput;
  output: FuzzyOutput;
  descricao: string;
  generoRecomendado: string;
  filtrosMusica: EmotionalCriteria;
  scoreConfianca: number;
}

/**
 * Classe principal do motor de inferência fuzzy
 */
export class FuzzyMusicEngine {
  private readonly generosDisponiveis = [
    'Funk', 'Sertanejo', 'MPB', 'Rock', 'Pop', 'Forró', 'Axé', 'Bossa Nova'
  ];

  /**
   * Processa entrada fuzzy e gera recomendação
   */
  public processRecommendation(input: FuzzyInput): PlaylistRecommendation {
    // 1. Fuzzificação - calcula graus de pertinência
    const grausPertinencia = this.fuzzifyEmotionalState(input.estadoEmocional);

    // 2. Aplicação das regras
    const ativacoesRegras = applyFuzzyRules(grausPertinencia, undefined, input.generoPreferido);

    // 3. Combinação das ativações
    let ativacoesCombinadas = combineRuleActivations(ativacoesRegras);

    // 4. Ajustes contextuais
    ativacoesCombinadas = this.applyContextualAdjustments(ativacoesCombinadas, input.contexto);

    // 5. Defuzzificação
    const resultadoDefuzz = defuzzifyCentroid(ativacoesCombinadas, INTENCAO_MEMBERSHIP_FUNCTIONS);

    // 6. Interpretação final
    const intencaoPlaylist = interpretIntention(resultadoDefuzz.value);
    const criteriosEmocionais = getEmotionalCriteriaForIntention(intencaoPlaylist.toLowerCase());

    // 7. Cálculo de confiança
    const grauConfianca = this.calculateConfidenceLevel(grausPertinencia, ativacoesRegras);

    const fuzzyOutput: FuzzyOutput = {
      valorIntencao: resultadoDefuzz.value,
      intencaoPlaylist,
      grauConfianca,
      detalhes: {
        grausPertinencia,
        ativacoesRegras,
        criteriosEmocionais
      }
    };

    // 8. Recomendação final
    return {
      input,
      output: fuzzyOutput,
      descricao: this.generatePlaylistDescription(intencaoPlaylist, input.generoPreferido),
      generoRecomendado: input.generoPreferido || 'Todos os gêneros',
      filtrosMusica: criteriosEmocionais,
      scoreConfianca: grauConfianca
    };
  }

  /**
   * Processa música do dataset e retorna análise emocional
   */
  public analyzeDatasetMusic(emotions: {
    raiva: number;
    medo: number;
    alegria: number;
    tristeza: number;
    surpresa: number;
  }, genero?: string): PlaylistRecommendation {
    const estadoEmocionalEquivalente = mapDatasetEmotionsToEmotionalState(emotions);
    
    return this.processRecommendation({
      estadoEmocional: estadoEmocionalEquivalente,
      generoPreferido: genero
    });
  }

  /**
   * Filtra músicas do dataset baseado na recomendação
   */
  public filterMusicsByRecommendation<T extends Record<string, any>>(
    musicas: T[],
    recomendacao: PlaylistRecommendation,
    options: {
      limit?: number;
      sortBy?: keyof T;
      minScore?: number;
    } = {}
  ): Array<T & { fuzzyScore: number }> {
    const { limit = 20, sortBy = 'popularidade', minScore = 0.5 } = options;
    const criterios = recomendacao.filtrosMusica;

    return musicas
      .map(musica => {
        const emotions = {
          raiva: musica.raiva || musica.Raiva,
          medo: musica.medo || musica.Medo,
          alegria: musica.alegria || musica.Alegria,
          tristeza: musica.tristeza || musica.Tristeza,
          surpresa: musica.surpresa || musica.Surpresa,
          energia: musica.energia || musica.Energia,
          valencia: musica.valencia || musica.Valência
        };

        const fuzzyScore = evaluateMusicalEmotionalFit(emotions, criterios);

        return {
          ...musica,
          fuzzyScore
        };
      })
      .filter(musica => musica.fuzzyScore >= minScore)
      .sort((a, b) => {
        // Ordena primeiro por score fuzzy, depois pelo campo especificado
        if (Math.abs(a.fuzzyScore - b.fuzzyScore) < 0.1) {
          const aValue = a[sortBy] || 0;
          const bValue = b[sortBy] || 0;
          return typeof aValue === 'number' && typeof bValue === 'number'
            ? bValue - aValue
            : 0;
        }
        return b.fuzzyScore - a.fuzzyScore;
      })
      .slice(0, limit);
  }

  /**
   * Fuzzifica estado emocional
   */
  private fuzzifyEmotionalState(value: number): Record<string, number> {
    return calculateMembership(value, EMOCIONAL_MEMBERSHIP_FUNCTIONS);
  }

  /**
   * Aplica ajustes contextuais
   */
  private applyContextualAdjustments(
    activations: Record<string, number>,
    context?: FuzzyInput['contexto']
  ): Record<string, number> {
    if (!context) return activations;

    const adjustedActivations = { ...activations };
    
    // Determina condições contextuais
    const conditions: string[] = [];
    
    if (context.hora !== undefined) {
      if (context.hora >= 6 && context.hora < 12) conditions.push('manha');
      else if (context.hora >= 18 || context.hora < 6) conditions.push('hora_noite');
    }
    
    if (context.diaSemana !== undefined && (context.diaSemana === 0 || context.diaSemana === 6)) {
      conditions.push('fim_semana');
    }

    // Aplica regras contextuais
    for (const rule of CONTEXTUAL_RULES) {
      if (conditions.includes(rule.condition)) {
        const variable = rule.adjustment.variable;
        const currentValue = adjustedActivations[variable] || 0;
        
        switch (rule.adjustment.operation) {
          case 'multiply':
            adjustedActivations[variable] = Math.min(1, currentValue * rule.adjustment.value);
            break;
          case 'add':
            adjustedActivations[variable] = Math.min(1, currentValue + rule.adjustment.value);
            break;
          case 'set':
            adjustedActivations[variable] = Math.min(1, rule.adjustment.value);
            break;
        }
      }
    }

    return adjustedActivations;
  }

  /**
   * Calcula nível de confiança da recomendação
   */
  private calculateConfidenceLevel(
    membershipDegrees: Record<string, number>,
    ruleActivations: RuleActivation[]
  ): number {
    // Confiança baseada na clareza do estado emocional
    const maxMembership = Math.max(...Object.values(membershipDegrees));
    const membershipClarity = maxMembership;

    // Confiança baseada no número de regras ativadas
    const activeRules = ruleActivations.filter(r => r.activationLevel > 0.1).length;
    const ruleConsistency = Math.min(1, activeRules / 3); // Normaliza para 3 regras

    // Confiança baseada na força das ativações
    const avgActivation = ruleActivations.reduce((sum, r) => sum + r.activationLevel, 0) / 
                         Math.max(1, ruleActivations.length);

    // Combina métricas de confiança
    return (membershipClarity * 0.4 + ruleConsistency * 0.3 + avgActivation * 0.3);
  }

  /**
   * Gera descrição da playlist
   */
  private generatePlaylistDescription(intencao: string, genero?: string): string {
    const descricoes: Record<string, string> = {
      'Calmante': 'Músicas suaves e relaxantes para acalmar e diminuir o estresse',
      'Reflexiva': 'Músicas que convidam à introspecção e reflexão pessoal',
      'Neutra': 'Músicas equilibradas para acompanhar atividades do dia a dia',
      'Estimulante': 'Músicas energéticas para motivar e animar',
      'Feliz': 'Músicas alegres e positivas para celebrar bons momentos'
    };

    const baseDesc = descricoes[intencao] || 'Playlist personalizada';
    
    if (genero && this.generosDisponiveis.includes(genero)) {
      return `${baseDesc} no gênero ${genero}`;
    } else {
      return `${baseDesc} com diversos gêneros brasileiros`;
    }
  }

  /**
   * Valida entrada do usuário
   */
  public validateInput(input: FuzzyInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Valida estado emocional
    if (input.estadoEmocional < 0 || input.estadoEmocional > 10) {
      errors.push('Estado emocional deve estar entre 0 e 10');
    }

    // Valida gênero preferido
    if (input.generoPreferido && !this.generosDisponiveis.includes(input.generoPreferido)) {
      errors.push(`Gênero deve ser um dos: ${this.generosDisponiveis.join(', ')}`);
    }

    // Valida contexto
    if (input.contexto) {
      if (input.contexto.hora !== undefined && (input.contexto.hora < 0 || input.contexto.hora > 23)) {
        errors.push('Hora deve estar entre 0 e 23');
      }
      
      if (input.contexto.diaSemana !== undefined && (input.contexto.diaSemana < 0 || input.contexto.diaSemana > 6)) {
        errors.push('Dia da semana deve estar entre 0 (domingo) e 6 (sábado)');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtém estatísticas do sistema
   */
  public getSystemStats(): {
    totalRules: number;
    availableGenres: string[];
    emotionalStates: string[];
    playlistIntentions: string[];
  } {
    return {
      totalRules: CONTEXTUAL_RULES.length + 5, // regras base + contextuais
      availableGenres: this.generosDisponiveis,
      emotionalStates: EMOCIONAL_MEMBERSHIP_FUNCTIONS.map(f => f.name),
      playlistIntentions: INTENCAO_MEMBERSHIP_FUNCTIONS.map(f => f.name)
    };
  }

  /**
   * Debug: obtém trace completo do processamento
   */
  public getProcessingTrace(input: FuzzyInput): {
    step1_fuzzification: Record<string, number>;
    step2_ruleApplication: RuleActivation[];
    step3_combinedActivations: Record<string, number>;
    step4_contextualAdjustments: Record<string, number>;
    step5_defuzzification: DefuzzificationResult;
    step6_finalIntention: string;
    step7_confidence: number;
  } {
    // Executa cada passo mantendo o estado intermediário
    const step1 = this.fuzzifyEmotionalState(input.estadoEmocional);
    const step2 = applyFuzzyRules(step1, undefined, input.generoPreferido);
    const step3 = combineRuleActivations(step2);
    const step4 = this.applyContextualAdjustments(step3, input.contexto);
    const step5 = defuzzifyCentroid(step4, INTENCAO_MEMBERSHIP_FUNCTIONS);
    const step6 = interpretIntention(step5.value);
    const step7 = this.calculateConfidenceLevel(step1, step2);

    return {
      step1_fuzzification: step1,
      step2_ruleApplication: step2,
      step3_combinedActivations: step3,
      step4_contextualAdjustments: step4,
      step5_defuzzification: step5,
      step6_finalIntention: step6,
      step7_confidence: step7
    };
  }
}

/**
 * Instância singleton do motor fuzzy
 */
export const fuzzyEngine = new FuzzyMusicEngine();