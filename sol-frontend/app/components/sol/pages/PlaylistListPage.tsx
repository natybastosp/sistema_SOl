import { useState, useMemo, useEffect } from "react";
import Header from "../Header";
import { PAGES } from "~/constants/sol";
import { PlaylistService } from "~/services/playlistService";

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

type SortOption = "recent" | "popular" | "name" | "duration";

export default function PlaylistListPage({
  userData,
  setCurrentPage,
  setPlaylistData,
}: PlaylistListPageProps) {
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterEmotion, setFilterEmotion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await PlaylistService.getPlaylists();
        console.log("Playlists carregadas:", result);
        if (result.success && result.data && result.data.length > 0) {
          setPlaylists(result.data);
        } else {
          /* console.log("Nenhuma playlist encontrada, usando dados de exemplo"); */
          setPlaylists([]);
          setError(null);
        }
      } catch (err) {
        console.error("Erro ao carregar playlists:", err);
        /*  setError(
          "Usando dados de exemplo - Conecte sua conta para ver suas playlists reais"
        ); */
        setPlaylists([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  const emotions = ["joy", "sadness", "anger", "fear"];
  const emotionEmojis: Record<string, string> = {
    joy: "😊",
    sadness: "😢",
    anger: "😠",
    fear: "😨",
  };

  const getDominantEmotion = (emotions: SavedPlaylist["emotions"]): string => {
    const entries = Object.entries(emotions);
    return entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    )[0];
  };

  const filteredAndSortedPlaylists = useMemo(() => {
    let result = [...playlists];

    // Aplicar filtro de emoção
    if (filterEmotion) {
      result = result.filter(
        (p) =>
          Math.max(
            p.emotions.sadness,
            p.emotions.joy,
            p.emotions.anger,
            p.emotions.fear
          ) ===
          (filterEmotion === "sadness"
            ? p.emotions.sadness
            : filterEmotion === "joy"
              ? p.emotions.joy
              : filterEmotion === "anger"
                ? p.emotions.anger
                : filterEmotion === "fear"
                  ? p.emotions.fear
                  : null)
      );
    }

    // Aplicar filtro de busca (fuzzy search)
    if (searchQuery) {
      result = result.filter((p) => fuzzySearch(searchQuery, p.name));
    }

    // Aplicar ordenação
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.likes - a.likes);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "duration":
        result.sort((a, b) => {
          const durationToMinutes = (dur: string) => {
            const parts = dur.split(":").map(Number);
            return parts[0] * 60 + parts[1];
          };
          return durationToMinutes(b.duration) - durationToMinutes(a.duration);
        });
        break;
      case "recent":
      default:
        result.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
    }

    return result;
  }, [playlists, filterEmotion, searchQuery, sortBy]);

  const handleDeletePlaylist = async (id: string) => {
    try {
      const result = await PlaylistService.deletePlaylist(id);
      if (result.success) {
        // Remover da lista local
        setPlaylists(playlists.filter((p) => p.id !== id));
        setShowDeleteConfirm(null);
      } else {
        console.error("Erro ao deletar playlist:", result.error);
        alert(result.error || "Erro ao deletar playlist");
      }
    } catch (error) {
      console.error("Erro ao deletar playlist:", error);
      alert("Erro ao deletar playlist");
    }
  };

  // Busca fuzzy melhorada
  const fuzzySearch = (query: string, text: string): boolean => {
    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);
    const textLower = text.toLowerCase();

    return searchTerms.every((term) => {
      // Busca exata primeiro
      if (textLower.includes(term)) return true;

      // Depois busca difusa: match characters in order
      let textIndex = 0;
      for (let i = 0; i < term.length; i++) {
        const charIndex = textLower.indexOf(term[i], textIndex);
        if (charIndex === -1) return false;
        textIndex = charIndex + 1;
      }
      return true;
    });
  };

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
                {filteredAndSortedPlaylists.length} playlist
                {filteredAndSortedPlaylists.length !== 1 ? "s" : ""} salva
                {filteredAndSortedPlaylists.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white rounded-lg p-2 border-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded font-semibold transition-all ${
                  viewMode === "grid"
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={
                  viewMode === "grid"
                    ? { backgroundColor: "#FFA500" }
                    : undefined
                }
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded font-semibold transition-all ${
                  viewMode === "list"
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={
                  viewMode === "list"
                    ? { backgroundColor: "#FFA500" }
                    : undefined
                }
              >
                ☰ Lista
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Buscar: 'Dia', 'Energia', 'Reflexão'... ou descrição"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xl"
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-xs text-gray-500">
                🔎 {filteredAndSortedPlaylists.length} resultado(s)
                encontrado(s)
              </p>
            )}
          </div>

          {/* Sort and Filters */}
          {!isLoading && (
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Ordenar por:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 rounded-lg bg-white font-semibold text-sol-darker focus:outline-none"
                    style={{
                      borderWidth: "2px",
                      borderColor: "#FFA500",
                    }}
                  >
                    <option value="recent">📅 Recentes</option>
                    {/* <option value="popular">❤️ Mais curtidas</option> */}
                    <option value="name">🔤 Por nome</option>
                    <option value="duration">⏱️ Maior duração</option>
                  </select>
                </div>
              </div>

              {/* Emotion Filters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Filtrar por Emoção:
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterEmotion(null)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      filterEmotion === null
                        ? "text-white"
                        : "bg-white text-gray-700 border-2 border-gray-300"
                    }`}
                    style={
                      filterEmotion === null
                        ? { backgroundColor: "#FFA500" }
                        : undefined
                    }
                  >
                    Todas
                  </button>
                  {emotions.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => setFilterEmotion(emotion)}
                      style={
                        filterEmotion === emotion
                          ? {
                              background:
                                "linear-gradient(to right, #FFA500, #DD8C00)",
                            }
                          : undefined
                      }
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        filterEmotion === emotion
                          ? "text-white shadow-lg"
                          : "bg-white text-gray-700 border-2 border-gray-300 hover:border-[#FFA500]"
                      }`}
                    >
                      {emotionEmojis[emotion]}{" "}
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4 animate-spin">⏳</div>
              <h3 className="text-xl font-bold text-sol-darker mb-2">
                Carregando playlists...
              </h3>
              <p className="text-gray-600">Um momento</p>
            </div>
          )}

          {/* Error State */}
          {/*  {error && !isLoading && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <p className="text-red-800 font-semibold">❌ {error}</p>
            </div>
          )}
 */}
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedPlaylists.map((playlist: SavedPlaylist) => {
                const dominantEmotion = getDominantEmotion(playlist.emotions);

                return (
                  <div
                    key={playlist.id}
                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group"
                  >
                    {/* Cover */}
                    <div
                      style={{
                        background:
                          "linear-gradient(to bottom right, #FFA500, #DD8C00)",
                      }}
                      className="relative p-8 flex items-center justify-center h-40"
                      onClick={async () => {
                        if (setPlaylistData) {
                          // Buscar dados completos da playlist (incluindo músicas)
                          const result = await PlaylistService.getPlaylist(
                            playlist.id
                          );
                          if (result.success && result.data) {
                            // Formatar dados para o formato esperado pela PlaylistPage
                            setPlaylistData({
                              playlist: result.data.musics.map(
                                (music: any) => ({
                                  ...music,
                                  spotify_uri: music.spotifyUri, // Mapear para snake_case
                                  nome: music.name, // Adicionar compatibilidade com nome
                                  artista: music.artist, // Adicionar compatibilidade com artista
                                })
                              ),
                              analysis: {
                                sadness: result.data.emotions.sadness,
                                joy: result.data.emotions.joy,
                                anger: result.data.emotions.anger,
                                fear: result.data.emotions.fear,
                                surprise: result.data.emotions.surprise,
                              },
                              playlistName: result.data.name,
                              playlistId: result.data.id,
                            });
                            setCurrentPage(PAGES.PLAYLIST);
                          }
                        }
                      }}
                    >
                      <span className="text-6xl group-hover:scale-110 transition-transform">
                        {playlist.cover}
                      </span>
                      <div className="absolute top-3 right-3 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                        <span className="text-lg">❤️</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-sol-darker mb-1">
                        {playlist.name}
                      </h3>
                      {/* <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {playlist.description}
                      </p> */}

                      {/* Emotion Bars */}
                      <div className="mb-4 space-y-1">
                        {emotions.map((emotion) => (
                          <div
                            key={emotion}
                            className="flex items-center gap-2"
                          >
                            <span className="text-xs font-semibold text-gray-600 w-12">
                              {emotionEmojis[emotion]}
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${(playlist.emotions[emotion as keyof typeof playlist.emotions] / 10) * 100}%`,
                                  backgroundColor:
                                    emotion === "joy"
                                      ? "#FCD34D" // Amarelo alegre
                                      : emotion === "sadness"
                                        ? "#60A5FA" // Azul tristeza
                                        : emotion === "anger"
                                          ? "#F87171" // Vermelho raiva
                                          : emotion === "fear"
                                            ? "#A78BFA" // Roxo medo
                                            : "", // Laranja surpresa
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">
                              {
                                playlist.emotions[
                                  emotion as keyof typeof playlist.emotions
                                ]
                              }
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-xs text-gray-600">Músicas</p>
                          <p
                            className="text-lg font-bold"
                            style={{ color: "#FFA500" }}
                          >
                            {playlist.musicCount}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-xs text-gray-600">Duração</p>
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#FFA500" }}
                          >
                            {playlist.duration}
                          </p>
                        </div>
                        {/*  <div className="bg-gray-50 rounded p-2">
                          <p className="text-xs text-gray-600">Curtidas</p>
                          <p className="text-lg font-bold text-emotion-joy">
                            {playlist.likes}
                          </p>
                        </div> */}
                      </div>

                      {/* Dominant Emotion and Date */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {emotionEmojis[dominantEmotion]}
                          </span>
                          <span className="text-xs font-semibold text-gray-600">
                            Dominante
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(playlist.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (setPlaylistData) {
                              // Buscar dados completos da playlist (incluindo músicas)
                              const result = await PlaylistService.getPlaylist(
                                playlist.id
                              );
                              if (result.success && result.data) {
                                // Formatar dados para o formato esperado pela PlaylistPage
                                setPlaylistData({
                                  playlist: result.data.musics.map(
                                    (music: any) => ({
                                      ...music,
                                      spotify_uri: music.spotifyUri, // Mapear para snake_case
                                      nome: music.name, // Adicionar compatibilidade com nome
                                      artista: music.artist, // Adicionar compatibilidade com artista
                                    })
                                  ),
                                  analysis: {
                                    sadness: result.data.emotions.sadness,
                                    joy: result.data.emotions.joy,
                                    anger: result.data.emotions.anger,
                                    fear: result.data.emotions.fear,
                                    surprise: result.data.emotions.surprise,
                                  },
                                  playlistName: result.data.name,
                                  playlistId: result.data.id,
                                });
                                setCurrentPage(PAGES.PLAYLIST);
                              }
                            }
                          }}
                          style={{
                            background:
                              "linear-gradient(to right, #FFA500, #DD8C00)",
                          }}
                          className="flex-1 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
                        >
                          <span>▶️</span>
                          <span>Ouvir Playlist</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(playlist.id);
                          }}
                          className="px-4 py-3 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors font-semibold"
                          title="Deletar"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === playlist.id && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-lg">
                          <p className="text-xs text-red-800 font-semibold mb-2">
                            Deseja deletar "{playlist.name}"?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                handleDeletePlaylist(playlist.id);
                              }}
                              className="flex-1 bg-red-600 text-white py-1 rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                            >
                              Deletar
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="flex-1 bg-gray-300 text-gray-800 py-1 rounded text-xs font-semibold hover:bg-gray-400 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {filteredAndSortedPlaylists.map((playlist: SavedPlaylist) => {
                const dominantEmotion = getDominantEmotion(playlist.emotions);

                return (
                  <div
                    key={playlist.id}
                    className="bg-white rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:bg-sol-light/30 group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl group-hover:scale-110 transition-transform">
                        {playlist.cover}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div
                          onClick={async () => {
                            if (setPlaylistData) {
                              // Buscar dados completos da playlist (incluindo músicas)
                              const result = await PlaylistService.getPlaylist(
                                playlist.id
                              );
                              if (result.success && result.data) {
                                // Formatar dados para o formato esperado pela PlaylistPage
                                setPlaylistData({
                                  playlist: result.data.musics.map(
                                    (music: any) => ({
                                      ...music,
                                      spotify_uri: music.spotifyUri, // Mapear para snake_case
                                      nome: music.name, // Adicionar compatibilidade com nome
                                      artista: music.artist, // Adicionar compatibilidade com artista
                                    })
                                  ),
                                  analysis: {
                                    sadness: result.data.emotions.sadness,
                                    joy: result.data.emotions.joy,
                                    anger: result.data.emotions.anger,
                                    fear: result.data.emotions.fear,
                                    surprise: result.data.emotions.surprise,
                                  },
                                  playlistName: result.data.name,
                                  playlistId: result.data.id,
                                });
                                setCurrentPage(PAGES.PLAYLIST);
                              }
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <h3 className="text-lg font-bold text-sol-darker truncate">
                            {playlist.name}
                          </h3>
                          {/*  <p className="text-sm text-gray-600 line-clamp-1">
                            {playlist.description}
                          </p> */}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm flex-wrap justify-end">
                        <div className="text-center bg-gray-50 rounded px-3 py-2">
                          <p className="text-gray-600 text-xs">Músicas</p>
                          <p className="font-bold" style={{ color: "#FFA500" }}>
                            {playlist.musicCount}
                          </p>
                        </div>
                        <div className="text-center bg-gray-50 rounded px-3 py-2">
                          <p className="text-gray-600 text-xs">Duração</p>
                          <p className="font-bold" style={{ color: "#FFA500" }}>
                            {playlist.duration}
                          </p>
                        </div>
                        {/*  <div className="text-center bg-gray-50 rounded px-3 py-2">
                          <p className="text-gray-600 text-xs">Curtidas</p>
                          <p className="font-bold text-emotion-joy">
                            {playlist.likes}
                          </p>
                        </div> */}
                        <div className="text-2xl" title={dominantEmotion}>
                          {emotionEmojis[dominantEmotion]}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(playlist.date).toLocaleDateString("pt-BR")}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={async () => {
                            if (setPlaylistData) {
                              // Buscar dados completos da playlist (incluindo músicas)
                              const result = await PlaylistService.getPlaylist(
                                playlist.id
                              );
                              if (result.success && result.data) {
                                // Formatar dados para o formato esperado pela PlaylistPage
                                setPlaylistData({
                                  playlist: result.data.musics.map(
                                    (music: any) => ({
                                      ...music,
                                      spotify_uri: music.spotifyUri, // Mapear para snake_case
                                      nome: music.name, // Adicionar compatibilidade com nome
                                      artista: music.artist, // Adicionar compatibilidade com artista
                                    })
                                  ),
                                  analysis: {
                                    sadness: result.data.emotions.sadness,
                                    joy: result.data.emotions.joy,
                                    anger: result.data.emotions.anger,
                                    fear: result.data.emotions.fear,
                                    surprise: result.data.emotions.surprise,
                                  },
                                  playlistName: result.data.name,
                                  playlistId: result.data.id,
                                });
                                setCurrentPage(PAGES.PLAYLIST);
                              }
                            }
                          }}
                          style={{
                            background:
                              "linear-gradient(to right, #FFA500, #DD8C00)",
                          }}
                          className="px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-1"
                          title="Ouvir Playlist"
                        >
                          <span>▶️</span>
                          <span>Ouvir</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(playlist.id)}
                          className="px-3 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                          title="Deletar"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === playlist.id && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 border-2 border-red-300 rounded-lg p-3 z-10 shadow-lg">
                          <p className="text-xs text-red-800 font-semibold mb-2">
                            Deseja deletar "{playlist.name}"?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                handleDeletePlaylist(playlist.id);
                              }}
                              className="flex-1 bg-red-600 text-white py-1 rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                            >
                              Deletar
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="flex-1 bg-gray-300 text-gray-800 py-1 rounded text-xs font-semibold hover:bg-gray-400 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedPlaylists.length === 0 && (
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
                style={{
                  background: "linear-gradient(to right, #FFA500, #DD8C00)",
                }}
                className="text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg"
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
