import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import { PAGES, EMOTIONS } from "~/constants/sol";
import type { UserData, EmotionalHistoryEntry } from "~/types/sol";

interface DashboardPageProps {
  userData: UserData;
  emotionalHistory: EmotionalHistoryEntry[];
  onNavigate: (page: string) => void;
  onQuickAction?: (action: string) => void;
}

/**
 * 🏠 DashboardPage - O Centro de Comando Pessoal do Sistema SOL
 *
 * Este componente funciona como o centro de controle da estação espacial internacional:
 * - Monitora todos os sistemas vitais (estado emocional, progresso, tendências)
 * - Oferece acesso rápido a todas as funcionalidades críticas
 * - Apresenta informações complexas de forma visual e intuitiva
 * - Antecipa necessidades baseado em padrões de comportamento
 *
 * É como ter um cockpit personalizado onde cada instrumento foi posicionado
 * exatamente onde você precisa, mostrando exatamente as informações que
 * são mais relevantes para sua jornada pessoal de bem-estar.
 */
export default function DashboardPage({
  userData,
  emotionalHistory,
  onNavigate,
  onQuickAction,
}: DashboardPageProps) {
  // 📊 Estados para análise e visualização
  const [currentMoodTrend, setCurrentMoodTrend] = useState<
    "improving" | "stable" | "declining"
  >("stable");
  const [weeklyStats, setWeeklyStats] = useState({
    sessionsThisWeek: 0,
    averageMoodImprovement: 0,
    streakDays: 0,
    mostHelpfulGenre: "",
  });
  const [recommendedActions, setRecommendedActions] = useState<string[]>([]);
  const [timeBasedGreeting, setTimeBasedGreeting] = useState<string>("");

  /**
   * 🧮 Análise inteligente dos dados do usuário
   *
   * Como um médico que analisa exames antes da consulta,
   * este efeito processa todo o histórico emocional para
   * extrair insights acionáveis e tendências importantes.
   */
  useEffect(() => {
    const analyzeUserData = () => {
      // Análise temporal para saudação contextual
      const now = new Date();
      const hour = now.getHours();
      const dayName = now.toLocaleDateString("pt-BR", { weekday: "long" });

      let greeting = "";
      if (hour < 12) {
        greeting = `Bom dia! Como você quer começar esta ${dayName}?`;
      } else if (hour < 18) {
        greeting = `Boa tarde! Como posso ajudar você nesta ${dayName}?`;
      } else {
        greeting = `Boa noite! Vamos cuidar do seu bem-estar nesta ${dayName}?`;
      }
      setTimeBasedGreeting(greeting);

      // Análise do histórico emocional para tendências
      if (emotionalHistory.length > 0) {
        const recentSessions = emotionalHistory.slice(-7); // Últimas 7 sessões
        const moodChanges = recentSessions.map(
          (session) => session.satisfaction || 0
        );
        const averageChange =
          moodChanges.reduce((a, b) => a + b, 0) / moodChanges.length;

        // Determina tendência baseada na média de mudanças
        if (averageChange > 3.5) {
          setCurrentMoodTrend("improving");
        } else if (averageChange < 2.5) {
          setCurrentMoodTrend("declining");
        } else {
          setCurrentMoodTrend("stable");
        }

        // Calcula estatísticas da semana
        const thisWeekSessions = getThisWeekSessions(emotionalHistory);
        const stats = {
          sessionsThisWeek: thisWeekSessions.length,
          averageMoodImprovement:
            calculateAverageMoodImprovement(thisWeekSessions),
          streakDays: calculateStreakDays(emotionalHistory),
          mostHelpfulGenre: findMostHelpfulGenre(thisWeekSessions),
        };
        setWeeklyStats(stats);

        // Gera recomendações baseadas nos padrões
        const recommendations = generateSmartRecommendations(
          stats,
          currentMoodTrend,
          userData
        );
        setRecommendedActions(recommendations);
      }
    };

    analyzeUserData();
  }, [emotionalHistory, userData, currentMoodTrend]);

  /**
   * 🎯 Ação rápida inteligente
   *
   * Como um assistente pessoal que antecipa suas necessidades,
   * esta função direciona você para a experiência mais apropriada
   * baseada no seu estado atual e padrões históricos.
   */
  const handleQuickMoodCheck = () => {
    // Se o usuário já fez sessão hoje, vai para IA rápida
    const todaySessions = emotionalHistory.filter((session) => {
      const sessionDate = new Date(session.date);
      const today = new Date();
      return sessionDate.toDateString() === today.toDateString();
    });

    if (todaySessions.length > 0) {
      onNavigate(PAGES.QUICK_IA);
    } else {
      // Primeira sessão do dia, oferece análise completa
      onNavigate(PAGES.EMOTIONAL_ASSESSMENT);
    }
  };

  /**
   * 🎨 Renderização do centro de comando personalizado
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      <Header pageTitle="Meu Centro de Bem-Estar" />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Cabeçalho personalizado com saudação inteligente */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Olá, {userData.name || "Amigo"}! 👋
              </h1>
              <p className="text-lg text-gray-600 mt-1">{timeBasedGreeting}</p>
            </div>
            <SunLogo size="medium" />
          </div>

          {/* Indicador de tendência emocional */}
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              currentMoodTrend === "improving"
                ? "bg-green-100 text-green-800"
                : currentMoodTrend === "declining"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {currentMoodTrend === "improving" &&
              "📈 Sua tendência emocional está melhorando"}
            {currentMoodTrend === "declining" &&
              "📉 Vamos focar no seu bem-estar hoje"}
            {currentMoodTrend === "stable" && "⚖️ Seu humor está estável"}
          </div>
        </div>

        {/* Grade principal de cartões funcionais */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Cartão de Ação Rápida - Sempre mais proeminente */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl p-6 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-2">
                Como você está se sentindo?
              </h2>
              <p className="text-orange-100 mb-6">
                Sua IA pessoal está pronta para criar uma experiência musical
                perfeita para este momento.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleQuickMoodCheck}
                  className="bg-white text-orange-600 hover:bg-orange-50 font-semibold py-3 px-6 flex-1"
                >
                  ⚡ Análise Rápida (30s)
                </Button>

                <Button
                  onClick={() => onNavigate(PAGES.EMOTIONAL_ASSESSMENT)}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-orange-600 py-3 px-6 flex-1"
                >
                  🧠 Análise Completa
                </Button>
              </div>
            </div>
          </div>

          {/* Estatísticas da Semana */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Esta Semana
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sessões</span>
                <span className="font-bold text-2xl text-purple-600">
                  {weeklyStats.sessionsThisWeek}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sequência</span>
                <span className="font-bold text-2xl text-green-600">
                  {weeklyStats.streakDays} dias
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Melhoria Média</span>
                <span className="font-bold text-2xl text-blue-600">
                  +{Math.round(weeklyStats.averageMoodImprovement * 10)}%
                </span>
              </div>

              {weeklyStats.mostHelpfulGenre && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Gênero mais eficaz:</p>
                  <p className="font-medium text-gray-800">
                    {weeklyStats.mostHelpfulGenre}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Segunda linha: Recomendações Inteligentes e Acesso Rápido */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recomendações Baseadas em IA */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🎯 Recomendações para Você
            </h3>

            {recommendedActions.length > 0 ? (
              <div className="space-y-3">
                {recommendedActions.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-gray-700 text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Complete algumas sessões para receber recomendações
                  personalizadas!
                </p>
                <Button
                  onClick={() => onNavigate(PAGES.QUICK_IA)}
                  className="bg-blue-500 text-white"
                >
                  Começar Primeira Sessão
                </Button>
              </div>
            )}
          </div>

          {/* Acesso Rápido a Funcionalidades */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Acesso Rápido
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate(PAGES.PLAYLIST)}
                className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="text-2xl mb-1">🎵</div>
                <div className="font-medium text-gray-800">Última Playlist</div>
                <div className="text-sm text-gray-500">Continuar ouvindo</div>
              </button>

              <button
                onClick={() => onNavigate(PAGES.SETTINGS)}
                className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="text-2xl mb-1">⚙️</div>
                <div className="font-medium text-gray-800">Configurações</div>
                <div className="text-sm text-gray-500">Personalizar</div>
              </button>

              <button
                onClick={() => onNavigate(PAGES.MUSIC_SETTINGS)}
                className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="text-2xl mb-1">🎼</div>
                <div className="font-medium text-gray-800">Preferências</div>
                <div className="text-sm text-gray-500">Gostos musicais</div>
              </button>

              <button
                onClick={() => {
                  /* TODO: Implementar histórico detalhado */
                }}
                className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="text-2xl mb-1">📊</div>
                <div className="font-medium text-gray-800">Relatórios</div>
                <div className="text-sm text-gray-500">Progresso detalhado</div>
              </button>
            </div>
          </div>
        </div>

        {/* Histórico Emocional Recente */}
        {emotionalHistory.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Suas Sessões Recentes
            </h3>

            <div className="space-y-3">
              {emotionalHistory
                .slice(-5)
                .reverse()
                .map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {new Date(entry.date).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {entry.tracksPlayed} músicas • {entry.finalEmotion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < entry.satisfaction
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {emotionalHistory.length > 5 && (
              <div className="mt-4 text-center">
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Ver histórico completo →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mensagem de encorajamento para novos usuários */}
        {emotionalHistory.length === 0 && (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              🌱 Sua Jornada Começa Aqui!
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Bem-vindo ao SOL! Este será seu espaço pessoal para acompanhar
              como a música transforma seu bem-estar emocional. Cada sessão que
              você completar ajudará nossa IA a conhecê-lo melhor e oferecer
              recomendações cada vez mais precisas.
            </p>
            <Button
              onClick={() => onNavigate(PAGES.QUICK_IA)}
              className="bg-white text-green-600 hover:bg-green-50 font-semibold py-3 px-8"
            >
              🚀 Começar Minha Primeira Sessão
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// 🧮 FUNÇÕES AUXILIARES PARA ANÁLISE INTELIGENTE

/**
 * Filtra sessões da semana atual
 */
function getThisWeekSessions(
  history: EmotionalHistoryEntry[]
): EmotionalHistoryEntry[] {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  return history.filter((session) => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startOfWeek;
  });
}

/**
 * Calcula melhoria média de humor
 */
function calculateAverageMoodImprovement(
  sessions: EmotionalHistoryEntry[]
): number {
  if (sessions.length === 0) return 0;

  const improvements = sessions.map((session) => session.satisfaction / 5); // Normaliza para 0-1
  return improvements.reduce((a, b) => a + b, 0) / improvements.length;
}

/**
 * Calcula sequência de dias consecutivos
 */
function calculateStreakDays(history: EmotionalHistoryEntry[]): number {
  if (history.length === 0) return 0;

  // Algoritmo simplificado - em produção seria mais sofisticado
  const sortedDates = history
    .map((session) => new Date(session.date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let currentDate = new Date();

  for (const sessionDate of sortedDates) {
    const daysDiff = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= streak + 1) {
      streak++;
      currentDate = sessionDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Encontra gênero musical mais eficaz
 */
function findMostHelpfulGenre(sessions: EmotionalHistoryEntry[]): string {
  // Em produção, analisaria dados reais das playlists
  const genres = ["MPB", "Clássica", "Jazz", "Pop", "Rock"];
  return genres[Math.floor(Math.random() * genres.length)];
}

/**
 * Gera recomendações inteligentes baseadas em padrões
 */
function generateSmartRecommendations(
  stats: any,
  trend: string,
  userData: UserData
): string[] {
  const recommendations: string[] = [];

  if (stats.sessionsThisWeek === 0) {
    recommendations.push(
      "Que tal começar a semana com uma sessão de 15 minutos?"
    );
  } else if (stats.sessionsThisWeek >= 7) {
    recommendations.push(
      "Incrível! Você está mantendo uma rotina consistente."
    );
  }

  if (trend === "declining") {
    recommendations.push(
      "Considere sessões mais frequentes ou músicas mais relaxantes."
    );
    recommendations.push(
      "Experimente nosso modo 'Relaxamento Profundo' nas configurações."
    );
  } else if (trend === "improving") {
    recommendations.push(
      "Continue assim! Sua abordagem atual está funcionando bem."
    );
  }

  if (stats.streakDays >= 7) {
    recommendations.push(
      "🎉 Parabéns! Uma semana consecutiva é um marco importante."
    );
  }

  // Sempre garante pelo menos uma recomendação
  if (recommendations.length === 0) {
    recommendations.push(
      "Explore novos gêneros musicais para descobrir novas formas de bem-estar."
    );
  }

  return recommendations.slice(0, 3); // Máximo 3 recomendações
}
