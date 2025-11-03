import { useState } from "react";
import Header from "../Header";
import { PAGES } from "~/constants/sol";

interface HistoryPageProps {
  userData?: { name: string };
  setCurrentPage: (page: string) => void;
}

interface PlaylistSession {
  id: string;
  date: string;
  emotions: {
    sadness: number;
    joy: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  musicCount: number;
  satisfaction: number;
  playlistName: string;
}

export default function HistoryPage({
  userData,
  setCurrentPage,
}: HistoryPageProps) {
  // Mock data - em produção, viria do backend
  const [sessions] = useState<PlaylistSession[]>([
    {
      id: "1",
      date: "2024-11-01",
      emotions: {
        sadness: 20,
        joy: 80,
        anger: 10,
        fear: 5,
        surprise: 30,
      },
      musicCount: 15,
      satisfaction: 92,
      playlistName: "Dia Feliz",
    },
    {
      id: "2",
      date: "2024-10-31",
      emotions: {
        sadness: 60,
        joy: 30,
        anger: 40,
        fear: 25,
        surprise: 15,
      },
      musicCount: 12,
      satisfaction: 78,
      playlistName: "Reflexão Noturna",
    },
    {
      id: "3",
      date: "2024-10-30",
      emotions: {
        sadness: 15,
        joy: 70,
        anger: 5,
        fear: 10,
        surprise: 50,
      },
      musicCount: 18,
      satisfaction: 88,
      playlistName: "Descobertas",
    },
    {
      id: "4",
      date: "2024-10-29",
      emotions: {
        sadness: 45,
        joy: 50,
        anger: 30,
        fear: 35,
        surprise: 20,
      },
      musicCount: 10,
      satisfaction: 65,
      playlistName: "Misturas",
    },
  ]);

  const emotionEmojis: Record<string, string> = {
    sadness: "😢",
    joy: "😊",
    anger: "😠",
    fear: "😨",
    surprise: "😮",
  };

  const emotionColors: Record<string, string> = {
    sadness: "text-emotion-sadness",
    joy: "text-emotion-joy",
    anger: "text-emotion-anger",
    fear: "text-emotion-fear",
    surprise: "text-emotion-surprise",
  };

  const getDominantEmotion = (emotions: PlaylistSession["emotions"]) => {
    const entries = Object.entries(emotions);
    return entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    )[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary flex flex-col">
      <Header
        pageTitle="Histórico de Sessões"
        showBackButton={true}
        showLogoutButton={true}
        onBack={() => setCurrentPage(PAGES.DASHBOARD)}
        onLogout={() => setCurrentPage(PAGES.LOGIN)}
        userName={userData?.name}
      />

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-sol-darker mb-2">
              📊 Seu Histórico
            </h2>
            <p className="text-gray-600">
              Acompanhe todas as suas sessões de análise emocional e playlists
              geradas
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border-2 border-emotion-joy shadow-lg">
              <div className="text-3xl font-bold text-emotion-joy mb-1">
                {sessions.length}
              </div>
              <p className="text-sm text-gray-600">Sessões Totais</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-emotion-calm shadow-lg">
              <div className="text-3xl font-bold text-emotion-calm mb-1">
                {Math.round(
                  sessions.reduce((sum, s) => sum + s.satisfaction, 0) /
                    sessions.length
                )}
                %
              </div>
              <p className="text-sm text-gray-600">Satisfação Média</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-sol-primary shadow-lg">
              <div className="text-3xl font-bold text-sol-primary mb-1">
                {sessions.reduce((sum, s) => sum + s.musicCount, 0)}
              </div>
              <p className="text-sm text-gray-600">Músicas Ouvidas</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-emotion-surprise shadow-lg">
              <div className="text-3xl font-bold text-emotion-surprise mb-1">
                {(
                  sessions.reduce((sum, s) => sum + s.musicCount, 0) /
                  sessions.length
                ).toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Média por Sessão</p>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {sessions.map((session) => {
              const dominantEmotion = getDominantEmotion(session.emotions);
              const emotionEmoji = emotionEmojis[dominantEmotion];

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-lg p-6 border-2 border-sol-primary hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{emotionEmoji}</span>
                        <div>
                          <h3 className="text-lg font-bold text-sol-darker">
                            {session.playlistName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(session.date).toLocaleDateString(
                              "pt-BR",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Emotion Bars */}
                      <div className="space-y-2">
                        {Object.entries(session.emotions).map(
                          ([emotion, value]) => (
                            <div
                              key={emotion}
                              className="flex items-center gap-2"
                            >
                              <span className="text-xs font-semibold text-gray-600 w-16">
                                {emotion}
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    emotion === "sadness"
                                      ? "bg-emotion-sadness"
                                      : emotion === "joy"
                                        ? "bg-emotion-joy"
                                        : emotion === "anger"
                                          ? "bg-emotion-anger"
                                          : emotion === "fear"
                                            ? "bg-emotion-fear"
                                            : "bg-emotion-surprise"
                                  }`}
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-700 w-8">
                                {value}%
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-emotion-joy/10 to-emotion-joy/5 rounded-lg p-4 border border-emotion-joy/30">
                        <p className="text-xs text-gray-600 mb-1">
                          Músicas Ouvidas
                        </p>
                        <p className="text-2xl font-bold text-emotion-joy">
                          {session.musicCount}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-emotion-calm/10 to-emotion-calm/5 rounded-lg p-4 border border-emotion-calm/30">
                        <p className="text-xs text-gray-600 mb-1">Satisfação</p>
                        <p className="text-2xl font-bold text-emotion-calm">
                          {session.satisfaction}%
                        </p>
                      </div>

                      <button className="md:col-span-2 w-full bg-gradient-to-r from-sol-primary to-sol-dark text-white py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
                        🎵 Reproduzir Novamente
                      </button>

                      <button className="md:col-span-2 w-full bg-sol-pale text-sol-darker py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all border border-sol-primary">
                        📋 Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-sol-darker mb-2">
                Sem histórico ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Crie uma análise emocional para começar seu histórico
              </p>
              <button
                onClick={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
                className="bg-gradient-to-r from-sol-primary to-sol-dark text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg"
              >
                Começar Análise
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
