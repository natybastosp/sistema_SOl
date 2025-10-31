import { useState } from "react";

const PAGES = {
  DASHBOARD: "dashboard",
  EMOTIONAL_ASSESSMENT: "emotional_assessment"
};

interface PlaylistPageProps {
  playlistData: any;
  setCurrentPage: (page: string) => void;
}

const Header = ({ pageTitle }: { pageTitle: string }) => (
  <div className="bg-white shadow-sm p-4 mb-6">
    <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
  </div>
);

export default function PlaylistPage({
  playlistData,
  setCurrentPage,
}: PlaylistPageProps) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [feedback, setFeedback] = useState<Record<string, "positive" | "negative">>({});
  const [showFinalFeedback, setShowFinalFeedback] = useState(false);

  const musics = playlistData?.playlist || [];
  const analysis = playlistData?.analysis || {};

  const handleTrackFeedback = (musicId: string, type: "positive" | "negative") => {
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
    const positiveFeedbacks = Object.values(feedback).filter((f) => f === "positive").length;
    console.log("📊 Sessão finalizada:");
    console.log(`   Músicas tocadas: ${currentTrack + 1}/${musics.length}`);
    console.log(`   Feedbacks positivos: ${positiveFeedbacks}`);
    console.log(`   Feedbacks negativos: ${musics.length - positiveFeedbacks}`);
    setCurrentPage(PAGES.DASHBOARD);
  };

  if (!musics || musics.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nenhuma música encontrada</p>
          <button
            onClick={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
            className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500"
          >
            Gerar Nova Playlist
          </button>
        </div>
      </div>
    );
  }

  const currentMusic = musics[currentTrack];

  if (showFinalFeedback) {
    const positiveFeedbacks = Object.values(feedback).filter((f) => f === "positive").length;
    const satisfactionRate = ((positiveFeedbacks / musics.length) * 100).toFixed(0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
        <Header pageTitle="Feedback" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sessão Concluída!</h2>
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-medium mb-1">Músicas Ouvidas</p>
                <p className="text-2xl font-bold text-blue-900">{currentTrack + 1} de {musics.length}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 font-medium mb-1">Taxa de Satisfação</p>
                <p className="text-2xl font-bold text-green-900">{satisfactionRate}%</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-700 font-medium mb-1">Intenção da Playlist</p>
                <p className="text-lg font-bold text-orange-900 capitalize">{analysis.intencaoPlaylist}</p>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="w-full bg-orange-400 text-white py-3 rounded-lg font-semibold hover:bg-orange-500"
            >
              Ver Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header pageTitle="Playlist" />
      <div className="flex p-8 gap-6">
        <div className="w-full flex gap-5">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600">Intenção da Playlist</p>
                <p className="text-lg font-bold text-orange-600 capitalize">{analysis.intencaoPlaylist}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Confiança da IA</p>
                <p className="text-lg font-bold text-blue-600">{(analysis.grauConfianca * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">Música {currentTrack + 1} de {musics.length}</p>
            </div>

            <div className="w-64 h-64 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl mx-auto mb-8 flex items-center justify-center">
              <span className="text-8xl">🎵</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentMusic.nome}</h2>
              <p className="text-lg text-gray-600 mb-1">{currentMusic.artista.replace(/\//g, "")}</p>
              <p className="text-sm text-orange-500 font-medium uppercase">{currentMusic.genero}</p>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Alegria</p>
                <div className="bg-yellow-100 rounded-lg py-2">
                  <p className="text-sm font-bold text-yellow-700">{(currentMusic.scoresEmocionais.alegria * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Tristeza</p>
                <div className="bg-blue-100 rounded-lg py-2">
                  <p className="text-sm font-bold text-blue-700">{(currentMusic.scoresEmocionais.tristeza * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Raiva</p>
                <div className="bg-red-100 rounded-lg py-2">
                  <p className="text-sm font-bold text-red-700">{(currentMusic.scoresEmocionais.raiva * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Medo</p>
                <div className="bg-purple-100 rounded-lg py-2">
                  <p className="text-sm font-bold text-purple-700">{(currentMusic.scoresEmocionais.medo * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Surpresa</p>
                <div className="bg-green-100 rounded-lg py-2">
                  <p className="text-sm font-bold text-green-700">{(currentMusic.scoresEmocionais.surpresa * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={previousTrack}
                disabled={currentTrack === 0}
                className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              <button className="w-16 h-16 flex items-center justify-center bg-orange-500 rounded-full text-white hover:bg-orange-600 transition-all shadow-lg">
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>

              <button
                onClick={nextTrack}
                className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 18h2V6h-2zm-11-7l8.5-6v12z"/>
                </svg>
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleTrackFeedback(currentMusic.id, "negative")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  feedback[currentMusic.id] === "negative"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                👎 Não Gostei
              </button>
              <button
                onClick={() => handleTrackFeedback(currentMusic.id, "positive")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  feedback[currentMusic.id] === "positive"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                👍 Gostei
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 w-80">
            <h3 className="font-semibold text-gray-800 mb-3">Playlist Completa</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {musics.map((music: any, index: number) => (
                <button
                  key={music.id}
                  onClick={() => setCurrentTrack(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    index === currentTrack
                      ? "bg-orange-100 border-2 border-orange-400"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <p className="font-medium text-sm text-gray-800">{index + 1}. {music.nome}</p>
                  <p className="text-xs text-gray-600">{music.artista.replace(/\//g, "")} • {music.genero}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}