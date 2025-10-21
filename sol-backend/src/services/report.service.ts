import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ReportService {
  /**
   * Gera CSV do histórico completo do usuário
   */
  static async generateHistoryCSV(userId: string): Promise<string> {
    const history = await prisma.recommendationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        musicas: {
          include: {
            music: {
              select: {
                name: true,
                artist: true,
                genre: true,
                sadnessScore: true,
                joyScore: true,
                angerScore: true,
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    // Header do CSV
    let csv =
      "Data,Hora,Estado_Emocional,Genero_Preferido,Intencao_Playlist,Grau_Confianca,";
    csv +=
      "Total_Musicas,Duracao_Minutos,Valencia_Media,Energia_Media,Tristeza_Media,Alegria_Media,";
    csv += "Grau_Triste,Grau_Ansioso,Grau_Neutro,Grau_Alegre\n";

    // Dados
    history.forEach((h) => {
      const date = new Date(h.createdAt);
      csv += `${date.toISOString().split("T")[0]},`;
      csv += `${date.toTimeString().split(" ")[0]},`;
      csv += `${h.estadoEmocional},`;
      csv += `${h.generoPreferido || "Todos"},`;
      csv += `${h.intencaoPlaylist},`;
      csv += `${h.grauConfianca},`;
      csv += `${h.totalMusicas},`;
      csv += `${h.duracaoMinutos},`;
      csv += `${h.valenciaMedia},`;
      csv += `${h.energiaMedia},`;
      csv += `${h.tristezaMedia},`;
      csv += `${h.alegriaMedia},`;
      csv += `${h.grauTriste},`;
      csv += `${h.grauAnsioso},`;
      csv += `${h.grauNeutro},`;
      csv += `${h.grauAlegre}\n`;
    });

    return csv;
  }

  /**
   * Gera relatório consolidado para análise acadêmica
   */
  static async generateConsolidatedReport(userId: string) {
    const [user, history, stats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.recommendationHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
      this.calculateDetailedStats(userId),
    ]);

    return {
      usuario: user,
      periodoAnalise: {
        dataInicio: history[0]?.createdAt || null,
        dataFim: history[history.length - 1]?.createdAt || null,
        diasAtivo: this.calculateActiveDays(history),
      },
      resumoGeral: {
        totalAnalises: history.length,
        estadoEmocionalMedio: stats.estadoEmocionalMedio,
        desvioPatrao: stats.desvioPatrao,
        minimoEstado: Math.min(...history.map((h) => h.estadoEmocional)),
        maximoEstado: Math.max(...history.map((h) => h.estadoEmocional)),
        mediana: this.calculateMedian(history.map((h) => h.estadoEmocional)),
      },
      distribuicaoEstados: stats.distribuicaoEstados,
      intencoes: stats.intencoes,
      generos: stats.generos,
      evolucaoTemporal: stats.evolucaoTemporal,
      metricas: {
        confiancaMedia: stats.confiancaMedia,
        totalMusicas: history.reduce((acc, h) => acc + h.totalMusicas, 0),
        tempoTotalMinutos: history.reduce(
          (acc, h) => acc + h.duracaoMinutos,
          0
        ),
      },
      geradoEm: new Date().toISOString(),
    };
  }

  /**
   * Calcula estatísticas detalhadas
   */
  private static async calculateDetailedStats(userId: string) {
    const history = await prisma.recommendationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    if (history.length === 0) {
      return {
        estadoEmocionalMedio: 0,
        desvioPatrao: 0,
        distribuicaoEstados: {},
        intencoes: {},
        generos: {},
        evolucaoTemporal: [],
        confiancaMedia: 0,
      };
    }

    // Média e desvio padrão
    const estados = history.map((h) => h.estadoEmocional);
    const media = estados.reduce((a, b) => a + b, 0) / estados.length;
    const variancia =
      estados.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) /
      estados.length;
    const desvioPatrao = Math.sqrt(variancia);

    // Distribuição por faixas
    const distribuicaoEstados = {
      "Depressivo (0-2)": history.filter((h) => h.estadoEmocional <= 2).length,
      "Ansioso (3-4)": history.filter(
        (h) => h.estadoEmocional >= 3 && h.estadoEmocional <= 4
      ).length,
      "Neutro (5-6)": history.filter(
        (h) => h.estadoEmocional >= 5 && h.estadoEmocional <= 6
      ).length,
      "Contente (7-8)": history.filter(
        (h) => h.estadoEmocional >= 7 && h.estadoEmocional <= 8
      ).length,
      "Feliz (9-10)": history.filter(
        (h) => h.estadoEmocional >= 9 && h.estadoEmocional <= 10
      ).length,
    };

    // Intenções
    const intencoes = history.reduce((acc: any, h) => {
      acc[h.intencaoPlaylist] = (acc[h.intencaoPlaylist] || 0) + 1;
      return acc;
    }, {});

    // Gêneros
    const generos = history
      .filter((h) => h.generoPreferido)
      .reduce((acc: any, h) => {
        acc[h.generoPreferido!] = (acc[h.generoPreferido!] || 0) + 1;
        return acc;
      }, {});

    // Evolução temporal (agrupado por dia)
    const porDia = history.reduce((acc: any, h) => {
      const dia = h.createdAt.toISOString().split("T")[0];
      if (!acc[dia]) {
        acc[dia] = { estados: [], intencoes: [], confiancas: [] };
      }
      acc[dia].estados.push(h.estadoEmocional);
      acc[dia].intencoes.push(h.intencaoPlaylist);
      acc[dia].confiancas.push(h.grauConfianca);
      return acc;
    }, {});

    const evolucaoTemporal = Object.entries(porDia).map(
      ([dia, dados]: [string, any]) => ({
        data: dia,
        estadoMedio: parseFloat(
          (
            dados.estados.reduce((a: number, b: number) => a + b, 0) /
            dados.estados.length
          ).toFixed(2)
        ),
        confiancaMedia: parseFloat(
          (
            dados.confiancas.reduce((a: number, b: number) => a + b, 0) /
            dados.confiancas.length
          ).toFixed(2)
        ),
        totalAnalises: dados.estados.length,
        intencaoPredominante: this.getMostFrequent(dados.intencoes),
      })
    );

    const confiancaMedia =
      history.reduce((acc, h) => acc + h.grauConfianca, 0) / history.length;

    return {
      estadoEmocionalMedio: parseFloat(media.toFixed(2)),
      desvioPatrao: parseFloat(desvioPatrao.toFixed(2)),
      distribuicaoEstados,
      intencoes,
      generos,
      evolucaoTemporal,
      confiancaMedia: parseFloat(confiancaMedia.toFixed(2)),
    };
  }

  /**
   * Gera dados estruturados para gráficos
   */
  static async generateChartData(userId: string, days: number = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - days);

    const history = await prisma.recommendationHistory.findMany({
      where: {
        userId,
        createdAt: { gte: dataInicio },
      },
      orderBy: { createdAt: "asc" },
    });

    // Dados para gráfico de linha (tendência emocional)
    const linhaEstadoEmocional = history.map((h) => ({
      x: h.createdAt.toISOString(),
      y: h.estadoEmocional,
      label: h.intencaoPlaylist,
    }));

    // Dados para gráfico de barras (distribuição de intenções)
    const intencoes = history.reduce((acc: any, h) => {
      acc[h.intencaoPlaylist] = (acc[h.intencaoPlaylist] || 0) + 1;
      return acc;
    }, {});

    const barrasIntencoes = Object.entries(intencoes).map(
      ([intencao, count]) => ({
        x: intencao,
        y: count,
      })
    );

    // Dados para gráfico de pizza (gêneros)
    const generos = history
      .filter((h) => h.generoPreferido)
      .reduce((acc: any, h) => {
        acc[h.generoPreferido!] = (acc[h.generoPreferido!] || 0) + 1;
        return acc;
      }, {});

    const pizzaGeneros = Object.entries(generos).map(([genero, count]) => ({
      label: genero,
      value: count,
    }));

    // Dados para heatmap (estados por dia da semana e hora)
    const heatmapData = this.generateHeatmapData(history);

    return {
      periodo: `${days} dias`,
      totalAnalises: history.length,
      graficos: {
        tendenciaEmocional: {
          tipo: "line",
          dados: linhaEstadoEmocional,
          eixoX: "Data/Hora",
          eixoY: "Estado Emocional (0-10)",
        },
        distribuicaoIntencoes: {
          tipo: "bar",
          dados: barrasIntencoes,
          eixoX: "Intenção",
          eixoY: "Quantidade",
        },
        generosFavoritos: {
          tipo: "pie",
          dados: pizzaGeneros,
        },
        heatmap: {
          tipo: "heatmap",
          dados: heatmapData,
          descricao: "Estado emocional por dia da semana e hora",
        },
      },
    };
  }

  // Métodos auxiliares
  private static calculateActiveDays(history: any[]): number {
    if (history.length === 0) return 0;
    const uniqueDays = new Set(
      history.map((h) => h.createdAt.toISOString().split("T")[0])
    );
    return uniqueDays.size;
  }

  private static calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private static getMostFrequent(arr: string[]): string {
    const freq = arr.reduce((acc: any, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(freq).reduce((a, b) => (freq[a] > freq[b] ? a : b));
  }

  private static generateHeatmapData(history: any[]) {
    const heatmap: any = {};
    const diasSemana = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

    history.forEach((h) => {
      const date = new Date(h.createdAt);
      const dia = diasSemana[date.getDay()];
      const hora = date.getHours();

      if (!heatmap[dia]) heatmap[dia] = {};
      if (!heatmap[dia][hora]) heatmap[dia][hora] = [];

      heatmap[dia][hora].push(h.estadoEmocional);
    });

    // Calcular médias
    const result: any[] = [];
    Object.keys(heatmap).forEach((dia) => {
      Object.keys(heatmap[dia]).forEach((hora) => {
        const estados = heatmap[dia][hora];
        const media =
          estados.reduce((a: number, b: number) => a + b, 0) / estados.length;
        result.push({
          dia,
          hora: parseInt(hora),
          estadoMedio: parseFloat(media.toFixed(2)),
          totalAnalises: estados.length,
        });
      });
    });

    return result;
  }
}
