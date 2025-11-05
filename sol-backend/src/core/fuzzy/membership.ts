/**
 * Funções de pertinência fuzzy para o sistema de recomendação musical
 */

export interface MembershipPoint {
  x: number;
  y: number;
}

export interface MembershipFunction {
  name: string;
  points: number[];
  type: 'triangular' | 'trapezoidal';
}

/**
 * Função de pertinência triangular
 * @param x Valor de entrada
 * @param points Array com [a, b, c] onde b é o pico
 */
export function triangularMembership(x: number, points: [number, number, number]): number {
  const [a, b, c] = points;
  
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  
  if (x < b) {
    return (x - a) / (b - a);
  } else {
    return (c - x) / (c - b);
  }
}

/**
 * Função de pertinência trapezoidal
 * @param x Valor de entrada
 * @param points Array com [a, b, c, d] onde b-c é o plateau
 */
export function trapezoidalMembership(x: number, points: [number, number, number, number]): number {
  const [a, b, c, d] = points;
  
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  
  if (x < b) {
    return (x - a) / (b - a);
  } else {
    return (d - x) / (d - c);
  }
}

/**
 * Calcula grau de pertinência para múltiplas funções
 */
export function calculateMembership(value: number, functions: MembershipFunction[]): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const func of functions) {
    if (func.type === 'triangular' && func.points.length === 3) {
      result[func.name] = triangularMembership(value, func.points as [number, number, number]);
    } else if (func.type === 'trapezoidal' && func.points.length === 4) {
      result[func.name] = trapezoidalMembership(value, func.points as [number, number, number, number]);
    }
  }
  
  return result;
}

/**
 * Definições das funções de pertinência para estado emocional
 */
export const EMOCIONAL_MEMBERSHIP_FUNCTIONS: MembershipFunction[] = [
  {
    name: 'triste',
    type: 'trapezoidal',
    points: [0, 0, 2, 4]
  },
  {
    name: 'ansioso',
    type: 'triangular',
    points: [2, 4, 6]
  },
  {
    name: 'neutro',
    type: 'triangular',
    points: [4, 5, 6]
  },
  {
    name: 'alegre',
    type: 'trapezoidal',
    points: [5, 7, 9, 10]
  }
];

/**
 * Definições das funções de pertinência para intenção da playlist
 */
export const INTENCAO_MEMBERSHIP_FUNCTIONS: MembershipFunction[] = [
  {
    name: 'calmante',
    type: 'trapezoidal',
    points: [0, 0, 0.2, 0.4]
  },
  {
    name: 'reflexiva',
    type: 'triangular',
    points: [0.3, 0.5, 0.7]
  },
  {
    name: 'neutra',
    type: 'triangular',
    points: [0.4, 0.6, 0.8]
  },
  {
    name: 'estimulante',
    type: 'trapezoidal',
    points: [0.6, 0.8, 1.0, 1.0]
  },
  {
    name: 'feliz',
    type: 'trapezoidal',
    points: [0.7, 0.9, 1.0, 1.0]
  }
];

/**
 * Gera pontos para visualização de uma função de pertinência
 */
export function generateMembershipPoints(
  func: MembershipFunction,
  domain: [number, number],
  steps: number = 100
): MembershipPoint[] {
  const [min, max] = domain;
  const stepSize = (max - min) / steps;
  const points: MembershipPoint[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const x = min + i * stepSize;
    let y = 0;
    
    if (func.type === 'triangular' && func.points.length === 3) {
      y = triangularMembership(x, func.points as [number, number, number]);
    } else if (func.type === 'trapezoidal' && func.points.length === 4) {
      y = trapezoidalMembership(x, func.points as [number, number, number, number]);
    }
    
    points.push({ x, y });
  }
  
  return points;
}

/**
 * Converte emoções do dataset para estado emocional [0-10]
 */
export function mapDatasetEmotionsToEmotionalState(emotions: {
  raiva: number;
  medo: number;
  alegria: number;
  tristeza: number;
  surpresa: number;
}): number {
  const { raiva, medo, alegria, tristeza, surpresa } = emotions;
  
  // Normaliza valores para escala 0-10
  const normalizedEmotions = {
    raiva: Math.max(0, Math.min(10, raiva)),
    medo: Math.max(0, Math.min(10, medo)),
    alegria: Math.max(0, Math.min(10, alegria)),
    tristeza: Math.max(0, Math.min(10, tristeza)),
    surpresa: Math.max(0, Math.min(10, surpresa))
  };
  
  // Determina estado emocional dominante
  if (normalizedEmotions.alegria >= 7 || normalizedEmotions.surpresa >= 6) {
    return 8.0; // Alegre
  } else if (normalizedEmotions.tristeza >= 6 || normalizedEmotions.medo >= 6) {
    return 2.0; // Triste
  } else if (normalizedEmotions.raiva >= 5 || normalizedEmotions.medo >= 3) {
    return 4.0; // Ansioso
  } else {
    return 5.0; // Neutro
  }
}