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
