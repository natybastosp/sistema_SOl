// src/hooks/useEmotionalState.js

import { useState, useCallback, useEffect } from "react";

const useEmotionalState = () => {
  // Lista de emoções que o sistema reconhece
  // Baseada na literatura de psicologia e no modelo do backend
  const emotions = [
    { id: "tristeza", label: "Tristeza", color: "#3B82F6" },
    { id: "alegria", label: "Alegria", color: "#10B981" },
    { id: "ansiedade", label: "Ansiedade", color: "#F59E0B" },
    { id: "raiva", label: "Raiva", color: "#EF4444" },
    { id: "surpresa", label: "Surpresa", color: "#8B5CF6" },
    { id: "medo", label: "Medo", color: "#6B7280" },
  ];

  // Estado emocional atual (escala de 0 a 10 para cada emoção)
  const [emotionalState, setEmotionalState] = useState(() => {
    const initialState = {};
    emotions.forEach((emotion) => {
      initialState[emotion.id] = 0;
    });
    return initialState;
  });

  // Histórico de estados emocionais
  const [emotionalHistory, setEmotionalHistory] = useState([]);

  // Indicadores se houve mudanças não salvas
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estado de carregamento para operações assíncronas
  const [isLoading, setIsLoading] = useState(false);

  // Carrega histórico salvo quando o hook é inicializado
  useEffect(() => {
    loadEmotionalHistory();
  }, []);

  /**
   * Carrega o histórico emocional do localStorage
   * Em produção, isso viria do backend
   */
  const loadEmotionalHistory = () => {
    try {
      const saved = localStorage.getItem("sol_emotional_history");
      if (saved) {
        const history = JSON.parse(saved);
        setEmotionalHistory(history);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico emocional:", error);
    }
  };

  /**
   * Atualiza o valor de uma emoção específica
   *
   * @param {string} emotionId - ID da emoção (ex: 'tristeza', 'alegria')
   * @param {number} value - Novo valor (0-10)
   */
  const updateEmotion = useCallback((emotionId, value) => {
    // Validação dos parâmetros
    if (!emotionId || typeof value !== "number") {
      console.warn("Parâmetros inválidos para updateEmotion");
      return;
    }

    // Garante que o valor está dentro do intervalo válido
    const clampedValue = Math.max(0, Math.min(10, value));

    setEmotionalState((prev) => ({
      ...prev,
      [emotionId]: clampedValue,
    }));

    setHasUnsavedChanges(true);
  }, []);

  /**
   * Calcula a emoção dominante atual
   * Retorna a emoção com maior intensidade
   */
  const getDominantEmotion = useCallback(() => {
    const entries = Object.entries(emotionalState);

    if (entries.length === 0) return null;

    const [dominantId, dominantValue] = entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    // Só considera dominante se o valor for maior que 0
    if (dominantValue === 0) return null;

    const emotion = emotions.find((e) => e.id === dominantId);
    return emotion ? { ...emotion, value: dominantValue } : null;
  }, [emotionalState, emotions]);

  /**
   * Calcula o "humor geral" do usuário
   * Retorna um valor entre -10 (muito negativo) e +10 (muito positivo)
   */
  const getOverallMood = useCallback(() => {
    const positiveEmotions = ["alegria", "surpresa"];
    const negativeEmotions = ["tristeza", "ansiedade", "raiva", "medo"];

    const positiveSum = positiveEmotions.reduce(
      (sum, emotion) => sum + (emotionalState[emotion] || 0),
      0
    );

    const negativeSum = negativeEmotions.reduce(
      (sum, emotion) => sum + (emotionalState[emotion] || 0),
      0
    );

    // Calcula a diferença normalizada
    const totalIntensity = positiveSum + negativeSum;
    if (totalIntensity === 0) return 0;

    return ((positiveSum - negativeSum) / totalIntensity) * 10;
  }, [emotionalState]);

  /**
   * Salva o estado emocional atual no histórico
   *
   * @param {Object} options - Opções para o salvamento
   * @param {string} options.context - Contexto da avaliação (ex: 'inicial', 'pos-playlist')
   * @param {Array} options.playlistData - Dados da playlist associada (opcional)
   */
  const saveEmotionalSnapshot = async (options = {}) => {
    try {
      setIsLoading(true);

      const snapshot = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString("pt-BR"),
        time: new Date().toLocaleTimeString("pt-BR"),
        emotions: { ...emotionalState },
        dominantEmotion: getDominantEmotion(),
        overallMood: getOverallMood(),
        context: options.context || "manual",
        playlistData: options.playlistData || null,
        metadata: {
          totalIntensity: Object.values(emotionalState).reduce(
            (sum, val) => sum + val,
            0
          ),
          emotionCount: Object.values(emotionalState).filter((val) => val > 0)
            .length,
        },
      };

      // Adiciona ao histórico
      const updatedHistory = [snapshot, ...emotionalHistory].slice(0, 50); // Mantém apenas 50 registros
      setEmotionalHistory(updatedHistory);

      // Salva no localStorage
      localStorage.setItem(
        "sol_emotional_history",
        JSON.stringify(updatedHistory)
      );

      setHasUnsavedChanges(false);

      return { success: true, snapshot };
    } catch (error) {
      console.error("Erro ao salvar snapshot emocional:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reseta o estado emocional para valores neutros
   */
  const resetEmotionalState = useCallback(() => {
    const resetState = {};
    emotions.forEach((emotion) => {
      resetState[emotion.id] = 0;
    });
    setEmotionalState(resetState);
    setHasUnsavedChanges(false);
  }, [emotions]);

  /**
   * Obtém estatísticas do histórico emocional
   */
  const getEmotionalStats = useCallback(() => {
    if (emotionalHistory.length === 0) {
      return { avgMood: 0, totalSessions: 0, mostFrequentEmotion: null };
    }

    // Calcula humor médio
    const avgMood =
      emotionalHistory.reduce((sum, entry) => sum + entry.overallMood, 0) /
      emotionalHistory.length;

    // Encontra emoção mais frequente
    const emotionFrequency = {};
    emotionalHistory.forEach((entry) => {
      if (entry.dominantEmotion) {
        const emotionId = entry.dominantEmotion.id;
        emotionFrequency[emotionId] = (emotionFrequency[emotionId] || 0) + 1;
      }
    });

    const mostFrequentEmotion =
      Object.keys(emotionFrequency).length > 0
        ? Object.entries(emotionFrequency).reduce((a, b) =>
            emotionFrequency[a[0]] > emotionFrequency[b[0]] ? a : b
          )[0]
        : null;

    return {
      avgMood: Math.round(avgMood * 100) / 100,
      totalSessions: emotionalHistory.length,
      mostFrequentEmotion: mostFrequentEmotion
        ? emotions.find((e) => e.id === mostFrequentEmotion)
        : null,
    };
  }, [emotionalHistory, emotions]);

  return {
    // Estados
    emotions,
    emotionalState,
    emotionalHistory,
    hasUnsavedChanges,
    isLoading,

    // Funções principais
    updateEmotion,
    saveEmotionalSnapshot,
    resetEmotionalState,

    // Funções de análise
    getDominantEmotion,
    getOverallMood,
    getEmotionalStats,

    // Utilitários
    loadEmotionalHistory,
  };
};

export default useEmotionalState;
