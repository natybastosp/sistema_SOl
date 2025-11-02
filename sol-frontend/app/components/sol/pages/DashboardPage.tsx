import React from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Header from "../Header";
import { PAGES } from "~/constants/sol";

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary">
      <Header pageTitle="Dashboard" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Boas-vindas */}
        <Card className="mb-6 border-sol-primary border-2">
          <CardHeader className="bg-gradient-to-r from-sol-pale to-transparent">
            <CardTitle className="text-2xl text-sol-darker">
              Olá, {userData.name}! 👋
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700">
              Bem-vindo ao sistema SOL. O que você gostaria de fazer hoje?
            </p>
          </CardContent>
        </Card>

        {/* AÇÕES PRINCIPAIS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 🧠 ANÁLISE EMOCIONAL */}
          <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-sol-primary bg-white hover:scale-105 transform">
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
                className="w-full bg-gradient-to-r from-sol-primary to-sol-primary hover:shadow-lg text-primary font-bold py-3 rounded-lg transition-all"
              >
                🎵 Começar Análise
              </Button>
            </CardContent>
          </Card>

          {/* 📜 HISTÓRICO */}
          <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-sol-pale bg-white hover:scale-105 transform">
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
                className="w-full border-2 border-sol-primary text-sol-primary hover:bg-sol-pale font-bold py-2 rounded-lg transition-all"
                variant="outline"
              >
                Ver Histórico
              </Button>
            </CardContent>
          </Card>

          {/* 🎵 MINHAS PLAYLISTS */}
          <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-sol-pale bg-white hover:scale-105 transform">
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
                onClick={() => setCurrentPage(PAGES.PLAYLIST)}
                className="w-full border-2 border-sol-primary text-sol-primary hover:bg-sol-pale font-bold py-2 rounded-lg transition-all"
                variant="outline"
              >
                Ver Playlists
              </Button>
            </CardContent>
          </Card>

          {/* 👤 PERFIL */}
          <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 border-sol-pale bg-white hover:scale-105 transform">
            <CardHeader className="bg-gradient-to-br from-sol-light/70 to-sol-pale/30 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-sol-darker text-xl">
                👤 Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Edite suas preferências e informações pessoais.
              </p>
              <Button
                onClick={() => setCurrentPage(PAGES.PROFILE)}
                className="w-full border-2 border-sol-primary text-sol-primary hover:bg-sol-pale font-bold py-2 rounded-lg transition-all"
                variant="outline"
              >
                Ver Perfil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 📊 ESTATÍSTICAS */}
        <Card className="mt-8 border-2 border-sol-primary bg-white hover:shadow-lg transition-all">
          <CardHeader className="bg-gradient-to-r from-sol-pale to-transparent">
            <CardTitle className="text-sol-darker">
              📊 Suas Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-sol-primary">12</div>
                <div className="text-sm text-gray-600">Análises</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sol-dark">240</div>
                <div className="text-sm text-gray-600">Músicas</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-sol-darker">8.5</div>
                <div className="text-sm text-gray-600">Bem-estar médio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
