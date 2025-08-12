// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Heart,
  Music,
  TrendingUp,
  Calendar,
  Settings,
  Play,
  RefreshCw,
  Download,
  Share2,
} from "lucide-react";
import Header from "../components/common/Header";
import SunLogo from "../components/common/SunLogo";
import Button from "../components/common/Button";
import useEmotionalState from "../hooks/useEmotionalState";

/**
 * Dashboard Principal do Usuário
 *
 * Este é o "centro de comando" da experiência SOL. Aqui o usuário pode:
 * - Visualizar seu progresso emocional ao longo do tempo
 * - Acessar estatísticas das suas sessões de musicoterapia
 * - Iniciar novas sessões rapidamente
 * - Gerenciar suas preferências e configurações
 * - Acompanhar insights sobre sua jornada de bem-estar
 *
 * O dashboard é projetado para ser motivacional e informativo,
 * mostrando ao usuário que sua jornada de autocuidado está
 * fazendo diferença e evoluindo positivamente.
 *
 * Princípios de design aplicados:
 * - Informações importantes em destaque
 * - Navegação intuitiva
 * - Feedback visual do progresso
 * - Ações rápidas acessíveis
 */
const DashboardPage = ({
  user,
  lastPlaylist,
  onNewSession,
  onEditPreferences,
  onLogout,
}) => {
  // Hook para gerenciar dados emocionais
  const { emotionalHistory, getEmotionalStats, emotions } = useEmotionalState();

  // Estados locais do dashboard
  const [selectedTimeframe, setSelectedTimeframe] = useState("week"); // week, month, all
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  // Dados computados
  const [stats, setStats] = useState({
    avgMood: 0,
    totalSessions: 0,
    mostFrequentEmotion: null,
  });

  // Atualiza estatísticas quando os dados mudam
  useEffect(() => {
    setStats(getEmotionalStats());
  }, [emotionalHistory, getEmotionalStats]);

  /**
   * Filtra histórico baseado no timeframe selecionado
   */
  const getFilteredHistory = () => {
    if (!emotionalHistory.length) return [];

    const now = new Date();
    let cutoffDate;

    switch (selectedTimeframe) {
      case "week":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return emotionalHistory;
    }

    return emotionalHistory.filter(
      (entry) => new Date(entry.timestamp) >= cutoffDate
    );
  };

  /**
   * Componente de Card de Estatística
   */
  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "blue",
    trend = null,
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm ${
              trend > 0
                ? "text-green-600"
                : trend < 0
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            <TrendingUp
              className={`w-4 h-4 mr-1 ${trend < 0 ? "rotate-180" : ""}`}
            />
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  /**
   * Gráfico simples de humor ao longo do tempo
   */
  const MoodChart = () => {
    const filteredHistory = getFilteredHistory();

    if (filteredHistory.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Evolução do Humor
          </h3>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Inicie algumas sessões para ver seu progresso aqui</p>
          </div>
        </div>
      );
    }

    // Simplificação: mostra apenas os últimos 7 pontos de dados
    const recentHistory = filteredHistory.slice(0, 7).reverse();
    const maxMood = 10;
    const minMood = -10;

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Evolução do Humor
          </h3>

          {/* Seletor de período */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["week", "month", "all"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedTimeframe === period
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {period === "week"
                  ? "7 dias"
                  : period === "month"
                  ? "30 dias"
                  : "Tudo"}
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico simplificado */}
        <div className="relative h-32">
          <div className="absolute inset-0 flex items-end justify-between space-x-2">
            {recentHistory.map((entry, index) => {
              const moodPercent =
                ((entry.overallMood - minMood) / (maxMood - minMood)) * 100;
              const height = Math.max(moodPercent, 5); // Altura mínima para visualização

              return (
                <div
                  key={entry.id || index}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      entry.overallMood > 3
                        ? "bg-green-400"
                        : entry.overallMood < -3
                        ? "bg-red-400"
                        : "bg-yellow-400"
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${new Date(
                      entry.timestamp
                    ).toLocaleDateString()}: ${entry.overallMood.toFixed(1)}`}
                  />
                  <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                    {new Date(entry.timestamp).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex justify-center mt-4 space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-1" />
            <span className="text-gray-600">Positivo</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1" />
            <span className="text-gray-600">Neutro</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded-full mr-1" />
            <span className="text-gray-600">Negativo</span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Seção de últimas sessões
   */
  const RecentSessions = () => {
    const recentSessions = emotionalHistory.slice(0, 5);

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Sessões Recentes
        </h3>

        {recentSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma sessão registrada ainda</p>
            <Button
              onClick={onNewSession}
              variant="primary"
              size="sm"
              className="mt-3"
            >
              Iniciar Primeira Sessão
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div
                key={session.id || index}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      session.overallMood > 3
                        ? "bg-green-400"
                        : session.overallMood < -3
                        ? "bg-red-400"
                        : "bg-yellow-400"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {session.dominantEmotion?.label ||
                      "Sessão de musicoterapia"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.timestamp).toLocaleDateString("pt-BR")} •
                    {new Date(session.timestamp).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {session.overallMood > 0 ? "+" : ""}
                    {session.overallMood.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Ações rápidas
   */
  const QuickActions = () => (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onNewSession}
          variant="secondary"
          size="md"
          className="bg-white bg-opacity-20 text-white border-white border-opacity-30 hover:bg-opacity-30 justify-center"
        >
          <Play className="w-4 h-4 mr-2" />
          Nova Sessão
        </Button>

        <Button
          onClick={onEditPreferences}
          variant="secondary"
          size="md"
          className="bg-white bg-opacity-20 text-white border-white border-opacity-30 hover:bg-opacity-30 justify-center"
        >
          <Settings className="w-4 h-4 mr-2" />
          Preferências
        </Button>

        <Button
          onClick={() => setShowDetailedStats(!showDetailedStats)}
          variant="secondary"
          size="md"
          className="bg-white bg-opacity-20 text-white border-white border-opacity-30 hover:bg-opacity-30 justify-center"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Estatísticas
        </Button>

        <Button
          onClick={() => {
            // Em produção, isso geraria um relatório real
            console.log("Gerando relatório...");
          }}
          variant="secondary"
          size="md"
          className="bg-white bg-opacity-20 text-white border-white border-opacity-30 hover:bg-opacity-30 justify-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Relatório
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <Header
        pageTitle={`Olá, ${user?.name || "Usuário"}!`}
        showUserActions={true}
        user={user}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Boas-vindas */}
          <div className="text-center">
            <SunLogo size="large" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2 mt-4">
              Seu Painel de Bem-Estar
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Acompanhe sua jornada de autocuidado e veja como a música está
              impactando positivamente seu bem-estar emocional.
            </p>
          </div>

          {/* Estatísticas principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={Heart}
              title="Humor Médio"
              value={stats.avgMood.toFixed(1)}
              subtitle="Baseado em todas as suas sessões"
              color="red"
              trend={15} // Em produção, seria calculado
            />

            <StatCard
              icon={Music}
              title="Sessões Realizadas"
              value={stats.totalSessions}
              subtitle="Total de sessões de musicoterapia"
              color="purple"
              trend={8}
            />

            <StatCard
              icon={TrendingUp}
              title="Emoção Mais Frequente"
              value={stats.mostFrequentEmotion?.label || "N/A"}
              subtitle="Sua emoção predominante"
              color="green"
            />
          </div>

          {/* Gráfico e Ações */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MoodChart />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Sessões recentes */}
          <RecentSessions />

          {/* Estatísticas detalhadas (opcional) */}
          {showDetailedStats && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Estatísticas Detalhadas
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {emotions.map((emotion) => {
                  const emotionCount = emotionalHistory.filter(
                    (entry) => entry.dominantEmotion?.id === emotion.id
                  ).length;

                  return (
                    <div
                      key={emotion.id}
                      className="text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div
                        className="w-4 h-4 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: emotion.color }}
                      />
                      <p className="text-sm font-medium text-gray-800">
                        {emotion.label}
                      </p>
                      <p className="text-xs text-gray-600">
                        {emotionCount} vezes
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ações de gerenciamento */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Pronto para mais uma sessão?
              </h3>
              <p className="text-sm text-gray-600">
                A consistência é chave para o bem-estar emocional
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={onLogout} variant="ghost" size="md">
                Sair
              </Button>

              <Button
                onClick={onNewSession}
                variant="primary"
                size="lg"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Iniciar Nova Sessão
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
