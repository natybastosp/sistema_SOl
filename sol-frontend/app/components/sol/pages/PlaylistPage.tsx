import { useState, useEffect } from "react";
import Header from "../Header";
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer";
import {
  initiateSpotifyAuthV2,
  disconnectSpotify,
} from "../../../services/spotifyServiceV2";

const PAGES = {
  DASHBOARD: "dashboard",
  EMOTIONAL_ASSESSMENT: "emotional_assessment",
};

interface PlaylistPageProps {
  playlistData: any;
  setCurrentPage: (page: string) => void;
  userData?: { name: string };
}

export default function PlaylistPage({
  playlistData,
  setCurrentPage,
  userData,
}: PlaylistPageProps) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [feedback, setFeedback] = useState<
    Record<string, "positive" | "negative">
  >({});
  const [showFinalFeedback, setShowFinalFeedback] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Tempo em ms
  const [duration, setDuration] = useState(0); // Duração total em ms
  const [isPlaying, setIsPlaying] = useState(false); // Estado de reprodução
  const { deviceId, isConnected, playTrack } = useSpotifyPlayer();

  const musics = playlistData?.playlist || [];
  const analysis = playlistData?.analysis || {};

  // 🔍 DEBUG: Verificar estrutura dos dados
  useEffect(() => {
    console.log("🎵 PlaylistPage - Dados recebidos:");
    console.log("   playlistData:", playlistData);
    console.log("   musics:", musics);
    console.log("   analysis:", analysis);
    if (musics.length > 0) {
      console.log("   Primeira música:", musics[0]);
      console.log("   Campos disponíveis:", Object.keys(musics[0]));
    }
  }, [playlistData]);

  // Verificar conexão Spotify ao carregar
  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  // Atualizar tempo de reprodução a cada segundo
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!spotifyConnected) return;

      try {
        const solToken = localStorage.getItem("sol-auth-token");
        if (!solToken) return;

        const response = await fetch("/api/spotify/player/currently-playing", {
          headers: {
            Authorization: `Bearer ${solToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.track) {
            setCurrentTime(data.track.progress || 0);
            setDuration(data.track.duration || 0);
            setIsPlaying(data.isPlaying || false);
          }
        }
      } catch (error) {
        console.log("Erro ao buscar progresso:", error);
      }
    }, 1000); // Atualizar a cada 1 segundo

    return () => clearInterval(interval);
  }, [spotifyConnected]);

  const checkSpotifyStatus = async () => {
    try {
      // Tentar obter token para verificar se conectado
      const solToken = localStorage.getItem("sol-auth-token");
      if (!solToken) {
        setSpotifyConnected(false);
        return;
      }

      const response = await fetch("/api/spotify/auth/token", {
        headers: {
          Authorization: `Bearer ${solToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSpotifyConnected(data.success);
      } else {
        setSpotifyConnected(false);
      }
    } catch (error) {
      console.log("Spotify not connected:", error);
      setSpotifyConnected(false);
    }
  };

  // Função para formatar tempo em mm:ss
  const formatTime = (ms: number): string => {
    if (!ms || ms < 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Função para pausar a música
  const handlePause = async () => {
    try {
      const solToken = localStorage.getItem("sol-auth-token");
      if (!solToken) return;

      const response = await fetch("/api/spotify/player/pause", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${solToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Erro ao pausar música:", error);
    }
    console.log("Música pausada");
  };

  // Função para retomar a música
  const handleResume = async () => {
    try {
      const solToken = localStorage.getItem("sol-auth-token");
      if (!solToken) return;

      // Verificar se temos deviceId
      if (!deviceId) {
        console.error("❌ Device ID não disponível");
        throw new Error("Device ID não disponível");
      }

      // Usar o endpoint correto /api/spotify/play com device_id
      const response = await fetch("/api/spotify/play", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${solToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [currentMusic.spotify_uri],
          device_id: deviceId,
        }),
      });

      if (response.ok) {
        setIsPlaying(true);
        console.log("✅ Música retomada");
      } else {
        const errorData = await response.json();
        console.error("❌ Erro ao retomar:", response.status, errorData);
        throw new Error(`Erro ${response.status}`);
      }
    } catch (error) {
      console.error("Erro ao retomar música:", error);
      throw error;
    }
  };

  const handleTrackFeedback = (
    musicId: string,
    type: "positive" | "negative"
  ) => {
    setFeedback((prev) => ({
      ...prev,
      [musicId]: type,
    }));
    console.log(`Feedback: ${type} para música ${musicId}`);
  };

  const nextTrack = () => {
    if (currentTrack < musics.length - 1) {
      setCurrentTrack(currentTrack + 1);
    } else {
      setShowFinalFeedback(true);
    }
  };

  const previousTrack = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
    }
  };

  const handleFinish = () => {
    const positiveFeedbacks = Object.values(feedback).filter(
      (f) => f === "positive"
    ).length;
    console.log("📊 Sessão finalizada:");
    console.log(`   Músicas tocadas: ${currentTrack + 1}/${musics.length}`);
    console.log(`   Feedbacks positivos: ${positiveFeedbacks}`);
    console.log(`   Feedbacks negativos: ${musics.length - positiveFeedbacks}`);
    setCurrentPage(PAGES.DASHBOARD);
  };

  // Redirecionamento automático após 3 segundos quando showFinalFeedback é true
  useEffect(() => {
    if (showFinalFeedback) {
      const timer = setTimeout(() => {
        handleFinish();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showFinalFeedback]);

  if (!musics || musics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-sol-darker mb-4 text-lg">
            Nenhuma música encontrada
          </p>
          <button
            onClick={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
            className="bg-sol-primary text-white px-6 py-2 rounded-lg hover:bg-sol-dark font-semibold"
          >
            Gerar Nova Playlist
          </button>
        </div>
      </div>
    );
  }

  const currentMusic = musics[currentTrack];

  if (showFinalFeedback) {
    const positiveFeedbacks = Object.values(feedback).filter(
      (f) => f === "positive"
    ).length;
    const satisfactionRate = (
      (positiveFeedbacks / musics.length) *
      100
    ).toFixed(0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary flex flex-col">
        <Header
          pageTitle="Feedback"
          showBackButton={true}
          showLogoutButton={true}
          onBack={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
          onLogout={() => setCurrentPage(PAGES.DASHBOARD)}
          userName={userData?.name}
        />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-sol-primary">
            <div className="w-20 h-20 bg-emotion-joy rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-sol-darker mb-4">
              Sessão Concluída!
            </h2>
            <div className="space-y-4 mb-8">
              <div className="bg-emotion-joy/20 border border-emotion-joy rounded-lg p-4">
                <p className="text-sm text-emotion-joy font-medium mb-1">
                  Músicas Ouvidas
                </p>
                <p className="text-2xl font-bold text-emotion-joy">
                  {currentTrack + 1} de {musics.length}
                </p>
              </div>
              <div className="bg-emotion-calm/20 border border-emotion-calm rounded-lg p-4">
                <p className="text-sm text-emotion-calm font-medium mb-1">
                  Taxa de Satisfação
                </p>
                <p className="text-2xl font-bold text-emotion-calm">
                  {satisfactionRate}%
                </p>
              </div>
              <div className="bg-sol-pale/40 border border-sol-primary rounded-lg p-4">
                <p className="text-sm text-sol-dark font-medium mb-1">
                  Intenção da Playlist
                </p>
                <p className="text-lg font-bold text-sol-darker capitalize">
                  {analysis.intencaoPlaylist}
                </p>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="w-full bg-sol-primary text-white py-3 rounded-lg font-semibold hover:bg-sol-dark transition-all mb-3"
            >
              Ver Dashboard
            </button>
            <p className="text-xs text-gray-500">
              ⏱️ Redirecionando automaticamente em 3 segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary">
      <Header
        pageTitle="Playlist"
        showBackButton={true}
        showLogoutButton={true}
        onBack={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
        onLogout={() => setCurrentPage(PAGES.DASHBOARD)}
        userName={userData?.name}
      />
      <div className="flex p-8 gap-6">
        <div className="w-full flex gap-5">
          <div className="bg-white rounded-3xl shadow-2xl p-8 flex-1 border-2 border-sol-primary">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-sol-pale/50 to-sol-light rounded-2xl p-4 mb-6 border border-sol-pale">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    🎯 Intenção
                  </p>
                  <p className="text-xl font-bold text-sol-primary capitalize mt-1">
                    {analysis.intencaoPlaylist}
                  </p>
                </div>
                {/*  <div className="text-right">
                  <p className="text-xs text-gray-600 font-medium">
                    🤖 Confiança da IA
                  </p>
                  <p className="text-xl font-bold text-sol-dark mt-1">
                    {analysis.grauConfianca &&
                    typeof analysis.grauConfianca === "number"
                      ? (analysis.grauConfianca * 100).toFixed(0)
                      : "—"}
                    %
                  </p>
                </div> */}
                <div className="h-12 w-px bg-sol-primary/20"></div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 font-medium">
                    📍 Posição
                  </p>
                  <p className="text-xl font-bold text-sol-darker mt-1">
                    {currentTrack + 1}/{musics.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-64 h-64 bg-gradient-to-br from-[#FAFDF6] via-[#FDD26B] to-[#FFA500] rounded-xl mx-auto mb-8 flex items-center justify-center">
              <span className="text-8xl">🎵</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-sol-darker mb-2">
                {currentMusic.nome || currentMusic.name || "Música"}
              </h2>
              <p className="text-lg text-gray-700 mb-1">
                {(
                  currentMusic.artista ||
                  currentMusic.artist ||
                  "Artista desconhecido"
                ).replace?.(/\//g, "") || "Artista desconhecido"}
              </p>
              <p className="text-sm text-sol-primary font-medium uppercase">
                {currentMusic.genero ||
                  currentMusic.genre ||
                  "Gênero desconhecido"}
              </p>
            </div>

            {/* Barra de Progresso */}
            {
              <div className="p-2">
                {/* Barra de progresso visual */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sol-primary to-[#FFA500] h-full transition-all duration-300"
                    style={{
                      width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  ></div>
                </div>

                {/* Tempo */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-sol-darker">
                    {formatTime(currentTime)}
                  </span>

                  <span className="text-sm font-semibold text-sol-darker">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            }

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={previousTrack}
                disabled={currentTrack === 0}
                className="w-20 h-20 flex items-center justify-center  rounded-full text-black hover:text-[#6f1a07] "
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={async () => {
                  if (!spotifyConnected) {
                    setIsConnecting(true);
                    await initiateSpotifyAuthV2();
                    setIsConnecting(false);
                  } else if (isPlaying) {
                    // Se está tocando, pausar
                    await handlePause();
                  } else {
                    // Se não está tocando, retomar ou começar
                    try {
                      const trackUri = currentMusic.spotify_uri;
                      if (
                        !trackUri ||
                        typeof trackUri !== "string" ||
                        trackUri.trim() === ""
                      ) {
                        alert(
                          "❌ Esta música não tem Spotify URI disponível.\n\nTente a próxima música!"
                        );
                        nextTrack();
                        return;
                      }
                      // Tenta retomar, e se não conseguir, começa do início
                      await handleResume();
                    } catch (error) {
                      console.error("Erro ao retomar música:", error);
                      try {
                        await playTrack(currentMusic.spotify_uri);
                      } catch (playError) {
                        console.error("Erro ao tocar música:", playError);
                        alert("❌ Erro ao tocar a música.\n\nTente a próxima!");
                        nextTrack();
                      }
                    }
                  }
                }}
                disabled={isConnecting}
                className={`w-20 h-20 flex items-center justify-center rounded-full transition-all ${
                  spotifyConnected
                    ? "text-black hover:text-[#6f1a07]"
                    : isConnecting
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {isConnecting ? (
                  <span className="text-xl">⏳</span>
                ) : spotifyConnected ? (
                  isPlaying ? (
                    // Ícone de pause quando está tocando
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    // Ícone de play quando está pausado
                    <svg
                      className="w-8 h-8 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )
                ) : (
                  <span className="text-xl">🎵</span>
                )}
              </button>

              <button
                onClick={nextTrack}
                className="w-20 h-20 flex items-center justify-center  rounded-full text-black hover:text-[#6f1a07] transition-all transform rotate-180"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
            </div>

            {!spotifyConnected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-blue-800 mb-2">
                  🎵 Conecte sua conta Spotify para ouvir as músicas!
                </p>
                <button
                  onClick={async () => {
                    setIsConnecting(true);
                    await initiateSpotifyAuthV2();
                    setIsConnecting(false);
                  }}
                  disabled={isConnecting}
                  className={`${
                    isConnecting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white font-semibold py-2 px-6 rounded-lg transition-all`}
                >
                  {isConnecting ? "Conectando..." : "Conectar Spotify"}
                </button>
              </div>
            )}

            {spotifyConnected && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center">
                <p className="text-xs text-green-700">
                  ✅ Spotify conectado{" "}
                  {isConnected ? "e pronto" : "mas aguardando..."}
                </p>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => handleTrackFeedback(currentMusic.id, "negative")}
                className={`flex-1 py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  feedback[currentMusic.id] === "negative"
                    ? "bg-emotion-anger text-white border-2 border-emotion-anger shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
                }`}
              >
                👎 Não Gostei
              </button>
              <button
                onClick={() => handleTrackFeedback(currentMusic.id, "positive")}
                className={`flex-1 py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  feedback[currentMusic.id] === "positive"
                    ? "bg-emotion-joy text-white border-2 border-emotion-joy shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
                }`}
              >
                👍 Gostei
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 w-80 border border-sol-primary">
            <h3 className="font-semibold text-sol-darker mb-3 text-lg">
              Playlist Completa
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {musics.map((music: any, index: number) => (
                <button
                  key={music.id}
                  onClick={() => setCurrentTrack(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    index === currentTrack
                      ? "bg-sol-pale border-2 border-sol-primary"
                      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <p className="font-medium text-sm text-sol-darker">
                    {index + 1}. {music.nome || music.name || "Música"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {(
                      music.artista ||
                      music.artist ||
                      "Artista desconhecido"
                    ).replace?.(/\//g, "") || "Artista desconhecido"}{" "}
                    • {music.genero || music.genre || "Gênero"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
