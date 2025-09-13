// ATUALIZAÇÃO: app/components/sol/pages/EntryCheckPage.tsx
// Versão otimizada para modo offline

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

  // 🎭 Estado para mostrar usuários demo (apenas em desenvolvimento)
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [demoUsers, setDemoUsers] = useState<string[]>([]);

  /**
   * 🎯 Efeito de inicialização inteligente
   */
  useEffect(() => {
    const checkForExistingSession = async () => {
      try {
        const result = await AuthService.checkAuthentication();

        if (result.authState.isAuthenticated && result.userData) {
          console.log("✅ [ENTRY_CHECK] Sessão existente encontrada");
          onAuthSuccess(
            result.authState,
            result.userData,
            result.shouldRedirectTo
          );
        }
      } catch (error) {
        console.log("ℹ️ [ENTRY_CHECK] Nenhuma sessão existente");
      }
    };

    // Carrega usuários demo em desenvolvimento
    const loadDemoUsers = async () => {
      if (process.env.NODE_ENV === "development") {
        try {
          const users = await AuthService.getOfflineUsers();
          const userEmails = Object.keys(users);
          setDemoUsers(userEmails);
        } catch (error) {
          console.log("Erro ao carregar usuários demo:", error);
        }
      }
    };

    checkForExistingSession();
    loadDemoUsers();
  }, [onAuthSuccess]);

  /**
   * 🔑 Processamento inteligente de login
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
      console.log("🔑 [ENTRY_CHECK] Tentando login...");

      const result = await AuthService.login(
        loginData.email,
        loginData.password
      );

      if (result.success && result.authState && result.userData) {
        console.log("✅ [ENTRY_CHECK] Login bem-sucedido");
        onAuthSuccess(
          result.authState,
          result.userData,
          result.redirectTo || PAGES.DASHBOARD
        );
      } else {
        setError(result.error || "Erro no login. Verifique suas credenciais.");
      }
    } catch (error) {
      console.error("❌ [ENTRY_CHECK] Erro no login:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🎭 Login rápido com usuário demo
   */
  const handleDemoLogin = async (email: string) => {
    setLoginData({ email, password: "123456" });
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await AuthService.login(email, "123456");

      if (result.success && result.authState && result.userData) {
        console.log("✅ [ENTRY_CHECK] Login demo bem-sucedido");
        onAuthSuccess(
          result.authState,
          result.userData,
          result.redirectTo || PAGES.DASHBOARD
        );
      } else {
        setError("Erro no login demo");
      }
    } catch (error) {
      setError("Erro no login demo");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🎨 Renderização da tela de boas-vindas
   */
  const renderWelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex flex-col">
      <Header pageTitle="Bem-vindo ao SOL" showBackButton={false} />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <SunLogo size="large" />

          <h1 className="text-4xl font-bold text-gray-800 mb-4">Olá! 👋</h1>

          <p className="text-lg text-gray-600 mb-8">
            Bem-vindo ao <strong>SOL</strong>, seu assistente pessoal de
            bem-estar emocional através da música.
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => setIsShowingLogin(true)}
              className="w-full bg-orange-500 text-white py-3 text-lg font-medium hover:bg-orange-600"
            >
              🔑 Já tenho uma conta
            </Button>

            <Button
              onClick={onNewUserSelected}
              variant="outline"
              className="w-full border-orange-300 text-orange-600 py-3 text-lg font-medium hover:bg-orange-50"
            >
              ✨ Criar nova conta
            </Button>

            {/* Botões demo apenas em desenvolvimento */}
            {process.env.NODE_ENV === "development" && demoUsers.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => setShowDemoUsers(!showDemoUsers)}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-600 py-2 text-sm"
                >
                  🎭 {showDemoUsers ? "Ocultar" : "Mostrar"} usuários demo
                </Button>

                {showDemoUsers && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-500 mb-2">
                      Usuários para teste (senha: 123456)
                    </p>
                    {demoUsers.map((email) => (
                      <Button
                        key={email}
                        onClick={() => handleDemoLogin(email)}
                        variant="outline"
                        className="w-full text-xs py-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                        disabled={isLoading}
                      >
                        🚀 {email}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              🌟 Sua jornada de bem-estar começa aqui
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * 🎨 Renderização da tela de login
   */
  const renderLoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      <Header
        pageTitle="Entrar na sua conta"
        onBack={() => setIsShowingLogin(false)}
      />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <SunLogo size="medium" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Que bom te ver de volta! 😊
            </h2>
            <p className="text-gray-600">
              Entre com seus dados para continuar sua jornada
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

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
                placeholder="Sua senha"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 text-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Entrando...
                </div>
              ) : (
                "🔑 Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <button
                onClick={onNewUserSelected}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Criar conta
              </button>
            </p>
          </div>

          {/* Modo offline indicator */}
          {/* {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-xs text-center">
                🔧 <strong>Modo Offline:</strong> Sistema funcionando sem API
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );

  // Renderização principal
  return isShowingLogin ? renderLoginScreen() : renderWelcomeScreen();
}
