import { NextRequest, NextResponse } from "next/server";
import { emotionalAnalysisSchema } from "@/lib/validators";
import { ValidationError } from "@/lib/errors";
import { errorHandler } from "@/middleware/error-handler";
import { FuzzyMusicEngine } from "@/core/fuzzy/engine";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { Logger } from "@/lib/logger";
import { rateLimit } from "@/middleware/rate-limit";

const fuzzyEngine = new FuzzyMusicEngine();
const limiter = rateLimit(50, 60000); // 50 requisições por minuto

/**
 * POST /api/emotions/analyze
 *
 * Analisa estado emocional e retorna playlist recomendada
 * 🔐 ROTA PROTEGIDA
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = limiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    Logger.info("📊 Analisando estado emocional...");

    // 1. Autenticação
    const user = await getUserFromRequest(request);
    Logger.debug("✅ Usuário autenticado", { userId: user.id });

    // 2. Parse e validação
    const body = await request.json();
    let validatedData = emotionalAnalysisSchema.parse(body);
    Logger.debug("✅ Dados validados", validatedData);

    // 2.3 Normalizar gênero (converter para minúsculas - como está no banco)
    if (validatedData.generoPreferido) {
      validatedData.generoPreferido =
        validatedData.generoPreferido.toLowerCase();
      Logger.debug(
        "🎵 Gênero normalizado para minúsculas:",
        validatedData.generoPreferido
      );
    }

    // 2.5 Converter 4 emoções para estadoEmocional se necessário
    let estadoEmocional = validatedData.estadoEmocional;

    if (
      !estadoEmocional &&
      validatedData.joy !== undefined &&
      validatedData.sadness !== undefined
    ) {
      // Converter: (joy - sadness) normalizado para escala 0-10
      // joy alta (10) + sadness baixa (0) = estado alegre (10)
      // joy baixa (0) + sadness alta (10) = estado triste (0)
      estadoEmocional = (validatedData.joy - validatedData.sadness + 10) / 2;
      Logger.debug("📊 Conversão de emoções para estado", {
        joy: validatedData.joy,
        sadness: validatedData.sadness,
        anger: validatedData.anger,
        fear: validatedData.fear,
        estadoEmocionalCalculado: estadoEmocional,
      });
    }

    if (!estadoEmocional) {
      throw new ValidationError("Estado emocional não pode ser determinado");
    }

    // 3. Processar com Fuzzy
    const fuzzyResult = fuzzyEngine.processRecommendation({
      estadoEmocional,
      generoPreferido: validatedData.generoPreferido,
    });
    Logger.debug("🧠 Fuzzy processado", fuzzyResult);
    Logger.debug("📋 Critérios emocionais", fuzzyResult.filtrosMusica);

    // 4. Buscar músicas no banco com critérios fuzzy
    // Construir filtros dinamicamente
    const whereFilters: any = {};

    // Se gênero foi especificado (e não for "Todos"), incluir no filtro
    if (
      validatedData.generoPreferido &&
      validatedData.generoPreferido !== "todos"
    ) {
      // Gênero já foi normalizado para minúsculas acima
      whereFilters.genre = validatedData.generoPreferido;
      Logger.debug("🎵 Filtrando por gênero", {
        genre: validatedData.generoPreferido,
      });
    } else if (validatedData.generoPreferido === "todos") {
      Logger.debug(
        "🎵 Nenhum filtro de gênero (Todos os gêneros selecionados)"
      );
    }

    // Aplicar critérios emocionais fuzzy
    whereFilters.joyScore = {
      gte: fuzzyResult.filtrosMusica.minAlegria || 0,
    };
    whereFilters.sadnessScore = {
      lte: fuzzyResult.filtrosMusica.maxTristeza || 10,
    };

    Logger.debug("🔍 Critérios de busca aplicados", {
      minJoy: fuzzyResult.filtrosMusica.minAlegria,
      maxSadness: fuzzyResult.filtrosMusica.maxTristeza,
      genre: validatedData.generoPreferido || "Qualquer um",
    });

    // Variar ordenação para evitar repetição de playlists
    const tipoOrdenacao = Math.random();
    let orderBy: any;

    if (tipoOrdenacao < 0.33) {
      orderBy = { joyScore: "desc" };
    } else if (tipoOrdenacao < 0.66) {
      orderBy = { energy: "desc" };
    } else {
      orderBy = { valence: "desc" };
    }

    Logger.debug("🎲 Variação de ordenação", {
      tipo: Object.keys(orderBy)[0],
      random: tipoOrdenacao,
    });

    const musicas = await prisma.music.findMany({
      where: whereFilters,
      take: 15, // Pega mais para ter margem de embaralhamento
      select: {
        id: true,
        name: true,
        artist: true,
        genre: true,
        energy: true,
        valence: true,
        spotifyId: true,
        duration: true,
        joyScore: true,
        sadnessScore: true,
      },
      orderBy: orderBy,
    });

    Logger.debug("📊 Resultado da busca", {
      totalEncontradas: musicas.length,
      genroFiltrado: validatedData.generoPreferido,
      generosMusicaEncontradas: musicas.map((m) => m.genre),
    });

    // Embaralhar as 15 músicas e pegar apenas 5
    const musicasShuffladas = musicas
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    if (musicasShuffladas.length === 0) {
      Logger.warn("⚠️ Nenhuma música encontrada com esses critérios", {
        genre: validatedData.generoPreferido || "Qualquer um",
        minJoy: fuzzyResult.filtrosMusica.minAlegria,
        maxSadness: fuzzyResult.filtrosMusica.maxTristeza,
      });

      // Tentar buscar sem critérios tão rigorosos
      Logger.info("🔄 Tentando busca mais flexível...");
      const musicasFlexivel = await prisma.music.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          artist: true,
          genre: true,
          energy: true,
          valence: true,
          spotifyId: true,
          duration: true,
          joyScore: true,
          sadnessScore: true,
        },
        orderBy: { joyScore: "desc" },
      });

      if (musicasFlexivel.length === 0) {
        throw new ValidationError(
          "Nenhuma música encontrada no banco de dados"
        );
      }

      Logger.warn("✅ Usando busca flexível, retornando 5 melhores músicas");
      musicasShuffladas.push(...musicasFlexivel.slice(0, 5));
    }

    Logger.info(`✅ Encontradas ${musicasShuffladas.length} músicas`);

    // 5. Salvar análise no histórico
    const emotionalState = await prisma.emotionalState.create({
      data: {
        userId: user.id,
        sadness: validatedData.sadness ?? (estadoEmocional <= 3 ? 8 : 2),
        joy: validatedData.joy ?? (estadoEmocional >= 7 ? 8 : 4),
        anger: validatedData.anger ?? 2,
        fear: validatedData.fear ?? 2,
        surprise: 5, // Mantém compatibilidade com schema, mas não usa
      },
    });

    Logger.debug("💾 Análise salva", { id: emotionalState.id });

    // 6. Criar e salvar playlist automaticamente
    const dataAtual = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const playlistName = `${fuzzyResult.output.intencaoPlaylist} - ${dataAtual}`;

    // Determinar emoji padrão baseado na emoção dominante
    const emotions = {
      sadness: validatedData.sadness ?? (estadoEmocional <= 3 ? 8 : 2),
      joy: validatedData.joy ?? (estadoEmocional >= 7 ? 8 : 4),
      anger: validatedData.anger ?? 2,
      fear: validatedData.fear ?? 2,
    };

    const dominantEmotion = Object.entries(emotions).reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    )[0];

    const emotionEmojis: Record<string, string> = {
      joy: "😊",
      sadness: "😢",
      anger: "😠",
      fear: "😨",
    };
    const coverEmoji = emotionEmojis[dominantEmotion] || "🎵";

    const playlist = await prisma.playlist.create({
      data: {
        userId: user.id,
        emotionalStateId: emotionalState.id,
        name: playlistName,
        description: `Playlist gerada com ${fuzzyResult.output.grauConfianca.toFixed(
          0
        )}% de confiança`,
        cover: coverEmoji,
        likes: 0,
      },
    });

    Logger.debug("💾 Playlist criada", { id: playlist.id, name: playlistName });

    // 7. Adicionar músicas à playlist
    if (musicasShuffladas.length > 0) {
      await prisma.playlistMusic.createMany({
        data: musicasShuffladas.map((musica, index) => ({
          playlistId: playlist.id,
          musicId: musica.id,
          position: index + 1,
        })),
      });

      Logger.debug(
        `💾 ${musicasShuffladas.length} músicas adicionadas à playlist`
      );
    }

    // 8. Retornar resultado
    Logger.success("✅ Análise concluída e playlist salva com sucesso");
    return NextResponse.json({
      success: true,
      data: {
        analysisId: emotionalState.id,
        playlistId: playlist.id,
        analysis: {
          estadoEmocional: validatedData.estadoEmocional,
          generoPreferido: validatedData.generoPreferido,
          grauConfianca: fuzzyResult.output.grauConfianca,
        },
        playlist: musicasShuffladas.map((m) => ({
          id: m.id,
          title: m.name,
          artist: m.artist,
          genre: m.genre,
          spotifyId: m.spotifyId,
          duration: m.duration,
        })),
      },
    });
  } catch (error) {
    Logger.error("❌ Erro ao analisar estado emocional", error);
    return errorHandler(error);
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API de Análise Emocional",
    version: "1.0.0",
    method: "POST",
    endpoint: "/api/emotions/analyze",
  });
}
