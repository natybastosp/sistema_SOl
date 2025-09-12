import type { UserData, AuthState, ApiResponse } from "~/types/sol";
import { DEFAULT_SETTINGS } from "~/constants/sol";

export class AuthService {
  private static readonly API_BASE =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001/api"
      : "/api";

  private static readonly STORAGE_KEYS = {
    TOKEN: "sol-auth-token",
    USER: "sol-user-data",
    SETTINGS: "sol-user-settings",
    LAST_LOGIN: "sol-last-login",
  } as const;

  /**
   * 🚪 Verificação Inteligente de Autenticação
   *
   * Como um porteiro que reconhece rostos familiares, esta função:
   * 1. Verifica se existe um token válido guardado
   * 2. Confirma com o servidor se o token ainda é válido
   * 3. Carrega todos os dados necessários para personalizar a experiência
   * 4. Decide qual fluxo o usuário deve seguir
   */
  static async checkAuthentication(): Promise<{
    authState: AuthState;
    userData?: UserData;
    shouldRedirectTo: string;
  }> {
    try {
      const savedToken = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(this.STORAGE_KEYS.USER);
      const lastLogin = localStorage.getItem(this.STORAGE_KEYS.LAST_LOGIN);

      // Se não tem token, definitivamente é usuário novo
      if (!savedToken || !savedUser) {
        return {
          authState: {
            isAuthenticated: false,
            isNewUser: true,
          },
          shouldRedirectTo: "entry-check",
        };
      }

      // Tenta validar o token com o backend
      const validationResponse = await this.validateToken(savedToken);

      if (!validationResponse.success) {
        // Token inválido, limpa dados locais e trata como novo usuário
        this.clearLocalData();
        return {
          authState: {
            isAuthenticated: false,
            isNewUser: true,
          },
          shouldRedirectTo: "entry-check",
        };
      }

      // Token válido! Prepara experiência personalizada
      const userData = JSON.parse(savedUser) as UserData;
      const isReturningToday = this.isReturningToday(lastLogin);

      return {
        authState: {
          isAuthenticated: true,
          isNewUser: false,
          userId: userData.id,
          token: savedToken,
          lastLoginDate: lastLogin || undefined,
        },
        userData,
        shouldRedirectTo: isReturningToday ? "quick-ia" : "dashboard",
      };
    } catch (error) {
      console.error("Erro na verificação de autenticação:", error);
      // Em caso de erro, assume usuário novo para segurança
      return {
        authState: {
          isAuthenticated: false,
          isNewUser: true,
        },
        shouldRedirectTo: "entry-check",
      };
    }
  }

