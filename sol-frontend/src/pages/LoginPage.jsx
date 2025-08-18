// src/pages/LoginPage.jsx

import React, { useState, useEffect } from "react";
import Header from "../components/common/Header";
import SunLogo from "../components/common/SunLogo";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

/**
 * Página de Login Refatorada
 *
 * Esta versão demonstra como usar os hooks e componentes que criamos.
 * Observe como o código ficou mais limpo e focado apenas na interface,
 * enquanto toda a lógica complexa fica nos hooks.
 *
 * Benefícios desta abordagem:
 * - Separação clara entre lógica e apresentação
 * - Reutilização de componentes
 * - Facilidade de manutenção
 * - Testes mais simples
 * - Código mais legível
 */
const LoginPage = ({ onLoginSuccess }) => {
  // Estados locais para o formulário
  // Estes são diferentes dos estados globais - eles só existem nesta página
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Hook personalizado que gerencia toda a lógica de autenticação
  // É como chamar um especialista para cuidar dessa parte
  const {
    login,
    socialLogin,
    isLoading,
    loginError,
    clearError,
    isAuthenticated,
  } = useAuth();

  // Efeito para redirecionar se o usuário já estiver logado
  // É como verificar se a pessoa já tem acesso antes de pedir credenciais
  useEffect(() => {
    if (isAuthenticated && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess]);

  // Limpa erros quando o usuário começa a digitar
  // Isso melhora a experiência do usuário
  useEffect(() => {
    if (loginError && (formData.username || formData.password)) {
      clearError();
    }
  }, [formData.username, formData.password, loginError, clearError]);

  /**
   * Atualiza os dados do formulário
   * Função auxiliar para manter o código limpo
   */
  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Processa o envio do formulário de login
   */
  const handleLogin = async (event) => {
    event.preventDefault(); // Evita que a página recarregue

    // Validação básica no frontend
    if (!formData.username.trim() || !formData.password.trim()) {
      return; // O hook de autenticação já cuida dessa validação
    }

    // Chama a função de login do hook
    const result = await login(formData.username, formData.password);

    // Se o login foi bem-sucedido, o useEffect acima cuidará do redirecionamento
    if (result.success) {
      console.log("Login realizado com sucesso!");
    }
  };

  /**
   * Processa login social (Google, Facebook)
   */
  const handleSocialLogin = async (provider) => {
    const result = await socialLogin(provider);

    if (result.success) {
      console.log(`Login com ${provider} realizado com sucesso!`);
    }
  };

  /**
   * Renderiza o formulário de login
   * Separamos em uma função para manter o JSX principal limpo
   */
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      {/* Campo de Email/Usuário */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email ou nome de usuário
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => updateFormData("username", e.target.value)}
          className="
            w-full p-4 border border-gray-300 rounded-xl 
            focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
            transition-all text-base
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          placeholder="Digite seu email ou usuário"
          disabled={isLoading}
          aria-describedby="username-help"
        />
      </div>

      {/* Campo de Senha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Senha
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => updateFormData("password", e.target.value)}
          className="
            w-full p-4 border border-gray-300 rounded-xl 
            focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
            transition-all text-base
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          placeholder="Digite sua senha"
          disabled={isLoading}
        />
        <div className="text-right mt-2">
          <button
            type="button"
            className="text-sm text-orange-500 hover:text-orange-600 transition-colors font-medium"
            disabled={isLoading}
          >
            Esqueceu a senha?
          </button>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {loginError && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          role="alert"
        >
          {loginError}
        </div>
      )}

      {/* Botão de Login */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!formData.username.trim() || !formData.password.trim()}
        loading={isLoading}
      >
        Entrar
      </Button>
    </form>
  );

  /**
   * Renderiza as opções de login social
   */
  const renderSocialLogin = () => (
    <div className="space-y-3">
      <Button
        onClick={() => handleSocialLogin("google")}
        variant="outline"
        size="md"
        className="w-full flex items-center justify-center"
        disabled={isLoading}
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
        onClick={() => handleSocialLogin("facebook")}
        variant="outline"
        size="md"
        className="w-full flex items-center justify-center"
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Continuar com Facebook
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      {/* Header - usando nosso componente reutilizável */}
      <Header pageTitle="Login" />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Seção de Apresentação */}
          <div className="text-center mb-8">
            <SunLogo size="large" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2 mt-4">
              Bem-vindo ao SOL
            </h2>
            <p className="text-gray-600">
              Faça login para continuar sua jornada musical terapêutica
            </p>
          </div>

          {/* Card do Formulário */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            {/* Formulário de Login */}
            {renderLoginForm()}

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  ou continue com
                </span>
              </div>
            </div>

            {/* Login Social */}
            {renderSocialLogin()}
          </div>

          {/* Link para Registro */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Não tem uma conta?{" "}
              <button className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                Cadastre-se aqui
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
