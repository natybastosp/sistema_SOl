import React, { useState } from "react";
import type { MetaFunction } from "react-router";

// Importando os componentes que você criou
import LoginPage from "~/components/sol/pages/LoginPage";
import PreferencesPages from "~/components/sol/pages/PreferencePages"; // Corrigido para o nome correto do arquivo
import EmotionalAssessmentPage from "~/components/sol/pages/EmotionalAssessmentPage";
import PlaylistPage from "~/components/sol/pages/PlaylistPage";
import DashboardPage from "~/components/sol/pages/DashboardPage";

// Importando types e constantes (você precisa criar esses arquivos também)
import type { UserData, Track, EmotionalHistoryEntry } from "~/types/sol";
import { SAMPLE_TRACKS, PAGES } from "~/constants/sol";

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
  const [currentPage, setCurrentPage] = useState<string>(PAGES.LOGIN);
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

  // Funções de manipulação de dados
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
        return (
          <PreferencesPages
            userData={userData}
            setUserData={setUserData}
            setCurrentPage={setCurrentPage}
          />
        );

      case PAGES.EMOTIONAL_ASSESSMENT:
        return (
          <EmotionalAssessmentPage
            userData={userData}
            setUserData={setUserData}
            setCurrentPage={setCurrentPage}
            onGeneratePlaylist={generatePlaylist}
          />
        );

      case PAGES.PLAYLIST:
        return (
          <PlaylistPage
            currentPlaylist={currentPlaylist}
            currentTrack={currentTrack}
            setCurrentTrack={setCurrentTrack}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            nextTrack={nextTrack}
            feedback={feedback}
            handleTrackFeedback={handleTrackFeedback}
            submitFinalFeedback={submitFinalFeedback}
          />
        );

      case PAGES.DASHBOARD:
        return (
          <DashboardPage
            emotionalHistory={emotionalHistory}
            setCurrentPage={setCurrentPage}
          />
        );

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
