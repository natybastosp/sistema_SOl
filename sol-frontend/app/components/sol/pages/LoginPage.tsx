import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import type { UserData } from "~/types/sol";
import { PAGES } from "~/constants/sol";

interface LoginPageProps {
  userData: UserData;
  setUserData: (userData: UserData | ((prev: UserData) => UserData)) => void;
  password: string;
  setPassword: (password: string) => void;
  setCurrentPage: (page: string) => void;
}

export default function LoginPage({
  userData,
  setUserData,
  password,
  setPassword,
  setCurrentPage,
}: LoginPageProps) {
  const handleLogin = () => {
    if (userData.name.trim() && password.trim()) {
      setCurrentPage(PAGES.PREFERENCES);
    }
  };

  const handleGoogleLogin = () => {
    setUserData((prev) => ({ ...prev, name: "Usuário Google" }));
    setCurrentPage(PAGES.PREFERENCES);
  };

  const handleFacebookLogin = () => {
    setUserData((prev) => ({ ...prev, name: "Usuário Facebook" }));
    setCurrentPage(PAGES.PREFERENCES);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      <Header pageTitle="login" />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Bem-vindo ao SOL
            </h2>
            <p className="text-gray-600">Faça login para continuar</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            <div className="space-y-6">
              {/* Campo de Email/Usuário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email ou nome de usuário
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base"
                  placeholder="Digite seu email ou usuário"
                />
              </div>

              {/* Campo de Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base"
                  placeholder="Digite sua senha"
                />
                <div className="text-right mt-2">
                  <button className="text-sm text-orange-500 hover:text-orange-600 transition-colors font-medium">
                    Esqueceu a senha?
                  </button>
                </div>
              </div>

              {/* Botão de Login */}
              <Button
                onClick={handleLogin}
                disabled={!userData.name.trim() || !password.trim()}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-105 disabled:hover:scale-100"
              >
                Entrar
              </Button>

              {/* Divisor */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    ou continue com
                  </span>
                </div>
              </div>

              {/* Botões de Login Social */}
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar com Google
                </Button>

                <Button
                  onClick={handleFacebookLogin}
                  variant="outline"
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="#1877F2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continuar com Facebook
                </Button>
              </div>

              {/* Link para criar conta */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <button className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                    Criar conta
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
