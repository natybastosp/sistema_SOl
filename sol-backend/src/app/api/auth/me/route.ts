import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await requireAuth(request);

    // Se retornou Response, é um erro de autenticação
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;

    // Buscar informações completas do usuário
    const userWithStats = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        musicPreferences: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            emotionalStates: true,
            playlists: true,
            feedbacks: true,
          },
        },
      },
    });

    if (!userWithStats) {
      return createErrorResponse("Usuário não encontrado", 404);
    }

    // Buscar último estado emocional
    const lastEmotionalState = await prisma.emotionalState.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Montar resposta com estatísticas
    const responseData = {
      ...userWithStats,
      stats: {
        totalEmotionalStates: userWithStats._count.emotionalStates,
        totalPlaylists: userWithStats._count.playlists,
        totalFeedbacks: userWithStats._count.feedbacks,
      },
      lastEmotionalState: lastEmotionalState
        ? {
            sadness: lastEmotionalState.sadness,
            joy: lastEmotionalState.joy,
            anger: lastEmotionalState.anger,
            fear: lastEmotionalState.fear,
            surprise: lastEmotionalState.surprise,
            createdAt: lastEmotionalState.createdAt,
          }
        : null,
    };

    // Remover _count da resposta
    const { _count, ...finalResponse } = responseData;

    return createSuccessResponse(
      finalResponse,
      "Informações do usuário obtidas com sucesso"
    );
  } catch (error) {
    console.error("Erro ao obter informações do usuário:", error);
    return createErrorResponse("Erro interno do servidor", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await requireAuth(request);

    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;

    // Extrair dados do corpo da requisição
    const body = await request.json();
    const { name, musicPreferences } = body;

    // Objeto para atualização
    const updateData: any = {};

    // Validar e preparar nome se fornecido
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return createErrorResponse("Nome deve ter pelo menos 2 caracteres");
      }
      if (name.length > 100) {
        return createErrorResponse("Nome muito longo (máximo 100 caracteres)");
      }
      updateData.name = name.trim();
    }

    // Validar e preparar preferências musicais se fornecidas
    if (musicPreferences !== undefined) {
      if (!Array.isArray(musicPreferences)) {
        return createErrorResponse("Preferências musicais devem ser um array");
      }

      const validatedPreferences = musicPreferences
        .filter((pref) => typeof pref === "string" && pref.trim().length > 0)
        .map((pref) => pref.trim())
        .slice(0, 10); // Máximo 10 preferências

      updateData.musicPreferences = validatedPreferences;
    }

    // Se não há dados para atualizar
    if (Object.keys(updateData).length === 0) {
      return createErrorResponse(
        "Nenhum dado válido fornecido para atualização"
      );
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        musicPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`✅ Usuário atualizado: ${updatedUser.email}`);

    return createSuccessResponse(updatedUser, "Perfil atualizado com sucesso");
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return createErrorResponse("Erro interno do servidor", 500);
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
