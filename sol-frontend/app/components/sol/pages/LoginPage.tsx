import { useState } from "react";
import { Button } from "~/components/ui/button";
import SunLogo from "../SunLogo";
import { PAGES } from "~/constants/sol";
import { AuthService } from "~/services/authService";

interface LoginPageProps {
  setCurrentPage: (page: string) => void;
  setUserData: (userData: any) => void;
}

export default function LoginPage({
  setCurrentPage,
  setUserData,
}: LoginPageProps) {
  // Estados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);

  // Estados para alternar entre login e registro
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");

  /**
   * 🔑 Handle Login Real
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(undefined);

    try {
      console.log("🔐 Tentando login...", email);

      const result = await AuthService.login(email, password);

      if (result.success && result.userData) {
        console.log("✅ Login bem-sucedido!", result.userData);

        // Salvar dados do usuário
        setUserData(result.userData);

        // Navegar para dashboard (usuário já existe)
        setCurrentPage(PAGES.DASHBOARD);
      } else {
        setError(result.error || "Erro ao fazer login");
      }
    } catch (err) {
      console.error("❌ Erro no login:", err);
      setError("Erro de conexão. Verifique se o backend está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 👤 Handle Registro Real
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(undefined);

    try {
      console.log("📝 Tentando registrar...", email);

      const result = await AuthService.register({
        name,
        email,
        password,
        preferences: [],
      });

      if (result.success && result.userData) {
        console.log("✅ Registro bem-sucedido!", result.userData);

        // Salvar dados do usuário
        setUserData(result.userData);

        // Navegar para preferências
        setCurrentPage(PAGES.PREFERENCES);
      } else {
        setError(result.error || "Erro ao registrar");
      }
    } catch (err) {
      console.error("❌ Erro no registro:", err);
      setError("Erro de conexão. Verifique se o backend está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🎨 Alternar entre Login e Registro
   */
  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError(undefined);
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sol-light via-sol-pale to-sol-primary flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isRegisterMode ? "Criar Conta" : "Bem-vindo ao SOL"}
            </h2>
            <p className="text-gray-600">
              {isRegisterMode
                ? "Crie sua conta para começar"
                : "Faça login para continuar"}
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            <form
              onSubmit={isRegisterMode ? handleRegister : handleLogin}
              className="space-y-6"
            >
              {/* Campo Nome (só no registro) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="Seu nome"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all pr-12"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {isRegisterMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 6 caracteres
                  </p>
                )}
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Botão de Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-400 text-white py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isRegisterMode ? "Criando conta..." : "Entrando..."}
                  </span>
                ) : isRegisterMode ? (
                  "Criar Conta"
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Alternar entre Login e Registro */}
            <div className="mt-6 text-center">
              <button
                onClick={toggleMode}
                disabled={isLoading}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors disabled:opacity-50"
              >
                {isRegisterMode
                  ? "Já tem conta? Faça login"
                  : "Não tem conta? Registre-se"}
              </button>
            </div>

            {/* Indicador de Conexão */}
            {/*   <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Conectado ao backend</span>
              </div>
            </div> */}
          </div>

          {/* Dica de Teste */}
          {/*   {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <p className="font-semibold mb-1">💡 Modo Desenvolvedor</p>
              <p>Use qualquer email/senha para testar.</p>
              <p className="mt-1">Exemplo: teste@sol.com / senha123</p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
