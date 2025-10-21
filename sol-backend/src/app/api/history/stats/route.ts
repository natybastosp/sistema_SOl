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
    const stats = await HistoryService.getUserStats(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas", details: error.message },
      { status: 500 }
    );
  }
}
