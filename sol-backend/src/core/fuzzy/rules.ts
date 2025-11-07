export interface FuzzyRule {
  id: string;
  description: string;
  antecedent: {
    variable: string;
    value: string;
  };
  consequent: {
    variable: string;
    value: string;
  };
  weight?: number; // Peso da regra (0-1), padrão 1
}

export interface RuleActivation {
  ruleId: string;
  activationLevel: number;
  consequent: {
    variable: string;
    value: string;
  };
}

/**
 * Regras principais do sistema fuzzy (5 regras base)
 */
export const FUZZY_RULES: FuzzyRule[] = [
  {
    id: "R1",
    description: "Se estado emocional é TRISTE, então intenção é CALMANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "triste",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "calmante",
    },
    weight: 1.0,
  },
  {
    id: "R2",
    description: "Se estado emocional é ANSIOSO, então intenção é REFLEXIVA",
    antecedent: {
      variable: "estado_emocional",
      value: "ansioso",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "reflexiva",
    },
    weight: 1.0,
  },
  {
    id: "R3",
    description: "Se estado emocional é NEUTRO, então intenção é NEUTRA",
    antecedent: {
      variable: "estado_emocional",
      value: "neutro",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "neutra",
    },
    weight: 1.0,
  },
  {
    id: "R4",
    description: "Se estado emocional é ALEGRE, então intenção é ESTIMULANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "alegre",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 0.8,
  },
  {
    id: "R5",
    description: "Se estado emocional é ALEGRE, então intenção é FELIZ",
    antecedent: {
      variable: "estado_emocional",
      value: "alegre",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "feliz",
    },
    weight: 0.9,
  },
];

/**
 * Regras específicas para gêneros musicais brasileiros
 */
