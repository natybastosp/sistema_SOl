import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";
import { ReportService } from "@/services/report.service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error, authResult.status);
    }

    const user = authResult.user;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: "Dias deve estar entre 1 e 365" },
        { status: 400 }
      );
    }

    const chartData = await ReportService.generateChartData(user.id, days);

    return NextResponse.json({
      success: true,
      data: chartData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao gerar dados para gráficos:", error);
    return NextResponse.json(
      { error: "Erro ao gerar dados", details: error.message },
      { status: 500 }
    );
  }
}
