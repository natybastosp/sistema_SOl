import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import Header from "../Header";
import SunLogo from "../SunLogo";
import { GENRES, EMOTIONS, PAGES } from "~/constants/sol";
import { AuthService } from "~/services/authService";
import type { UserData, AuthState } from "~/types/sol";

interface RegistrationPageProps {
  onRegistrationComplete: (authState: AuthState, userData: UserData) => void;
  onNavigateBack: () => void;
}

/**
 * 🌱 RegistrationPage - A Primeira Consulta Terapêutica Digital
 *
 * Este componente funciona como a primeira sessão com um terapeuta excepcional que:
 * - Faz você se sentir acolhido desde o primeiro momento
 * - Coleta informações de forma natural e conversacional
 * - Oferece insights e validação durante o processo
 * - Já começa a construir esperança e motivação para a jornada
 *
 * Cada step é projetado não apenas para coletar dados, mas para ser
 * terapeuticamente benéfico, fazendo a pessoa se sentir vista,
 * compreendida e otimista sobre as possibilidades de melhoria.
 */
export default function RegistrationPage({
  onRegistrationComplete,
  onNavigateBack,
}: RegistrationPageProps) {
  // 📋 Estados para navegação entre steps
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // 👤 Estados para dados básicos (Step 1)
  const [basicData, setBasicData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
  });

  // 🎵 Estados para preferências musicais (Step 2)
  const [musicPreferences, setMusicPreferences] = useState({
    favoriteGenres: [] as string[],
    discoveryWillingness: 5, // 1-10 scale
    emotionalConnection: "",
    musicalMemories: "",
  });

  // 😊 Estados para perfil emocional (Step 3)
  const [emotionalProfile, setEmotionalProfile] = useState({
    currentEmotions: {} as Record<string, number>,
    primaryConcern: "",
    therapyGoals: [] as string[],
    previousExperience: "",
  });

  // 🎨 Estados para experiência do usuário
  const [validationMessages, setValidationMessages] = useState<
    Record<string, string>
  >({});
  const [encouragementMessage, setEncouragementMessage] = useState("");

  /**
   * 🔍 Validação inteligente em tempo real
   *
   * Como um terapeuta atento que percebe quando você está hesitante
   * e oferece orientação gentil, este efeito monitora os dados
   * inseridos e oferece feedback construtivo em tempo real.
   */
  useEffect(() => {
    const validateCurrentStep = () => {
      const newMessages: Record<string, string> = {};

      if (currentStep === 1) {
        if (basicData.name.length > 0 && basicData.name.length < 2) {
          newMessages.name =
            "Seu nome nos ajuda a personalizar sua experiência 😊";
        }

        if (basicData.email && !basicData.email.includes("@")) {
          newMessages.email =
            "Precisamos de um email válido para manter sua conta segura";
        }

        if (basicData.password.length > 0 && basicData.password.length < 6) {
          newMessages.password =
            "Uma senha mais longa protege melhor suas informações pessoais";
        }

        if (
          basicData.confirmPassword &&
          basicData.password !== basicData.confirmPassword
        ) {
          newMessages.confirmPassword = "As senhas não coincidem";
        }

        if (
          basicData.age &&
          (parseInt(basicData.age) < 13 || parseInt(basicData.age) > 120)
        ) {
          newMessages.age =
            "Precisamos de uma idade válida para personalizar suas recomendações";
        }
      }

      setValidationMessages(newMessages);

      // Mensagens de encorajamento baseadas no progresso
      if (currentStep === 1 && basicData.name && basicData.email) {
        setEncouragementMessage("Ótimo! Já estamos nos conhecendo melhor 🌟");
      } else if (
        currentStep === 2 &&
        musicPreferences.favoriteGenres.length > 0
      ) {
        setEncouragementMessage(
          "Excelente! Seus gostos musicais nos ajudam a criar experiências únicas para você 🎵"
        );
      } else if (
        currentStep === 3 &&
        Object.keys(emotionalProfile.currentEmotions).length > 0
      ) {
        setEncouragementMessage(
          "Obrigado por compartilhar como você se sente. Isso nos permite cuidar melhor de você ❤️"
        );
      }
    };

    validateCurrentStep();
  }, [currentStep, basicData, musicPreferences, emotionalProfile]);

  /**
   * 📈 Navegação inteligente entre steps
   *
   * Como um terapeuta que sabe quando é apropriado aprofundar uma conversa
   * ou quando é melhor passar para o próximo tópico, esta função
   * gerencia a progressão natural através do processo de onboarding.
   */
  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return (
          basicData.name.length >= 2 &&
          basicData.email.includes("@") &&
          basicData.password.length >= 6 &&
          basicData.password === basicData.confirmPassword &&
          basicData.age &&
          parseInt(basicData.age) >= 13 &&
          parseInt(basicData.age) <= 120
        );
      case 2:
        return musicPreferences.favoriteGenres.length > 0;
      case 3:
        return Object.keys(emotionalProfile.currentEmotions).length > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceedToNextStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  /**
   * 🎵 Manipulação inteligente de preferências musicais
   */
  const toggleGenre = (genre: string) => {
    setMusicPreferences((prev) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre],
    }));
  };

  const updateEmotionalState = (emotionKey: string, value: number) => {
    setEmotionalProfile((prev) => ({
      ...prev,
      currentEmotions: {
        ...prev.currentEmotions,
        [emotionKey]: value,
      },
    }));
  };

  /**
   * 🚀 Finalização do registro com integração backend
   *
   * Como o momento final de uma primeira consulta terapêutica onde
   * se estabelece o plano de tratamento e agenda próximos passos.
   */
  const handleRegistration = async () => {
    setIsSubmitting(true);
    setError(undefined);

    try {
      // Consolida todos os dados do registro
      const registrationData = {
        name: basicData.name,
        email: basicData.email,
        password: basicData.password,
        age: parseInt(basicData.age),
        preferences: musicPreferences.favoriteGenres,
        initialEmotionalState: emotionalProfile.currentEmotions,
        // Dados adicionais para personalização avançada
        musicProfile: {
          discoveryWillingness: musicPreferences.discoveryWillingness,
          emotionalConnection: musicPreferences.emotionalConnection,
          musicalMemories: musicPreferences.musicalMemories,
        },
        therapyGoals: emotionalProfile.therapyGoals,
        primaryConcern: emotionalProfile.primaryConcern,
      };

      const result = await AuthService.register(registrationData);

      if (result.success && result.authState && result.userData) {
        onRegistrationComplete(result.authState, result.userData);
      } else {
        setError(result.error || "Erro no registro. Tente novamente.");
      }
    } catch (error) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 🎨 Renderização do Step 1: Conhecendo Você
   */
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Vamos nos conhecer! 👋
        </h2>
        <p className="text-gray-600">
          Conte-me um pouco sobre você para que eu possa personalizar sua
          experiência
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Como você gostaria de ser chamado?
          </label>
          <input
            type="text"
            value={basicData.name}
            onChange={(e) =>
              setBasicData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Seu nome ou apelido"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {validationMessages.name && (
            <p className="text-sm text-orange-600 mt-1">
              {validationMessages.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qual sua idade?
          </label>
          <input
            type="number"
            value={basicData.age}
            onChange={(e) =>
              setBasicData((prev) => ({ ...prev, age: e.target.value }))
            }
            placeholder="Sua idade"
            min="13"
            max="120"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Isso nos ajuda a escolher músicas adequadas para você
          </p>
          {validationMessages.age && (
            <p className="text-sm text-orange-600 mt-1">
              {validationMessages.age}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seu email
        </label>
        <input
          type="email"
          value={basicData.email}
          onChange={(e) =>
            setBasicData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="seu@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Manteremos suas informações completamente privadas e seguras
        </p>
        {validationMessages.email && (
          <p className="text-sm text-orange-600 mt-1">
            {validationMessages.email}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Crie uma senha
          </label>
          <input
            type="password"
            value={basicData.password}
            onChange={(e) =>
              setBasicData((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {validationMessages.password && (
            <p className="text-sm text-orange-600 mt-1">
              {validationMessages.password}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirme sua senha
          </label>
          <input
            type="password"
            value={basicData.confirmPassword}
            onChange={(e) =>
              setBasicData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            placeholder="Digite a senha novamente"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {validationMessages.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">
              {validationMessages.confirmPassword}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * 🎵 Renderização do Step 2: Descobrindo Seus Gostos Musicais
   */
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Conte-me sobre seus gostos musicais 🎵
        </h2>
        <p className="text-gray-600">
          Conhecer suas preferências musicais me ajuda a criar experiências
          perfeitas para você
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Quais gêneros musicais você mais gosta? (Selecione quantos quiser)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                musicPreferences.favoriteGenres.includes(genre)
                  ? "border-orange-500 bg-orange-50 transform scale-105"
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-25"
              }`}
            >
              <div className="font-medium text-gray-800">{genre}</div>
              <div className="text-sm text-gray-500">
                {getGenreDescription(genre)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          O quanto você gosta de descobrir músicas novas? (1-10)
        </h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Prefiro conhecidas</span>
          <input
            type="range"
            min="1"
            max="10"
            value={musicPreferences.discoveryWillingness}
            onChange={(e) =>
              setMusicPreferences((prev) => ({
                ...prev,
                discoveryWillingness: Number(e.target.value),
              }))
            }
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-500">Adoro descobrir</span>
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium min-w-[3rem] text-center">
            {musicPreferences.discoveryWillingness}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Como a música afeta suas emoções? (Opcional)
        </h3>
        <textarea
          value={musicPreferences.emotionalConnection}
          onChange={(e) =>
            setMusicPreferences((prev) => ({
              ...prev,
              emotionalConnection: e.target.value,
            }))
          }
          placeholder="Ex: 'Música clássica me acalma', 'Rock me dá energia para enfrentar desafios'..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={3}
          maxLength={300}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Tem alguma música ou momento musical especial? (Opcional)
        </h3>
        <textarea
          value={musicPreferences.musicalMemories}
          onChange={(e) =>
            setMusicPreferences((prev) => ({
              ...prev,
              musicalMemories: e.target.value,
            }))
          }
          placeholder="Ex: 'A música do meu casamento sempre me emociona', 'Bach me ajuda a me concentrar'..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={3}
          maxLength={300}
        />
      </div>
    </div>
  );

  /**
   * 😊 Renderização do Step 3: Entendendo Como Você se Sente
   */
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Como você tem se sentido ultimamente? 💙
        </h2>
        <p className="text-gray-600">
          Entender seu estado emocional me permite oferecer o suporte mais
          adequado
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Selecione as emoções que você tem sentido e sua intensidade (1-10)
        </h3>
        <div className="space-y-4">
          {EMOTIONS.map((emotion) => (
            <div key={emotion.key} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${emotion.color}`}
                  ></div>
                  <span className="font-medium text-gray-800">
                    {emotion.name}
                  </span>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium min-w-[3rem] text-center">
                  {emotionalProfile.currentEmotions[emotion.key] || 0}
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="10"
                value={emotionalProfile.currentEmotions[emotion.key] || 0}
                onChange={(e) =>
                  updateEmotionalState(emotion.key, Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Não sinto</span>
                <span>Sinto muito</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          O que mais tem te preocupado ou incomodado? (Opcional)
        </h3>
        <textarea
          value={emotionalProfile.primaryConcern}
          onChange={(e) =>
            setEmotionalProfile((prev) => ({
              ...prev,
              primaryConcern: e.target.value,
            }))
          }
          placeholder="Ex: 'Estresse no trabalho', 'Ansiedade social', 'Dificuldade para dormir'..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={3}
          maxLength={200}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          O que você espera conseguir com a musicoterapia?
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            "Reduzir ansiedade",
            "Melhorar o humor",
            "Relaxar mais",
            "Ter mais energia",
            "Dormir melhor",
            "Focar melhor",
            "Lidar com estresse",
            "Autoconhecimento",
          ].map((goal) => (
            <button
              key={goal}
              onClick={() => {
                const isSelected = emotionalProfile.therapyGoals.includes(goal);
                setEmotionalProfile((prev) => ({
                  ...prev,
                  therapyGoals: isSelected
                    ? prev.therapyGoals.filter((g) => g !== goal)
                    : [...prev.therapyGoals, goal],
                }));
              }}
              className={`p-3 text-left rounded-lg border transition-all ${
                emotionalProfile.therapyGoals.includes(goal)
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * 🎨 Renderização principal com navegação inteligente
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <Header pageTitle={`Cadastro - Passo ${currentStep} de 3`} />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Indicador de progresso visual */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <SunLogo size="medium" />
            </div>

            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? "bg-orange-500 text-white"
                        : step < currentStep
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step < currentStep ? "✓" : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 ${
                        step < currentStep ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conteúdo principal baseado no step */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Mensagem de encorajamento */}
            {encouragementMessage && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm text-center">
                  {encouragementMessage}
                </p>
              </div>
            )}

            {/* Exibição de erro */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Navegação entre steps */}
            <div className="mt-8 flex justify-between">
              <Button
                onClick={currentStep === 1 ? onNavigateBack : prevStep}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                ← {currentStep === 1 ? "Voltar ao início" : "Passo anterior"}
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceedToNextStep() || isSubmitting}
                  className="bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  Próximo passo →
                </Button>
              ) : (
                <Button
                  onClick={handleRegistration}
                  disabled={!canProceedToNextStep() || isSubmitting}
                  className="bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Criando sua conta...
                    </div>
                  ) : (
                    "🎉 Finalizar cadastro"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🛠️ FUNÇÕES AUXILIARES PARA PERSONALIZAÇÃO

/**
 * Oferece descrições contextuais dos gêneros musicais
 */
function getGenreDescription(genre: string): string {
  const descriptions: Record<string, string> = {
    Rock: "Energia e atitude",
    Pop: "Melodias cativantes",
    MPB: "Poesia brasileira",
    Sertanejo: "Coração brasileiro",
    Funk: "Ritmo e diversão",
    Jazz: "Improvisação e suavidade",
    Clássica: "Elegância atemporal",
    Eletrônica: "Modernidade e batida",
    Reggae: "Tranquilidade e positividade",
    "Hip Hop": "Expressão e verdade",
  };

  return descriptions[genre] || "Estilo único";
}
