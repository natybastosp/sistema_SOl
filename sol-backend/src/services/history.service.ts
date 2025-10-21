import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SaveHistoryInput {
  userId: string;
  estadoEmocional: number;
  generoPreferido?: string;
  fuzzyResult: any;
  playlist: {
    total: number;
    duracaoMinutos: number;
    estatisticas: {
      valenciaMedia: string;
      energiaMedia: string;
      tristezaMedia: string;
      alegriaMedia: string;
    };
    musicas: Array<{ id: string }>;
  };
  criteriosAplicados: any;
}

export class HistoryService {
  /**
   * Salva uma recomendação no histórico
   */
  static async saveRecommendation(data: SaveHistoryInput) {
    const {
      userId,
      estadoEmocional,
      generoPreferido,
      fuzzyResult,
      playlist,
      criteriosAplicados,
    } = data;

    try {
      // Extrair dados do resultado fuzzy
      const { output } = fuzzyResult;
      const { intencaoPlaylist, grauConfianca, detalhes } = output;
      const grausPertinencia = detalhes.grausPertinencia;

      // Converter estatísticas de string para float
      const valenciaMedia =
        playlist.estatisticas.valenciaMedia === "N/A"
          ? 0
          : parseFloat(playlist.estatisticas.valenciaMedia);

      const energiaMedia =
        playlist.estatisticas.energiaMedia === "N/A"
          ? 0
          : parseFloat(playlist.estatisticas.energiaMedia);

      // Criar registro no histórico
      const history = await prisma.recommendationHistory.create({
        data: {
          userId,
          estadoEmocional,
          generoPreferido: generoPreferido || null,

          // Análise fuzzy
          intencaoPlaylist,
          grauConfianca,
          valorIntencao: output.valorIntencao || 0.5,
          descricao: fuzzyResult.descricao || "",

          // Graus de pertinência
          grauTriste: grausPertinencia.triste || 0,
          grauAnsioso: grausPertinencia.ansioso || 0,
          grauNeutro: grausPertinencia.neutro || 0,
          grauAlegre: grausPertinencia.alegre || 0,

          // Critérios (JSON)
          criteriosJson: criteriosAplicados,

          // Info da playlist
          totalMusicas: playlist.total,
          duracaoMinutos: playlist.duracaoMinutos,

          // Estatísticas
          valenciaMedia,
          energiaMedia,
          tristezaMedia: parseFloat(playlist.estatisticas.tristezaMedia),
          alegriaMedia: parseFloat(playlist.estatisticas.alegriaMedia),

          // Relacionar músicas
          musicas: {
            create: playlist.musicas.map((musica, index) => ({
              musicId: musica.id,
              position: index + 1,
            })),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          musicas: {
            include: {
              music: {
                select: {
                  id: true,
                  name: true,
                  artist: true,
                },
              },
            },
          },
        },
      });

      console.log(`✅ Histórico salvo: ${history.id} para usuário ${userId}`);

      return history;
    } catch (error: any) {
      console.error("❌ Erro ao salvar histórico:", error);
      throw new Error(`Falha ao salvar histórico: ${error.message}`);
    }
  }

  /**
   * Busca histórico do usuário com paginação
   */
  static async getUserHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.recommendationHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          musicas: {
            include: {
              music: {
                select: {
                  id: true,
                  name: true,
                  artist: true,
                  genre: true,
                  spotifyId: true,
                },
              },
            },
            orderBy: { position: "asc" },
          },
        },
      }),
      prisma.recommendationHistory.count({ where: { userId } }),
    ]);

    return {
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Busca detalhes de um histórico específico
   */
  static async getHistoryById(historyId: string, userId: string) {
    const history = await prisma.recommendationHistory.findFirst({
      where: {
        id: historyId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        musicas: {
          include: {
            music: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!history) {
      throw new Error("Histórico não encontrado");
    }

    return history;
  }

  /**
   * Estatísticas gerais do usuário
   */
  static async getUserStats(userId: string) {
    const history = await prisma.recommendationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (history.length === 0) {
      return {
        totalAnalises: 0,
        estadoEmocionalMedio: 0,
        intencoesMaisComuns: [],
        generosFavoritos: [],
        tendenciaEmocional: null,
      };
    }

    const estadoEmocionalMedio =
      history.reduce((acc, h) => acc + h.estadoEmocional, 0) / history.length;

    const intencoes = history.reduce((acc: any, h) => {
      acc[h.intencaoPlaylist] = (acc[h.intencaoPlaylist] || 0) + 1;
      return acc;
    }, {});

    const intencoesMaisComuns = Object.entries(intencoes)
      .map(([intencao, count]) => ({ intencao, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    const generos = history
      .filter((h) => h.generoPreferido)
      .reduce((acc: any, h) => {
        acc[h.generoPreferido!] = (acc[h.generoPreferido!] || 0) + 1;
        return acc;
      }, {});

    const generosFavoritos = Object.entries(generos)
      .map(([genero, count]) => ({ genero, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    const agora = new Date();
    const ultimos30Dias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    const historicoRecente = history.filter(
      (h) => new Date(h.createdAt) >= ultimos30Dias
    );
    const historicoAntigo = history.filter(
      (h) => new Date(h.createdAt) < ultimos30Dias
    );

    let tendenciaEmocional = null;
    if (historicoRecente.length > 0 && historicoAntigo.length > 0) {
      const mediaRecente =
        historicoRecente.reduce((acc, h) => acc + h.estadoEmocional, 0) /
        historicoRecente.length;
      const mediaAntiga =
        historicoAntigo.reduce((acc, h) => acc + h.estadoEmocional, 0) /
        historicoAntigo.length;
      const diferencaPercentual =
        ((mediaRecente - mediaAntiga) / mediaAntiga) * 100;

      tendenciaEmocional = {
        mediaRecente: parseFloat(mediaRecente.toFixed(2)),
        mediaAntiga: parseFloat(mediaAntiga.toFixed(2)),
        variacao: parseFloat(diferencaPercentual.toFixed(2)),
        tendencia:
          diferencaPercentual > 5
            ? "melhorando"
            : diferencaPercentual < -5
            ? "piorando"
            : "estável",
      };
    }

    return {
      totalAnalises: history.length,
      estadoEmocionalMedio: parseFloat(estadoEmocionalMedio.toFixed(2)),
      intencoesMaisComuns,
      generosFavoritos,
      tendenciaEmocional,
    };
  }

  /**
   * Tendência emocional ao longo do tempo
   */
  static async getEmotionalTrend(userId: string, days: number = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - days);

    const history = await prisma.recommendationHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: dataInicio,
        },
      },
      orderBy: { createdAt: "asc" },
      select: {
        estadoEmocional: true,
        intencaoPlaylist: true,
        grauConfianca: true,
        createdAt: true,
      },
    });

    const porDia = history.reduce((acc: any, h) => {
      const dia = h.createdAt.toISOString().split("T")[0];
      if (!acc[dia]) {
        acc[dia] = [];
      }
      acc[dia].push(h.estadoEmocional);
      return acc;
    }, {});

    const tendencia = Object.entries(porDia).map(
      ([dia, estados]: [string, any]) => ({
        data: dia,
        estadoMedio: parseFloat(
          (
            estados.reduce((a: number, b: number) => a + b, 0) / estados.length
          ).toFixed(2)
        ),
        totalAnalises: estados.length,
      })
    );

    return {
      periodo: `${days} dias`,
      dataInicio: dataInicio.toISOString(),
      dataFim: new Date().toISOString(),
      totalAnalises: history.length,
      tendencia,
    };
  }
}