export const GENRE_SPECIFIC_RULES: FuzzyRule[] = [
  // === REGRAS PARA RAP ===
  {
    id: "RAP1",
    description: "Rap com estado TRISTE gera intenção REFLEXIVA intensa",
    antecedent: {
      variable: "estado_emocional",
      value: "triste",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "reflexiva",
    },
    weight: 1.1,
  },
  {
    id: "RAP2",
    description: "Rap com estado ANSIOSO intensifica intenção REFLEXIVA",
    antecedent: {
      variable: "estado_emocional",
      value: "ansioso",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "reflexiva",
    },
    weight: 1.2,
  },
  {
    id: "RAP3",
    description: "Rap com estado NEUTRO gera intenção ESTIMULANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "neutro",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 1.0,
  },
  {
    id: "RAP4",
    description: "Rap com estado ALEGRE gera intenção ESTIMULANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "alegre",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 1.0,
  },

  // === REGRAS PARA SAMBA ===
  {
    id: "SAMBA1",
    description: "Samba com estado TRISTE gera intenção REFLEXIVA suave",
    antecedent: {
      variable: "estado_emocional",
      value: "triste",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "reflexiva",
    },
    weight: 0.9,
  },
  {
    id: "SAMBA2",
    description: "Samba com estado ANSIOSO gera intenção ESTIMULANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "ansioso",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 1.0,
  },
  {
    id: "SAMBA3",
    description: "Samba com estado NEUTRO gera intenção NEUTRA alegre",
    antecedent: {
      variable: "estado_emocional",
      value: "neutro",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "neutra",
    },
    weight: 1.0,
  },
  {
    id: "SAMBA4",
    description: "Samba com estado ALEGRE intensifica intenção FELIZ",
    antecedent: {
      variable: "estado_emocional",
      value: "alegre",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "feliz",
    },
    weight: 1.2,
  },

  // === REGRAS PARA FUNK ===
  {
    id: "FUNK1",
    description:
      "Funk com estado TRISTE gera intenção ESTIMULANTE para animação",
    antecedent: {
      variable: "estado_emocional",
      value: "triste",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 0.9,
  },
  {
    id: "FUNK2",
    description:
      "Funk com estado ANSIOSO gera intenção ESTIMULANTE para liberação",
    antecedent: {
      variable: "estado_emocional",
      value: "ansioso",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 1.1,
  },
  {
    id: "FUNK3",
    description: "Funk com estado NEUTRO gera intenção ESTIMULANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "neutro",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 1.0,
  },
  {
    id: "FUNK4",
    description: "Funk com estado ALEGRE intensifica intenção FELIZ",
    antecedent: {
      variable: "estado_emocional",
      value: "alegre",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "feliz",
    },
    weight: 1.2,
  },

  // === REGRAS PARA SERTANEJO ===
  {
    id: "SERTANEJO1",
    description: "Sertanejo com estado TRISTE intensifica intenção CALMANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "triste",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "calmante",
    },
    weight: 1.2,
  },
  {
    id: "SERTANEJO2",
    description: "Sertanejo com estado ANSIOSO gera intenção REFLEXIVA",
    antecedent: {
      variable: "estado_emocional",
      value: "ansioso",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "reflexiva",
    },
    weight: 0.9,
  },
  {
    id: "SERTANEJO3",
    description: "Sertanejo com estado NEUTRO mantém intenção NEUTRA",
    antecedent: {
      variable: "estado_emocional",
      value: "neutro",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "neutra",
    },
    weight: 1.0,
  },
  {
    id: "SERTANEJO4",
    description: "Sertanejo com estado ALEGRE gera intenção FELIZ",
    antecedent: {
      variable: "estado_emocional",
      value: "alegre",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "feliz",
    },
    weight: 1.0,
  },

  // === REGRAS PARA ROCK ===
  {
    id: "ROCK1",
    description: "Rock com estado TRISTE gera intenção REFLEXIVA intensa",
    antecedent: {
      variable: "estado_emocional",
      value: "triste",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "reflexiva",
    },
    weight: 1.0,
  },
  {
    id: "ROCK2",
    description: "Rock com estado ANSIOSO intensifica intenção ESTIMULANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "ansioso",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 1.2,
  },
  {
    id: "ROCK3",
    description: "Rock com estado NEUTRO gera intenção ESTIMULANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "neutro",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 1.0,
  },
  {
    id: "ROCK4",
    description: "Rock com estado ALEGRE intensifica intenção ESTIMULANTE",
    antecedent: {
      variable: "estado_emocional",
      value: "alegre",
    },
    consequent: {
      variable: "intencao_playlist",
      value: "estimulante",
    },
    weight: 1.1,
  },
];

/**
 * Aplica regras fuzzy aos graus de pertinência
 */
export function applyFuzzyRules(
  membershipDegrees: Record<string, number>,
  rules: FuzzyRule[] = FUZZY_RULES,
  selectedGenre?: string
): RuleActivation[] {
  const activations: RuleActivation[] = [];

  // Aplica regras principais
  for (const rule of rules) {
    const antecedentValue = membershipDegrees[rule.antecedent.value] || 0;

    if (antecedentValue > 0) {
      const activationLevel = antecedentValue * (rule.weight || 1.0);

      activations.push({
        ruleId: rule.id,
        activationLevel: Math.min(1, activationLevel), // Limita a 1
        consequent: rule.consequent,
      });
    }
  }

  // Aplica regras específicas por gênero se aplicável
  if (selectedGenre) {
    const genreRules = getGenreSpecificRules(selectedGenre);

    for (const rule of genreRules) {
      const antecedentValue = membershipDegrees[rule.antecedent.value] || 0;

      if (antecedentValue > 0) {
        const activationLevel = antecedentValue * (rule.weight || 1.0);

        activations.push({
          ruleId: rule.id,
          activationLevel: Math.min(1, activationLevel),
          consequent: rule.consequent,
        });
      }
    }
  }

  return activations;
}

/**
 * Obtém regras específicas para um gênero
 */
export function getGenreSpecificRules(genre: string): FuzzyRule[] {
  const genreMap: Record<string, string[]> = {
    Rap: ["RAP1", "RAP2", "RAP3", "RAP4"],
    Samba: ["SAMBA1", "SAMBA2", "SAMBA3", "SAMBA4"],
    Funk: ["FUNK1", "FUNK2", "FUNK3", "FUNK4"],
    Sertanejo: ["SERTANEJO1", "SERTANEJO2", "SERTANEJO3", "SERTANEJO4"],
    Rock: ["ROCK1", "ROCK2", "ROCK3", "ROCK4"],
  };

  const ruleIds = genreMap[genre] || [];
  return GENRE_SPECIFIC_RULES.filter((rule) => ruleIds.includes(rule.id));
}

/**
 * Combina ativações de regras por consequente usando máximo
 */
export function combineRuleActivations(
  activations: RuleActivation[]
): Record<string, number> {
  const combinedActivations: Record<string, number> = {};

  for (const activation of activations) {
    const consequentValue = activation.consequent.value;
    const currentLevel = combinedActivations[consequentValue] || 0;

    // Usa operador máximo para combinar ativações
    combinedActivations[consequentValue] = Math.max(
      currentLevel,
      activation.activationLevel
    );
  }

  return combinedActivations;
}

/**
 * Critérios emocionais para filtrar músicas do dataset
 */
export interface EmotionalCriteria {
  maxRaiva?: number;
  minRaiva?: number;
  maxMedo?: number;
  minMedo?: number;
  maxAlegria?: number;
  minAlegria?: number;
  maxTristeza?: number;
  minTristeza?: number;
  maxEnergia?: number;
  minEnergia?: number;
  maxValencia?: number;
  minValencia?: number;
}

/**
 * Mapeamento de intenções para critérios emocionais
 * MELHORADO: Critérios mais específicos por gênero
 */
export const INTENTION_TO_EMOTIONAL_CRITERIA: Record<
  string,
  EmotionalCriteria
> = {
  calmante: {
    maxRaiva: 3,
    maxEnergia: 0.5,
    minValencia: 0.3,
    maxTristeza: 6,
  },
  reflexiva: {
    maxRaiva: 4,
    minTristeza: 2,
    maxEnergia: 0.7,
    maxAlegria: 6,
    minValencia: 0.3,
  },
  neutra: {
    maxRaiva: 5,
    maxAlegria: 7,
    maxTristeza: 6,
    minValencia: 0.4,
    maxValencia: 0.7,
    maxEnergia: 0.8,
  },
  estimulante: {
    minEnergia: 0.6,
    minAlegria: 5,
    maxTristeza: 5,
    minValencia: 0.4,
  },
  feliz: {
    minAlegria: 6,
    minValencia: 0.5,
    maxTristeza: 4,
    maxMedo: 4,
    minEnergia: 0.5,
  },
};

/**
 * Critérios emocionais específicos por gênero
 */
export const GENRE_EMOTIONAL_MODIFIERS: Record<
  string,
  Record<string, Partial<EmotionalCriteria>>
> = {
  Rap: {
    reflexiva: { maxEnergia: 0.7, minTristeza: 2, maxAlegria: 5 },
    estimulante: { minEnergia: 0.7, maxTristeza: 6 },
    neutra: { minEnergia: 0.6 },
  },
  Samba: {
    reflexiva: { maxEnergia: 0.6, minValencia: 0.3 },
    estimulante: { minEnergia: 0.7, minAlegria: 6 },
    neutra: { minValencia: 0.4, minEnergia: 0.5 },
    feliz: { minEnergia: 0.6, minAlegria: 7, minValencia: 0.6 },
  },
  Funk: {
    estimulante: { minEnergia: 0.8, minAlegria: 6 },
    feliz: { minEnergia: 0.7, minAlegria: 7 },
    neutra: { minEnergia: 0.6 },
  },
  Sertanejo: {
    calmante: { minValencia: 0.2, maxEnergia: 0.4 },
    reflexiva: { maxEnergia: 0.5 },
    feliz: { minValencia: 0.6, maxEnergia: 0.7 },
  },
  Rock: {
    estimulante: { minEnergia: 0.7, maxTristeza: 6 },
    reflexiva: { minEnergia: 0.4, maxAlegria: 5 },
    neutra: { minEnergia: 0.5 },
  },
};

/**
 * Obtém critérios emocionais para uma intenção com modificadores de gênero
 */
export function getEmotionalCriteriaForIntention(
  intention: string,
  genre?: string
): EmotionalCriteria {
  const baseCriteria = INTENTION_TO_EMOTIONAL_CRITERIA[intention] || {};

  if (!genre || !GENRE_EMOTIONAL_MODIFIERS[genre]) {
    return baseCriteria;
  }

  const genreModifiers = GENRE_EMOTIONAL_MODIFIERS[genre][intention] || {};

  // Combina critérios base com modificadores específicos do gênero
  return {
    ...baseCriteria,
    ...genreModifiers,
  };
}

/**
 * Avalia se uma música atende aos critérios emocionais
 */
export function evaluateMusicalEmotionalFit(
  musicEmotions: {
    raiva?: number;
    medo?: number;
    alegria?: number;
    tristeza?: number;
    energia?: number;
    valencia?: number;
  },
  criteria: EmotionalCriteria
): number {
  let score = 0;
  let totalCriteria = 0;

  // Avalia cada critério
  for (const [key, value] of Object.entries(criteria)) {
    if (value === undefined) continue;

    const emotionKey = key.replace("max", "").replace("min", "").toLowerCase();
    const emotionValue =
      musicEmotions[emotionKey as keyof typeof musicEmotions];

    if (emotionValue === undefined) continue;

    totalCriteria++;

    if (key.startsWith("max") && emotionValue <= value) {
      score++;
    } else if (key.startsWith("min") && emotionValue >= value) {
      score++;
    }
  }

  return totalCriteria > 0 ? score / totalCriteria : 0;
}

/**
 * Valida se um gênero é suportado
 */
export function isValidGenre(genre: string): boolean {
  return ["Rap", "Samba", "Funk", "Sertanejo", "Rock"].includes(genre);
}

/**
 * Obtém estatísticas das regras por gênero
 */
export function getGenreRuleStats(): Record<
  string,
  { totalRules: number; ruleIds: string[] }
> {
  const genres = ["Rap", "Samba", "Funk", "Sertanejo", "Rock"];
  const stats: Record<string, { totalRules: number; ruleIds: string[] }> = {};

  for (const genre of genres) {
    const rules = getGenreSpecificRules(genre);
    stats[genre] = {
      totalRules: rules.length,
      ruleIds: rules.map((r) => r.id),
    };
  }

  return stats;
}