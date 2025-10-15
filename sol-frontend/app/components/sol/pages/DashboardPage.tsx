import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import { PAGES } from "~/constants/sol";
import { HistoryService } from "~/services/historyService";
import type { UserData } from "~/types/sol";

interface DashboardPageProps {
  userData: UserData;
  setCurrentPage: (page: string) => void;
}

export default function DashboardPage({
  userData,
  setCurrentPage,
}: DashboardPageProps) {
  // Estados para dados
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [trend, setTrend] = useState<any>(null);

  // Estados de carregamento
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | undefined>();

  /**
   * 📊 Carregar Estatísticas
   */
  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const result = await HistoryService.getStats();

      if (result.success && result.data) {
        console.log("✅ Estatísticas carregadas:", result.data);
        setStats(result.data);
      }
    } catch (err) {
      console.error("❌ Erro ao carregar estatísticas:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  /**
   * 📋 Carregar Histórico
   */
  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const result = await HistoryService.getHistory(1, 10);

      if (result.success && result.data) {
        console.log("✅ Histórico carregado:", result.data);
        setHistory(result.data.historico);
      }
    } catch (err) {
      console.error("❌ Erro ao carregar histórico:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  /**
   * 📈 Carregar Tendência
   */
  const loadTrend = async () => {
    try {
      const result = await HistoryService.getTrend(7); // Últimos 7 dias

      if (result.success && result.data) {
        console.log("✅ Tendência carregada:", result.data);
        setTrend(result.data);
      }
    } catch (err) {
      console.error("❌ Erro ao carregar tendência:", err);
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    loadStats();
    loadHistory();
    loadTrend();
  }, []);

  /**
   * 🎨 Obter cor da intenção
   */
  const getIntentionColor = (intention: string) => {
    const lower = intention.toLowerCase();
    if (lower.includes("calma")) return "bg-blue-500";
    if (lower.includes("reflex")) return "bg-purple-500";
    if (lower.includes("neutra")) return "bg-yellow-500";
    if (lower.includes("estim")) return "bg-orange-500";
    if (lower.includes("feliz")) return "bg-green-500";
    return "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header pageTitle="Dashboard" />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Olá, {userData.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Veja seu progresso emocional</p>
            </div>
            <Button
              onClick={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
              className="bg-orange-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-500"
            >
              🎵 Nova Análise
            </Button>
          </div>

          {/* Cards de Estatísticas */}
          {isLoadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total de Análises */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm text-gray-600 mb-1">Total de Análises</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalAnalises}
                </p>
              </div>

              {/* Estado Emocional Médio */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm text-gray-600 mb-1">
                  Estado Emocional Médio
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.estadoEmocionalMedio.toFixed(1)}/10
                </p>
              </div>

              {/* Tendência */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-sm text-gray-600 mb-1">
                  Tendência Emocional
                </p>
                <p className="text-3xl font-bold text-orange-600 capitalize">
                  {stats.tendenciaEmocional?.tendencia || "Estável"}
                  {stats.tendenciaEmocional?.tendencia === "melhorando" &&
                    " 📈"}
                  {stats.tendenciaEmocional?.tendencia === "piorando" && " 📉"}
                  {stats.tendenciaEmocional?.tendencia === "estável" && " ➡️"}
                </p>
              </div>
            </div>
          ) : null}

          {/* Grid de 2 Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Intenções Mais Comuns */}
            {stats && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  🎯 Intenções Mais Comuns
                </h2>
                <div className="space-y-3">
                  {stats.intencoesMaisComuns.slice(0, 5).map((item: any) => (
                    <div
                      key={item.intencao}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${getIntentionColor(
                          item.intencao
                        )}`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {item.intencao}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.quantidade}x
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${getIntentionColor(
                              item.intencao
                            )} h-2 rounded-full`}
                            style={{
                              width: `${(item.quantidade / stats.totalAnalises) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gêneros Favoritos */}
            {stats && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  🎵 Gêneros Favoritos
                </h2>
                <div className="space-y-3">
                  {stats.generosFavoritos.slice(0, 5).map((item: any) => (
                    <div key={item.genero} className="flex items-center gap-3">
                      <span className="text-2xl">🎸</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {item.genero}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.quantidade}x
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-400 h-2 rounded-full"
                            style={{
                              width: `${(item.quantidade / stats.totalAnalises) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Histórico Recente */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                📋 Histórico Recente
              </h2>
              {!isLoadingHistory && history.length > 0 && (
                <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                  Ver Todos
                </button>
              )}
            </div>

            {isLoadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item: any) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full ${getIntentionColor(
                            item.intencaoPlaylist
                          )} flex items-center justify-center text-white font-bold`}
                        >
                          {item.estadoEmocional}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 capitalize">
                            {item.intencaoPlaylist}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {item.totalMusicas} músicas
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {(item.grauConfianca * 100).toFixed(0)}% confiança
                        </p>
                      </div>
                    </div>
                    {item.generoPreferido && (
                      <div className="mt-2">
                        <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded capitalize">
                          {item.generoPreferido}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Você ainda não tem histórico de análises
                </p>
                <Button
                  onClick={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
                  className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500"
                >
                  Fazer Primeira Análise
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
