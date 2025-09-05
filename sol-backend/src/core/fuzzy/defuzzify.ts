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
        // Aproximação da área sob a curva clippada
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
 * Método de defuzzificação por máximo
 */
export function defuzzifyMaximum(
  activations: Record<string, number>,
  membershipFunctions: MembershipFunction[]
): DefuzzificationResult {
  let maxActivation = 0;
  let maxFunction: MembershipFunction | null = null;
  let maxValue = 0.5;

  // Encontra função com maior ativação
  for (const func of membershipFunctions) {
    const activation = activations[func.name] || 0;
    
    if (activation > maxActivation) {
      maxActivation = activation;
      maxFunction = func;
    }
  }

  if (maxFunction) {
    if (maxFunction.type === 'triangular' && maxFunction.points.length === 3) {
      maxValue = maxFunction.points[1]; // Pico
    } else if (maxFunction.type === 'trapezoidal' && maxFunction.points.length === 4) {
      maxValue = (maxFunction.points[1] + maxFunction.points[2]) / 2; // Centro do plateau
    }
  }

  const activatedRegions = maxFunction ? [{
    name: maxFunction.name,
    peak: maxValue,
    area: maxActivation
  }] : [];

  return {
    value: Math.max(0, Math.min(1, maxValue)),
    method: 'maximum',
    confidence: maxActivation,
    activatedRegions
  };
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
  const totalActivation = Object.values(activations).reduce((sum, val) => sum + val, 0);
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

/**
 * Interpreta valor defuzzificado em categoria de intenção
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
 * Método de defuzzificação adaptativo
 * Escolhe automaticamente o melhor método baseado nas características das ativações
 */
export function defuzzifyAdaptive(
  activations: Record<string, number>,
  membershipFunctions: MembershipFunction[]
): DefuzzificationResult {
  const activeCount = Object.values(activations).filter(v => v > 0.1).length;
  const maxActivation = Math.max(...Object.values(activations));
  const activationVariance = calculateVariance(Object.values(activations));

  // Se há uma ativação dominante clara, usa método máximo
  if (maxActivation > 0.8 && activationVariance > 0.1) {
    return defuzzifyMaximum(activations, membershipFunctions);
  }
  
  // Se há poucas ativações, usa média ponderada
  if (activeCount <= 2) {
    return defuzzifyWeightedAverage(activations, membershipFunctions);
  }
  
  // Para casos gerais, usa centroide
  return defuzzifyCentroid(activations, membershipFunctions);
}

/**
 * Classe utilitária para análise de defuzzificação
 */
export class DefuzzificationAnalyzer {
  static compareMethods(
    activations: Record<string, number>,
    membershipFunctions: MembershipFunction[]
  ): {
    centroid: DefuzzificationResult;
    weightedAverage: DefuzzificationResult;
    maximum: DefuzzificationResult;
    adaptive: DefuzzificationResult;
    recommendation: string;
  } {
    const centroid = defuzzifyCentroid(activations, membershipFunctions);
    const weightedAverage = defuzzifyWeightedAverage(activations, membershipFunctions);
    const maximum = defuzzifyMaximum(activations, membershipFunctions);
    const adaptive = defuzzifyAdaptive(activations, membershipFunctions);

    // Recomenda método baseado na confiança
    const methods = { centroid, weightedAverage, maximum, adaptive };
    const bestMethod = Object.entries(methods).reduce((best, [name, result]) => 
      result.confidence > best.result.confidence ? { name, result } : best,
      { name: 'centroid', result: centroid }
    );

    return {
      ...methods,
      recommendation: bestMethod.name
    };
  }

  static visualizeDefuzzification(
    activations: Record<string, number>,
    membershipFunctions: MembershipFunction[],
    resolution: number = 100
  ): Array<{
    x: number;
    aggregatedY: number;
    individual: Record<string, number>;
  }> {
    const points: Array<{
      x: number;
      aggregatedY: number;
      individual: Record<string, number>;
    }> = [];

    for (let i = 0; i <= resolution; i++) {
      const x = i / resolution;
      let aggregatedY = 0;
      const individual: Record<string, number> = {};

      for (const func of membershipFunctions) {
        const activation = activations[func.name] || 0;
        let membership = 0;

        if (func.type === 'triangular' && func.points.length === 3) {
          membership = triangularMembership(x, func.points as [number, number, number]);
        } else if (func.type === 'trapezoidal' && func.points.length === 4) {
          membership = trapezoidalMembership(x, func.points as [number, number, number, number]);
        }

        const clipped = Math.min(membership, activation);
        individual[func.name] = clipped;
        aggregatedY = Math.max(aggregatedY, clipped);
      }

      points.push({ x, aggregatedY, individual });
    }

    return points;
  }
}