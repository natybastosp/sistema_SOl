const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Conjuntos fuzzy para intensidade emocional (mantidos do sistema anterior)
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

// Classe aprimorada para regras fuzzy
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

// Base de conhecimento expandida de musicoterapia
const MusicTherapyRules = [
  // Regras para tristeza
  new FuzzyMusicRule(
    "tristeza_muito_alta",
    "Para tristeza extrema, música que valida sentimentos antes de introduzir esperança",
    [{ emotion: "sadness", intensity: "veryHigh" }],
    {
      preferredGenres: ["MPB", "Blues", "Folk", "Classical", "Indie"],
      valenceRange: [0.0, 0.3],
      energyRange: [0.1, 0.4],
      danceabilityRange: [0.0, 0.2],
      acousticnessRange: [0.3, 1.0],
    },
    1.5 // Peso muito alto para casos extremos
  ),

  new FuzzyMusicRule(
    "tristeza_alta",
    "Para tristeza intensa, começar com música melancólica e gradualmente introduzir esperança",
    [{ emotion: "sadness", intensity: "high" }],
    {
      preferredGenres: ["MPB", "Blues", "Folk", "Classical"],
      valenceRange: [0.1, 0.4],
      energyRange: [0.2, 0.5],
      danceabilityRange: [0.1, 0.3],
      acousticnessRange: [0.2, 0.8],
    },
    1.2
  ),

  // Regras para ansiedade
  new FuzzyMusicRule(
    "ansiedade_muito_alta",
    "Para ansiedade extrema, música extremamente calmante e previsível",
    [{ emotion: "fear", intensity: "veryHigh" }],
    {
      preferredGenres: ["Classical", "Ambient", "New Age", "Nature"],
      valenceRange: [0.3, 0.5],
      energyRange: [0.0, 0.3],
      danceabilityRange: [0.0, 0.2],
      acousticnessRange: [0.5, 1.0],
      speechinessRange: [0.0, 0.1],
    },
    1.4
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
      acousticnessRange: [0.3, 0.8],
    },
    1.1
  ),

  // Regras para alegria
  new FuzzyMusicRule(
    "alegria_muito_alta",
    "Para euforia, música que celebra mas não sobrecarrega",
    [{ emotion: "joy", intensity: "veryHigh" }],
    {
      preferredGenres: ["Pop", "Rock", "Reggae", "Samba", "Dance"],
      valenceRange: [0.7, 1.0],
      energyRange: [0.6, 0.9],
      danceabilityRange: [0.5, 0.9],
      acousticnessRange: [0.0, 0.4],
    },
    1.0
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
      acousticnessRange: [0.0, 0.5],
    },
    0.9
  ),

  // Regras para raiva
  new FuzzyMusicRule(
    "raiva_muito_alta",
    "Para raiva extrema, música que permita catarse segura e gradual acalmamento",
    [{ emotion: "anger", intensity: "veryHigh" }],
    {
      preferredGenres: ["Rock", "Metal", "Punk", "Blues", "Grunge"],
      valenceRange: [0.1, 0.4],
      energyRange: [0.7, 1.0],
      danceabilityRange: [0.3, 0.8],
      acousticnessRange: [0.0, 0.3],
    },
    1.3
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
      acousticnessRange: [0.0, 0.4],
    },
    1.0
  ),

  // Regras para estados mistos
  new FuzzyMusicRule(
    "tristeza_ansiedade_alta",
    "Para combinação de tristeza e ansiedade, música profundamente calmante e reconfortante",
    [
      { emotion: "sadness", intensity: "high" },
      { emotion: "fear", intensity: "high" },
    ],
    {
      preferredGenres: ["Classical", "Ambient", "Folk", "New Age"],
      valenceRange: [0.2, 0.4],
      energyRange: [0.1, 0.3],
      danceabilityRange: [0.0, 0.2],
      acousticnessRange: [0.4, 1.0],
    },
    1.4
  ),

  new FuzzyMusicRule(
    "raiva_tristeza_alta",
    "Para raiva misturada com tristeza, música que processe ambas as emoções",
    [
      { emotion: "anger", intensity: "high" },
      { emotion: "sadness", intensity: "high" },
    ],
    {
      preferredGenres: ["Blues", "Rock", "Folk", "MPB"],
      valenceRange: [0.2, 0.5],
      energyRange: [0.3, 0.7],
      danceabilityRange: [0.2, 0.5],
      acousticnessRange: [0.1, 0.6],
    },
    1.2
  ),

  // Regra para estado equilibrado
  new FuzzyMusicRule(
    "equilibrio_emocional",
    "Para estado emocional equilibrado, música que mantenha estabilidade",
    [
      { emotion: "joy", intensity: "medium" },
      { emotion: "sadness", intensity: "low" },
      { emotion: "anger", intensity: "low" },
      { emotion: "fear", intensity: "low" },
    ],
    {
      preferredGenres: ["MPB", "Jazz", "Pop", "Folk", "Classical"],
      valenceRange: [0.4, 0.7],
      energyRange: [0.3, 0.6],
      danceabilityRange: [0.2, 0.5],
      acousticnessRange: [0.1, 0.7],
    },
    0.8
  ),
];

