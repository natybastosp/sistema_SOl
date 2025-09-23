/**
 * Módulo de defuzzificação para converter saídas fuzzy em valores crisp
 */

import { 
  triangularMembership, 
  trapezoidalMembership, 
  type MembershipFunction 
} from './membership';

export interface DefuzzificationResult {
  value: number;
  method: string;
  confidence: number;
  activatedRegions: Array<{
    name: string;
    peak: number;
    area: number;
  }>;
}

/**
 * Método de defuzzificação por centroide (centro de área)
 * Principal método usado no sistema
 */
export function defuzzifyCentroid(
  activations: Record<string, number>,
  membershipFunctions: MembershipFunction[],
  domain: [number, number] = [0, 1],
  resolution: number = 1000
): DefuzzificationResult {
  const [min, max] = domain;
  const stepSize = (max - min) / resolution;
  
  let numerator = 0;
  let denominator = 0;
  const activatedRegions: DefuzzificationResult['activatedRegions'] = [];

  // Calcula centroide
  for (let i = 0; i <= resolution; i++) {
    const x = min + i * stepSize;
    let aggregatedMembership = 0;

    // Agrega valores de pertinência de todas as funções ativadas
    for (const func of membershipFunctions) {
      const activation = activations[func.name] || 0;
      
      if (activation > 0) {
        let membership = 0;
        
        if (func.type === 'triangular' && func.points.length === 3) {
          membership = triangularMembership(x, func.points as [number, number, number]);
        } else if (func.type === 'trapezoidal' && func.points.length === 4) {
          membership = trapezoidalMembership(x, func.points as [number, number, number, number]);
        }

        // Aplica clipping (método de Mamdani)
        const clippedMembership = Math.min(membership, activation);
        aggregatedMembership = Math.max(aggregatedMembership, clippedMembership);
      }
    }

    numerator += x * aggregatedMembership;
    denominator += aggregatedMembership;
  }

  // Calcula regiões ativadas para análise
  for (const func of membershipFunctions) {
    const activation = activations[func.name] || 0;
    
    if (activation > 0) {
      let peak = 0;
      let area = 0;

      if (func.type === 'triangular' && func.points.length === 3) {
        peak = func.points[1]; // Pico da triangular
        area = calculateTriangularClippedArea(func.points as [number, number, number], activation);
      } else if (func.type === 'trapezoidal' && func.points.length === 4) {
        peak = (func.points[1] + func.points[2]) / 2; // Centro do plateau
        area = calculateTrapezoidalClippedArea(func.points as [number, number, number, number], activation);
      }

      activatedRegions.push({
        name: func.name,
        peak,
        area
      });
    }
  }

  const centroidValue = denominator > 0 ? numerator / denominator : 0.5;
  const confidence = calculateDefuzzificationConfidence(activations, activatedRegions);

  return {
    value: Math.max(0, Math.min(1, centroidValue)), // Garante que está no domínio [0,1]
    method: 'centroid',
    confidence,
    activatedRegions
  };
}

/**
 * Método de defuzzificação por média ponderada
 * Alternativa mais simples para casos específicos
 */
export function defuzzifyWeightedAverage(
  activations: Record<string, number>,
  membershipFunctions: MembershipFunction[]
): DefuzzificationResult {
  let numerator = 0;
  let denominator = 0;
  const activatedRegions: DefuzzificationResult['activatedRegions'] = [];

  for (const func of membershipFunctions) {
    const activation = activations[func.name] || 0;
    
    if (activation > 0) {
      let peak = 0;

      if (func.type === 'triangular' && func.points.length === 3) {
        peak = func.points[1];
      } else if (func.type === 'trapezoidal' && func.points.length === 4) {
        peak = (func.points[1] + func.points[2]) / 2;
      }

      numerator += peak * activation;
      denominator += activation;

      activatedRegions.push({
        name: func.name,
        peak,
        area: activation
      });
    }
  }

  const value = denominator > 0 ? numerator / denominator : 0.5;
  const confidence = calculateDefuzzificationConfidence(activations, activatedRegions);

  return {
    value: Math.max(0, Math.min(1, value)),
    method: 'weighted_average',
    confidence,
    activatedRegions
  };
}

/**
 * Interpreta valor defuzzificado em categoria de intenção
 * Mapeia valor [0,1] para as 5 intenções do sistema
 */
export function interpretIntention(value: number): string {
  const interpretations = [
    { threshold: 0.25, label: 'Calmante' },
    { threshold: 0.45, label: 'Reflexiva' },
    { threshold: 0.65, label: 'Neutra' },
    { threshold: 0.85, label: 'Estimulante' },
    { threshold: 1.0, label: 'Feliz' }
  ];

  for (const interpretation of interpretations) {
    if (value <= interpretation.threshold) {
      return interpretation.label;
    }
  }

  return 'Feliz'; // Fallback
}

/**
 * Calcula área de uma função triangular clippada
 */
function calculateTriangularClippedArea(points: [number, number, number], clipLevel: number): number {
  const [a, b, c] = points;
  
  if (clipLevel >= 1) {
    // Área completa do triângulo
    return 0.5 * (c - a) * 1;
  }

  // Calcula pontos onde o clip intersecta os lados do triângulo
  const leftIntersect = a + (b - a) * clipLevel;
  const rightIntersect = c - (c - b) * clipLevel;
  
  // Área do trapézio formado pelo clipping
  const width = rightIntersect - leftIntersect;
  return width * clipLevel;
}

/**
 * Calcula área de uma função trapezoidal clippada
 */
function calculateTrapezoidalClippedArea(points: [number, number, number, number], clipLevel: number): number {
  const [a, b, c, d] = points;
  
  if (clipLevel >= 1) {
    // Área completa do trapézio
    const base1 = c - b; // Plateau
    const base2 = d - a; // Base inferior
    return 0.5 * (base1 + base2) * 1;
  }

  // Para função trapezoidal, o clipping sempre resulta em trapézio menor
  const leftIntersect = a + (b - a) * clipLevel;
  const rightIntersect = d - (d - c) * clipLevel;
  const width = rightIntersect - leftIntersect;
  
  return width * clipLevel;
}

/**
 * Calcula confiança da defuzzificação
 */
function calculateDefuzzificationConfidence(
  activations: Record<string, number>,
  activatedRegions: DefuzzificationResult['activatedRegions']
): number {
  if (activatedRegions.length === 0) return 0;

  // Confiança baseada na força das ativações
  const maxActivation = Math.max(...Object.values(activations));
  
  // Confiança baseada na distribuição das ativações
  const activationVariance = calculateVariance(Object.values(activations));
  const distributionFactor = 1 / (1 + activationVariance); // Menor variância = maior confiança

  // Confiança baseada no número de regiões ativadas
  const regionFactor = Math.min(1, activatedRegions.length / 3);

  // Combina fatores
  return (maxActivation * 0.5 + distributionFactor * 0.3 + regionFactor * 0.2);
}

/**
 * Calcula variância de um array de números
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}