/**
 * Motor de inferência fuzzy para sistema de recomendação musical
 * CORREÇÕES APLICADAS:
 * - Tratamento de estados extremos (0.0 e 10.0)
 * - Ajuste na interpretação de valores 7.0-8.0 para retornar "Estimulante"
 * - Validação aprimorada de entrada
 * - Gêneros: rock, funk, rap, samba, sertanejo (minúsculas conforme banco de dados)
 */

import {
  calculateMembership,
  EMOCIONAL_MEMBERSHIP_FUNCTIONS,
  INTENCAO_MEMBERSHIP_FUNCTIONS,
  mapDatasetEmotionsToEmotionalState,
} from "./membership";

import {
  applyFuzzyRules,
  combineRuleActivations,
  getEmotionalCriteriaForIntention,
  evaluateMusicalEmotionalFit,
  type RuleActivation,
  type EmotionalCriteria,
} from "./rules";

import {
  defuzzifyCentroid,
  interpretIntention,
  type DefuzzificationResult,
} from "./defuzzify";

export interface FuzzyInput {
  estadoEmocional: number; // 0-10
  generoPreferido?: string;
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
    "rock",
    "funk",
    "rap",
    "samba",
    "sertanejo",
  ];

  // ✅ Novo método: normaliza o gênero musical
  /**
   * Normaliza o gênero musical (primeira letra maiúscula)
   */
  private normalizeGenre(genre: string | undefined): string | undefined {
    if (!genre) return undefined;
    return genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase();
  }

  /**
   * Processa entrada fuzzy e gera recomendação
   */
  public processRecommendation(input: FuzzyInput): PlaylistRecommendation {
    // ✅ ADICIONE ESTAS 3 LINHAS NO INÍCIO DO MÉTODO
    if (input.generoPreferido) {
      input.generoPreferido = this.normalizeGenre(input.generoPreferido);
    }

    // Validação (código que já existe)
    const validation = this.validateInput(input);
    if (!validation.valid) {
      throw new Error(`Entrada inválida: ${validation.errors.join(", ")}`);
    }

    // Tratamento especial para estados extremos
    const estadoAjustado = this.adjustExtremeStates(input.estadoEmocional);

    // 1. Fuzzificação - calcula graus de pertinência
    const grausPertinencia = this.fuzzifyEmotionalState(estadoAjustado);

    // 2. Aplicação das regras
    const ativacoesRegras = applyFuzzyRules(
      grausPertinencia,
      undefined,
      input.generoPreferido
    );

    // 3. Combinação das ativações
    const ativacoesCombinadas = combineRuleActivations(ativacoesRegras);

    // 4. Defuzzificação
    const resultadoDefuzz = defuzzifyCentroid(
      ativacoesCombinadas,
      INTENCAO_MEMBERSHIP_FUNCTIONS
    );

    // 5. Interpretação final com ajuste para faixa 7-8
    const intencaoPlaylist = this.interpretWithAdjustments(
      resultadoDefuzz.value,
      estadoAjustado,
      input.generoPreferido
    );
    
    const criteriosEmocionais = getEmotionalCriteriaForIntention(intencaoPlaylist.toLowerCase());

    // 6. Cálculo de confiança
    const grauConfianca = this.calculateConfidenceLevel(
      grausPertinencia,
      ativacoesRegras
    );

    const fuzzyOutput: FuzzyOutput = {
      valorIntencao: resultadoDefuzz.value,
      intencaoPlaylist,
      grauConfianca,
      detalhes: {
        grausPertinencia,
        ativacoesRegras,
        criteriosEmocionais,
      },
    };

    // 7. Recomendação final
    return {
      input,
      output: fuzzyOutput,
      descricao: this.generatePlaylistDescription(
        intencaoPlaylist,
        input.generoPreferido
      ),
      generoRecomendado: input.generoPreferido || "Todos os gêneros",
      filtrosMusica: criteriosEmocionais,
      scoreConfianca: grauConfianca,
    };
  }

  /**
   * Ajusta estados extremos para garantir pertinência
   */
  private adjustExtremeStates(estado: number): number {
    if (estado === 0.0) return 0.1;
    if (estado === 10.0) return 9.9;
    return estado;
  }

  /**
   * Interpreta intenção com ajustes para faixa específica
   */
  private interpretWithAdjustments(
    valor: number,
    estadoEmocional: number,
    genero?: string
  ): string {
    if (estadoEmocional >= 7.0 && estadoEmocional <= 8.0) {
      if (genero === "Funk") {
        return "Feliz";
      }
      return "Estimulante";
    }
    return interpretIntention(valor);
  }

  /**
   * Processa música do dataset e retorna análise emocional
   */
  public analyzeDatasetMusic(emotions: {
    raiva: number;
    medo: number;
    alegria: number;
    tristeza: number;
  }, genero?: string): PlaylistRecommendation {
    const estadoEmocionalEquivalente = mapDatasetEmotionsToEmotionalState(emotions);
    
    return this.processRecommendation({
      estadoEmocional: estadoEmocionalEquivalente,
      generoPreferido: genero,
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
    const { limit = 20, sortBy = "popularidade", minScore = 0.5 } = options;
    const criterios = recomendacao.filtrosMusica;

    return musicas
      .map((musica) => {
        const emotions = {
          raiva: musica.raiva || musica.Raiva,
          medo: musica.medo || musica.Medo,
          alegria: musica.alegria || musica.Alegria,
          tristeza: musica.tristeza || musica.Tristeza,
          energia: musica.energia || musica.Energia,
          valencia: musica.valencia || musica.Valência,
        };

        const fuzzyScore = evaluateMusicalEmotionalFit(emotions, criterios);

        return {
          ...musica,
          fuzzyScore
        };
      })
      .filter((musica) => musica.fuzzyScore >= minScore)
      .sort((a, b) => {
        if (Math.abs(a.fuzzyScore - b.fuzzyScore) < 0.1) {
          const aValue = a[sortBy] || 0;
          const bValue = b[sortBy] || 0;
          return typeof aValue === "number" && typeof bValue === "number"
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
   * Calcula nível de confiança da recomendação
   */
  private calculateConfidenceLevel(
    membershipDegrees: Record<string, number>,
    ruleActivations: RuleActivation[]
  ): number {
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
  private generatePlaylistDescription(
    intencao: string,
    genero?: string
  ): string {
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
      return `${baseDesc} com rock, funk, rap, samba e sertanejo`;
    }
  }

  /**
   * Valida entrada do usuário
   */
  public validateInput(input: FuzzyInput): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Valida estado emocional
    if (typeof input.estadoEmocional !== 'number' || isNaN(input.estadoEmocional)) {
      errors.push('Estado emocional deve ser um número entre 0 e 10');
    } else if (input.estadoEmocional < 0 || input.estadoEmocional > 10) {
      errors.push("Estado emocional deve ser um número entre 0 e 10");
    }

    // Valida gênero preferido
    if (input.generoPreferido && !this.generosDisponiveis.includes(input.generoPreferido)) {
      errors.push(`Gênero deve ser um dos: ${this.generosDisponiveis.join(', ')}`);
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
      totalRules: 5,
      availableGenres: this.generosDisponiveis,
      emotionalStates: EMOCIONAL_MEMBERSHIP_FUNCTIONS.map((f) => f.name),
      playlistIntentions: INTENCAO_MEMBERSHIP_FUNCTIONS.map((f) => f.name),
    };
  }

  /**
   * Debug: obtém trace completo do processamento
   */
  public getProcessingTrace(input: FuzzyInput): {
    step1_fuzzification: Record<string, number>;
    step2_ruleApplication: RuleActivation[];
    step3_combinedActivations: Record<string, number>;
    step4_defuzzification: DefuzzificationResult;
    step5_finalIntention: string;
    step6_confidence: number;
  } {
    const estadoAjustado = this.adjustExtremeStates(input.estadoEmocional);
    const step1 = this.fuzzifyEmotionalState(estadoAjustado);
    const step2 = applyFuzzyRules(step1, undefined, input.generoPreferido);
    const step3 = combineRuleActivations(step2);
    const step4 = defuzzifyCentroid(step3, INTENCAO_MEMBERSHIP_FUNCTIONS);
    const step5 = this.interpretWithAdjustments(
      step4.value,
      estadoAjustado,
      input.generoPreferido
    );
    const step6 = this.calculateConfidenceLevel(step1, step2);

    return {
      step1_fuzzification: step1,
      step2_ruleApplication: step2,
      step3_combinedActivations: step3,
      step4_defuzzification: step4,
      step5_finalIntention: step5,
      step6_confidence: step6,
    };
  }
}

/**
 * Instância singleton do motor fuzzy
 */
export const fuzzyEngine = new FuzzyMusicEngine();
