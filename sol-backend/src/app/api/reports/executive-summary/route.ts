import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error, authResult.status);
    }

    const user = authResult.user;

    const [history, totalUsers, totalMusics] = await Promise.all([
      prisma.recommendationHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.count(),
      prisma.music.count(),
    ]);

    if (history.length === 0) {
      return NextResponse.json({
        success: true,
        summary: {
          mensagem: "Nenhuma análise realizada ainda",
          recomendacao:
            "Use o sistema para gerar recomendações e obter métricas",
        },
      });
    }

    // Calcular métricas principais
    const estados = history.map((h) => h.estadoEmocional);
    const estadoMedio = estados.reduce((a, b) => a + b, 0) / estados.length;
    const minEstado = Math.min(...estados);
    const maxEstado = Math.max(...estados);

    // Melhora emocional
    const primeiraMetade = estados.slice(0, Math.floor(estados.length / 2));
    const segundaMetade = estados.slice(Math.floor(estados.length / 2));
    const mediaPrimeira =
      primeiraMetade.reduce((a, b) => a + b, 0) / primeiraMetade.length;
    const mediaSegunda =
      segundaMetade.reduce((a, b) => a + b, 0) / segundaMetade.length;
    const melhora = ((mediaSegunda - mediaPrimeira) / mediaPrimeira) * 100;

    // Taxa de uso do sistema fuzzy
    const confiancaMedia =
      history.reduce((acc, h) => acc + h.grauConfianca, 0) / history.length;
    const efetividadeFuzzy = confiancaMedia * 100;

    // Intenção mais recomendada
    const intencoes = history.reduce((acc: any, h) => {
      acc[h.intencaoPlaylist] = (acc[h.intencaoPlaylist] || 0) + 1;
      return acc;
    }, {});
    const intencaoMaisComum = Object.entries(intencoes).sort(
      (a: any, b: any) => b[1] - a[1]
    )[0];

    // Período de uso
    const primeiraAnalise = new Date(history[0].createdAt);
    const ultimaAnalise = new Date(history[history.length - 1].createdAt);
    const diasDeUso = Math.ceil(
      (ultimaAnalise.getTime() - primeiraAnalise.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const summary = {
      tituloRelatorio: "RESUMO EXECUTIVO - SISTEMA SOL",
      subtitulo:
        "Sistema de Recomendação Musical Baseado em Lógica Fuzzy para Saúde Mental",

      usuario: {
        identificacao: user.name,
        email: user.email,
        cadastradoEm: user.createdAt,
      },

      metricsGerais: {
        totalAnalises: history.length,
        diasDeUso,
        mediaDiariaAnalises: parseFloat(
          (history.length / Math.max(diasDeUso, 1)).toFixed(2)
        ),
        totalMusicasRecomendadas: history.reduce(
          (acc, h) => acc + h.totalMusicas,
          0
        ),
        tempoTotalAudioMinutos: history.reduce(
          (acc, h) => acc + h.duracaoMinutos,
          0
        ),
      },

      indicadoresEmocionais: {
        estadoEmocionalMedio: parseFloat(estadoMedio.toFixed(2)),
        estadoMinimo: minEstado,
        estadoMaximo: maxEstado,
        variacaoPercentual: parseFloat(
          (((maxEstado - minEstado) / minEstado) * 100).toFixed(2)
        ),
        melhoraObservada: {
          percentual: parseFloat(melhora.toFixed(2)),
          tendencia:
            melhora > 5 ? "POSITIVA" : melhora < -5 ? "NEGATIVA" : "ESTÁVEL",
          interpretacao:
            melhora > 5
              ? "Houve melhora significativa no estado emocional ao longo do uso"
              : melhora < -5
              ? "Houve declínio no estado emocional - recomenda-se acompanhamento profissional"
              : "Estado emocional manteve-se relativamente estável",
        },
      },

      eficienciaDoSistema: {
        confiancaMediaFuzzy: parseFloat((confiancaMedia * 100).toFixed(2)),
        classificacao:
          confiancaMedia >= 0.8
            ? "ALTA"
            : confiancaMedia >= 0.6
            ? "MÉDIA"
            : "BAIXA",
        intencaoMaisRecomendada: {
          tipo: intencaoMaisComum[0],
          frequencia: intencaoMaisComum[1],
          percentual: parseFloat(
            ((intencaoMaisComum[1] / history.length) * 100).toFixed(2)
          ),
        },
      },

      distribuicaoUso: {
        porEstadoEmocional: {
          depressivo: history.filter((h) => h.estadoEmocional <= 2).length,
          ansioso: history.filter(
            (h) => h.estadoEmocional >= 3 && h.estadoEmocional <= 4
          ).length,
          neutro: history.filter(
            (h) => h.estadoEmocional >= 5 && h.estadoEmocional <= 6
          ).length,
          contente: history.filter(
            (h) => h.estadoEmocional >= 7 && h.estadoEmocional <= 8
          ).length,
          feliz: history.filter((h) => h.estadoEmocional >= 9).length,
        },
        generosMusicais: Object.entries(
          history
            .filter((h) => h.generoPreferido)
            .reduce((acc: any, h) => {
              acc[h.generoPreferido!] = (acc[h.generoPreferido!] || 0) + 1;
              return acc;
            }, {})
        ).map(([genero, count]) => ({ genero, quantidade: count })),
      },

      conclusoesPrelimares: [
        history.length >= 10
          ? "Dataset suficiente para análises estatísticas significativas"
          : "Dataset ainda pequeno - recomenda-se mais interações para análises robustas",

        confiancaMedia >= 0.7
          ? "Sistema fuzzy demonstra alta confiabilidade nas recomendações"
          : "Sistema fuzzy requer ajustes nos parâmetros de inferência",

        melhora > 5
          ? "Evidências preliminares de impacto positivo na saúde emocional do usuário"
          : "Necessário acompanhamento prolongado para avaliar impacto terapêutico",

        diasDeUso >= 7
          ? "Período de teste adequado para validação preliminar do sistema"
          : "Período de teste ainda curto - recomenda-se extensão para pelo menos 7 dias",
      ],

      recomendacoesParaTCC: {
        analiseQuantitativa: `Com ${
          history.length
        } análises realizadas em ${diasDeUso} dia(s), o sistema demonstra ${efetividadeFuzzy.toFixed(
          0
        )}% de eficiência na classificação fuzzy`,
        analiseQualitativa: `A intenção "${
          intencaoMaisComum[0]
        }" foi a mais recomendada (${(
          (intencaoMaisComum[1] / history.length) *
          100
        ).toFixed(0)}% dos casos)`,
        validacaoSistema:
          confiancaMedia >= 0.7
            ? "Sistema validado com confiança aceitável"
            : "Sistema requer refinamento",
        graficosRecomendados: [
          "Gráfico de linha: Evolução temporal do estado emocional",
          "Gráfico de barras: Distribuição de intenções de playlist",
          "Gráfico de pizza: Preferências de gêneros musicais",
          "Heatmap: Padrões de uso por dia/hora",
        ],
      },

      contextoDoBanco: {
        totalUsuariosCadastrados: totalUsers,
        baseMusical: {
          totalMusicas: totalMusics,
          caracteristicas:
            "Músicas classificadas com scores emocionais (tristeza, alegria, raiva, medo, surpresa)",
          fontes: "Base proprietária com análise emocional pré-processada",
        },
      },

      metadadosDoRelatorio: {
        versaoSistema: "1.0.0",
        modeloFuzzy: "Mamdani com defuzzificação por centroide",
        geradoEm: new Date().toISOString(),
        periodoAnalisado: {
          inicio: primeiraAnalise.toISOString(),
          fim: ultimaAnalise.toISOString(),
        },
      },
    };

    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao gerar resumo executivo:", error);
    return NextResponse.json(
      { error: "Erro ao gerar resumo", details: error.message },
      { status: 500 }
    );
  }
}
