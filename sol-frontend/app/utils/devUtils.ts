import { AuthService } from "~/services/authService";

export class DevUtils {
  /**
   * 🎭 Cria usuários de exemplo para testes
   */
  static async createDemoUsers(): Promise<void> {
    console.log("🎭 Criando usuários demo...");

    const demoUsers = [
      {
        name: "Ana Silva",
        email: "ana@demo.com",
        password: "123456",
        age: 28,
        preferences: ["Pop", "MPB", "Rock"],
        emotionalProfile: {
          dominantEmotion: "calm",
          responsePatterns: {
            happy: 0.7,
            calm: 0.9,
            anxiety: 0.3,
          },
        },
      },
      {
        name: "Carlos Santos",
        email: "carlos@demo.com",
        password: "123456",
        age: 32,
        preferences: ["Rock", "Jazz", "Clássica"],
        emotionalProfile: {
          dominantEmotion: "joy",
          responsePatterns: {
            joy: 0.8,
            energy: 0.9,
            sadness: 0.2,
          },
        },
      },
      {
        name: "Maria Oliveira",
        email: "maria@demo.com",
        password: "123456",
        age: 24,
        preferences: ["Eletrônica", "Pop", "Funk"],
        emotionalProfile: {
          dominantEmotion: "energy",
          responsePatterns: {
            energy: 0.9,
            happy: 0.8,
            stress: 0.4,
          },
        },
      },
    ];

    for (const user of demoUsers) {
      try {
        await AuthService.register(user);
        console.log(`✅ Usuário criado: ${user.name} (${user.email})`);
      } catch (error) {
        console.log(`⚠️ Usuário já existe: ${user.email}`);
      }
    }

    console.log("🎉 Usuários demo prontos!");
    console.log("\n📋 Credenciais de teste:");
    console.log("• ana@demo.com / 123456");
    console.log("• carlos@demo.com / 123456");
    console.log("• maria@demo.com / 123456");
  }

  /**
   * 🗑️ Limpa todos os dados para começar fresh
   */
  static async resetAllData(): Promise<void> {
    console.log("🗑️ Limpando todos os dados...");
    await AuthService.resetOfflineData();
    console.log("✅ Sistema resetado!");
  }

  /**
   * 📊 Mostra estatísticas do sistema offline
   */
  static async showOfflineStats(): Promise<void> {
    const users = await AuthService.getOfflineUsers();
    const userCount = Object.keys(users).length;

    console.log("📊 Estatísticas do Sistema Offline:");
    console.log(`👥 Usuários cadastrados: ${userCount}`);

    if (userCount > 0) {
      console.log("\n👤 Usuários:");
      Object.values(users).forEach((user: any, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
      });
    }

    const currentUser = localStorage.getItem("sol-user-data");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      console.log(`\n🔐 Usuário atual: ${user.name}`);
    } else {
      console.log("\n🔐 Nenhum usuário logado");
    }
  }

  /**
   * 🎮 Atalhos rápidos para desenvolvimento
   */
  static async quickStart(): Promise<void> {
    console.log("🚀 Quick Start - Configurando ambiente de desenvolvimento...");

    // Limpa dados antigos
    await this.resetAllData();

    // Cria usuários demo
    await this.createDemoUsers();

    // Faz login automático com o primeiro usuário
    const loginResult = await AuthService.login("ana@demo.com", "123456");

    if (loginResult.success) {
      console.log("✅ Login automático realizado com ana@demo.com");
      console.log("🎯 Sistema pronto para desenvolvimento!");
    } else {
      console.log("❌ Erro no login automático");
    }
  }

  /**
   * 🎲 Simula dados de histórico emocional
   */
  static generateMockEmotionalHistory(): Array<any> {
    const emotions = ["calm", "joy", "sadness", "anxiety", "anger"];
    const genres = ["Pop", "Rock", "MPB", "Jazz", "Clássica"];
    const history = [];

    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const initialEmotion =
        emotions[Math.floor(Math.random() * emotions.length)];
      const finalEmotion =
        emotions[Math.floor(Math.random() * emotions.length)];

      history.push({
        date: date.toISOString(),
        initialEmotion: { [initialEmotion]: Math.random() * 10 },
        finalEmotion,
        tracksPlayed: Math.floor(Math.random() * 15) + 3,
        satisfaction: Math.floor(Math.random() * 5) + 1,
        sessionId: `mock-${Date.now()}-${i}`,
        sessionDuration: Math.floor(Math.random() * 30) + 10,
        therapeuticGoals: ["relaxation", "energy", "focus"][
          Math.floor(Math.random() * 3)
        ],
        goalAchievement: { primary: Math.random() },
        playlist: {
          id: `playlist-${i}`,
          name: `Playlist ${i + 1}`,
          tracks: [],
          generationMethod:
            Math.random() > 0.5 ? "quick_ai" : "complete_assessment",
        },
      });
    }

    return history;
  }

  /**
   * 📱 Adiciona atalhos ao console do navegador
   */
  static addBrowserShortcuts(): void {
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.SOL_DEV = {
        reset: () => this.resetAllData(),
        createUsers: () => this.createDemoUsers(),
        stats: () => this.showOfflineStats(),
        quickStart: () => this.quickStart(),
        login: (email: string, password: string) =>
          AuthService.login(email, password),
        logout: () => AuthService.logout(),
      };

      console.log(`
🌟 SOL Development Utils Loaded!

Use these commands in the browser console:

🎮 SOL_DEV.quickStart()     - Setup everything and auto-login
🗑️ SOL_DEV.reset()          - Clear all data  
👥 SOL_DEV.createUsers()    - Create demo users
📊 SOL_DEV.stats()          - Show system stats
🔐 SOL_DEV.login(email, pw) - Manual login
🚪 SOL_DEV.logout()         - Logout current user

Happy coding! 🚀
      `);
    }
  }
}

// Auto-carrega utilitários em desenvolvimento
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  DevUtils.addBrowserShortcuts();
}
