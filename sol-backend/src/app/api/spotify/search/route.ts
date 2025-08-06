import { NextRequest, NextResponse } from "next/server";
import { spotifyService } from "@/lib/spotify";
import { verifyToken } from "@/lib/auth";

/**
 * API para buscar músicas no Spotify com análise emocional
 * POST /api/spotify/search
 *
 * Esta API permite buscar uma música específica no Spotify,
 * obter suas características de áudio e fazer análise emocional
 * automática para uso no sistema de recomendação SOL.
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (proteger a API)
    const authResult = await verifyToken(request);
    if (!authResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Token inválido ou expirado",
          message: "Faça login novamente para continuar",
        },
        { status: 401 }
      );
    }

    // Extrair dados da requisição
    const body = await request.json();
    const { trackName, artistName, includeAnalysis = true } = body;

    // Validar dados obrigatórios
    if (!trackName || !artistName) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios ausentes",
          message: "Nome da música e artista são obrigatórios",
          requiredFields: ["trackName", "artistName"],
        },
        { status: 400 }
      );
    }

    // Limpar e validar strings de entrada
    const cleanTrackName = trackName.trim();
    const cleanArtistName = artistName.trim();

    if (cleanTrackName.length < 2 || cleanArtistName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          message: "Nome da música e artista devem ter pelo menos 2 caracteres",
        },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Buscando música: "${cleanTrackName}" - "${cleanArtistName}" (usuário: ${authResult.user?.email})`
    );

    // Buscar no Spotify usando nosso serviço
    const result = await spotifyService.searchTrack(
      cleanTrackName,
      cleanArtistName,
      includeAnalysis
    );

    if (!result.found) {
      return NextResponse.json(
        {
          success: false,
          found: false,
          message: "Música não encontrada no Spotify",
          searchParams: {
            trackName: cleanTrackName,
            artistName: cleanArtistName,
          },
          suggestions: [
            "Verifique a grafia do nome da música",
            "Tente usar nomes mais simples (sem feat., etc.)",
            "Verifique se a música está disponível no Spotify Brasil",
          ],
        },
        { status: 404 }
      );
    }

    // Preparar resposta com dados encontrados
    const responseData: any = {
      success: true,
      found: true,
      track: {
        spotifyId: result.track!.id,
        name: result.track!.name,
        artist: result.track!.artists[0].name,
        album: result.track!.album.name,
        releaseDate: result.track!.album.release_date,
        duration: result.track!.duration_ms,
        popularity: result.track!.popularity,
        previewUrl: result.track!.preview_url,
        spotifyUrl: result.track!.external_urls.spotify,
        uri: result.track!.uri,
      },
      searchParams: {
        trackName: cleanTrackName,
        artistName: cleanArtistName,
      },
    };

    // Adicionar análise emocional se solicitada e disponível
    if (includeAnalysis && result.audioFeatures) {
      const emotionalAnalysis = spotifyService.analyzeEmotionalProfile(
        result.audioFeatures
      );

      responseData.audioFeatures = {
        // Características básicas de áudio
        danceability: result.audioFeatures.danceability,
        energy: result.audioFeatures.energy,
        valence: result.audioFeatures.valence,
        acousticness: result.audioFeatures.acousticness,
        instrumentalness: result.audioFeatures.instrumentalness,
        speechiness: result.audioFeatures.speechiness,
        liveness: result.audioFeatures.liveness,
        loudness: result.audioFeatures.loudness,
        tempo: result.audioFeatures.tempo,
        timeSignature: result.audioFeatures.time_signature,
      };

      responseData.emotionalAnalysis = {
        mood: emotionalAnalysis.mood,
        energyLevel: emotionalAnalysis.energyLevel,
        therapeuticPotential: emotionalAnalysis.therapeuticPotential,
        // Adicionar recomendações de uso baseadas na análise
        recommendedFor: generateTherapeuticRecommendations(emotionalAnalysis),
        // Score geral de adequação para saúde mental (0-100)
        mentalHealthScore: calculateMentalHealthScore(emotionalAnalysis),
      };

      console.log(
        `✅ Música analisada com sucesso. Mood: ${
          emotionalAnalysis.mood
        }, Potencial terapêutico máximo: ${Math.max(
          ...Object.values(emotionalAnalysis.therapeuticPotential)
        )}`
      );
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Erro na API de busca Spotify:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: "Ocorreu um erro ao buscar a música. Tente novamente.",
        ...(process.env.NODE_ENV === "development" && {
          debug: error.message,
        }),
      },
      { status: 500 }
    );
  }
}

/**
 * Gera recomendações terapêuticas baseadas na análise emocional
 */
function generateTherapeuticRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];
  const { therapeuticPotential, mood, energyLevel } = analysis;

  // Analisar potencial terapêutico e gerar recomendações específicas
  if (therapeuticPotential.anxiety > 0.7) {
    recommendations.push("Redução de ansiedade");
    recommendations.push("Sessões de relaxamento");
  }

  if (therapeuticPotential.depression > 0.7) {
    recommendations.push("Melhoria do humor");
    recommendations.push("Terapia de positividade");
  }

  if (therapeuticPotential.relaxation > 0.8) {
    recommendations.push("Meditação e mindfulness");
    recommendations.push("Relaxamento antes do sono");
  }

  if (therapeuticPotential.motivation > 0.7) {
    recommendations.push("Exercícios físicos");
    recommendations.push("Atividades produtivas");
    recommendations.push("Superação de desafios");
  }

  // Recomendações baseadas no mood
  if (mood === "happy-energetic") {
    recommendations.push("Atividades sociais");
    recommendations.push("Exercícios aeróbicos");
  } else if (mood === "sad-calm") {
    recommendations.push("Reflexão e introspecção");
    recommendations.push("Journaling terapêutico");
  }

  // Se não houver recomendações específicas, dar uma genérica
  if (recommendations.length === 0) {
    recommendations.push("Escuta casual e bem-estar geral");
  }

  return recommendations;
}

/**
 * Calcula um score geral de adequação para saúde mental (0-100)
 */
function calculateMentalHealthScore(analysis: any): number {
  const { therapeuticPotential } = analysis;

  // Média ponderada dos potenciais terapêuticos
  const averagePotential =
    therapeuticPotential.anxiety * 0.3 + // Ansiedade tem peso maior
    therapeuticPotential.depression * 0.3 + // Depressão tem peso maior
    therapeuticPotential.relaxation * 0.2 + // Relaxamento é importante
    therapeuticPotential.motivation * 0.2; // Motivação complementa

  // Converter para escala 0-100
  return Math.round(averagePotential * 100);
}

/**
 * Método GET para documentação da API
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/spotify/search",
    method: "POST",
    description:
      "Busca músicas no Spotify com análise emocional para o Sistema SOL",
    authentication: "Bearer token required",
    parameters: {
      trackName: "string (obrigatório) - Nome da música",
      artistName: "string (obrigatório) - Nome do artista",
      includeAnalysis:
        "boolean (opcional, padrão: true) - Incluir análise emocional",
    },
    example: {
      trackName: "Imagine",
      artistName: "John Lennon",
      includeAnalysis: true,
    },
    response: {
      success: "boolean",
      found: "boolean",
      track: "SpotifyTrack object",
      audioFeatures: "AudioFeatures object (se includeAnalysis=true)",
      emotionalAnalysis: "EmotionalAnalysis object (se includeAnalysis=true)",
    },
  });
}
