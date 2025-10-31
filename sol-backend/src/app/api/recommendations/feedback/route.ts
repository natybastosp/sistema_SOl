import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { getUserFromRequest } from "@/lib/auth-helper";
import { feedbackSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    Logger.info("💬 Processing feedback for playlist");

    // Autenticar usuário
    const user = await getUserFromRequest(request);

    // Parse request body
    const body = await request.json();

    // Validar com Zod
    const validated = feedbackSchema.parse(body);

    // Verificar se a playlist pertence ao usuário
    const playlist = await prisma.playlist.findUnique({
      where: { id: validated.playlistId },
    });

    if (!playlist) {
      Logger.warn(`Playlist not found: ${validated.playlistId}`);
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    if (playlist.userId !== user.id) {
      Logger.warn(`User ${user.id} tried to access playlist from another user`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Salvar feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        playlistId: validated.playlistId,
        rating: validated.rating,
        comment: validated.comment,
      },
    });

    Logger.success(`✅ Feedback saved: ${feedback.id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: feedback.id,
        rating: feedback.rating,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    Logger.error("Error processing feedback", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save feedback",
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    Logger.info("📊 Fetching user feedbacks");

    // Autenticar usuário
    const user = await getUserFromRequest(request);

    // Parse pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Buscar feedbacks do usuário
    const feedbacks = await prisma.feedback.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Contar total
    const total = await prisma.feedback.count({
      where: { userId: user.id },
    });

    Logger.success(`✅ Retrieved ${feedbacks.length} feedbacks`);

    return NextResponse.json({
      success: true,
      data: {
        feedbacks: feedbacks.map((f) => ({
          id: f.id,
          playlistId: f.playlistId,
          rating: f.rating,
          comment: f.comment,
          postEmotion: {
            sadness: f.postSadness,
            joy: f.postJoy,
            anger: f.postAnger,
            fear: f.postFear,
            surprise: f.postSurprise,
          },
          createdAt: f.createdAt,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    Logger.error("Error fetching feedbacks", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch feedbacks",
      },
      { status: 400 }
    );
  }
}
