import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  ThumbsUp,
  ThumbsDown,
  Music,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import type { MetaFunction } from "react-router";

// Importando nossos novos componentes
import Header from "~/components/sol/Header";
import SunLogo from "~/components/sol/SunLogo";
import LoginPage from "~/components/sol/pages/LoginPage";

// Importando types e constantes
import type { UserData, Track, EmotionalHistoryEntry } from "~/types/sol";
import { GENRES, EMOTIONS, SAMPLE_TRACKS, PAGES } from "~/constants/sol";

export const meta: MetaFunction = () => {
  return [
    { title: "SOL - Sistema de Recomendação Musical" },
    {
      name: "description",
      content:
        "Sistema inteligente de recomendação musical para apoio à saúde mental",
    },
  ];
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState(PAGES.LOGIN);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    preferences: [],
    emotionalState: {},
  });
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [emotionalHistory, setEmotionalHistory] = useState<
    EmotionalHistoryEntry[]
  >([]);
  const [password, setPassword] = useState("");

  const handlePreferences = () => {
    if (userData.preferences.length > 0) {
      setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT);
    }
  };

  const handleEmotionalAssessment = () => {
    const hasEmotions = Object.values(userData.emotionalState).some(
      (value) => value > 0
    );
    if (hasEmotions) {
      generatePlaylist();
      setCurrentPage(PAGES.PLAYLIST);
    }
  };

  const generatePlaylist = () => {
    const dominantEmotion = Object.entries(userData.emotionalState).reduce(
      (a, b) =>
        userData.emotionalState[a[0]] > userData.emotionalState[b[0]] ? a : b
    )[0];

    const filteredTracks = SAMPLE_TRACKS.filter(
      (track) => track.emotion === dominantEmotion || track.emotion === "calm"
    );

    setCurrentPlaylist(filteredTracks);
    setCurrentTrack(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (currentTrack < currentPlaylist.length - 1) {
      setCurrentTrack(currentTrack + 1);
    }
  };

  const handleTrackFeedback = (trackId: number, rating: string) => {
    setFeedback((prev) => ({ ...prev, [trackId]: rating }));
  };

  const submitFinalFeedback = (finalEmotion: string) => {
    const newEntry: EmotionalHistoryEntry = {
      date: new Date().toLocaleDateString(),
      initialEmotion: userData.emotionalState,
      finalEmotion: finalEmotion,
      tracksPlayed: currentPlaylist.length,
      satisfaction: Object.values(feedback).filter((f) => f === "positive")
        .length,
    };

    setEmotionalHistory((prev) => [...prev, newEntry]);
    setCurrentPage(PAGES.DASHBOARD);
  };

  // Componente de Preferências Musicais (ainda não modularizado)
  const PreferencesPage = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header pageTitle="cadastro" />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Página de cadastro
            </h2>
            <p className="text-gray-600">
              Selecione seus gêneros musicais preferidos
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    const newPrefs = userData.preferences.includes(genre)
                      ? userData.preferences.filter((p) => p !== genre)
                      : [...userData.preferences, genre];
                    setUserData((prev) => ({ ...prev, preferences: newPrefs }));
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userData.preferences.includes(genre)
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-orange-200"
                  }`}
                >
                  <Music className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{genre}</span>
                </button>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handlePreferences}
                disabled={userData.preferences.length === 0}
                className="bg-orange-400 text-white px-12 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Avaliação Emocional (ainda não modularizado)
  const EmotionalAssessmentPage = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header pageTitle="IA" />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Como posso te ajudar?
            </h2>
            <p className="text-gray-600">
              Avalie como você está se sentindo agora
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="space-y-8">
              {EMOTIONS.map((emotion) => (
                <div key={emotion.key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-700">
                      {emotion.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {userData.emotionalState[emotion.key] || 0}/10
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={userData.emotionalState[emotion.key] || 0}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          emotionalState: {
                            ...prev.emotionalState,
                            [emotion.key]: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #fb923c 0%, #fb923c ${(userData.emotionalState[emotion.key] || 0) * 10}%, #e5e7eb ${(userData.emotionalState[emotion.key] || 0) * 10}%, #e5e7eb 100%)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={handleEmotionalAssessment}
                className="bg-orange-400 text-white px-12 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
              >
                Gerar Playlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente do Player de Música (ainda não modularizado)
  const PlaylistPage = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header pageTitle="IA com playlist" />

      <div className="flex-1 flex p-8">
        <div className="max-w-6xl w-full mx-auto flex gap-8">
          {/* Left Side - Player */}
          <div className="flex-1">
            <div className="text-center mb-8">
              <SunLogo size="large" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              {currentPlaylist.length > 0 && (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {currentPlaylist[currentTrack]?.title}
                    </h3>
                    <p className="text-gray-600">
                      {currentPlaylist[currentTrack]?.artist}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentPlaylist[currentTrack]?.duration}
                    </p>
                  </div>

                  <div className="flex justify-center items-center space-x-4 mb-6">
                    <Button
                      onClick={togglePlayPause}
                      className="bg-orange-400 text-white p-4 rounded-full hover:bg-orange-500 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>

                    <Button
                      onClick={nextTrack}
                      disabled={currentTrack >= currentPlaylist.length - 1}
                      variant="outline"
                      className="p-4 rounded-full"
                    >
                      <SkipForward className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() =>
                        handleTrackFeedback(
                          currentPlaylist[currentTrack].id,
                          "positive"
                        )
                      }
                      variant={
                        feedback[currentPlaylist[currentTrack].id] ===
                        "positive"
                          ? "default"
                          : "outline"
                      }
                      className="flex items-center space-x-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Gostei</span>
                    </Button>

                    <Button
                      onClick={() =>
                        handleTrackFeedback(
                          currentPlaylist[currentTrack].id,
                          "negative"
                        )
                      }
                      variant={
                        feedback[currentPlaylist[currentTrack].id] ===
                        "negative"
                          ? "default"
                          : "outline"
                      }
                      className="flex items-center space-x-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Não gostei</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Playlist */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Sua Playlist
              </h3>

              <div className="space-y-3">
                {currentPlaylist.map((track, index) => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      index === currentTrack
                        ? "bg-orange-50 border border-orange-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentTrack(index)}
                  >
                    <div className="font-medium text-sm text-gray-800">
                      {track.title}
                    </div>
                    <div className="text-xs text-gray-600">{track.artist}</div>
                    <div className="text-xs text-gray-500">
                      {track.duration}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Como você se sente agora?
                </h4>
                <div className="space-y-2">
                  {EMOTIONS.map((emotion) => (
                    <Button
                      key={emotion.key}
                      onClick={() => submitFinalFeedback(emotion.key)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {emotion.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente Dashboard (ainda não modularizado)
  const DashboardPage = () => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sessões Totais
              </h3>
              <p className="text-3xl font-bold text-orange-500">
                {emotionalHistory.length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Músicas Ouvidas
              </h3>
              <p className="text-3xl font-bold text-orange-500">
                {emotionalHistory.reduce(
                  (acc, entry) => acc + entry.tracksPlayed,
                  0
                )}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Satisfação Média
              </h3>
              <p className="text-3xl font-bold text-orange-500">
                {emotionalHistory.length > 0
                  ? Math.round(
                      (emotionalHistory.reduce(
                        (acc, entry) => acc + entry.satisfaction,
                        0
                      ) /
                        emotionalHistory.length) *
                        100
                    ) / 100
                  : 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Histórico de Sessões
            </h3>

            {emotionalHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma sessão registrada ainda.
              </p>
            ) : (
              <div className="space-y-4">
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
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-6">
              <Button
                onClick={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
                className="bg-orange-400 text-white px-8 py-2 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
              >
                Nova Sessão
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderização condicional das páginas
  const renderCurrentPage = () => {
    switch (currentPage) {
      case PAGES.LOGIN:
        return (
          <LoginPage
            userData={userData}
            setUserData={setUserData}
            password={password}
            setPassword={setPassword}
            setCurrentPage={setCurrentPage}
          />
        );
      case PAGES.PREFERENCES:
        return <PreferencesPage />;
      case PAGES.EMOTIONAL_ASSESSMENT:
        return <EmotionalAssessmentPage />;
      case PAGES.PLAYLIST:
        return <PlaylistPage />;
      case PAGES.DASHBOARD:
        return <DashboardPage />;
      default:
        return (
          <LoginPage
            userData={userData}
            setUserData={setUserData}
            password={password}
            setPassword={setPassword}
            setCurrentPage={setCurrentPage}
          />
        );
    }
  };

  return <div className="App">{renderCurrentPage()}</div>;
}
