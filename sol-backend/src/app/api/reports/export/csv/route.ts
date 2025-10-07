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
    const csv = await ReportService.generateHistoryCSV(user.id);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="historico_${user.email}_${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar CSV:", error);
    return NextResponse.json(
      { error: "Erro ao gerar CSV", details: error.message },
      { status: 500 }
    );
  }
}
