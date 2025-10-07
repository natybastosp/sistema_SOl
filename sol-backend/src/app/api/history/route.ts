import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";
import { HistoryService } from "@/services/history.service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error, authResult.status);
    }

    const user = authResult.user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (page < 1) {
      return NextResponse.json(
        { error: "Página deve ser maior que 0" },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Limite deve estar entre 1 e 50" },
        { status: 400 }
      );
    }

    const result = await HistoryService.getUserHistory(user.id, page, limit);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico", details: error.message },
      { status: 500 }
    );
  }
}
