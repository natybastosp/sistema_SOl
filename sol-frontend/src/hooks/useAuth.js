// src/hooks/useAuth.js

import { useState, useEffect } from "react";

/**
 * Hook customizado para gerenciar autenticação
 *
 * Este hook centraliza toda a lógica de autenticação da aplicação.
 * É como ter um assistente pessoal que cuida apenas de login/logout
 * e validação de usuário. Qualquer componente pode usar este hook
 * para acessar informações de autenticação de forma consistente.
 *
 * Benefícios desta abordagem:
 * - Lógica centralizada em um lugar
 * - Reutilização em múltiplos componentes
 * - Facilita testes unitários
 * - Manutenção simplificada
 */
const useAuth = () => {
  // Estados relacionados à autenticação
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  // Efeito para verificar se há um usuário logado ao carregar a aplicação
  // Isso é importante para manter o usuário logado entre sessões
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Verifica se há um token válido armazenado
   * Em uma implementação real, isso faria uma chamada para o backend
   */
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      // Simulando verificação de token
      // Em produção, isso seria uma chamada real para a API
      const storedUser = localStorage.getItem("sol_user");
      const storedToken = localStorage.getItem("sol_token");

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Erro ao verificar status de autenticação:", error);
      // Em caso de erro, limpa dados possivelmente corrompidos
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função de login
   * Simula o processo de autenticação e armazena os dados do usuário
   *
   * @param {string} username - Nome de usuário ou email
   * @param {string} password - Senha do usuário
   */
  const login = async (username, password) => {
    try {
      setIsLoading(true);
      setLoginError("");

      // Validações básicas
      if (!username.trim() || !password.trim()) {
        throw new Error("Por favor, preencha todos os campos");
      }

      // Simulando chamada de API
      // Em produção, isso seria uma requisição real para o backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula delay da rede

      // Simulando resposta bem-sucedida
      const userData = {
        id: Date.now(), // ID temporário
        name: username,
        email: username.includes("@") ? username : `${username}@example.com`,
        loginTime: new Date().toISOString(),
      };

      const token = `token_${Date.now()}`; // Token temporário

      // Armazena dados localmente
      localStorage.setItem("sol_user", JSON.stringify(userData));
      localStorage.setItem("sol_token", token);

      // Atualiza estado
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const errorMessage =
        error.message || "Erro ao fazer login. Tente novamente.";
      setLoginError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função de login social (Google, Facebook, etc.)
   * Simplifica o processo para logins externos
   *
   * @param {string} provider - Provedor do login ('google', 'facebook', etc.)
   */
  const socialLogin = async (provider) => {
    try {
      setIsLoading(true);
      setLoginError("");

      // Simulando processo de login social
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userData = {
        id: Date.now(),
        name: `Usuário ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
        email: `usuario@${provider}.com`,
        provider: provider,
        loginTime: new Date().toISOString(),
      };

      const token = `${provider}_token_${Date.now()}`;

      localStorage.setItem("sol_user", JSON.stringify(userData));
      localStorage.setItem("sol_token", token);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = `Erro ao fazer login com ${provider}. Tente novamente.`;
      setLoginError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função de logout
   * Limpa todos os dados de autenticação
   */
  const logout = () => {
    // Remove dados do localStorage
    localStorage.removeItem("sol_user");
    localStorage.removeItem("sol_token");

    // Limpa estado
    setUser(null);
    setIsAuthenticated(false);
    setLoginError("");
  };

  /**
   * Limpa erros de login
   * Útil para limpar mensagens de erro quando o usuário começa a digitar novamente
   */
  const clearError = () => {
    setLoginError("");
  };

  // Retorna todas as funções e estados que os componentes podem usar
  return {
    // Estados
    user,
    isAuthenticated,
    isLoading,
    loginError,

    // Funções
    login,
    socialLogin,
    logout,
    clearError,
    checkAuthStatus,
  };
};

export default useAuth;
