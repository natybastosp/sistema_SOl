const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Conjuntos fuzzy para intensidade emocional
const EmotionalIntensitySets = {
  veryLow: {
    name: "muito_baixo",
    membershipFunction: (x) => {
      if (x <= 0.1) return 1.0;
      if (x >= 0.3) return 0.0;
      return (0.3 - x) / 0.2;
    },
  },
  low: {
    name: "baixo",
    membershipFunction: (x) => {
      if (x <= 0.1 || x >= 0.5) return 0.0;
      if (x >= 0.2 && x <= 0.4) return 1.0;
      if (x < 0.2) return (x - 0.1) / 0.1;
      return (0.5 - x) / 0.1;
    },
  },
  medium: {
    name: "medio",
    membershipFunction: (x) => {
      if (x <= 0.3 || x >= 0.7) return 0.0;
      if (x >= 0.4 && x <= 0.6) return 1.0;
      if (x < 0.4) return (x - 0.3) / 0.1;
      return (0.7 - x) / 0.1;
    },
  },
  high: {
    name: "alto",
    membershipFunction: (x) => {
      if (x <= 0.5 || x >= 0.9) return 0.0;
      if (x >= 0.6 && x <= 0.8) return 1.0;
      if (x < 0.6) return (x - 0.5) / 0.1;
      return (0.9 - x) / 0.1;
    },
  },
  veryHigh: {
    name: "muito_alto",
    membershipFunction: (x) => {
      if (x >= 0.9) return 1.0;
      if (x <= 0.7) return 0.0;
      return (x - 0.7) / 0.2;
    },
  },
};

// Classe que representa uma regra fuzzy para recomendação musical
class FuzzyMusicRule {
  constructor(id, description, conditions, recommendations, weight = 1.0) {
    this.id = id;
    this.description = description;
    this.emotionalConditions = conditions;
    this.musicalRecommendations = recommendations;
    this.weight = weight;
  }

  calculateActivation(emotionalState) {
    let totalActivation = 1.0;

    for (const condition of this.emotionalConditions) {
      const emotionValue = emotionalState[condition.emotion];
      const intensitySet = EmotionalIntensitySets[condition.intensity];

      if (!intensitySet) {
        console.warn(`Conjunto fuzzy não encontrado: ${condition.intensity}`);
        continue;
      }

      const membershipDegree = intensitySet.membershipFunction(emotionValue);
      totalActivation = Math.min(totalActivation, membershipDegree);
    }

    return totalActivation * this.weight;
  }
}

// Base de conhecimento de musicoterapia
const MusicTherapyRules = [
  new FuzzyMusicRule(
    "tristeza_alta",
    "Para tristeza intensa, começar com música melancólica e gradualmente introduzir esperança",
    [{ emotion: "sadness", intensity: "high" }],
    {
      preferredGenres: ["MPB", "Blues", "Folk", "Classical"],
      valenceRange: [0.1, 0.4],
      energyRange: [0.2, 0.5],
      danceabilityRange: [0.1, 0.3],
    },
    1.2
  ),
  new FuzzyMusicRule(
    "ansiedade_alta",
    "Para ansiedade alta, música com ritmo previsível e harmonias calmantes",
    [{ emotion: "fear", intensity: "high" }],
    {
      preferredGenres: ["Classical", "Ambient", "New Age", "Folk"],
      valenceRange: [0.3, 0.6],
      energyRange: [0.1, 0.4],
      danceabilityRange: [0.1, 0.3],
    },
    1.1
  ),
  new FuzzyMusicRule(
    "alegria_alta",
    "Para alta alegria, música que mantenha e celebre o estado positivo",
    [{ emotion: "joy", intensity: "high" }],
    {
      preferredGenres: ["Pop", "Rock", "Reggae", "Samba"],
      valenceRange: [0.6, 1.0],
      energyRange: [0.5, 0.9],
      danceabilityRange: [0.4, 0.8],
    },
    0.9
  ),
  new FuzzyMusicRule(
    "raiva_alta",
    "Para raiva intensa, música que permita catarse emocional controlada",
    [{ emotion: "anger", intensity: "high" }],
    {
      preferredGenres: ["Rock", "Metal", "Punk", "Blues"],
      valenceRange: [0.2, 0.5],
      energyRange: [0.6, 0.9],
      danceabilityRange: [0.3, 0.7],
    },
    1.0
  ),
  new FuzzyMusicRule(
    "equilibrio_emocional",
    "Para estado emocional equilibrado, música que mantenha estabilidade",
    [
      { emotion: "joy", intensity: "medium" },
      { emotion: "sadness", intensity: "low" },
    ],
    {
      preferredGenres: ["MPB", "Jazz", "Pop", "Folk", "Classical"],
      valenceRange: [0.4, 0.7],
      energyRange: [0.3, 0.6],
      danceabilityRange: [0.2, 0.5],
    },
    0.8
  ),
];

