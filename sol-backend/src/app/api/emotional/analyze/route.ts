import { NextRequest, NextResponse } from "next/server";
import { FuzzyMusicEngine } from "@/core/fuzzy/engine";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";

/**
 * POST /api/emotional/analyze
 * Analisa estado emocional e retorna recomendação musical
 * 🔐 PROTEGIDO - Requer autenticação
 */
export async function POST(request: NextRequest) {
  try {
    // 1. VERIFICAR AUTENTICAÇÃO
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error, authResult.status);
    }

    const user = authResult.user;
    console.log(`🔐 Usuário autenticado: ${user.email}`);

    // 2. Extrair dados do body
    const body = await request.json();
    const { estadoEmocional, generoPreferido } = body;

    // 3. Validação básica
    if (estadoEmocional === undefined || estadoEmocional === null) {
      return NextResponse.json(
        { error: 'Campo "estadoEmocional" é obrigatório (0-10)' },
        { status: 400 }
      );
    }

    if (estadoEmocional < 0 || estadoEmocional > 10) {
      return NextResponse.json(
        { error: "Estado emocional deve estar entre 0 e 10" },
        { status: 400 }
      );
    }

    // 4. Inicializar engine fuzzy
    const fuzzyEngine = new FuzzyMusicEngine();

    // 5. Processar recomendação
    const resultado = fuzzyEngine.processRecommendation({
      estadoEmocional: Number(estadoEmocional),
      generoPreferido: generoPreferido || undefined,
    });

    // 6. Retornar resultado
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      data: resultado,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Erro na análise emocional:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar análise emocional",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/emotional/analyze
 * Retorna informações sobre o endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/emotional/analyze",
    method: "POST",
    authentication: "🔐 REQUER TOKEN JWT",
    description:
      "Analisa estado emocional e retorna recomendação musical fuzzy",
    headers: {
      Authorization: "Bearer {seu_token_jwt}",
    },
    body: {
      estadoEmocional: "number (0-10) - obrigatório",
      generoPreferido: "string (opcional) - Rock, Funk, MPB, Sertanejo, etc",
    },
    example: {
      estadoEmocional: 4,
      generoPreferido: "Rock",
    },
  });
}
