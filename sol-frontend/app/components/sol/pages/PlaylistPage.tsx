import { useState } from "react";

const PAGES = {
  DASHBOARD: "dashboard",
  EMOTIONAL_ASSESSMENT: "emotional_assessment",
};

interface PlaylistPageProps {
  playlistData: any;
  setCurrentPage: (page: string) => void;
}

const Header = ({ pageTitle }: { pageTitle: string }) => (
  <div className="bg-gradient-to-r from-sol-primary to-sol-dark shadow-md p-4 mb-6">
    <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
  </div>
);

export default function PlaylistPage({
  playlistData,
  setCurrentPage,
}: PlaylistPageProps) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [feedback, setFeedback] = useState<
    Record<string, "positive" | "negative">
  >({});
  const [showFinalFeedback, setShowFinalFeedback] = useState(false);

  const musics = playlistData?.playlist || [];
  const analysis = playlistData?.analysis || {};

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
        <Header pageTitle="Feedback" />
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
              className="w-full bg-sol-primary text-white py-3 rounded-lg font-semibold hover:bg-sol-dark transition-all"
            >
              Ver Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary">
      <Header pageTitle="Playlist" />
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
                <div className="text-right">
                  <p className="text-xs text-gray-600 font-medium">
                    🤖 Confiança da IA
                  </p>
                  <p className="text-xl font-bold text-sol-dark mt-1">
                    {(analysis.grauConfianca * 100).toFixed(0)}%
                  </p>
                </div>
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

            <div className="w-64 h-64 bg-gradient-to-br from-sol-primary to-sol-dark rounded-xl mx-auto mb-8 flex items-center justify-center">
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

            <div className="grid grid-cols-5 gap-3 mb-8">
              {/* Alegria */}
              <div className="text-center">
                <div className="bg-emotion-joy/10 rounded-lg py-3 px-2 border-2 border-emotion-joy h-32 flex flex-col justify-between">
                  <p className="text-xs font-bold text-emotion-joy mb-2">
                    😊 Alegria
                  </p>
                  <div className="flex-1 bg-gray-200 rounded-md relative overflow-hidden">
                    <div
                      className="bg-gradient-to-t from-emotion-joy to-emotion-joy w-full transition-all duration-300"
                      style={{
                        height: `${
                          currentMusic.scoresEmocionais
                            ? currentMusic.scoresEmocionais.alegria * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-lg font-bold text-emotion-joy mt-2">
                    {currentMusic.scoresEmocionais
                      ? (currentMusic.scoresEmocionais.alegria * 100).toFixed(0)
                      : "—"}
                    %
                  </p>
                </div>
              </div>

              {/* Tristeza */}
              <div className="text-center">
                <div className="bg-emotion-sadness/10 rounded-lg py-3 px-2 border-2 border-emotion-sadness h-32 flex flex-col justify-between">
                  <p className="text-xs font-bold text-emotion-sadness mb-2">
                    😢 Tristeza
                  </p>
                  <div className="flex-1 bg-gray-200 rounded-md relative overflow-hidden">
                    <div
                      className="bg-gradient-to-t from-emotion-sadness to-emotion-sadness w-full transition-all duration-300"
                      style={{
                        height: `${
                          currentMusic.scoresEmocionais
                            ? currentMusic.scoresEmocionais.tristeza * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-lg font-bold text-emotion-sadness mt-2">
                    {currentMusic.scoresEmocionais
                      ? (currentMusic.scoresEmocionais.tristeza * 100).toFixed(
                          0
                        )
                      : "—"}
                    %
                  </p>
                </div>
              </div>

              {/* Raiva */}
              <div className="text-center">
                <div className="bg-emotion-anger/10 rounded-lg py-3 px-2 border-2 border-emotion-anger h-32 flex flex-col justify-between">
                  <p className="text-xs font-bold text-emotion-anger mb-2">
                    😠 Raiva
                  </p>
                  <div className="flex-1 bg-gray-200 rounded-md relative overflow-hidden">
                    <div
                      className="bg-gradient-to-t from-emotion-anger to-emotion-anger w-full transition-all duration-300"
                      style={{
                        height: `${
                          currentMusic.scoresEmocionais
                            ? currentMusic.scoresEmocionais.raiva * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-lg font-bold text-emotion-anger mt-2">
                    {currentMusic.scoresEmocionais
                      ? (currentMusic.scoresEmocionais.raiva * 100).toFixed(0)
                      : "—"}
                    %
                  </p>
                </div>
              </div>

              {/* Medo */}
              <div className="text-center">
                <div className="bg-emotion-fear/10 rounded-lg py-3 px-2 border-2 border-emotion-fear h-32 flex flex-col justify-between">
                  <p className="text-xs font-bold text-emotion-fear mb-2">
                    😨 Medo
                  </p>
                  <div className="flex-1 bg-gray-200 rounded-md relative overflow-hidden">
                    <div
                      className="bg-gradient-to-t from-emotion-fear to-emotion-fear w-full transition-all duration-300"
                      style={{
                        height: `${
                          currentMusic.scoresEmocionais
                            ? currentMusic.scoresEmocionais.medo * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-lg font-bold text-emotion-fear mt-2">
                    {currentMusic.scoresEmocionais
                      ? (currentMusic.scoresEmocionais.medo * 100).toFixed(0)
                      : "—"}
                    %
                  </p>
                </div>
              </div>

              {/* Surpresa */}
              <div className="text-center">
                <div className="bg-emotion-surprise/10 rounded-lg py-3 px-2 border-2 border-emotion-surprise h-32 flex flex-col justify-between">
                  <p className="text-xs font-bold text-emotion-surprise mb-2">
                    😮 Surpresa
                  </p>
                  <div className="flex-1 bg-gray-200 rounded-md relative overflow-hidden">
                    <div
                      className="bg-gradient-to-t from-emotion-surprise to-emotion-surprise w-full transition-all duration-300"
                      style={{
                        height: `${
                          currentMusic.scoresEmocionais
                            ? currentMusic.scoresEmocionais.surpresa * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-lg font-bold text-emotion-surprise mt-2">
                    {currentMusic.scoresEmocionais
                      ? (currentMusic.scoresEmocionais.surpresa * 100).toFixed(
                          0
                        )
                      : "—"}
                    %
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={previousTrack}
                disabled={currentTrack === 0}
                className="w-14 h-14 flex items-center justify-center bg-sol-pale/80 text-sol-primary rounded-full hover:bg-sol-pale disabled:opacity-40 disabled:cursor-not-allowed transition-all border-2 border-sol-primary shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-sol-primary to-sol-dark rounded-full text-white hover:shadow-2xl transition-all shadow-lg hover:scale-110 transform">
                <svg
                  className="w-8 h-8 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <button
                onClick={nextTrack}
                className="w-14 h-14 flex items-center justify-center bg-sol-pale/80 text-sol-primary rounded-full hover:bg-sol-pale transition-all border-2 border-sol-primary shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 18h2V6h-2zm-11-7l8.5-6v12z" />
                </svg>
              </button>
            </div>

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