// Classe principal com busca em cascata inteligente
class ImprovedFuzzyMusicRecommendationEngine {
  constructor() {
    this.rules = MusicTherapyRules;
    this.searchLevels = [
      "exact_match",
      "genre_priority",
      "emotional_priority",
      "flexible_emotional",
      "musical_characteristics",
      "diversified_selection",
    ];
  }

  async generateRecommendations(emotionalState, userId, playlistSize = 15) {
    console.log("🧠 Iniciando análise fuzzy aprimorada do estado emocional...");

    const ruleActivations = this.fuzzifyEmotionalState(emotionalState);
    const musicalStrategy = this.inferMusicalStrategy(ruleActivations);

    // Busca em cascata inteligente - garantindo sempre resultados
    const candidateMusics = await this.intelligentCascadeSearch(
      musicalStrategy,
      playlistSize * 2
    );

    const finalPlaylist = this.selectOptimalPlaylist(
      candidateMusics,
      emotionalState,
      playlistSize
    );
    const explanation = this.generateDetailedExplanation(
      ruleActivations,
      musicalStrategy,
      finalPlaylist
    );

    return {
      playlist: finalPlaylist,
      strategy: musicalStrategy,
      explanation: explanation,
      confidence: this.calculateConfidence(ruleActivations),
      searchMetrics: this.getSearchMetrics(),
    };
  }

  /**
   * Sistema de busca em cascata inteligente
   * Tenta múltiplas estratégias em ordem de prioridade até conseguir músicas suficientes
   */
  async intelligentCascadeSearch(strategy, targetCount) {
    console.log("🔍 Iniciando busca em cascata inteligente...");

    let allCandidates = [];
    let searchMetrics = {
      levelsUsed: [],
      totalCandidates: 0,
      searchSuccess: false,
    };

    // Nível 1: Busca exata (gênero + critérios emocionais precisos)
    if (allCandidates.length < targetCount) {
      console.log("   🎯 Nível 1: Busca com critérios exatos...");
      const exactMatches = await this.searchLevel1ExactMatch(strategy);
      allCandidates = this.addUniqueResults(
        allCandidates,
        exactMatches,
        "exact_match"
      );
      searchMetrics.levelsUsed.push({ level: 1, found: exactMatches.length });
    }

    // Nível 2: Prioridade de gênero com critérios emocionais relaxados
    if (allCandidates.length < targetCount) {
      console.log(
        "   🎵 Nível 2: Priorizando gêneros com critérios flexíveis..."
      );
      const genreMatches = await this.searchLevel2GenrePriority(strategy);
      allCandidates = this.addUniqueResults(
        allCandidates,
        genreMatches,
        "genre_priority"
      );
      searchMetrics.levelsUsed.push({ level: 2, found: genreMatches.length });
    }

    // Nível 3: Prioridade emocional com gêneros flexíveis
    if (allCandidates.length < targetCount) {
      console.log("   😊 Nível 3: Priorizando critérios emocionais...");
      const emotionalMatches = await this.searchLevel3EmotionalPriority(
        strategy
      );
      allCandidates = this.addUniqueResults(
        allCandidates,
        emotionalMatches,
        "emotional_priority"
      );
      searchMetrics.levelsUsed.push({
        level: 3,
        found: emotionalMatches.length,
      });
    }

    // Nível 4: Critérios emocionais muito flexíveis
    if (allCandidates.length < targetCount) {
      console.log("   🌊 Nível 4: Critérios emocionais expandidos...");
      const flexibleMatches = await this.searchLevel4FlexibleEmotional(
        strategy
      );
      allCandidates = this.addUniqueResults(
        allCandidates,
        flexibleMatches,
        "flexible_emotional"
      );
      searchMetrics.levelsUsed.push({
        level: 4,
        found: flexibleMatches.length,
      });
    }

    // Nível 5: Características musicais similares
    if (allCandidates.length < targetCount) {
      console.log("   🎶 Nível 5: Buscando por características musicais...");
      const musicalMatches = await this.searchLevel5MusicalCharacteristics(
        strategy
      );
      allCandidates = this.addUniqueResults(
        allCandidates,
        musicalMatches,
        "musical_characteristics"
      );
      searchMetrics.levelsUsed.push({ level: 5, found: musicalMatches.length });
    }

    // Nível 6: Seleção diversificada garantida (último recurso)
    if (allCandidates.length < targetCount) {
      console.log(
        "   🎲 Nível 6: Seleção diversificada para garantir playlist..."
      );
      const diversifiedMatches = await this.searchLevel6DiversifiedSelection(
        targetCount - allCandidates.length
      );
      allCandidates = this.addUniqueResults(
        allCandidates,
        diversifiedMatches,
        "diversified_selection"
      );
      searchMetrics.levelsUsed.push({
        level: 6,
        found: diversifiedMatches.length,
      });
    }

    searchMetrics.totalCandidates = allCandidates.length;
    searchMetrics.searchSuccess =
      allCandidates.length >= Math.min(targetCount, 5); // Mínimo 5 músicas

    this.searchMetrics = searchMetrics;

    console.log(
      `   ✅ Busca concluída: ${allCandidates.length} candidatos encontrados`
    );
    console.log(`   📊 Níveis utilizados: ${searchMetrics.levelsUsed.length}`);

    return allCandidates;
  }

