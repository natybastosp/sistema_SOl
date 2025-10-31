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
    const validatedData = emotionalAnalysisSchema.parse(body);
    Logger.debug("✅ Dados validados", validatedData);

    // 3. Processar com Fuzzy
    const fuzzyResult = fuzzyEngine.processRecommendation({
      estadoEmocional: validatedData.estadoEmocional,
      generoPreferido: validatedData.generoPreferido,
    });
    Logger.debug("🧠 Fuzzy processado", fuzzyResult);

    // 4. Buscar músicas no banco
    const musicas = await prisma.music.findMany({
      where: {
        genre: validatedData.generoPreferido,
      },
      take: 20,
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

    if (musicas.length === 0) {
      Logger.warn("Nenhuma música encontrada para", {
        genre: validatedData.generoPreferido,
      });
      throw new ValidationError(
        "Nenhuma música encontrada para essa combinação"
      );
    }

    Logger.info(`✅ Encontradas ${musicas.length} músicas`);

    // 5. Salvar análise no histórico
    const emotionalState = await prisma.emotionalState.create({
      data: {
        userId: user.id,
        sadness: validatedData.estadoEmocional <= 3 ? 8 : 2,
        joy: validatedData.estadoEmocional >= 7 ? 8 : 4,
        anger: 2,
        fear: 2,
        surprise: 5,
      },
    });

    Logger.debug("💾 Análise salva", { id: emotionalState.id });

    // 6. Retornar resultado
    Logger.success("✅ Análise concluída com sucesso");
    return NextResponse.json({
      success: true,
      data: {
        analysisId: emotionalState.id,
        analysis: {
          estadoEmocional: validatedData.estadoEmocional,
          generoPreferido: validatedData.generoPreferido,
          grauConfianca: fuzzyResult.output.grauConfianca,
        },
        playlist: musicas.map((m) => ({
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
