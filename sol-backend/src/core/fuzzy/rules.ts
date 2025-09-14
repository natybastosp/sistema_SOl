/**
 * Sistema de regras fuzzy para recomendação musical brasileira
 */

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
    id: 'R1',
    description: 'Se estado emocional é TRISTE, então intenção é CALMANTE',
    antecedent: {
      variable: 'estado_emocional',
      value: 'triste'
    },
    consequent: {
      variable: 'intencao_playlist',
      value: 'calmante'
    },
    weight: 1.0
  },
  {
    id: 'R2',
    description: 'Se estado emocional é ANSIOSO, então intenção é REFLEXIVA',
    antecedent: {
      variable: 'estado_emocional',
      value: 'ansioso'
    },
    consequent: {
      variable: 'intencao_playlist',
      value: 'reflexiva'
    },
    weight: 1.0
  },
  {
    id: 'R3',
    description: 'Se estado emocional é NEUTRO, então intenção é NEUTRA',
    antecedent: {
      variable: 'estado_emocional',
      value: 'neutro'
    },
    consequent: {
      variable: 'intencao_playlist',
      value: 'neutra'
    },
    weight: 1.0
  },
  {
    id: 'R4',
    description: 'Se estado emocional é ALEGRE, então intenção é ESTIMULANTE',
    antecedent: {
      variable: 'estado_emocional',
      value: 'alegre'
    },
    consequent: {
      variable: 'intencao_playlist',
      value: 'estimulante'
    },
    weight: 0.8
  },
  {
    id: 'R5',
    description: 'Se estado emocional é ALEGRE, então intenção é FELIZ',
    antecedent: {
      variable: 'estado_emocional',
      value: 'alegre'
    },
    consequent: {
      variable: 'intencao_playlist',
      value: 'feliz'
    },
    weight: 0.9
  }
];

/**
 * Regras específicas para gêneros musicais brasileiros
 * CORRIGIDO: Apenas 4 regras - uma por gênero
 */
export const GENRE_SPECIFIC_RULES: FuzzyRule[] = [
  {
    id: 'G1',
    description: 'MPB com estado TRISTE intensifica intenção REFLEXIVA',
    antecedent: {
      variable: 'estado_emocional',
      value: 'triste'
    },
    consequent: {
      variable: 'intencao_playlist',
      value: 'reflexiva'
    },
    weight: 0.7
  },
  {
    id: 'G2',
    description: 'Funk com estado ALEGRE intensifica intenção ESTIMULANTE',
    antecedent: {
      variable: 'estado_emocional',
      value: 'alegre'
    },
    consequent: {
      variable: 'intencao_playlist',
      value: 'estimulante'
    },
    weight: 1.2
  },
  {
    id: 'G3',
    description: 'Sertanejo com estado TRISTE intensifica intenção CALMANTE',
    antecedent: {
      variable: 'estado_emocional',
      value: 'triste'
    },
    consequent: {
      variable: 'intencao_playlist',
      value: 'calmante'
    },
    weight: 1.1
  },
  {
    id: 'G4',
    description: 'Rock com estado ANSIOSO intensifica intenção ESTIMULANTE',
    antecedent: {
      variable: 'estado_emocional',
      value: 'ansioso'
    },
    consequent: {
      variable: 'intencao_playlist',
      value: 'estimulante'
    },
    weight: 1.0
  }
  // REMOVIDO: G5 (desnecessária)
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
        consequent: rule.consequent
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
          consequent: rule.consequent
        });
      }
    }
  }
  
  return activations;
}

/**
 * Obtém regras específicas para um gênero
 * CORRIGIDO: Rock tem apenas G4
 */
export function getGenreSpecificRules(genre: string): FuzzyRule[] {
  const genreMap: Record<string, string[]> = {
    'MPB': ['G1'],
    'Funk': ['G2'],
    'Sertanejo': ['G3'],
    'Rock': ['G4'] // CORRIGIDO: Apenas G4, sem G5
  };
  
  const ruleIds = genreMap[genre] || [];
  return GENRE_SPECIFIC_RULES.filter(rule => ruleIds.includes(rule.id));
}

/**
 * Combina ativações de regras por consequente usando máximo
 */
export function combineRuleActivations(activations: RuleActivation[]): Record<string, number> {
  const combinedActivations: Record<string, number> = {};
  
  for (const activation of activations) {
    const consequentValue = activation.consequent.value;
    const currentLevel = combinedActivations[consequentValue] || 0;
    
    // Usa operador máximo para combinar ativações
    combinedActivations[consequentValue] = Math.max(currentLevel, activation.activationLevel);
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
  maxSurpresa?: number;
  minSurpresa?: number;
  maxEnergia?: number;
  minEnergia?: number;
  maxValencia?: number;
  minValencia?: number;
}

/**
 * Mapeamento de intenções para critérios emocionais
 */
export const INTENTION_TO_EMOTIONAL_CRITERIA: Record<string, EmotionalCriteria> = {
  calmante: {
    maxRaiva: 3,
    maxEnergia: 0.5,
    minValencia: 0.3,
    maxTristeza: 5
  },
  reflexiva: {
    maxRaiva: 4,
    minTristeza: 3,
    maxEnergia: 0.6,
    maxAlegria: 6
  },
  neutra: {
    maxRaiva: 5,
    maxAlegria: 7,
    maxTristeza: 6,
    minValencia: 0.4,
    maxValencia: 0.7
  },
  estimulante: {
    minEnergia: 0.7,
    minAlegria: 6,
    maxTristeza: 4,
    minValencia: 0.5
  },
  feliz: {
    minAlegria: 7,
    minValencia: 0.6,
    maxTristeza: 3,
    maxMedo: 3
  }
};

/**
 * Obtém critérios emocionais para uma intenção
 */
export function getEmotionalCriteriaForIntention(intention: string): EmotionalCriteria {
  return INTENTION_TO_EMOTIONAL_CRITERIA[intention] || {};
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
    surpresa?: number;
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
    
    const emotionKey = key.replace('max', '').replace('min', '').toLowerCase();
    const emotionValue = musicEmotions[emotionKey as keyof typeof musicEmotions];
    
    if (emotionValue === undefined) continue;
    
    totalCriteria++;
    
    if (key.startsWith('max') && emotionValue <= value) {
      score++;
    } else if (key.startsWith('min') && emotionValue >= value) {
      score++;
    }
  }
  
  return totalCriteria > 0 ? score / totalCriteria : 0;
}
