import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSuccessResponse, createErrorResponse } from "@/lib/auth";
import { optionalAuth } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    // Autenticação opcional - funciona com ou sem login
    const { user } = await optionalAuth(request);

    // Buscar todos os gêneros únicos com contagem
    const genresWithCount = await prisma.music.groupBy({
      by: ["genre"],
      _count: {
        genre: true,
      },
      orderBy: {
        _count: {
          genre: "desc",
        },
      },
    });

    // Calcular estatísticas
    const totalMusic = genresWithCount.reduce(
      (sum, genre) => sum + genre._count.genre,
      0
    );
    const totalGenres = genresWithCount.length;

    // Separar gêneros por popularidade
    const popularGenres = genresWithCount.filter((g) => g._count.genre >= 50);
    const mediumGenres = genresWithCount.filter(
      (g) => g._count.genre >= 10 && g._count.genre < 50
    );
    const rareGenres = genresWithCount.filter((g) => g._count.genre < 10);

    // Lista simples de nomes para uso em formulários
    const genreNames = genresWithCount.map((g) => g.genre);

    // Top 10 mais populares
    const topGenres = genresWithCount.slice(0, 10);

    // Se usuário autenticado, incluir suas preferências
    let userPreferences = null;
    if (user) {
      userPreferences = user.musicPreferences || [];
    }

    const responseData = {
      total: {
        genres: totalGenres,
        musics: totalMusic,
        averageMusicsPerGenre: Math.round(totalMusic / totalGenres),
      },
      categories: {
        popular: {
          count: popularGenres.length,
          genres: popularGenres.map((g) => ({
            name: g.genre,
            musicCount: g._count.genre,
          })),
        },
        medium: {
          count: mediumGenres.length,
          genres: mediumGenres.map((g) => ({
            name: g.genre,
            musicCount: g._count.genre,
          })),
        },
        rare: {
          count: rareGenres.length,
          genres: rareGenres.map((g) => ({
            name: g.genre,
            musicCount: g._count.genre,
          })),
        },
      },
      topGenres: topGenres.map((g) => ({
        name: g.genre,
        musicCount: g._count.genre,
        percentage: Math.round((g._count.genre / totalMusic) * 100),
      })),
      allGenres: genresWithCount.map((g) => ({
        name: g.genre,
        musicCount: g._count.genre,
      })),
      genreNames, // Array simples para formulários
      userPreferences, // Preferências do usuário (se autenticado)
    };

    return createSuccessResponse(
      responseData,
      "Gêneros musicais obtidos com sucesso"
    );
  } catch (error) {
    console.error("Erro ao buscar gêneros:", error);
    return createErrorResponse("Erro interno do servidor", 500);
  }
}

// Buscar músicas de um gênero específico
export async function POST(request: NextRequest) {
  try {
    const { user } = await optionalAuth(request);
    const body = await request.json();
    const { genre, limit = 20, offset = 0 } = body;

    if (!genre) {
      return createErrorResponse("Gênero é obrigatório");
    }

    // Verificar se o gênero existe
    const genreExists = await prisma.music.findFirst({
      where: { genre: genre },
    });

    if (!genreExists) {
      return createErrorResponse("Gênero não encontrado", 404);
    }

    // Buscar músicas do gênero
    const musics = await prisma.music.findMany({
      where: { genre: genre },
      select: {
        id: true,
        spotifyId: true,
        name: true,
        artist: true,
        album: true,
        duration: true,
        genre: true,
        sadnessScore: true,
        joyScore: true,
        angerScore: true,
        fearScore: true,
        surpriseScore: true,
        danceability: true,
        energy: true,
        valence: true,
      },
      orderBy: [
        { joyScore: "desc" }, // Ordenar por alegria primeiro
        { name: "asc" },
      ],
      take: Number(limit),
      skip: Number(offset),
    });

    // Contar total para paginação
    const total = await prisma.music.count({
      where: { genre: genre },
    });

    const responseData = {
      genre,
      musics,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total,
      },
    };

    return createSuccessResponse(
      responseData,
      `Músicas do gênero ${genre} obtidas com sucesso`
    );
  } catch (error) {
    console.error("Erro ao buscar músicas do gênero:", error);
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
