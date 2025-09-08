import { Link } from "react-router";
import { Sun, Music, Heart, Brain } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "SOL - Sistema de Recomendação Musical" },
    {
      name: "description",
      content:
        "Plataforma inteligente de recomendação musical para apoio à saúde mental",
    },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                <Sun className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Bem-vindo ao <span className="text-orange-500">SOL</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema Inteligente de Recomendação Musical para Apoio à Saúde
              Mental
            </p>

            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Descubra músicas personalizadas baseadas no seu estado emocional
              atual. Nossa IA analisa seus sentimentos e cria playlists
              terapêuticas especialmente para você.
            </p>

            {/* CTA Button */}
            <Link to="/sol">
              <Button className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105">
                Começar Jornada Musical
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Como o SOL funciona
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Análise Emocional
              </h3>
              <p className="text-gray-600">
                Avalie seu estado emocional atual através de um questionário
                intuitivo e personalizado.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                IA Personalizada
              </h3>
              <p className="text-gray-600">
                Nossa inteligência artificial processa seus dados e cria
                recomendações musicais únicas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Playlist Terapêutica
              </h3>
              <p className="text-gray-600">
                Receba uma playlist personalizada para apoiar seu bem-estar
                emocional e mental.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Sobre o Projeto SOL
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            O SOL é um projeto de pesquisa desenvolvido no Centro Universitário
            IESB, focado em utilizar inteligência artificial e musicoterapia
            para apoio à saúde mental. Nossa plataforma combina análise
            emocional avançada com recomendações musicais personalizadas.
          </p>
          <p className="text-lg text-gray-600 mb-12">
            Destinado especialmente para pessoas que enfrentam desafios como
            ansiedade, depressão e estresse, o SOL oferece uma abordagem
            inovadora e acessível para o bem-estar emocional através da música.
          </p>

          <Link to="/sol">
            <Button
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50 px-8 py-3 text-lg"
            >
              Experimentar Agora
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">SOL</h3>
          <p className="text-gray-400 mb-4">
            Sistema Inteligente de Recomendação Musical
          </p>
          <p className="text-sm text-gray-500">
            Centro Universitário IESB - Coordenação de Engenharia / Ciência da
            Computação
          </p>
        </div>
      </footer>
    </div>
  );
}
