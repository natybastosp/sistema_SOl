/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // Arquivo HTML principal
    "./src/**/*.{js,ts,jsx,tsx}", // Todos os arquivos React
    "./src/**/*.{vue,html}", // Suporte para outras tecnologias (futuro-proof)
  ],

  theme: {
    extend: {
      // === SISTEMA DE CORES TERAPÊUTICAS ===
      colors: {
        // Paleta Principal "SOL" - Baseada na metáfora de esperança e calor
        // Cada tom foi escolhido para evocar sentimentos específicos
        sol: {
          // Tons mais claros - para backgrounds suaves que não cansam a vista
          50: "#fff7ed", // Quase branco com sussurro de laranja - para backgrounds grandes
          100: "#ffedd5", // Muito sutil - para cards em destaque suave
          200: "#fed7aa", // Delicado - para hover states que não assustam
          300: "#fdba74", // Visível mas gentil - para elementos secundários

          // Tons principais - o coração da identidade visual
          400: "#fb923c", // Laranja acolhedor - cor principal da marca
          500: "#f97316", // Laranja vibrante - para call-to-actions importantes
          600: "#ea580c", // Laranja confiável - para hover de botões primários

          // Tons escuros - para contraste e legibilidade
          700: "#c2410c", // Para textos sobre backgrounds claros
          800: "#9a3412", // Para textos que precisam se destacar
          900: "#7c2d12", // Tom mais escuro - para máximo contraste
        },

        tristeza: {
          // Background suave que não deprime mais
          background: "#dbeafe", // Azul muito claro para seções
          card: "#bfdbfe", // Azul claro para cards individuais

          // Cor principal - confiável mas não fria
          primary: "#3b82f6", // Azul que transmite confiança
          hover: "#2563eb", // Azul um pouco mais intenso para interação

          // Para textos e ícones - legível mas empático
          text: "#1e40af", // Azul escuro para leitura confortável
          icon: "#1d4ed8", // Azul para ícones que precisam se destacar
        },

        ansiedade: {
          background: "#fed7aa", // Laranja suave que aquece sem alarmar
          card: "#fdba74", // Tom médio para elementos em destaque
          primary: "#f97316", // Laranja principal - energético mas controlado
          hover: "#ea580c", // Laranja mais forte para feedback de interação
          text: "#c2410c", // Laranja escuro para textos legíveis
          icon: "#9a3412", // Tom escuro para ícones pequenos
        },

        alegria: {
          background: "#fef3c7", // Amarelo suave como luz solar filtrada
          card: "#fde68a", // Amarelo mais presente mas não agressivo
          primary: "#f59e0b", // Amarelo dourado - otimista e elegante
          hover: "#d97706", // Amarelo mais intenso para interações
          text: "#92400e", // Amarelo escuro para leitura
          icon: "#78350f", // Tom escuro para contraste adequado
        },
        raiva: {
          background: "#fecaca", // Vermelho muito suave - não ameaçador
          card: "#fca5a5", // Vermelho claro para elementos individuais
          primary: "#ef4444", // Vermelho assertivo mas não agressivo
          hover: "#dc2626", // Vermelho mais forte para feedback
          text: "#b91c1c", // Vermelho escuro para textos
          icon: "#991b1b", // Vermelho muito escuro para ícones
        },

        calma: {
          background: "#d1fae5", // Verde suave como folhagem clara
          card: "#a7f3d0", // Verde presente mas relaxante
          primary: "#10b981", // Verde equilibrado - nem muito escuro nem claro
          hover: "#059669", // Verde mais intenso para interação
          text: "#047857", // Verde escuro para leitura
          icon: "#065f46", // Verde muito escuro para contraste
        },

        // === CORES NEUTRAS REFINADAS ===
        // Sistema de cinzas mais sofisticado que o padrão do Tailwind
        neutral: {
          // Backgrounds e superfícies
          0: "#ffffff", // Branco puro - para fundos importantes
          25: "#fafafa", // Quase branco - fundo da aplicação
          50: "#f5f5f5", // Cinza muito claro - fundos alternativos
          100: "#f0f0f0", // Cinza claro - para seções separadas
          200: "#e5e5e5", // Border padrão - visível mas suave
          300: "#d4d4d4", // Border mais forte - para elementos importantes
          400: "#a3a3a3", // Border de destaque
          500: "#737373", // Texto secundário - informações de apoio
          600: "#525252", // Texto principal - maior parte do conteúdo
          700: "#404040", // Texto importante - headings e destaques
          800: "#262626", // Texto de máxima importância - títulos principais
          900: "#171717", // Texto de máximo contraste - quando precisar de força total
        },

        // === CORES DE SISTEMA (Feedback) ===
        // Para mensagens de sucesso, erro, aviso, etc.
        feedback: {
          // Sucesso - verde diferente do "calma" para distinguir contextos
          success: {
            light: "#d1fae5",
            DEFAULT: "#10b981",
            dark: "#047857",
          },

          // Aviso - amarelo mais neutro que o da "alegria"
          warning: {
            light: "#fef3c7",
            DEFAULT: "#f59e0b",
            dark: "#d97706",
          },

          // Erro - vermelho mais técnico que o da "raiva"
          error: {
            light: "#fee2e2",
            DEFAULT: "#ef4444",
            dark: "#dc2626",
          },

          // Informação - azul mais neutro que o da "tristeza"
          info: {
            light: "#dbeafe",
            DEFAULT: "#3b82f6",
            dark: "#1d4ed8",
          },
        },
      },

      // === SISTEMA DE ESPAÇAMENTO HARMONIOSO ===
      // Baseado em múltiplos de 4px para consistência visual
      spacing: {
        // Espaçamentos pequenos - para detalhes e ajustes finos
        0.5: "0.125rem", // 2px - para ajustes microscópicos
        1.5: "0.375rem", // 6px - espaçamento pequeno mas visível
        2.5: "0.625rem", // 10px - espaçamento pequeno-médio
        3.5: "0.875rem", // 14px - bom para padding interno de elementos pequenos

        // Espaçamentos médios - para a maioria dos layouts
        4.5: "1.125rem", // 18px - espaçamento confortável
        5.5: "1.375rem", // 22px - espaçamento generoso
        6.5: "1.625rem", // 26px - para separações mais evidentes
        7.5: "1.875rem", // 30px - espaçamento grande mas não exagerado

        // Espaçamentos grandes - para seções e layouts principais
        18: "4.5rem", // 72px - separação entre seções importantes
        22: "5.5rem", // 88px - para headers e areas de destaque
        26: "6.5rem", // 104px - separação muito evidente
        30: "7.5rem", // 120px - para layouts especiais
      },

      // === TIPOGRAFIA OTIMIZADA PARA LEITURA ===
      // Tamanhos e heights que facilitam a leitura, especialmente importante
      // para usuários que podem estar em estado emocional vulnerável
      fontSize: {
        // Tamanhos pequenos - para metadados e labels
        "2xs": ["0.625rem", { lineHeight: "0.75rem", letterSpacing: "0.05em" }], // 10px
        xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.025em" }], // 12px

        // Tamanhos padrão - para corpo de texto
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px - texto pequeno mas legível
        base: ["1rem", { lineHeight: "1.5rem" }], // 16px - tamanho base, ideal para leitura
        lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px - texto destacado

        // Tamanhos grandes - para títulos e elementos de destaque
        xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px - subtítulos
        "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px - títulos de seção
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px - títulos importantes
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px - títulos de página

        // Tamanhos especiais - para momentos de impacto
        "5xl": ["3rem", { lineHeight: "1.2" }], // 48px - títulos hero
        "6xl": ["3.75rem", { lineHeight: "1.1" }], // 60px - para momentos especiais
      },

      // === SISTEMA DE SOMBRAS TERAPÊUTICAS ===
      // Sombras que criam profundidade sem ser agressivas
      boxShadow: {
        // Sombras básicas - para criar hierarquia visual suave
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // Sombra quase imperceptível
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)", // Sombra sutil
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // Sombra padrão
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // Sombra elevada
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", // Sombra forte

        // Sombras especiais - para elementos únicos
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)", // Para cards padrão
        "card-hover":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // Cards em hover
        player: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", // Para o player de música

        // Sombras emocionais - com cor relacionada à emoção
        tristeza: "0 4px 6px -1px rgba(59, 130, 246, 0.2)", // Sombra azul suave
        ansiedade: "0 4px 6px -1px rgba(251, 146, 60, 0.2)", // Sombra laranja suave
        alegria: "0 4px 6px -1px rgba(245, 158, 11, 0.2)", // Sombra amarela suave
        raiva: "0 4px 6px -1px rgba(239, 68, 68, 0.2)", // Sombra vermelha suave
        calma: "0 4px 6px -1px rgba(16, 185, 129, 0.2)", // Sombra verde suave

        // Sombras de foco - para acessibilidade
        focus: "0 0 0 3px rgba(251, 146, 60, 0.5)", // Foco padrão laranja
        "focus-blue": "0 0 0 3px rgba(59, 130, 246, 0.5)", // Foco azul para contextos específicos
      },

      // === ANIMAÇÕES TERAPÊUTICAS ===
      // Animações que transmitem calma e não causam ansiedade
      animation: {
        // Animações suaves para transições
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)", // Entrada suave
        "fade-out": "fadeOut 0.3s cubic-bezier(0.16, 1, 0.3, 1)", // Saída suave
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)", // Desliza para cima
        "slide-down": "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)", // Desliza para baixo

        // Animações específicas para elementos emocionais
        "emotion-pulse":
          "emotionPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", // Pulse suave
        "heart-beat": "heartBeat 1.5s ease-in-out infinite", // Batimento cardíaco suave

        // Animações para música
        "music-wave": "musicWave 1.5s ease-in-out infinite", // Ondas sonoras
        "music-note": "musicNote 2s ease-in-out infinite", // Nota musical flutuante

        // Animações de loading que não causam ansiedade
        "spin-slow": "spin 2s linear infinite", // Rotação lenta
        "bounce-gentle": "bounceGentle 2s infinite", // Bounce muito suave
        breathe: "breathe 4s ease-in-out infinite", // Respiração (para exercícios)
      },

      // === KEYFRAMES PERSONALIZADOS ===
      // As "receitas" das animações customizadas
      keyframes: {
        // Fade suave
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },

        // Slides direcionais
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        // Pulse emocional - mais suave que o padrão
        emotionPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },

        // Batimento cardíaco suave
        heartBeat: {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.1)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.1)" },
          "70%": { transform: "scale(1)" },
        },

        // Ondas musicais
        musicWave: {
          "0%, 100%": { transform: "scaleY(1)" },
          "25%": { transform: "scaleY(1.2)" },
          "50%": { transform: "scaleY(1.5)" },
          "75%": { transform: "scaleY(1.2)" },
        },

        // Bounce muito suave para não causar ansiedade
        bounceGentle: {
          "0%, 100%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(-3%)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },

        // Respiração para exercícios de mindfulness
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
      },

      // === BREAKPOINTS OTIMIZADOS ===
      // Pontos de quebra pensados para dispositivos reais
      screens: {
        xs: "475px", // Phones pequenos (iPhone SE)
        sm: "640px", // Phones grandes e tablets pequenos em portrait
        md: "768px", // Tablets em landscape
        lg: "1024px", // Laptops e desktops pequenos
        xl: "1280px", // Desktops padrão
        "2xl": "1536px", // Telas grandes e ultrawide

        // Breakpoints semânticos para facilitar o uso
        mobile: { max: "767px" }, // Apenas mobile
        tablet: { min: "768px", max: "1023px" }, // Apenas tablet
        desktop: { min: "1024px" }, // Desktop para cima

        // Breakpoints específicos para a aplicação
        "player-mobile": { max: "640px" }, // Para o player de música em mobile
        "emotion-grid": { min: "768px" }, // Para o grid de emoções
      },
    },
  },

  // PLUGINS - Extensões que adicionam funcionalidades
  plugins: [
    // Plugin para formulários mais bonitos automaticamente
    require("@tailwindcss/forms")({
      strategy: "class", // Permite controle manual - importante para não quebrar componentes existentes
    }),

    // Plugin para aspect ratios consistentes
    require("@tailwindcss/aspect-ratio"),

    // Plugin para tipografia rica (se precisar de artigos longos)
    require("@tailwindcss/typography")({
      className: "prose", // Classe personalizada para não conflitar
    }),
  ],

  // CONFIGURAÇÕES AVANÇADAS

  // Mode para purging de CSS não utilizado em produção
  // Muito importante para performance - remove CSS não usado
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    // Classes que podem ser geradas dinamicamente e não devem ser removidas
    safelist: [
      // Cores emocionais que podem ser usadas dinamicamente
      "bg-tristeza-background",
      "bg-ansiedade-background",
      "bg-alegria-background",
      "bg-raiva-background",
      "bg-calma-background",
      // Sombras emocionais
      "shadow-tristeza",
      "shadow-ansiedade",
      "shadow-alegria",
      "shadow-raiva",
      "shadow-calma",
      // Animações que podem ser aplicadas condicionalmente
      "animate-emotion-pulse",
      "animate-heart-beat",
      "animate-breathe",
    ],
  },

  // Configurações experimentais que podem ser úteis
  experimental: {
    // Otimizações para builds mais rápidos
    optimizeUniversalDefaults: true,
  },
};
