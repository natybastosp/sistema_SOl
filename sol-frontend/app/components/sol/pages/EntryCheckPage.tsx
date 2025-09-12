import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import { AuthService } from "~/services/authService";
import { PAGES } from "~/constants/sol";
import type { UserData, AuthState } from "~/types/sol";

interface EntryCheckPageProps {
  onAuthSuccess: (
    authState: AuthState,
    userData: UserData,
    redirectTo: string
  ) => void;
  onNewUserSelected: () => void;
}

export default function EntryCheckPage({
  onAuthSuccess,
  onNewUserSelected,
}: EntryCheckPageProps) {
  // 🔄 Estados para gerenciar o fluxo de autenticação
  const [isShowingLogin, setIsShowingLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // 📝 Estados do formulário de login
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  /**
   * 🎯 Efeito de inicialização inteligente
   *
   * Como um porteiro que verifica a lista de hóspedes esperados,
   * este efeito verifica automaticamente se há alguém já logado
   * e oferece acesso direto se apropriado.
   */
  useEffect(() => {
    const checkForExistingSession = async () => {
      try {
        const result = await AuthService.checkAuthentication();

        if (result.authState.isAuthenticated && result.userData) {
          // Usuário já autenticado - oferece acesso direto
          onAuthSuccess(
            result.authState,
            result.userData,
            result.shouldRedirectTo
          );
        }
      } catch (error) {
        // Se der erro, simplesmente continua com a página normal
        console.log("Nenhuma sessão existente encontrada");
      }
    };

    checkForExistingSession();
  }, [onAuthSuccess]);

  /**
   * 🔑 Processamento inteligente de login
   *
   * Como um porteiro experiente que reconhece preferências,
   * este método não apenas autentica, mas personaliza toda
   * a experiência subsequente baseada no perfil do usuário.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setError("Por favor, preencha email e senha");
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await AuthService.login(
        loginData.email,
        loginData.password
      );

      if (result.success && result.authState && result.userData) {
        // Login bem-sucedido - redireciona para experiência personalizada
        onAuthSuccess(
          result.authState,
          result.userData,
          result.redirectTo || PAGES.DASHBOARD
        );
      } else {
        setError(result.error || "Erro no login. Verifique suas credenciais.");
      }
    } catch (error) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🎨 Renderização da experiência de entrada principal
   *
   * Esta é a primeira impressão que as pessoas têm do sistema SOL.
   * Cada elemento é cuidadosamente posicionado para transmitir
   * profissionalismo, acolhimento e facilidade de uso.
   */
  if (!isShowingLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
        {/*         <Header pageTitle="Bem-vindo ao SOL" /> */}

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            {/* Logo e apresentação principal */}
            <div className="mb-12">
              <SunLogo size="large" />
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Bem-vindo ao SOL
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Sistema de Recomendação Musical Terapêutica
              </p>
              <p className="text-gray-500 max-w-lg mx-auto">
                Descubra como a música pode transformar seu bem-estar emocional
                através de recomendações personalizadas baseadas em inteligência
                artificial.
              </p>
            </div>

            {/* Cartões de valor - explica benefícios rapidamente */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 text-xl">🧠</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  IA Personalizada
                </h3>
                <p className="text-sm text-gray-600">
                  Algoritmos que aprendem suas preferências e estado emocional
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 text-xl">🎵</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Musicoterapia
                </h3>
                <p className="text-sm text-gray-600">
                  Baseado em pesquisas científicas sobre música e bem-estar
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-100">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 text-xl">📈</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Acompanhamento
                </h3>
                <p className="text-sm text-gray-600">
                  Monitore seu progresso emocional ao longo do tempo
                </p>
              </div>
            </div>
          </div>
          {/* Botões de ação principal - decisão clara e simples */}
          <div className=" ml-12 bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Como você gostaria de começar?
            </h2>

            <div className="space-y-4">
              {/* Botão para usuários existentes */}
              <Button
                onClick={() => setIsShowingLogin(true)}
                className="w-full bg-orange-500 text-white py-4 text-lg font-medium hover:bg-orange-600 transition-colors"
                disabled={isLoading}
              >
                🔑 Já tenho conta - Fazer login
              </Button>

              {/* Botão para novos usuários */}
              <Button
                onClick={onNewUserSelected}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 py-4 text-lg font-medium hover:bg-orange-50 transition-colors"
                disabled={isLoading}
              >
                ✨ Sou novo aqui - Criar conta
              </Button>
            </div>

            {/* Informação adicional para reduzir ansiedade */}
            <p className="text-sm text-gray-500 mt-6">
              🧡 Seus dados são privados e seguros. Você controla totalmente
              suas informações.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 🔐 Renderização do formulário de login otimizado
   *
   * Quando o usuário escolhe fazer login, mostramos um formulário
   * limpo e focado, sem distrações desnecessárias.
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      <Header pageTitle="Login" />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Cabeçalho do login com opção de voltar */}
          <div className="text-center mb-8">
            <SunLogo size="medium" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Bem-vindo de volta!
            </h2>
            <p className="text-gray-600">
              Entre na sua conta para continuar sua jornada de bem-estar
            </p>
          </div>

          {/* Formulário de login */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Campo de email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>

              {/* Campo de senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                />
              </div>

              {/* Exibição de erro se houver */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Botão de submit */}
              <Button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 font-medium hover:bg-orange-600 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  "Entrar na minha conta"
                )}
              </Button>
            </form>

            {/* Links adicionais */}
            <div className="mt-6 text-center space-y-3">
              <button
                type="button"
                className="text-orange-600 hover:text-orange-700 text-sm transition-colors"
                onClick={() => {
                  /* TODO: Implementar recuperação de senha */
                }}
              >
                Esqueci minha senha
              </button>

              <div className="text-gray-400">•</div>

              <button
                type="button"
                className="text-gray-600 hover:text-gray-700 text-sm transition-colors"
                onClick={() => setIsShowingLogin(false)}
                disabled={isLoading}
              >
                ← Voltar para escolha inicial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
