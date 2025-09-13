import type { UserData, AuthState, ApiResponse } from "~/types/sol";
import { DEFAULT_SETTINGS } from "~/constants/sol";

export class AuthService {
  private static readonly STORAGE_KEYS = {
    TOKEN: "sol-auth-token",
    USER: "sol-user-data",
    SETTINGS: "sol-user-settings",
    LAST_LOGIN: "sol-last-login",
    USERS_DB: "sol-users-database", // Simula banco de usuários
  } as const;

  /**
   * 🗄️ Simulação de banco de dados local
   */
  private static getUsersDB(): Record<string, any> {
    const stored = localStorage.getItem(this.STORAGE_KEYS.USERS_DB);
    return stored ? JSON.parse(stored) : {};
  }

  private static saveUsersDB(db: Record<string, any>): void {
    localStorage.setItem(this.STORAGE_KEYS.USERS_DB, JSON.stringify(db));
  }

  /**
   * 🎲 Gerador de ID único simples
   */
  private static generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 🎲 Gerador de token JWT simulado
   */
  private static generateToken(userId: string): string {
    return `fake_jwt_${userId}_${Date.now()}`;
  }

  /**
   * ⏰ Verifica se o usuário retornou hoje
   */
  private static isReturningToday(lastLogin: string | null): boolean {
    if (!lastLogin) return false;

    const lastLoginDate = new Date(lastLogin);
    const today = new Date();

    return lastLoginDate.toDateString() === today.toDateString();
  }

  /**
   * 🎯 Determina melhor experiência inicial
   */
  private static determineOptimalEntry(
    user: UserData,
    lastLoginWasToday: boolean
  ): string {
    // Se é primeira vez, vai para dashboard
    if (!user.profileSetupComplete) {
      return "dashboard";
    }

    // Se já usou hoje, oferece IA rápida
    if (lastLoginWasToday) {
      return "quick-ia";
    }

    // Usuário retornando após um tempo, vai para dashboard
    return "dashboard";
  }

