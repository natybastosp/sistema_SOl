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
   <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
     <Header pageTitle="Dashboard" />


     <div className="container mx-auto px-4 py-8 max-w-4xl">
       {/* Boas-vindas */}
       <Card className="mb-6">
         <CardHeader>
           <CardTitle className="text-2xl">Olá, {userData.name}! 👋</CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-gray-600">
             Bem-vindo ao sistema SOL. O que você gostaria de fazer hoje?
           </p>
         </CardContent>
       </Card>


       {/* AÇÕES PRINCIPAIS */}


       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* 🆕 BOTÃO: ANÁLISE EMOCIONAL (NOVO!) */}
         <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-300">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               🧠 Análise Emocional
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-gray-600 mb-4">
               Conte-nos como você está se sentindo e receba uma playlist
               personalizada com análise Fuzzy!
             </p>
             <Button
               onClick={() => setCurrentPage(PAGES.EMOTIONAL_FLOW)}
               className="w-full bg-orange-500 hover:bg-orange-600"
             >
               🎵 Começar Análise
             </Button>
           </CardContent>
         </Card>


         {/* BOTÃO: VER HISTÓRICO */}


         <Card className="hover:shadow-lg transition-shadow cursor-pointer">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               📜 Histórico
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-gray-600 mb-4">
               Veja suas análises anteriores e playlists geradas.
             </p>
             <Button
               onClick={() => setCurrentPage(PAGES.HISTORY)}
               className="w-full"
               variant="outline"
             >
               Ver Histórico
             </Button>
           </CardContent>
         </Card>


         {/* BOTÃO: PLAYLISTS SALVAS */}


         <Card className="hover:shadow-lg transition-shadow cursor-pointer">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               🎵 Minhas Playlists
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-gray-600 mb-4">
               Acesse suas playlists favoritas salvas.
             </p>
             <Button
               onClick={() => setCurrentPage(PAGES.PLAYLIST)}
               className="w-full"
               variant="outline"
             >
               Ver Playlists
             </Button>
           </CardContent>
         </Card>


         {/* BOTÃO: PERFIL */}


         <Card className="hover:shadow-lg transition-shadow cursor-pointer">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               👤 Perfil
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-gray-600 mb-4">
               Edite suas preferências e informações pessoais.
             </p>
             <Button
               onClick={() => setCurrentPage(PAGES.PROFILE)}
               className="w-full"
               variant="outline"
             >
               Ver Perfil
             </Button>
           </CardContent>
         </Card>
       </div>


       {/* ESTATÍSTICAS (OPCIONAL) */}


       <Card className="mt-6">
         <CardHeader>
           <CardTitle>📊 Suas Estatísticas</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-3 gap-4 text-center">
             <div>
               <div className="text-3xl font-bold text-orange-600">12</div>
               <div className="text-sm text-gray-600">Análises</div>
             </div>
             <div>
               <div className="text-3xl font-bold text-orange-600">240</div>
               <div className="text-sm text-gray-600">Músicas</div>
             </div>
             <div>
               <div className="text-3xl font-bold text-orange-600">8.5</div>
               <div className="text-sm text-gray-600">Bem-estar médio</div>
             </div>
           </div>
         </CardContent>
       </Card>
     </div>
   </div>
 );
}
