import React from "react";
import { Button } from "~/components/ui/button";
import { GENRES } from "~/constants/sol";

// 🎵 TIPOS PARA COMPONENTES DE PREFERÊNCIAS MUSICAIS
export interface MusicPreferences {
  favoriteGenres: string[];
  discoveryWillingness: number;
  emotionalConnection?: string;
  musicalMemories?: string;
  energyPreferences?: Record<string, number>;
  timeOfDayPreferences?: Record<string, string[]>;
}

interface MusicPreferencesContextProps {
  preferences: MusicPreferences;
  updatePreferences: (updates: Partial<MusicPreferences>) => void;
  mode: "registration" | "settings" | "quick-setup";
}

/**
 * 🎼 GenreSelector - Componente Inteligente de Seleção de Gêneros
 *
 * Este componente funciona como um sommelier musical que:
 * - Apresenta gêneros de forma visualmente atrativa
 * - Oferece descrições contextuais para ajudar na escolha
 * - Adapta sua apresentação baseado no contexto (registro vs configurações)
 * - Fornece insights sobre as escolhas para autoconhecimento
 */
export function GenreSelector({
  preferences,
  updatePreferences,
  mode,
}: MusicPreferencesContextProps) {
  const toggleGenre = (genre: string) => {
    const isCurrentlySelected = preferences.favoriteGenres.includes(genre);
    const newGenres = isCurrentlySelected
      ? preferences.favoriteGenres.filter((g) => g !== genre)
      : [...preferences.favoriteGenres, genre];

    updatePreferences({ favoriteGenres: newGenres });
  };

  const getGenreInsight = (genre: string): string => {
    const insights: Record<string, string> = {
      Rock: "Ótimo para energia e motivação",
      Pop: "Perfeito para elevar o humor",
      MPB: "Ideal para reflexão e conexão emocional",
      Sertanejo: "Excelente para nostalgia e conforto",
      Funk: "Fantástico para energia e diversão",
      Jazz: "Perfeito para relaxamento e sofisticação",
      Clássica: "Ideal para foco e tranquilidade",
      Eletrônica: "Ótimo para energia e modernidade",
      Reggae: "Excelente para paz e positividade",
      "Hip Hop": "Perfeito para expressão e atitude",
    };
    return insights[genre] || "Estilo único com características especiais";
  };

  const getSelectionEncouragement = (): string => {
    const count = preferences.favoriteGenres.length;
    if (count === 0)
      return "Selecione os gêneros que mais tocam seu coração 🎵";
    if (count === 1)
      return "Ótimo começo! Sinta-se livre para escolher mais 😊";
    if (count <= 3) return "Excelente! Você tem gostos bem definidos 🌟";
    if (count <= 5) return "Que diversidade musical incrível! 🎨";
    return "Você é um verdadeiro explorador musical! 🚀";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3
          className={`font-semibold mb-2 ${
            mode === "registration"
              ? "text-lg text-gray-800"
              : "text-base text-gray-700"
          }`}
        >
          {mode === "registration"
            ? "Quais gêneros musicais fazem você se sentir bem?"
            : "Seus gêneros musicais favoritos"}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {getSelectionEncouragement()}
        </p>
      </div>

      <div
        className={`grid gap-3 ${
          mode === "quick-setup" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
        }`}
      >
        {GENRES.map((genre) => {
          const isSelected = preferences.favoriteGenres.includes(genre);

          return (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`p-4 rounded-lg border-2 transition-all text-left relative group ${
                isSelected
                  ? "border-orange-500 bg-orange-50 transform scale-105 shadow-md"
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-25 hover:shadow-sm"
              }`}
            >
              {/* Indicador visual de seleção */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  ✓
                </div>
              )}

              <div className="font-medium text-gray-800 mb-1">{genre}</div>
              <div
                className={`text-xs transition-all ${
                  isSelected ? "text-orange-700" : "text-gray-500"
                }`}
              >
                {mode !== "quick-setup" && getGenreInsight(genre)}
              </div>

              {/* Tooltip hover para modo configurações */}
              {mode === "settings" && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {getGenreInsight(genre)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Insight sobre as seleções atuais */}
      {preferences.favoriteGenres.length >= 2 && mode === "registration" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            💡 Insight sobre seus gostos:
          </h4>
          <p className="text-blue-700 text-sm">
            {generateMusicPersonalityInsight(preferences.favoriteGenres)}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * 🔍 DiscoveryWillingnessSlider - Componente de Personalidade Musical
 *
 * Este componente avalia o perfil de descoberta musical da pessoa,
 * oferecendo insights sobre como isso afeta as recomendações.
 */
export function DiscoveryWillingnessSlider({
  preferences,
  updatePreferences,
  mode,
}: MusicPreferencesContextProps) {
  const getDiscoveryPersonality = (level: number): string => {
    if (level <= 3) return "Tradicionalista Musical";
    if (level <= 5) return "Explorador Cauteloso";
    if (level <= 7) return "Aventureiro Musical";
    return "Desbravador Sonoro";
  };

  const getDiscoveryDescription = (level: number): string => {
    if (level <= 3)
      return "Você prefere o conforto das músicas conhecidas e testadas.";
    if (level <= 5)
      return "Você está aberto a novidades, mas gosta de manter alguns clássicos.";
    if (level <= 7)
      return "Você adora descobrir novos artistas e estilos musicais.";
    return "Você é um verdadeiro explorador musical, sempre em busca do próximo som incrível!";
  };

  const getRecommendationImpact = (level: number): string => {
    if (level <= 3) return "Focaremos em variações dos seus gêneros favoritos.";
    if (level <= 5)
      return "Misturaremos favoritos com algumas descobertas cuidadosamente selecionadas.";
    if (level <= 7)
      return "Incluiremos regularmente novas descobertas nas suas playlists.";
    return "Você receberá muitas recomendações de artistas emergentes e estilos únicos!";
  };

  return (
    <div className="space-y-4">
      <div>
        <h3
          className={`font-semibold mb-2 ${
            mode === "registration"
              ? "text-lg text-gray-800"
              : "text-base text-gray-700"
          }`}
        >
          O quanto você gosta de descobrir músicas novas?
        </h3>
        <p className="text-sm text-gray-600">
          Isso nos ajuda a balancear o familiar com o novo nas suas
          recomendações.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-800">
            {getDiscoveryPersonality(preferences.discoveryWillingness)}
          </span>
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {preferences.discoveryWillingness}/10
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-3">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Só conhecidas
          </span>
          <input
            type="range"
            min="1"
            max="10"
            value={preferences.discoveryWillingness}
            onChange={(e) =>
              updatePreferences({
                discoveryWillingness: Number(e.target.value),
              })
            }
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${preferences.discoveryWillingness * 10}%, #e5e7eb ${preferences.discoveryWillingness * 10}%, #e5e7eb 100%)`,
            }}
          />
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Adoro descobrir
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            <strong>Seu perfil:</strong>{" "}
            {getDiscoveryDescription(preferences.discoveryWillingness)}
          </p>
          <p className="text-sm text-blue-700">
            <strong>Como isso afeta suas recomendações:</strong>{" "}
            {getRecommendationImpact(preferences.discoveryWillingness)}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 💭 EmotionalConnectionInput - Componente de Conexão Emocional
 *
 * Permite que a pessoa reflita sobre sua relação pessoal com a música,
 * oferecendo uma experiência quase terapêutica de autoconhecimento.
 */
export function EmotionalConnectionInput({
  preferences,
  updatePreferences,
  mode,
}: MusicPreferencesContextProps) {
  const getSuggestionPrompts = (): string[] => {
    return [
      "Música clássica me ajuda a me concentrar",
      "Rock me dá energia para enfrentar desafios",
      "MPB me faz sentir nostalgia e aconchego",
      "Jazz me relaxa após dias estressantes",
      "Pop me anima e eleva meu humor",
      "Sertanejo me conecta com minhas raízes",
    ];
  };

  const getCharacterCount = (): {
    current: number;
    max: number;
    percentage: number;
  } => {
    const current = preferences.emotionalConnection?.length || 0;
    const max = 300;
    return { current, max, percentage: (current / max) * 100 };
  };

  const charCount = getCharacterCount();

  return (
    <div className="space-y-4">
      <div>
        <h3
          className={`font-semibold mb-2 ${
            mode === "registration"
              ? "text-lg text-gray-800"
              : "text-base text-gray-700"
          }`}
        >
          Como a música afeta suas emoções?
        </h3>
        <p className="text-sm text-gray-600">
          Compartilhar isso nos ajuda a entender melhor como você se conecta com
          diferentes estilos.
        </p>
      </div>

      <div>
        <textarea
          value={preferences.emotionalConnection || ""}
          onChange={(e) =>
            updatePreferences({ emotionalConnection: e.target.value })
          }
          placeholder="Ex: 'Música clássica me acalma quando estou ansioso', 'Rock me dá energia para trabalhar'..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={4}
          maxLength={300}
        />

        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500">
            {charCount.current === 0 &&
              "Opcional, mas muito útil para personalização"}
          </div>
          <div
            className={`text-xs ${
              charCount.percentage > 90
                ? "text-red-500"
                : charCount.percentage > 70
                  ? "text-orange-500"
                  : "text-gray-400"
            }`}
          >
            {charCount.current}/{charCount.max}
          </div>
        </div>
      </div>

      {/* Sugestões se o campo estiver vazio */}
      {(!preferences.emotionalConnection ||
        preferences.emotionalConnection.length < 10) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">
            💡 Algumas ideias para te inspirar:
          </h4>
          <div className="space-y-1">
            {getSuggestionPrompts()
              .slice(0, 3)
              .map((prompt, index) => (
                <button
                  key={index}
                  onClick={() =>
                    updatePreferences({
                      emotionalConnection:
                        (preferences.emotionalConnection || "") +
                        (preferences.emotionalConnection ? ". " : "") +
                        prompt,
                    })
                  }
                  className="block text-sm text-yellow-700 hover:text-yellow-900 hover:underline"
                >
                  • "{prompt}"
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 📚 MusicalMemoriesInput - Componente de Memórias Musicais
 *
 * Explora as conexões profundas entre música e memórias pessoais,
 * criando um perfil emocional rico para recomendações mais precisas.
 */
export function MusicalMemoriesInput({
  preferences,
  updatePreferences,
  mode,
}: MusicPreferencesContextProps) {
  const getMemoryCategories = () => {
    return [
      {
        category: "Momentos Especiais",
        examples: ["música do casamento", "formatura", "nascimento dos filhos"],
      },
      {
        category: "Lembranças da Infância",
        examples: ["canções de ninar", "músicas dos pais", "desenhos animados"],
      },
      {
        category: "Conquistas Pessoais",
        examples: [
          "música que te motivou",
          "trilha de superação",
          "hino pessoal",
        ],
      },
      {
        category: "Conexões com Pessoas",
        examples: ["música de um ente querido", "banda favorita com amigos"],
      },
    ];
  };

  return (
    <div className="space-y-4">
      <div>
        <h3
          className={`font-semibold mb-2 ${
            mode === "registration"
              ? "text-lg text-gray-800"
              : "text-base text-gray-700"
          }`}
        >
          Tem alguma música ou momento musical especial?
        </h3>
        <p className="text-sm text-gray-600">
          Memórias musicais nos ajudam a entender o que realmente toca seu
          coração.
        </p>
      </div>

      <div>
        <textarea
          value={preferences.musicalMemories || ""}
          onChange={(e) =>
            updatePreferences({ musicalMemories: e.target.value })
          }
          placeholder="Ex: 'A música do meu casamento sempre me emociona', 'Bach me lembra do meu avô pianista'..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={4}
          maxLength={300}
        />

        <div className="text-xs text-gray-400 mt-2 text-right">
          {preferences.musicalMemories?.length || 0}/300
        </div>
      </div>

      {/* Inspiração por categorias */}
      {(!preferences.musicalMemories ||
        preferences.musicalMemories.length < 20) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-3">
            🎵 Que tipo de memórias você tem?
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {getMemoryCategories()
              .slice(0, 4)
              .map((cat, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-purple-700 mb-1">
                    {cat.category}:
                  </div>
                  <div className="text-purple-600 text-xs">
                    {cat.examples.join(", ")}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 📊 PreferencesPreview - Componente de Resumo Inteligente
 *
 * Oferece uma visão consolidada das preferências musicais,
 * com insights sobre como elas influenciarão as recomendações.
 */
export function PreferencesPreview({
  preferences,
  mode,
}: Omit<MusicPreferencesContextProps, "updatePreferences">) {
  const generatePersonalityProfile = (): string => {
    const genres = preferences.favoriteGenres;
    const discovery = preferences.discoveryWillingness;

    if (genres.length === 0) return "Ainda descobrindo seus gostos musicais";

    let profile = "";

    // Análise de diversidade
    if (genres.length === 1) {
      profile += `Focado em ${genres[0]}, `;
    } else if (genres.length <= 3) {
      profile += `Gostos bem definidos (${genres.slice(0, 2).join(", ")}), `;
    } else {
      profile += "Eclético e diverso, ";
    }

    // Análise de descoberta
    if (discovery <= 3) {
      profile += "prefere o familiar e testado.";
    } else if (discovery <= 7) {
      profile += "equilibra conhecido com descobertas.";
    } else {
      profile += "sempre em busca de novos sons.";
    }

    return profile;
  };

  const getRecommendationStrategy = (): string => {
    const genres = preferences.favoriteGenres;
    const discovery = preferences.discoveryWillingness;

    if (genres.length === 0)
      return "Exploraremos juntos diferentes estilos para encontrar o que funciona melhor para você.";

    let strategy = `Basearemos suas recomendações em ${genres.slice(0, 3).join(", ")}`;

    if (genres.length > 3) {
      strategy += ` e ${genres.length - 3} outros gêneros`;
    }

    if (discovery > 5) {
      strategy += ", incluindo descobertas musicais regulares";
    } else {
      strategy += ", focando em variações dos seus favoritos";
    }

    strategy += ".";
    return strategy;
  };

  if (preferences.favoriteGenres.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
        🎭 Seu Perfil Musical
      </h4>

      <div className="space-y-3">
        <div>
          <h5 className="font-medium text-blue-700 mb-1">
            Personalidade Musical:
          </h5>
          <p className="text-blue-600 text-sm">
            {generatePersonalityProfile()}
          </p>
        </div>

        <div>
          <h5 className="font-medium text-blue-700 mb-1">
            Nossa Estratégia para Você:
          </h5>
          <p className="text-blue-600 text-sm">{getRecommendationStrategy()}</p>
        </div>

        {(preferences.emotionalConnection || preferences.musicalMemories) && (
          <div>
            <h5 className="font-medium text-blue-700 mb-1">
              Conexão Emocional:
            </h5>
            <p className="text-blue-600 text-sm">
              Suas descrições pessoais nos ajudarão a criar experiências ainda
              mais significativas e terapêuticas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 🛠️ FUNÇÕES AUXILIARES PARA INSIGHTS MUSICAIS

/**
 * Gera insights sobre a personalidade musical baseada nos gêneros selecionados
 */
function generateMusicPersonalityInsight(genres: string[]): string {
  const genrePersonalities: Record<string, string[]> = {
    Rock: ["energético", "determinado", "expressivo"],
    Pop: ["otimista", "social", "versátil"],
    MPB: ["reflexivo", "cultural", "emocional"],
    Sertanejo: ["nostálgico", "familiar", "tradicional"],
    Funk: ["dinâmico", "festivo", "urbano"],
    Jazz: ["sofisticado", "contemplativo", "criativo"],
    Clássica: ["analítico", "calmo", "intelectual"],
    Eletrônica: ["moderno", "inovador", "tecnológico"],
    Reggae: ["pacífico", "espiritual", "descontraído"],
    "Hip Hop": ["autêntico", "consciente", "urbano"],
  };

  const traits = new Set<string>();
  genres.forEach((genre) => {
    if (genrePersonalities[genre]) {
      genrePersonalities[genre].forEach((trait) => traits.add(trait));
    }
  });

  if (traits.size === 0) return "Você tem gostos únicos e interessantes!";

  const traitsList = Array.from(traits);
  if (traitsList.length <= 2) {
    return `Você parece ser uma pessoa ${traitsList.join(" e ")}.`;
  } else {
    return `Você parece ser uma pessoa ${traitsList.slice(0, -1).join(", ")} e ${traitsList[traitsList.length - 1]}.`;
  }
}
