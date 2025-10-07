import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";
import { HistoryService } from "@/services/history.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error, authResult.status);
    }

    const user = authResult.user;
    const historyId = params.id;

    const history = await HistoryService.getHistoryById(historyId, user.id);

    return NextResponse.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error.message === "Histórico não encontrado") {
      return NextResponse.json(
        { error: "Histórico não encontrado" },
        { status: 404 }
      );
    }

    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do histórico", details: error.message },
      { status: 500 }
    );
  }
}
