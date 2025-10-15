import type { UserData, AuthState, ApiResponse } from "~/types/sol";
import { DEFAULT_SETTINGS } from "~/constants/sol";

export class AuthService {
  private static readonly API_BASE =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "/api";

  private static readonly STORAGE_KEYS = {
    TOKEN: "sol-auth-token",
    USER: "sol-user-data",
    SETTINGS: "sol-user-settings",
    LAST_LOGIN: "sol-last-login",
  } as const;

  /**
   * 🚪 Verificação de Autenticação
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

      if (!savedToken || !savedUser) {
        return {
          authState: {
            isAuthenticated: false,
            isNewUser: true,
          },
          shouldRedirectTo: "entry-check",
        };
      }

      // Validar token com backend
      const validationResponse = await this.validateToken(savedToken);

      if (!validationResponse.success) {
        this.clearLocalData();
        return {
          authState: {
            isAuthenticated: false,
            isNewUser: true,
          },
          shouldRedirectTo: "entry-check",
        };
      }

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
      console.error("❌ Erro na verificação:", error);
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
   * 🔑 Login de Usuário
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
      console.log(`🔐 Tentando login: ${email}`);

      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || "Erro no login",
        };
      }

      const { user, token } = result.data;

      // Salvar no localStorage
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(
        this.STORAGE_KEYS.LAST_LOGIN,
        new Date().toISOString()
      );

      console.log("✅ Login bem-sucedido!");

      const authState: AuthState = {
        isAuthenticated: true,
        isNewUser: false,
        userId: user.id,
        token,
        lastLoginDate: new Date().toISOString(),
        loginMethod: "email",
      };

      return {
        success: true,
        authState,
        userData: user,
        redirectTo: "dashboard",
      };
    } catch (error) {
      console.error("❌ Erro no login:", error);
      return {
        success: false,
        error: "Erro de conexão. Verifique se o backend está rodando.",
      };
    }
  }

  /**
   * 👤 Registro de Novo Usuário
   */
  static async register(registrationData: {
    name: string;
    email: string;
    password: string;
    preferences?: string[];
  }): Promise<{
    success: boolean;
    authState?: AuthState;
    userData?: UserData;
    error?: string;
  }> {
    try {
      console.log(`📝 Registrando usuário: ${registrationData.email}`);

      const response = await fetch(`${this.API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registrationData.name,
          email: registrationData.email,
          password: registrationData.password,
          musicPreferences: registrationData.preferences || [],
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || "Erro no registro",
        };
      }

      const { user, token } = result.data;

      // Salvar no localStorage
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

      console.log("✅ Registro bem-sucedido!");

      const authState: AuthState = {
        isAuthenticated: true,
        isNewUser: true,
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
      console.error("❌ Erro no registro:", error);
      return {
        success: false,
        error: "Erro de conexão. Verifique se o backend está rodando.",
      };
    }
  }

  /**
   * 🔄 Logout
   */
  static async logout(): Promise<{ success: boolean }> {
    try {
      this.clearLocalData();
      console.log("👋 Logout realizado");
      return { success: true };
    } catch (error) {
      console.error("❌ Erro no logout:", error);
      return { success: false };
    }
  }

  /**
   * ✅ Validar Token com Backend
   */
  private static async validateToken(token: string): Promise<{
    success: boolean;
    user?: UserData;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        return {
          success: true,
          user: result.data.user,
        };
      }

      return { success: false };
    } catch (error) {
      console.error("❌ Erro ao validar token:", error);
      return { success: false };
    }
  }

  /**
   * 🧹 Limpar dados locais
   */
  private static clearLocalData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
    localStorage.removeItem(this.STORAGE_KEYS.LAST_LOGIN);
  }

  /**
   * 📅 Verificar se usuário retornou hoje
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
   * 🔑 Obter token atual
   */
  static getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
  }

  /**
   * 👤 Obter usuário atual
   */
  static getCurrentUser(): UserData | null {
    const userStr = localStorage.getItem(this.STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as UserData;
    } catch {
      return null;
    }
  }
}