  /**
   * 🔑 Login de Usuário Existente
   *
   * Como um recepcionista que reconhece um hóspede regular:
   * 1. Verifica as credenciais com máxima segurança
   * 2. Carrega todas as preferências e configurações
   * 3. Prepara uma experiência personalizada baseada no histórico
   * 4. Decide se oferece IA rápida ou dashboard completo
   */
  static async login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    authState?: AuthState;
    userData?: UserData;
    redirectTo?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result: ApiResponse<{
        user: UserData;
        token: string;
        lastLoginWasToday: boolean;
      }> = await response.json();

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error?.message || "Erro no login",
        };
      }

      const { user, token, lastLoginWasToday } = result.data;

      // Salva dados localmente para experiência offline
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(
        this.STORAGE_KEYS.LAST_LOGIN,
        new Date().toISOString()
      );

      const authState: AuthState = {
        isAuthenticated: true,
        isNewUser: false,
        userId: user.id,
        token,
        lastLoginDate: new Date().toISOString(),
        loginMethod: "email",
      };

      // Decide a melhor experiência inicial baseada no padrão de uso
      const redirectTo = this.determineOptimalEntry(user, lastLoginWasToday);

      return {
        success: true,
        authState,
        userData: user,
        redirectTo,
      };
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        error: "Erro de conexão. Tente novamente.",
      };
    }
  }

  /**
   * 👤 Registro de Novo Usuário
   *
   * Como um concierge preparando a chegada de um novo hóspede VIP:
   * 1. Cria a conta com máxima atenção aos detalhes
   * 2. Configura preferências padrão baseadas nas melhores práticas
   * 3. Prepara um onboarding personalizado
   * 4. Garante que a primeira experiência seja memorável
   */
  static async register(registrationData: {
    name: string;
    email: string;
    password: string;
    age?: number;
    preferences: string[];
    initialEmotionalState: Record<string, number>;
  }): Promise<{
    success: boolean;
    authState?: AuthState;
    userData?: UserData;
    error?: string;
  }> {
    try {
      // Prepara dados para o backend com configurações inteligentes
      const fullUserData = {
        ...registrationData,
        profileSetupComplete: true,
        emotionalProfile: {
          dominantEmotion: this.analyzeDominantEmotion(
            registrationData.initialEmotionalState
          ),
          responsePatterns: {},
          preferredTherapyTypes: this.suggestTherapyTypes(
            registrationData.preferences
          ),
          progressMetrics: {
            sessionsCompleted: 0,
            averageMoodImprovement: 0,
            streakDays: 0,
          },
        },
        discoverySettings: {
          allowExplicitContent: registrationData.age
            ? registrationData.age >= 18
            : false,
          preferredDecades: this.suggestDecades(registrationData.age),
          artistBlacklist: [],
          genreWeights: this.calculateGenreWeights(
            registrationData.preferences
          ),
        },
      };

      const response = await fetch(`${this.API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullUserData),
      });

      const result: ApiResponse<{
        user: UserData;
        token: string;
      }> = await response.json();

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error?.message || "Erro no registro",
        };
      }

      const { user, token } = result.data;

      // Salva dados e configurações padrão
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(
        this.STORAGE_KEYS.SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS)
      );
      localStorage.setItem(
        this.STORAGE_KEYS.LAST_LOGIN,
        new Date().toISOString()
      );

      const authState: AuthState = {
        isAuthenticated: true,
        isNewUser: true, // Mantém como novo usuário para fluxo de onboarding
        userId: user.id,
        token,
        lastLoginDate: new Date().toISOString(),
        loginMethod: "email",
      };

      return {
        success: true,
        authState,
        userData: user,
      };
    } catch (error) {
      console.error("Erro no registro:", error);
      return {
        success: false,
        error: "Erro de conexão. Tente novamente.",
      };
    }
  }

  /**
   * 🔄 Logout Inteligente
   *
   * Como um concierge despedindo um hóspede:
   * 1. Salva qualquer trabalho em progresso
   * 2. Limpa dados sensíveis mas mantém preferências de interface
   * 3. Prepara para uma volta rápida e fácil
   */
  static async logout(): Promise<{ success: boolean }> {
    try {
      const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);

      if (token) {
        // Notifica o backend sobre o logout
        await fetch(`${this.API_BASE}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Limpa dados sensíveis mas mantém preferências de interface
      this.clearSensitiveData();

      return { success: true };
    } catch (error) {
      console.error("Erro no logout:", error);
      // Mesmo com erro de rede, limpa dados locais
      this.clearSensitiveData();
      return { success: true };
    }
  }

  // 🛠️ MÉTODOS AUXILIARES PRIVADOS

  /**
   * Valida token com o backend
   */
  private static async validateToken(
    token: string
  ): Promise<ApiResponse<UserData>> {
    const response = await fetch(`${this.API_BASE}/auth/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  }

  /**
   * Verifica se o usuário já fez login hoje
   */
  private static isReturningToday(lastLogin: string | null): boolean {
    if (!lastLogin) return false;

    const lastLoginDate = new Date(lastLogin);
    const today = new Date();

    return (
      lastLoginDate.getDate() === today.getDate() &&
      lastLoginDate.getMonth() === today.getMonth() &&
      lastLoginDate.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Determina a melhor página inicial baseada no perfil do usuário
   */
  private static determineOptimalEntry(
    user: UserData,
    lastLoginWasToday: boolean
  ): string {
    // Se já usou hoje, oferece IA rápida
    if (lastLoginWasToday) {
      return "quick-ia";
    }

    // Se tem histórico emocional rico, vai direto para dashboard
    if (user.emotionalProfile?.progressMetrics.sessionsCompleted > 5) {
      return "dashboard";
    }

    // Usuário relativamente novo, oferece IA completa
    return "emotional-assessment";
  }

  /**
   * Analisa emoção dominante do estado inicial
   */
  private static analyzeDominantEmotion(
    emotionalState: Record<string, number>
  ): string {
    return (
      Object.entries(emotionalState).reduce((a, b) =>
        emotionalState[a[0]] > emotionalState[b[0]] ? a : b
      )[0] || "calm"
    );
  }

  /**
   * Sugere tipos de terapia baseado nas preferências musicais
   */
  private static suggestTherapyTypes(preferences: string[]): string[] {
    const therapyMap: Record<string, string[]> = {
      Clássica: ["meditation", "focus"],
      Jazz: ["relaxation", "creativity"],
      Rock: ["energy", "motivation"],
      Eletrônica: ["focus", "energy"],
      MPB: ["relaxation", "emotional_processing"],
    };

    const suggestions = new Set<string>();
    preferences.forEach((genre) => {
      therapyMap[genre]?.forEach((therapy) => suggestions.add(therapy));
    });

    return Array.from(suggestions);
  }

  /**
   * Sugere décadas musicais baseado na idade
   */
  private static suggestDecadas(age?: number): string[] {
    if (!age) return ["2010s", "2020s"];

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;

    // Inclui décadas da adolescência/juventude + década atual
    const teenageDecade = Math.floor((birthYear + 15) / 10) * 10;
    const currentDecade = Math.floor(currentYear / 10) * 10;

    return [`${teenageDecade}s`, `${currentDecade}s`];
  }

  /**
   * Calcula pesos dos gêneros baseado nas preferências
   */
  private static calculateGenreWeights(
    preferences: string[]
  ): Record<string, number> {
    const weights: Record<string, number> = {};
    const baseWeight = 1.0 / preferences.length;

    preferences.forEach((genre) => {
      weights[genre] = baseWeight;
    });

    return weights;
  }

  /**
   * Limpa todos os dados locais
   */
  private static clearLocalData(): void {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Limpa apenas dados sensíveis, mantém preferências de interface
   */
  private static clearSensitiveData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
    // Mantém SETTINGS para preservar preferências de interface
  }
}

/**
 * 🎯 Hook React para uso fácil do AuthService
 *
 * Este hook é como ter um assistente pessoal que cuida de toda
 * a autenticação para você, deixando os componentes focarem
 * apenas na experiência do usuário.
 */
export function useAuth() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const login = React.useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await AuthService.login(email, password);
      if (!result.success) {
        setError(result.error);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = React.useCallback(
    async (data: Parameters<typeof AuthService.register>[0]) => {
      setIsLoading(true);
      setError(undefined);

      try {
        const result = await AuthService.register(data);
        if (!result.success) {
          setError(result.error);
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      return await AuthService.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = React.useCallback(async () => {
    setIsLoading(true);
    try {
      return await AuthService.checkAuthentication();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    register,
    logout,
    checkAuth,
    isLoading,
    error,
    clearError: () => setError(undefined),
  };
}
