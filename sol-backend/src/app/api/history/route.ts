import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { getUserFromRequest } from "@/lib/auth-helper";
import { historyQuerySchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    Logger.info("📜 Fetching recommendation history");

    // Autenticar usuário
    const user = await getUserFromRequest(request);

    // Parse e validar query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const days = parseInt(searchParams.get("days") || "7", 10);

    // Validar com Zod
    const validated = historyQuerySchema.parse({ limit, offset, days });

    // Calcular data limite
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - (validated.days || 7));

    // Buscar histórico paginado
    const history = await prisma.recommendationHistory.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: dateLimit,
        },
      },
      include: {
        musicas: {
          include: {
            music: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: validated.limit,
      skip: validated.offset,
    });

    // Contar total para paginação
    const total = await prisma.recommendationHistory.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: dateLimit,
        },
      },
    });

    Logger.success(`✅ Retrieved ${history.length} history records`);

    return NextResponse.json({
      success: true,
      data: {
        history: history.map((item) => ({
          id: item.id,
          estadoEmocional: item.estadoEmocional,
          intencaoPlaylist: item.intencaoPlaylist,
          grauConfianca: item.grauConfianca,
          totalMusicas: item.totalMusicas,
          duracaoMinutos: item.duracaoMinutos,
          createdAt: item.createdAt,
          musicas: item.musicas.map((m) => ({
            position: m.position,
            music: {
              id: m.music.id,
              name: m.music.name,
              artist: m.music.artist,
              album: m.music.album,
              genre: m.music.genre,
              duration: m.music.duration,
            },
          })),
        })),
        pagination: {
          total,
          limit: validated.limit,
          offset: validated.offset,
          hasMore: validated.offset + validated.limit < total,
        },
      },
    });
  } catch (error) {
    Logger.error("Error fetching history", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch history",
      },
      { status: 400 }
    );
  }
}