// Motor de inferência fuzzy
class FuzzyMusicRecommendationEngine {
  constructor() {
    this.rules = MusicTherapyRules;
  }

  async generateRecommendations(emotionalState, userId, playlistSize = 15) {
    console.log("🧠 Iniciando análise fuzzy do estado emocional...");

    const ruleActivations = this.fuzzifyEmotionalState(emotionalState);
    const musicalStrategy = this.inferMusicalStrategy(ruleActivations);
    const candidateMusics = await this.findCandidateMusics(musicalStrategy);
    const finalPlaylist = this.selectOptimalPlaylist(
      candidateMusics,
      emotionalState,
      playlistSize
    );
    const explanation = this.generateExplanation(
      ruleActivations,
      musicalStrategy
    );

    return {
      playlist: finalPlaylist,
      strategy: musicalStrategy,
      explanation: explanation,
      confidence: this.calculateConfidence(ruleActivations),
    };
  }

  fuzzifyEmotionalState(emotionalState) {
    const activations = new Map();

    console.log("📊 Calculando ativação das regras fuzzy...");

    for (const rule of this.rules) {
      const activation = rule.calculateActivation(emotionalState);
      activations.set(rule.id, activation);

      if (activation > 0.1) {
        console.log(
          `   ✓ Regra "${rule.description}": ${(activation * 100).toFixed(
            1
          )}% ativada`
        );
      }
    }

    return activations;
  }

  inferMusicalStrategy(ruleActivations) {
    let combinedStrategy = {
      genreWeights: new Map(),
      valenceTarget: 0,
      energyTarget: 0,
      danceabilityTarget: 0,
      totalWeight: 0,
    };

    for (const rule of this.rules) {
      const activation = ruleActivations.get(rule.id) || 0;

      if (activation > 0.05) {
        const weight = activation;

        for (const genre of rule.musicalRecommendations.preferredGenres) {
          const currentWeight = combinedStrategy.genreWeights.get(genre) || 0;
          combinedStrategy.genreWeights.set(genre, currentWeight + weight);
        }

        const valenceAvg =
          (rule.musicalRecommendations.valenceRange[0] +
            rule.musicalRecommendations.valenceRange[1]) /
          2;
        const energyAvg =
          (rule.musicalRecommendations.energyRange[0] +
            rule.musicalRecommendations.energyRange[1]) /
          2;
        const danceabilityAvg =
          (rule.musicalRecommendations.danceabilityRange[0] +
            rule.musicalRecommendations.danceabilityRange[1]) /
          2;

        combinedStrategy.valenceTarget += valenceAvg * weight;
        combinedStrategy.energyTarget += energyAvg * weight;
        combinedStrategy.danceabilityTarget += danceabilityAvg * weight;
        combinedStrategy.totalWeight += weight;
      }
    }

    if (combinedStrategy.totalWeight > 0) {
      combinedStrategy.valenceTarget /= combinedStrategy.totalWeight;
      combinedStrategy.energyTarget /= combinedStrategy.totalWeight;
      combinedStrategy.danceabilityTarget /= combinedStrategy.totalWeight;
    }

    return combinedStrategy;
  }

