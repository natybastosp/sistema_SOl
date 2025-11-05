import { useState } from "react";
import Header from "../Header";
import { PAGES } from "~/constants/sol";

interface PlaylistListPageProps {
  userData?: { name: string };
  setCurrentPage: (page: string) => void;
  setPlaylistData?: (data: any) => void;
}

interface SavedPlaylist {
  id: string;
  name: string;
  description: string;
  date: string;
  musicCount: number;
  duration: string;
  likes: number;
  cover: string;
  emotions: {
    sadness: number;
    joy: number;
    anger: number;
    fear: number;
    surprise: number;
  };
}

export default function PlaylistListPage({
  userData,
  setCurrentPage,
  setPlaylistData,
}: PlaylistListPageProps) {
  const [playlists] = useState<SavedPlaylist[]>([
    {
      id: "1",
      name: "Dia Feliz",
      description: "Músicas para um dia cheio de energia e alegria",
      date: "2024-11-01",
      musicCount: 15,
      duration: "1:02:45",
      likes: 24,
      cover: "😊",
      emotions: {
        sadness: 10,
        joy: 95,
        anger: 5,
        fear: 2,
        surprise: 40,
      },
    },
    {
      id: "2",
      name: "Noite Reflexiva",
      description: "Para aqueles momentos de contemplação e paz",
      date: "2024-10-31",
      musicCount: 18,
      duration: "1:15:30",
      likes: 18,
      cover: "🌙",
      emotions: {
        sadness: 35,
        joy: 45,
        anger: 15,
        fear: 20,
        surprise: 25,
      },
    },
    {
      id: "3",
      name: "Energia Pura",
      description: "Ritmo forte para momento de ação e motivação",
      date: "2024-10-30",
      musicCount: 12,
      duration: "52:15",
      likes: 32,
      cover: "⚡",
      emotions: {
        sadness: 5,
        joy: 85,
        anger: 60,
        fear: 10,
        surprise: 75,
      },
    },
    {
      id: "4",
      name: "Melancolia Criativa",
      description: "Tristeza produtiva para gerar inspiração",
      date: "2024-10-29",
      musicCount: 16,
      duration: "1:08:20",
      likes: 15,
      cover: "💙",
      emotions: {
        sadness: 80,
        joy: 30,
        anger: 25,
        fear: 40,
        surprise: 20,
      },
    },
    {
      id: "5",
      name: "Mistura Explosiva",
      description: "Variação de emoções em uma única sessão",
      date: "2024-10-28",
      musicCount: 20,
      duration: "1:25:00",
      likes: 28,
      cover: "🎆",
      emotions: {
        sadness: 50,
        joy: 60,
        anger: 55,
        fear: 45,
        surprise: 70,
      },
    },
  ]);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterEmotion, setFilterEmotion] = useState<string | null>(null);

  const emotions = ["joy", "sadness", "anger", "fear", "surprise"];
  const emotionEmojis: Record<string, string> = {
    joy: "😊",
    sadness: "😢",
    anger: "😠",
    fear: "😨",
    surprise: "😮",
  };

  const getDominantEmotion = (emotions: SavedPlaylist["emotions"]): string => {
    const entries = Object.entries(emotions);
    return entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    )[0];
  };

  const filteredPlaylists = filterEmotion
    ? playlists.filter(
        (p) =>
          Math.max(
            p.emotions.sadness,
            p.emotions.joy,
            p.emotions.anger,
            p.emotions.fear,
            p.emotions.surprise
          ) ===
          (filterEmotion === "sadness"
            ? p.emotions.sadness
            : filterEmotion === "joy"
              ? p.emotions.joy
              : filterEmotion === "anger"
                ? p.emotions.anger
                : filterEmotion === "fear"
                  ? p.emotions.fear
                  : p.emotions.surprise)
      )
    : playlists;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary flex flex-col">
      <Header
        pageTitle="Suas Playlists"
        showBackButton={true}
        showLogoutButton={true}
        onBack={() => setCurrentPage(PAGES.DASHBOARD)}
        onLogout={() => setCurrentPage(PAGES.LOGIN)}
        userName={userData?.name}
      />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-sol-darker mb-2">
                🎵 Suas Playlists
              </h2>
              <p className="text-gray-600">
                {filteredPlaylists.length} playlist
                {filteredPlaylists.length !== 1 ? "s" : ""} salva
                {filteredPlaylists.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white rounded-lg p-2 border-2 border-sol-primary">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-sol-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-sol-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ☰ Lista
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Filtrar por Emoção:
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterEmotion(null)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterEmotion === null
                    ? "bg-sol-primary text-white"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-sol-primary"
                }`}
              >
                Todas
              </button>
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => setFilterEmotion(emotion)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    filterEmotion === emotion
                      ? "bg-gradient-to-r from-sol-primary to-sol-dark text-white shadow-lg"
                      : "bg-white text-gray-700 border-2 border-gray-300 hover:border-sol-primary"
                  }`}
                >
                  {emotionEmojis[emotion]}{" "}
                  {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaylists.map((playlist) => {
                const dominantEmotion = getDominantEmotion(playlist.emotions);

                return (
                  <div
                    key={playlist.id}
                    className="bg-white rounded-lg overflow-hidden shadow-lg border-2 border-sol-primary hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
                    onClick={() => {
                      if (setPlaylistData) {
                        setPlaylistData({ playlist });
                        setCurrentPage(PAGES.PLAYLIST);
                      }
                    }}
                  >
                    {/* Cover */}
                    <div className="relative bg-gradient-to-br from-sol-primary to-sol-dark p-8 flex items-center justify-center h-40">
                      <span className="text-6xl">{playlist.cover}</span>
                      <div className="absolute top-3 right-3 bg-white rounded-full w-10 h-10 flex items-center justify-center">
                        <span className="text-lg">❤️</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-sol-darker mb-1">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {playlist.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-xs text-gray-600">Músicas</p>
                          <p className="text-lg font-bold text-sol-primary">
                            {playlist.musicCount}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-xs text-gray-600">Duração</p>
                          <p className="text-sm font-bold text-sol-primary">
                            {playlist.duration}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-xs text-gray-600">Curtidas</p>
                          <p className="text-lg font-bold text-emotion-joy">
                            {playlist.likes}
                          </p>
                        </div>
                      </div>

                      {/* Emotion Indicator */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">
                          {emotionEmojis[dominantEmotion]}
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          Emoção dominante
                        </span>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-gray-500 text-center">
                        {new Date(playlist.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {filteredPlaylists.map((playlist) => {
                const dominantEmotion = getDominantEmotion(playlist.emotions);

                return (
                  <div
                    key={playlist.id}
                    className="bg-white rounded-lg p-4 border-2 border-sol-primary hover:shadow-lg transition-all cursor-pointer hover:bg-sol-light/30"
                    onClick={() => {
                      if (setPlaylistData) {
                        setPlaylistData({ playlist });
                        setCurrentPage(PAGES.PLAYLIST);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{playlist.cover}</span>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-sol-darker">
                          {playlist.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {playlist.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600 text-xs">Músicas</p>
                          <p className="font-bold text-sol-primary">
                            {playlist.musicCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-xs">Duração</p>
                          <p className="font-bold text-sol-primary">
                            {playlist.duration}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-xs">Curtidas</p>
                          <p className="font-bold text-emotion-joy">
                            {playlist.likes}
                          </p>
                        </div>
                        <div className="text-2xl">
                          {emotionEmojis[dominantEmotion]}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(playlist.date).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredPlaylists.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-bold text-sol-darker mb-2">
                Sem playlists
              </h3>
              <p className="text-gray-600 mb-6">
                Crie uma análise emocional para gerar suas primeiras playlists
              </p>
              <button
                onClick={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
                className="bg-gradient-to-r from-sol-primary to-sol-dark text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg"
              >
                Criar Playlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
