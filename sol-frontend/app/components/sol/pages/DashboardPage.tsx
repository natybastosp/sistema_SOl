import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Header from "../Header";
import { PAGES } from "~/constants/sol";
import { HistoryService } from "~/services/historyService";
import type { HistoryStats } from "~/services/historyService";

interface DashboardPageProps {
  userData: {
    name: string;
    email: string;
  };
  setCurrentPage: (page: string) => void;
}

export default function DashboardPage({
  userData,
  setCurrentPage,
}: DashboardPageProps) {
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoadingStats(true);
      console.log("🔍 DashboardPage: Buscando estatísticas...");
      const result = await HistoryService.getStats();
      console.log("📊 DashboardPage: Resultado recebido:", result);
      if (result.success && result.data) {
        console.log("✅ DashboardPage: Estatísticas carregadas:", result.data);
        setStats(result.data);
      } else {
        console.log("❌ DashboardPage: Falha ao carregar:", result.error);
      }
      setIsLoadingStats(false);
    };

    loadStats();
  }, []);

  const handleLogout = () => {
    setCurrentPage(PAGES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary">
      <Header
        pageTitle="Dashboard"
        userName={userData.name}
        showLogoutButton={true}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Boas-vindas */}
        <Card className="mb-6 border-sol-primary border-2">
          <CardHeader className="bg-gradient-to-r from-sol-pale to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-sol-darker">
                Olá, {userData.name}! 👋
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative w-max">
                  <span
                    className="text-7xl inline-block animate-spin z-0"
                    style={{ animationDuration: "4s" }}
                    role="img"
                    aria-label="sol"
                  >
                    ☀️
                  </span>
                  <span
                    className="absolute left-[65%] top-[80%] transform -translate-x-1/2 -translate-y-1/2 text-4xl text-sol-primary z-10 pointer-events-none"
                    role="img"
                    aria-label="nota-musical"
                  >
                    🎵
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <p className="text-gray-700">
              Bem-vindo ao arcabouço SOL. Como você está se sentindo hoje?
            </p>
          </CardContent>
        </Card>

        {/* AÇÕES PRINCIPAIS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 🧠 ANÁLISE EMOCIONAL */}
          <Card className="hover:shadow-2xl transition-all border-2 border-sol-primary bg-white hover:scale-105 transform">
            <CardHeader className="bg-gradient-to-br from-sol-pale/50 via-sol-light/30 to-transparent rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-sol-darker text-xl">
                🧠 Análise Emocional
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Conte-nos como você está se sentindo e receba uma playlist
                personalizada com análise Fuzzy!
              </p>
              <Button
                onClick={() => setCurrentPage(PAGES.EMOTIONAL_ASSESSMENT)}
                className="w-full border-2 border-sol-primary text-sol-primary hover:bg-sol-pale font-bold py-2 rounded-lg transition-all cursor-pointer"
                variant="outline"
              >
                🎵 Começar Análise
              </Button>
            </CardContent>
          </Card>

          {/* 📜 HISTÓRICO */}
          {/*  <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-sol-pale bg-white hover:scale-105 transform">
            <CardHeader className="bg-gradient-to-br from-sol-light/70 to-sol-pale/30 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-sol-darker text-xl">
                📜 Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Veja suas análises anteriores e playlists geradas.
              </p>
              <Button
                onClick={() => setCurrentPage(PAGES.HISTORY)}
                className="w-full border-2 border-sol-primary text-sol-primary hover:bg-sol-pale font-bold py-2 rounded-lg transition-all mt-5"
                variant="outline"
              >
                Ver Histórico
              </Button>
            </CardContent>
          </Card> */}

          {/* 🎵 MINHAS PLAYLISTS */}
          <Card className="hover:shadow-2xl transition-all  border-2 border-sol-pale bg-white hover:scale-105 transform">
            <CardHeader className="bg-gradient-to-br from-sol-light/70 to-sol-pale/30 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-sol-darker text-xl">
                🎵 Minhas Playlists
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Acesse suas playlists favoritas salvas.
              </p>
              <Button
                onClick={() => setCurrentPage(PAGES.PLAYLIST_LIST)}
                className="w-full border-2 border-sol-primary text-sol-primary hover:bg-sol-pale font-bold py-2 mt-6 rounded-lg transition-all cursor-pointer"
                variant="outline"
              >
                Ver Playlists
              </Button>
            </CardContent>
          </Card>

          {/* 👤 PERFIL */}
          <Card className="hover:shadow-2xl transition-all  border-2 border-sol-pale bg-white hover:scale-105 transform">
            <CardHeader className="bg-gradient-to-br from-sol-light/70 to-sol-pale/30 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-sol-darker text-xl">
                👤 Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Edite suas informações pessoais.
              </p>
              <Button
                onClick={() => setCurrentPage(PAGES.PROFILE)}
                className="w-full border-2 border-sol-primary text-sol-primary hover:bg-sol-pale font-bold py-2 rounded-lg transition-all cursor-pointer"
                variant="outline"
              >
                Ver Perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
