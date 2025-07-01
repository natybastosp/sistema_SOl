// API Route para Recomendação Musical Fuzzy - Sistema SOL
// Esta rota permite testar e usar o sistema de lógica fuzzy
// Arquivo: src/app/api/recommendations/fuzzy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { generateFuzzyMusicRecommendation } from "@/lib/fuzzy/emotionalMusicRecommendation";
import { EmotionalState, MusicRecommendationRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    console.log("🎵 API: Recebendo solicitação de recomendação fuzzy...");

    // Extrair dados do request
    const body = await request.json();

    // Validar dados de entrada
    const validationResult = validateRecommendationRequest(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados de entrada inválidos",
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    // Criar objeto de requisição estruturado
    const recommendationRequest: MusicRecommendationRequest = {
      userId: body.userId || "test-user",
      currentEmotion: {
        anger: body.anger || 0,
        fear: body.fear || 0,
        joy: body.joy || 0,
        sadness: body.sadness || 0,
        surprise: body.surprise || 0,
      },
      preferredGenres: body.preferredGenres || [],
      playlistSize: body.playlistSize || 15,
      algorithm: "fuzzy",
    };

    console.log(
      "📊 Estado emocional recebido:",
      recommendationRequest.currentEmotion
    );

    // Gerar recomendação usando lógica fuzzy
    const recommendation = await generateFuzzyMusicRecommendation(
      recommendationRequest
    );

    // Retornar resposta estruturada
    return NextResponse.json({
      success: true,
      data: {
        playlist: recommendation.data.playlist,
        explanation: recommendation.data.explanation,
        strategy: {
          valenceTarget: recommendation.data.strategy.valenceTarget,
          energyTarget: recommendation.data.strategy.energyTarget,
          danceabilityTarget: recommendation.data.strategy.danceabilityTarget,
          topGenres: Array.from(
            recommendation.data.strategy.genreWeights.entries()
          )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map((entry) => ({ genre: entry[0], weight: entry[1] })),
        },
        confidence: recommendation.data.confidence,
        algorithm: recommendation.algorithm,
        timestamp: recommendation.timestamp,
      },
      message: "Recomendação gerada com sucesso usando lógica fuzzy",
    });
  } catch (error) {
    console.error("❌ Erro na API de recomendação fuzzy:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// GET endpoint para testar o sistema com estados emocionais predefinidos
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testCase = searchParams.get("test") || "balanced";

  // Estados emocionais de teste predefinidos
  const testCases: Record<string, EmotionalState> = {
    // Estado equilibrado - pessoa se sentindo bem
    balanced: {
      anger: 0.1,
      fear: 0.2,
      joy: 0.6,
      sadness: 0.1,
      surprise: 0.3,
    },

    // Pessoa muito triste - precisa de cuidado especial
    very_sad: {
      anger: 0.2,
      fear: 0.4,
      joy: 0.1,
      sadness: 0.8,
      surprise: 0.1,
    },

    // Pessoa ansiosa - precisa de música calmante
    anxious: {
      anger: 0.3,
      fear: 0.7,
      joy: 0.2,
      sadness: 0.4,
      surprise: 0.5,
    },

    // Pessoa muito feliz - manter o estado positivo
    very_happy: {
      anger: 0.1,
      fear: 0.1,
      joy: 0.9,
      sadness: 0.0,
      surprise: 0.6,
    },

    // Pessoa com raiva - precisa de catarse controlada
    angry: {
      anger: 0.8,
      fear: 0.3,
      joy: 0.1,
      sadness: 0.2,
      surprise: 0.4,
    },

    // Estado misto complexo - tristeza + ansiedade
    sad_anxious: {
      anger: 0.2,
      fear: 0.6,
      joy: 0.1,
      sadness: 0.7,
      surprise: 0.2,
    },
  };

  const emotionalState = testCases[testCase] || testCases.balanced;

  try {
    const recommendationRequest: MusicRecommendationRequest = {
      userId: `test-${testCase}`,
      currentEmotion: emotionalState,
      preferredGenres: [],
      playlistSize: 10,
      algorithm: "fuzzy",
    };

    const recommendation = await generateFuzzyMusicRecommendation(
      recommendationRequest
    );

    return NextResponse.json({
      success: true,
      testCase: testCase,
      emotionalState: emotionalState,
      recommendation: recommendation.data,
      message: `Teste executado para caso: ${testCase}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erro no teste",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

/**
 * Função para validar dados de entrada da requisição
 * Garante que o estado emocional está em formato válido
 */
function validateRecommendationRequest(body: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar que pelo menos um valor emocional foi fornecido
  const emotions = ["anger", "fear", "joy", "sadness", "surprise"];
  const hasEmotionalData = emotions.some(
    (emotion) =>
      typeof body[emotion] === "number" &&
      body[emotion] >= 0 &&
      body[emotion] <= 1
  );

  if (!hasEmotionalData) {
    errors.push(
      "Pelo menos um valor emocional válido deve ser fornecido (0-1)"
    );
  }

  // Validar cada emoção individualmente
  emotions.forEach((emotion) => {
    if (body[emotion] !== undefined) {
      if (typeof body[emotion] !== "number") {
        errors.push(`${emotion} deve ser um número`);
      } else if (body[emotion] < 0 || body[emotion] > 1) {
        errors.push(`${emotion} deve estar entre 0 e 1`);
      }
    }
  });

  // Validar playlistSize se fornecido
  if (body.playlistSize !== undefined) {
    if (
      !Number.isInteger(body.playlistSize) ||
      body.playlistSize < 1 ||
      body.playlistSize > 50
    ) {
      errors.push("playlistSize deve ser um inteiro entre 1 e 50");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
