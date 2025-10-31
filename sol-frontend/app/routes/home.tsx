import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import LoginPage from "~/components/sol/pages/LoginPage";
import PreferencesPages from "~/components/sol/pages/PreferencePages";
import EmotionalAssessmentPage from "~/components/sol/pages/EmotionalAssessmentPage";
import PlaylistPage from "~/components/sol/pages/PlaylistPage";
import DashboardPage from "~/components/sol/pages/DashboardPage";

// Constantes
import { PAGES } from "~/constants/sol";

export const meta: MetaFunction = () => {
  return [
    { title: "SOL - Sistema de Recomendação Musical" },
    {
      name: "description",
      content: "Sistema inteligente de recomendação musical baseado em emoções",
    },
  ];
};

// TYPES
interface UserData {
  id?: string;
  name: string;
  email: string;
  preferences?: {
    genres?: string[];
    artists?: string[];
  };
}

// COMPONENTE PRINCIPAL - HOME

export default function Home() {
  // ESTADOS

  const [currentPage, setCurrentPage] = useState<string>(PAGES.LOGIN);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    preferences: {
      genres: [],
      artists: [],
    },
  });

  // RENDER

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* PÁGINA: LOGIN */}

      {currentPage === PAGES.LOGIN && (
        <LoginPage setCurrentPage={setCurrentPage} setUserData={setUserData} />
      )}

      {/* PÁGINA: PREFERÊNCIAS */}

      {currentPage === PAGES.PREFERENCES && (
        <PreferencesPages
          userData={userData}
          setUserData={setUserData}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* PÁGINA: AVALIAÇÃO EMOCIONAL */}

      {currentPage === PAGES.EMOTIONAL_ASSESSMENT && (
        <EmotionalAssessmentPage
          userData={userData}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* PÁGINA: PLAYLIST */}

      {currentPage === PAGES.PLAYLIST && (
        <PlaylistPage userData={userData} setCurrentPage={setCurrentPage} />
      )}

      {/* PÁGINA: DASHBOARD */}

      {currentPage === PAGES.DASHBOARD && (
        <DashboardPage userData={userData} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}
