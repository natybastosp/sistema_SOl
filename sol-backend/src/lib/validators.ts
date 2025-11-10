import { z } from "zod";

/**
 * Validação de Login
 */
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validação de Registro
 */
export const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Senhas não correspondem",
    path: ["passwordConfirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Validação de Análise Emocional
 */
export const emotionalAnalysisSchema = z
  .object({
    // Novo: aceitar 4 emoções (sem surprise)
    sadness: z.number().min(0).max(10).optional(),
    joy: z.number().min(0).max(10).optional(),
    anger: z.number().min(0).max(10).optional(),
    fear: z.number().min(0).max(10).optional(),

    // Legacy: para compatibilidade
    estadoEmocional: z.number().min(0).max(10).optional(),

    generoPreferido: z.string().optional(),
    energia: z.number().min(1).max(10).optional(),
    valencia: z.number().min(1).max(10).optional(),
  })
  .refine(
    (data) => {
      // Validação: deve ter estadoEmocional OU as 4 emoções
      const tem4Emocoes =
        data.sadness !== undefined &&
        data.joy !== undefined &&
        data.anger !== undefined &&
        data.fear !== undefined;
      const temEstado = data.estadoEmocional !== undefined;
      return tem4Emocoes || temEstado;
    },
    {
      message:
        "Deve fornecer estadoEmocional ou as 4 emoções (sadness, joy, anger, fear)",
    }
  );

export type EmotionalAnalysisInput = z.infer<typeof emotionalAnalysisSchema>;

/**
 * Validação de Recomendação
 */
export const recommendationSchema = z.object({
  emotionalData: emotionalAnalysisSchema,
  preferences: z
    .object({
      maxSongs: z.number().min(1).max(100).default(20),
      includeSpotify: z.boolean().default(true),
    })
    .optional(),
});

export type RecommendationInput = z.infer<typeof recommendationSchema>;

/**
 * Validação de Feedback
 */
export const feedbackSchema = z.object({
  playlistId: z.string().uuid("ID da playlist inválido"),
  rating: z.number().min(1).max(5, "Rating entre 1 e 5"),
  comment: z.string().max(500, "Comentário muito longo").optional(),
  helpful: z.boolean().optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

/**
 * Validação de Query Params para Histórico
 */
export const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(30),
  offset: z.coerce.number().min(0).default(0),
  days: z.coerce.number().min(1).default(7),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;