  // Nível 1: Busca com critérios exatos
  async searchLevel1ExactMatch(strategy) {
    try {
      const topGenres = Array.from(strategy.genreWeights.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((entry) => entry[0]);

      return await prisma.music.findMany({
        where: {
          AND: [
            { genre: { in: topGenres } },
            {
              valence: {
                gte: Math.max(0, strategy.valenceTarget - 0.2),
                lte: Math.min(1, strategy.valenceTarget + 0.2),
              },
            },
            {
              energy: {
                gte: Math.max(0, strategy.energyTarget - 0.2),
                lte: Math.min(1, strategy.energyTarget + 0.2),
              },
            },
          ],
        },
        take: 50,
      });
    } catch (error) {
      console.warn("⚠️ Erro no nível 1:", error.message);
      return [];
    }
  }

  // Nível 2: Prioridade de gênero com critérios relaxados
  async searchLevel2GenrePriority(strategy) {
    try {
      const topGenres = Array.from(strategy.genreWeights.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((entry) => entry[0]);

      return await prisma.music.findMany({
        where: {
          genre: { in: topGenres },
        },
        take: 80,
      });
    } catch (error) {
      console.warn("⚠️ Erro no nível 2:", error.message);
      return [];
    }
  }

  // Nível 3: Prioridade emocional com gêneros flexíveis
  async searchLevel3EmotionalPriority(strategy) {
    try {
      return await prisma.music.findMany({
        where: {
          OR: [
            {
              valence: {
                gte: Math.max(0, strategy.valenceTarget - 0.3),
                lte: Math.min(1, strategy.valenceTarget + 0.3),
              },
            },
            {
              energy: {
                gte: Math.max(0, strategy.energyTarget - 0.3),
                lte: Math.min(1, strategy.energyTarget + 0.3),
              },
            },
          ],
        },
        take: 100,
      });
    } catch (error) {
      console.warn("⚠️ Erro no nível 3:", error.message);
      return [];
    }
  }

  // Nível 4: Critérios emocionais muito flexíveis
  async searchLevel4FlexibleEmotional(strategy) {
    try {
      return await prisma.music.findMany({
        where: {
          OR: [
            { valence: { not: null } },
            { energy: { not: null } },
            { danceability: { not: null } },
          ],
        },
        orderBy: [{ createdAt: "desc" }],
        take: 120,
      });
    } catch (error) {
      console.warn("⚠️ Erro no nível 4:", error.message);
      return [];
    }
  }

  // Nível 5: Características musicais similares
  async searchLevel5MusicalCharacteristics(strategy) {
    try {
      return await prisma.music.findMany({
        where: {
          AND: [
            { spotifyId: { not: null } }, // Priorizar músicas com dados completos
            { valence: { not: null } },
            { energy: { not: null } },
          ],
        },
        orderBy: [{ popularity: "desc" }],
        take: 100,
      });
    } catch (error) {
      console.warn("⚠️ Erro no nível 5:", error.message);
      return [];
    }
  }

  // Nível 6: Seleção diversificada garantida
  async searchLevel6DiversifiedSelection(needed) {
    try {
      // Buscar uma seleção diversificada por gêneros
      const genreDistribution = await prisma.music.groupBy({
        by: ["genre"],
        _count: { genre: true },
        orderBy: { _count: { genre: "desc" } },
        take: 10,
      });

      const diversifiedResults = [];
      const musicsPerGenre = Math.ceil(needed / genreDistribution.length);

      for (const genreInfo of genreDistribution) {
        const genreMusics = await prisma.music.findMany({
          where: { genre: genreInfo.genre },
          take: musicsPerGenre,
          orderBy: { createdAt: "desc" },
        });
        diversifiedResults.push(...genreMusics);

        if (diversifiedResults.length >= needed) break;
      }

      return diversifiedResults.slice(0, needed);
    } catch (error) {
      console.warn("⚠️ Erro no nível 6:", error.message);
      // Último recurso absoluto
      return await prisma.music.findMany({ take: needed });
    }
  }

  // Função auxiliar para adicionar resultados únicos
  addUniqueResults(existing, newResults, source) {
    const existingIds = new Set(existing.map((music) => music.id));
    const uniqueNew = newResults.filter((music) => !existingIds.has(music.id));

    // Marcar a fonte da busca para análise posterior
    const markedNew = uniqueNew.map((music) => ({
      ...music,
      searchSource: source,
    }));

    return [...existing, ...markedNew];
  }

  // Resto dos métodos mantidos do sistema anterior com melhorias
  fuzzifyEmotionalState(emotionalState) {
    const activations = new Map();

    console.log("📊 Calculando ativação das regras fuzzy aprimoradas...");

    for (const rule of this.rules) {
      const activation = rule.calculateActivation(emotionalState);
      activations.set(rule.id, activation);

      if (activation > 0.05) {
        // Threshold reduzido para capturar mais nuances
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
      valenceTarget: 0.5, // Default neutro
      energyTarget: 0.5,
      danceabilityTarget: 0.3,
      acousticnessTarget: 0.4,
      totalWeight: 0,
    };

    for (const rule of this.rules) {
      const activation = ruleActivations.get(rule.id) || 0;

      if (activation > 0.02) {
        // Threshold muito baixo para capturar nuances
        const weight = activation;

        // Acumular preferências de gênero
        for (const genre of rule.musicalRecommendations.preferredGenres) {
          const currentWeight = combinedStrategy.genreWeights.get(genre) || 0;
          combinedStrategy.genreWeights.set(genre, currentWeight + weight);
        }

        // Calcular alvos musicais (média ponderada)
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

    // Normalizar alvos pela soma dos pesos
    if (combinedStrategy.totalWeight > 0) {
      combinedStrategy.valenceTarget /= combinedStrategy.totalWeight;
      combinedStrategy.energyTarget /= combinedStrategy.totalWeight;
      combinedStrategy.danceabilityTarget /= combinedStrategy.totalWeight;
    }

    return combinedStrategy;
  }

  selectOptimalPlaylist(candidates, originalEmotionalState, playlistSize) {
    console.log("🎯 Selecionando playlist otimizada com diversificação...");

    if (candidates.length === 0) {
      console.warn("⚠️ Nenhum candidato disponível para seleção");
      return [];
    }

    // Calcular scores para todos os candidatos
    const scoredMusics = candidates.map((music) => ({
      ...music,
      fuzzyScore: this.calculateEnhancedMusicScore(
        music,
        originalEmotionalState
      ),
      emotionalDistance: this.calculateEmotionalDistance(
        music,
        originalEmotionalState
      ),
    }));

    // Ordenar por score
    scoredMusics.sort((a, b) => b.fuzzyScore - a.fuzzyScore);

    // Seleção inteligente com diversificação
    const selectedMusics = this.diversifiedSelection(
      scoredMusics,
      playlistSize
    );

    console.log(
      `   ✓ Playlist final com ${selectedMusics.length} músicas selecionada`
    );
    console.log(`   📊 Fontes: ${this.getSourceDistribution(selectedMusics)}`);

    return selectedMusics;
  }

  // Seleção diversificada para evitar monotonia
  diversifiedSelection(scoredMusics, playlistSize) {
    const selected = [];
    const usedArtists = new Set();
    const usedGenres = new Map();

    for (const music of scoredMusics) {
      if (selected.length >= playlistSize) break;

      // Evitar muitas músicas do mesmo artista
      const artistCount = Array.from(usedArtists).filter((artist) =>
        artist.toLowerCase().includes(music.artist.toLowerCase().split(" ")[0])
      ).length;

      // Evitar muitas músicas do mesmo gênero
      const genreCount = usedGenres.get(music.genre) || 0;

      // Critérios de diversificação
      const artistOk = artistCount < Math.max(1, Math.floor(playlistSize / 8)); // Max 1-2 por artista
      const genreOk = genreCount < Math.max(2, Math.floor(playlistSize / 3)); // Max 2-5 por gênero

      if (artistOk && genreOk) {
        selected.push(music);
        usedArtists.add(music.artist);
        usedGenres.set(music.genre, genreCount + 1);
      } else if (selected.length < playlistSize * 0.7) {
        // Se ainda não temos músicas suficientes, relaxar critérios
        selected.push(music);
        usedArtists.add(music.artist);
        usedGenres.set(music.genre, genreCount + 1);
      }
    }

    // Se ainda não temos músicas suficientes, adicionar as melhores restantes
    if (selected.length < playlistSize) {
      const selectedIds = new Set(selected.map((m) => m.id));
      const remaining = scoredMusics.filter((m) => !selectedIds.has(m.id));

      const needed = playlistSize - selected.length;
      selected.push(...remaining.slice(0, needed));
    }

    return selected;
  }

  // Score aprimorado que considera múltiplos fatores
  calculateEnhancedMusicScore(music, emotionalState) {
    const emotionalProximity = this.calculateEmotionalProximity(
      music,
      emotionalState
    );
    const therapeuticPotential = this.calculateEnhancedTherapeuticPotential(
      music,
      emotionalState
    );
    const musicalQuality = this.calculateMusicalQuality(music);
    const dataCompleteness = this.calculateDataCompleteness(music);

    // Pesos ajustados para melhor balanceamento
    return (
      emotionalProximity * 0.35 +
      therapeuticPotential * 0.35 +
      musicalQuality * 0.15 +
      dataCompleteness * 0.15
    );
  }

  calculateEnhancedTherapeuticPotential(music, emotionalState) {
    let therapeuticScore = 0.5; // Score base

    // Análise mais sofisticada do potencial terapêutico

    // Para tristeza intensa: música ligeiramente mais positiva ajuda gradualmente
    if (emotionalState.sadness > 0.6) {
      const valence = music.valence || 0.5;
      const targetValence = emotionalState.sadness + 0.1; // Ligeiramente mais positiva

      if (valence >= emotionalState.sadness && valence <= targetValence + 0.2) {
        therapeuticScore += 0.4; // Alto potencial terapêutico
      } else if (valence > 0.7 && emotionalState.sadness > 0.8) {
        therapeuticScore -= 0.2; // Música muito alegre pode ser contraproducente
      }

      // Música acústica é melhor para tristeza
      const acousticness = music.acousticness || 0.5;
      if (acousticness > 0.4) therapeuticScore += 0.2;
    }

    // Para ansiedade: música calma e previsível
    if (emotionalState.fear > 0.5) {
      const energy = music.energy || 0.5;
      const danceability = music.danceability || 0.5;

      if (energy < 0.4) therapeuticScore += 0.3;
      if (danceability < 0.3) therapeuticScore += 0.2;

      // Música instrumental ou com pouca fala é melhor para ansiedade
      const speechiness = music.speechiness || 0.5;
      if (speechiness < 0.2) therapeuticScore += 0.2;
    }

    // Para raiva: permitir catarse mas não intensificar
    if (emotionalState.anger > 0.6) {
      const energy = music.energy || 0.5;
      const valence = music.valence || 0.5;

      // Música energética pode ajudar na catarse
      if (energy > 0.6 && energy < 0.9) therapeuticScore += 0.3;

      // Mas não deve ser muito negativa
      if (valence > 0.3) therapeuticScore += 0.2;

      // Música muito agressiva pode piorar
      if (energy > 0.9 && valence < 0.3) therapeuticScore -= 0.3;
    }

    // Para alegria: manter o estado sem sobrecarregar
    if (emotionalState.joy > 0.7) {
      const valence = music.valence || 0.5;
      const energy = music.energy || 0.5;

      if (valence > 0.6 && valence < 0.9) therapeuticScore += 0.3;
      if (energy > 0.5 && energy < 0.8) therapeuticScore += 0.2;

      // Evitar música muito intensa se a pessoa já está muito alegre
      if (energy > 0.9 && emotionalState.joy > 0.9) therapeuticScore -= 0.2;
    }

    return Math.max(0, Math.min(1.0, therapeuticScore));
  }

  calculateMusicalQuality(music) {
    let qualityScore = 0.5; // Score base

    // Popularidade (se disponível)
    if (music.popularity) {
      qualityScore += (music.popularity / 100) * 0.3;
    }

    // Presença de Spotify ID indica melhor qualidade de dados
    if (music.spotifyId) {
      qualityScore += 0.2;
    }

    // Balanceamento musical (não muito extremo em nenhuma dimensão)
    const attributes = [
      music.valence,
      music.energy,
      music.danceability,
      music.acousticness,
    ].filter((attr) => attr !== null && attr !== undefined);

    if (attributes.length > 0) {
      const avgExtremeness =
        attributes.reduce((sum, attr) => {
          return sum + Math.abs(attr - 0.5); // Distância do centro
        }, 0) / attributes.length;

      // Preferir músicas não muito extremas (mais versáteis)
      qualityScore += (0.5 - avgExtremeness) * 0.2;
    }

    return Math.max(0, Math.min(1.0, qualityScore));
  }

  calculateDataCompleteness(music) {
    const fields = [
      music.valence,
      music.energy,
      music.danceability,
      music.acousticness,
      music.speechiness,
      music.tempo,
      music.anger,
      music.fear,
      music.joy,
      music.sadness,
      music.surprise,
    ];

    const completeFields = fields.filter(
      (field) => field !== null && field !== undefined
    ).length;

    return completeFields / fields.length;
  }

  calculateEmotionalDistance(music, emotionalState) {
    const distance = Math.sqrt(
      Math.pow((music.anger || 0) - emotionalState.anger, 2) +
        Math.pow((music.fear || 0) - emotionalState.fear, 2) +
        Math.pow((music.joy || 0) - emotionalState.joy, 2) +
        Math.pow((music.sadness || 0) - emotionalState.sadness, 2) +
        Math.pow((music.surprise || 0) - emotionalState.surprise, 2)
    );

    return distance / Math.sqrt(5); // Normalizar para 0-1
  }

  calculateEmotionalProximity(music, emotionalState) {
    return 1 - this.calculateEmotionalDistance(music, emotionalState);
  }

  generateDetailedExplanation(ruleActivations, strategy, playlist) {
    const activeRules = Array.from(ruleActivations.entries())
      .filter(([_, activation]) => activation > 0.05)
      .sort((a, b) => b[1] - a[1]);

    let explanation = "";

    if (activeRules.length === 0) {
      explanation = "Detectei um estado emocional equilibrado. ";
    } else {
      const primaryRule = this.rules.find(
        (rule) => rule.id === activeRules[0][0]
      );
      const primaryActivation = activeRules[0][1];

      explanation =
        `Identifiquei que ${primaryRule?.description.toLowerCase()} ` +
        `(confiança: ${(primaryActivation * 100).toFixed(0)}%). `;

      if (activeRules.length > 1) {
        const secondaryRule = this.rules.find(
          (rule) => rule.id === activeRules[1][0]
        );
        explanation += `Também considerei que ${secondaryRule?.description.toLowerCase()}. `;
      }
    }

    // Adicionar informação sobre a estratégia musical
    const topGenres = Array.from(strategy.genreWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    if (topGenres.length > 0) {
      explanation += `Por isso, priorizei gêneros como ${topGenres.join(
        ", "
      )} `;
    }

    // Adicionar informação sobre características musicais
    const valenceDesc =
      strategy.valenceTarget < 0.3
        ? "baixa positividade"
        : strategy.valenceTarget > 0.7
        ? "alta positividade"
        : "positividade moderada";
    const energyDesc =
      strategy.energyTarget < 0.3
        ? "baixa energia"
        : strategy.energyTarget > 0.7
        ? "alta energia"
        : "energia moderada";

    explanation += `com ${valenceDesc} e ${energyDesc}. `;

    // Adicionar informação sobre o processo de busca
    if (this.searchMetrics && this.searchMetrics.levelsUsed.length > 1) {
      explanation +=
        `Para garantir uma playlist completa, utilizei ${this.searchMetrics.levelsUsed.length} ` +
        `estratégias de busca diferentes, sempre priorizando relevância emocional.`;
    }

    return explanation;
  }

  calculateConfidence(ruleActivations) {
    const values = Array.from(ruleActivations.values());
    if (values.length === 0) return 0.5;

    const maxActivation = Math.max(...values);
    const totalActivation = values.reduce((sum, val) => sum + val, 0);
    const avgActivation = totalActivation / values.length;

    // Confiança baseada em múltiplos fatores
    const maxComponent = maxActivation * 0.6; // Regra mais forte
    const avgComponent = avgActivation * 0.4; // Consenso geral

    return Math.min(1.0, maxComponent + avgComponent);
  }

  getSearchMetrics() {
    return (
      this.searchMetrics || {
        levelsUsed: [],
        totalCandidates: 0,
        searchSuccess: false,
      }
    );
  }

  getSourceDistribution(playlist) {
    const sources = {};
    playlist.forEach((music) => {
      const source = music.searchSource || "unknown";
      sources[source] = (sources[source] || 0) + 1;
    });

    return Object.entries(sources)
      .map(([source, count]) => `${source}:${count}`)
      .join(", ");
  }
}

// Função principal exportada aprimorada
async function generateFuzzyMusicRecommendation(request) {
  console.log(
    "🎵 SOL: Gerando recomendação musical com sistema fuzzy aprimorado..."
  );
  console.log(`👤 Usuário: ${request.userId}`);
  console.log(`😊 Estado emocional:`, request.currentEmotion);

  const engine = new ImprovedFuzzyMusicRecommendationEngine();

  try {
    const startTime = Date.now();

    const recommendation = await engine.generateRecommendations(
      request.currentEmotion,
      request.userId,
      request.playlistSize || 15
    );

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(
      `✅ Recomendação gerada com ${recommendation.playlist.length} músicas`
    );
    console.log(
      `🎯 Confiança: ${(recommendation.confidence * 100).toFixed(1)}%`
    );
    console.log(`⏱️  Tempo de processamento: ${processingTime}ms`);
    console.log(
      `🔍 Busca bem-sucedida: ${recommendation.searchMetrics.searchSuccess}`
    );

    return {
      success: true,
      data: {
        ...recommendation,
        processingTime,
        version: "fuzzy_v2_improved",
      },
      timestamp: new Date().toISOString(),
      algorithm: "fuzzy_logic_cascading_search",
    };
  } catch (error) {
    console.error(
      "❌ Erro na geração de recomendação fuzzy aprimorada:",
      error
    );

    // Sistema de fallback para garantir sempre algum resultado
    try {
      console.log("🔄 Tentando sistema de fallback...");
      const fallbackPlaylist = await prisma.music.findMany({
        take: request.playlistSize || 15,
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: {
          playlist: fallbackPlaylist.map((music) => ({
            ...music,
            fuzzyScore: 0.5,
          })),
          explanation:
            "Sistema de fallback ativado. Selecionei uma playlist diversificada do catálogo.",
          confidence: 0.3,
          strategy: { genreWeights: new Map() },
          searchMetrics: {
            levelsUsed: [{ level: "fallback", found: fallbackPlaylist.length }],
          },
        },
        timestamp: new Date().toISOString(),
        algorithm: "fallback_system",
      };
    } catch (fallbackError) {
      throw new Error(
        `Sistema completamente indisponível: ${fallbackError.message}`
      );
    }
  }
}

module.exports = {
  generateFuzzyMusicRecommendation,
  ImprovedFuzzyMusicRecommendationEngine,
};