  /**
   * 🧹 Limpa dados locais
   */
  private static clearLocalData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.USER);
    localStorage.removeItem(this.STORAGE_KEYS.LAST_LOGIN);
  }

  /**
   * ✅ Simula validação de token
   */
  private static async validateToken(
    token: string
  ): Promise<{ success: boolean }> {
    // Simula tempo de resposta da API
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Token válido se começar com "fake_jwt_" e não está expirado (24h)
    if (!token.startsWith("fake_jwt_")) {
      return { success: false };
    }

    const parts = token.split("_");
    const timestamp = parseInt(parts[parts.length - 1]);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return { success: now - timestamp < twentyFourHours };
  }

  /**
   * 🚪 Verificação Inteligente de Autenticação (OFFLINE)
   */
  static async checkAuthentication(): Promise<{
    authState: AuthState;
    userData?: UserData;
    shouldRedirectTo: string;
  }> {
    try {
      console.log("🔍 [OFFLINE MODE] Verificando autenticação local...");

      const savedToken = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(this.STORAGE_KEYS.USER);
      const lastLogin = localStorage.getItem(this.STORAGE_KEYS.LAST_LOGIN);

      // Se não tem token, definitivamente é usuário novo
      if (!savedToken || !savedUser) {
        console.log("❌ [OFFLINE MODE] Nenhuma sessão encontrada");
        return {
          authState: {
            isAuthenticated: false,
            isNewUser: true,
          },
          shouldRedirectTo: "entry-check",
        };
      }

      // Valida token localmente
      const validationResponse = await this.validateToken(savedToken);

      if (!validationResponse.success) {
        console.log("❌ [OFFLINE MODE] Token expirado");
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

      console.log("✅ [OFFLINE MODE] Usuário autenticado:", userData.name);

      return {
        authState: {
          isAuthenticated: true,
          isNewUser: false,
          userId: userData.id,
          token: savedToken,
          lastLoginDate: lastLogin || undefined,
        },
        userData,
        shouldRedirectTo: this.determineOptimalEntry(
          userData,
          isReturningToday
        ),
      };
    } catch (error) {
      console.error("❌ [OFFLINE MODE] Erro na verificação:", error);
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
   * 🔑 Login de Usuário Existente (OFFLINE)
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
      console.log("🔑 [OFFLINE MODE] Tentativa de login:", email);

      // Simula tempo de resposta
      await new Promise((resolve) => setTimeout(resolve, 500));

      const usersDB = this.getUsersDB();
      const user = usersDB[email.toLowerCase()];

      if (!user || user.password !== password) {
        console.log("❌ [OFFLINE MODE] Credenciais inválidas");
        return {
          success: false,
          error: "Email ou senha incorretos",
        };
      }

      const lastLogin = localStorage.getItem(this.STORAGE_KEYS.LAST_LOGIN);
      const lastLoginWasToday = this.isReturningToday(lastLogin);

      // Gera novo token
      const token = this.generateToken(user.id);

      // Salva dados localmente
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

      const redirectTo = this.determineOptimalEntry(user, lastLoginWasToday);

      console.log(
        "✅ [OFFLINE MODE] Login bem-sucedido, redirecionando para:",
        redirectTo
      );

      return {
        success: true,
        authState,
        userData: user,
        redirectTo,
      };
    } catch (error) {
      console.error("❌ [OFFLINE MODE] Erro no login:", error);
      return {
        success: false,
        error: "Erro interno. Tente novamente.",
      };
    }
  }

  /**
   * 👤 Registro de Novo Usuário (OFFLINE)
   */
  static async register(registrationData: {
    name: string;
    email: string;
    password: string;
    age?: number;
    preferences?: string[];
    emotionalProfile?: any;
  }): Promise<{
    success: boolean;
    authState?: AuthState;
    userData?: UserData;
    error?: string;
  }> {
    try {
      console.log(
        "👤 [OFFLINE MODE] Tentativa de registro:",
        registrationData.email
      );

      // Simula tempo de resposta
      await new Promise((resolve) => setTimeout(resolve, 800));

      const usersDB = this.getUsersDB();
      const emailLower = registrationData.email.toLowerCase();

      // Verifica se usuário já existe
      if (usersDB[emailLower]) {
        console.log("❌ [OFFLINE MODE] Email já cadastrado");
        return {
          success: false,
          error: "Este email já está cadastrado",
        };
      }

      // Cria novo usuário
      const userId = this.generateId();
      const newUser: UserData = {
        id: userId,
        name: registrationData.name,
        email: registrationData.email,
        age: registrationData.age,
        preferences: registrationData.preferences || [],
        emotionalState: {},
        profileSetupComplete: true,
        emotionalProfile: {
          dominantEmotion: "calm",
          responsePatterns: {},
          progressMetrics: {
            sessionsCompleted: 0,
            averageMoodImprovement: 0,
            streakDays: 0,
          },
          ...registrationData.emotionalProfile,
        },
        discoverySettings: {
          allowExplicitContent: false,
          preferredDecades: ["2010s", "2020s"],
          artistBlacklist: [],
          genreWeights: {},
        },
      };

      // Salva no "banco de dados" local
      usersDB[emailLower] = {
        ...newUser,
        password: registrationData.password, // Em produção seria hash
      };
      this.saveUsersDB(usersDB);

      // Gera token e salva sessão
      const token = this.generateToken(userId);
      localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(newUser));
      localStorage.setItem(
        this.STORAGE_KEYS.LAST_LOGIN,
        new Date().toISOString()
      );

      // Salva configurações padrão
      localStorage.setItem(
        this.STORAGE_KEYS.SETTINGS,
        JSON.stringify(DEFAULT_SETTINGS)
      );

      const authState: AuthState = {
        isAuthenticated: true,
        isNewUser: true, // Marca como novo para eventual onboarding
        userId,
        token,
        lastLoginDate: new Date().toISOString(),
        loginMethod: "email",
      };

      console.log("✅ [OFFLINE MODE] Registro bem-sucedido:", newUser.name);

      return {
        success: true,
        authState,
        userData: newUser,
      };
    } catch (error) {
      console.error("❌ [OFFLINE MODE] Erro no registro:", error);
      return {
        success: false,
        error: "Erro interno. Tente novamente.",
      };
    }
  }

  /**
   * 🚪 Logout (OFFLINE)
   */
  static async logout(): Promise<{ success: boolean }> {
    try {
      console.log("🚪 [OFFLINE MODE] Fazendo logout...");

      this.clearLocalData();

      console.log("✅ [OFFLINE MODE] Logout realizado");
      return { success: true };
    } catch (error) {
      console.error("❌ [OFFLINE MODE] Erro no logout:", error);
      return { success: false };
    }
  }

  /**
   * 👤 Atualizar dados do usuário (OFFLINE)
   */
  static async updateUser(userData: Partial<UserData>): Promise<{
    success: boolean;
    userData?: UserData;
    error?: string;
  }> {
    try {
      console.log("👤 [OFFLINE MODE] Atualizando dados do usuário...");

      const currentUserStr = localStorage.getItem(this.STORAGE_KEYS.USER);
      if (!currentUserStr) {
        return { success: false, error: "Usuário não encontrado" };
      }

      const currentUser = JSON.parse(currentUserStr) as UserData;
      const updatedUser = { ...currentUser, ...userData };

      // Atualiza localStorage
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      // Atualiza "banco de dados" se email está definido
      if (currentUser.email) {
        const usersDB = this.getUsersDB();
        if (usersDB[currentUser.email.toLowerCase()]) {
          usersDB[currentUser.email.toLowerCase()] = {
            ...usersDB[currentUser.email.toLowerCase()],
            ...updatedUser,
          };
          this.saveUsersDB(usersDB);
        }
      }

      console.log("✅ [OFFLINE MODE] Dados atualizados");
      return { success: true, userData: updatedUser };
    } catch (error) {
      console.error("❌ [OFFLINE MODE] Erro ao atualizar:", error);
      return { success: false, error: "Erro interno" };
    }
  }

  /**
   * 🔧 Métodos utilitários para desenvolvimento
   */
  static async resetOfflineData(): Promise<void> {
    console.log("🗑️ [OFFLINE MODE] Limpando todos os dados...");

    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log("✅ [OFFLINE MODE] Dados limpos");
  }

  static async getOfflineUsers(): Promise<Record<string, any>> {
    return this.getUsersDB();
  }

  static async createDemoUser(): Promise<void> {
    console.log("🎭 [OFFLINE MODE] Criando usuário demo...");

    await this.register({
      name: "Demo User",
      email: "demo@sol.com",
      password: "123456",
      age: 25,
      preferences: ["Pop", "Rock", "MPB"],
      emotionalProfile: {
        dominantEmotion: "calm",
        responsePatterns: { happy: 0.8, calm: 0.9 },
      },
    });

    console.log(
      "✅ [OFFLINE MODE] Usuário demo criado (demo@sol.com / 123456)"
    );
  }
}