  async findCandidateMusics(strategy) {
    console.log("🔍 Buscando músicas candidatas no catálogo...");

    const topGenres = Array.from(strategy.genreWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    try {
      // Busca flexível que funciona mesmo quando alguns campos são null
      const whereConditions = [];

      if (topGenres.length > 0) {
        whereConditions.push({ genre: { in: topGenres } });
      }

      const candidates = await prisma.music.findMany({
        where: whereConditions.length > 0 ? { OR: whereConditions } : {},
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      });

      console.log(`   ✓ Encontradas ${candidates.length} músicas candidatas`);
      return candidates;
    } catch (error) {
      console.warn(
        "⚠️ Erro na busca específica, usando busca geral:",
        error.message
      );

      // Fallback: busca mais geral se a busca específica falhar
      const fallbackCandidates = await prisma.music.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
      });

      console.log(
        `   ✓ Usando ${fallbackCandidates.length} músicas como fallback`
      );
      return fallbackCandidates;
    }
  }

  selectOptimalPlaylist(candidates, originalEmotionalState, playlistSize) {
    console.log("🎯 Selecionando playlist otimizada...");

    const scoredMusics = candidates.map((music) => ({
      ...music,
      fuzzyScore: this.calculateMusicFuzzyScore(music, originalEmotionalState),
    }));

    const selectedMusics = scoredMusics
      .sort((a, b) => b.fuzzyScore - a.fuzzyScore)
      .slice(0, playlistSize);

    console.log(
      `   ✓ Playlist final com ${selectedMusics.length} músicas selecionada`
    );
    return selectedMusics;
  }

  calculateMusicFuzzyScore(music, emotionalState) {
    const emotionalProximity = this.calculateEmotionalProximity(
      music,
      emotionalState
    );
    const therapeuticPotential = this.calculateTherapeuticPotential(
      music,
      emotionalState
    );
    const musicalQuality = 0.5; // Score base quando não temos dados de popularidade

    return (
      emotionalProximity * 0.4 +
      therapeuticPotential * 0.4 +
      musicalQuality * 0.2
    );
  }

  calculateEmotionalProximity(music, emotionalState) {
    const distance = Math.sqrt(
      Math.pow((music.anger || 0) - emotionalState.anger, 2) +
        Math.pow((music.fear || 0) - emotionalState.fear, 2) +
        Math.pow((music.joy || 0) - emotionalState.joy, 2) +
        Math.pow((music.sadness || 0) - emotionalState.sadness, 2) +
        Math.pow((music.surprise || 0) - emotionalState.surprise, 2)
    );

    return Math.max(0, 1 - distance / Math.sqrt(5));
  }

  calculateTherapeuticPotential(music, emotionalState) {
    let therapeuticScore = 0.5;

    if (emotionalState.sadness > 0.7) {
      const valence = music.valence || 0;
      if (
        valence > emotionalState.sadness &&
        valence < emotionalState.sadness + 0.3
      ) {
        therapeuticScore += 0.3;
      }
    }

    if (emotionalState.fear > 0.6) {
      const energy = music.energy || 0;
      if (energy < 0.4) {
        therapeuticScore += 0.2;
      }
    }

    return Math.min(1.0, therapeuticScore);
  }

  generateExplanation(ruleActivations, strategy) {
    const activeRules = Array.from(ruleActivations.entries())
      .filter(([_, activation]) => activation > 0.1)
      .sort((a, b) => b[1] - a[1]);

    if (activeRules.length === 0) {
      return (
        "Baseei as recomendações em seu estado emocional equilibrado, " +
        "selecionando músicas que mantenham estabilidade emocional."
      );
    }

    const primaryRule = this.rules.find(
      (rule) => rule.id === activeRules[0][0]
    );
    const explanation =
      `Detectei que ${primaryRule?.description.toLowerCase()}. ` +
      `Por isso, selecionei músicas que `;

    const topGenres = Array.from(strategy.genreWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    return (
      explanation +
      `combinam com este estado, priorizando gêneros como ` +
      `${topGenres.join(", ")} com características musicais adequadas para ` +
      `promover bem-estar emocional.`
    );
  }

  calculateConfidence(ruleActivations) {
    const values = Array.from(ruleActivations.values());
    const maxActivation = Math.max(...values);
    const totalActivation = values.reduce((sum, val) => sum + val, 0);

    return Math.min(
      1.0,
      Math.max(maxActivation, totalActivation / this.rules.length)
    );
  }
}

// Função principal exportada
async function generateFuzzyMusicRecommendation(request) {
  console.log("🎵 SOL: Gerando recomendação musical com lógica fuzzy...");
  console.log(`👤 Usuário: ${request.userId}`);
  console.log(`�� Estado emocional:`, request.currentEmotion);

  const engine = new FuzzyMusicRecommendationEngine();

  try {
    const recommendation = await engine.generateRecommendations(
      request.currentEmotion,
      request.userId,
      request.playlistSize || 15
    );

    console.log(
      `✅ Recomendação gerada com ${recommendation.playlist.length} músicas`
    );
    console.log(
      `🎯 Confiança: ${(recommendation.confidence * 100).toFixed(1)}%`
    );

    return {
      success: true,
      data: recommendation,
      timestamp: new Date().toISOString(),
      algorithm: "fuzzy_logic_v1",
    };
  } catch (error) {
    console.error("❌ Erro na geração de recomendação fuzzy:", error);
    throw new Error(`Falha no sistema de recomendação: ${error.message}`);
  }
}

module.exports = {
  generateFuzzyMusicRecommendation,
  FuzzyMusicRecommendationEngine,
};
