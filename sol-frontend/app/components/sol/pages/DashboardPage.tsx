import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import type { EmotionalHistoryEntry } from "~/types/sol";
import { PAGES } from "~/constants/sol";

interface DashboardPageProps {
  emotionalHistory: EmotionalHistoryEntry[];
  setCurrentPage: (page: string) => void;
}

export default function DashboardPage({
  emotionalHistory,
  setCurrentPage,
}: DashboardPageProps) {
  const totalSessions = emotionalHistory.length;
  const totalTracks = emotionalHistory.reduce(
    (acc, entry) => acc + entry.tracksPlayed,
    0
  );
  const averageSatisfaction =
    emotionalHistory.length > 0
      ? Math.round(
          (emotionalHistory.reduce(
            (acc, entry) => acc + entry.satisfaction,
            0
          ) /
            emotionalHistory.length) *
            100
        ) / 100
      : 0;

  const startNewSession = () => {
    setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header pageTitle="dashboard" />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <SunLogo size="medium" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Seu Dashboard
            </h2>
            <p className="text-gray-600">Acompanhe seu progresso emocional</p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sessões Totais
              </h3>
              <p className="text-3xl font-bold text-orange-500">
                {totalSessions}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Músicas Ouvidas
              </h3>
              <p className="text-3xl font-bold text-orange-500">
                {totalTracks}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Satisfação Média
              </h3>
              <p className="text-3xl font-bold text-orange-500">
                {averageSatisfaction}
              </p>
            </div>
          </div>

          {/* Histórico de Sessões */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Histórico de Sessões
            </h3>

            {emotionalHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-6">
                  Nenhuma sessão registrada ainda.
                </p>
                <Button
                  onClick={startNewSession}
                  className="bg-orange-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
                >
                  Começar Primeira Sessão
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {emotionalHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">
                          Sessão {index + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {entry.date}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Músicas ouvidas: {entry.tracksPlayed}</p>
                        <p>Avaliações positivas: {entry.satisfaction}</p>
                        <p>Estado emocional final: {entry.finalEmotion}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    onClick={startNewSession}
                    className="bg-orange-400 text-white px-8 py-2 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
                  >
                    Nova Sessão
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
