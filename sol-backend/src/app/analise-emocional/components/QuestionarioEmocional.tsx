"use client";

import { useState } from "react";

interface EmocaoSlider {
  id: "sadness" | "joy" | "anger" | "fear" | "surprise";
  label: string;
  descricao: string;
  icone: string;
}

const emocoes: EmocaoSlider[] = [
  {
    id: "sadness",
    label: "Tristeza",
    descricao: "Como você se sente em relação à tristeza?",
    icone: "😢",
  },
  {
    id: "joy",
    label: "Alegria",
    descricao: "Qual é seu nível de alegria neste momento?",
    icone: "😊",
  },
  {
    id: "anger",
    label: "Raiva",
    descricao: "Como está seu nível de raiva?",
    icone: "😠",
  },
  {
    id: "fear",
    label: "Medo",
    descricao: "Qual é seu nível de medo ou ansiedade?",
    icone: "😨",
  },
  {
    id: "surprise",
    label: "Surpresa",
    descricao: "Como você avalia seu sentimento de surpresa?",
    icone: "😮",
  },
];

export default function QuestionarioEmocional() {
  const [emocoes_valores, setEmocoes_valores] = useState<
    Record<string, number>
  >({
    sadness: 5,
    joy: 5,
    anger: 5,
    fear: 5,
    surprise: 5,
  });
  const [carregando, setCarregando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [recomendacoes, setRecomendacoes] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleSliderChange = (id: string, valor: number) => {
    setEmocoes_valores((prev) => ({
      ...prev,
      [id]: valor,
    }));
  };

  const finalizarQuestionario = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emocoes_valores),
      });

      if (!response.ok) {
        throw new Error("Erro ao analisar emoções");
      }

      const dados = await response.json();
      setRecomendacoes(dados);
      setFinalizado(true);
    } catch (erro) {
      const mensagem =
        erro instanceof Error ? erro.message : "Erro desconhecido";
      setErro(mensagem);
      console.error("Erro ao enviar análise emocional:", mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const reiniciarQuestionario = () => {
    setEmocoes_valores({
      sadness: 5,
      joy: 5,
      anger: 5,
      fear: 5,
      surprise: 5,
    });
    setFinalizado(false);
    setRecomendacoes(null);
    setErro(null);
  };

  if (finalizado && recomendacoes) {
    return (
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={{ color: "#16a34a", marginBottom: "8px" }}>
            Análise Emocional Concluída! 🎵
          </h2>
          <p style={styles.cardDescription}>
            Aqui estão as músicas recomendadas para você
          </p>
        </div>

        <div style={styles.cardContent}>
          <div style={styles.mutedBox}>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              <strong>Intenção Detected:</strong>{" "}
              {recomendacoes.fuzzy_output?.intention || "N/A"}
            </p>
            <p style={{ fontSize: "14px" }}>
              <strong>Confiança:</strong>{" "}
              {Math.round((recomendacoes.confidence || 0) * 100)}%
            </p>
          </div>

          <div>
            <h3 style={{ fontWeight: "600", marginBottom: "12px" }}>
              Gêneros Recomendados
            </h3>
            <div style={styles.genresContainer}>
              {recomendacoes.suggested_genres?.map((genero: string) => (
                <span key={genero} style={styles.genreTag}>
                  {genero}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontWeight: "600", marginBottom: "12px" }}>
              Faixas Sugeridas
            </h3>
            <div style={styles.tracksList}>
              {recomendacoes.tracks
                ?.slice(0, 5)
                .map((faixa: any, idx: number) => (
                  <div key={idx} style={styles.trackItem}>
                    <p style={{ fontWeight: "500", fontSize: "14px" }}>
                      {faixa.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "#666" }}>
                      {faixa.artist}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {erro && <div style={styles.errorBox}>⚠️ {erro}</div>}
        </div>

        <div style={styles.cardFooter}>
          <button onClick={reiniciarQuestionario} style={styles.buttonOutline}>
            Nova Análise
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={{ marginBottom: "8px" }}>Análise Emocional 🎭</h2>
        <p style={styles.cardDescription}>
          Indique seu nível emocional de 0 a 10 para cada sentimento
        </p>
      </div>

      <div style={styles.cardContent}>
        {emocoes.map((emocao) => (
          <div key={emocao.id} style={styles.emocaoContainer}>
            <div style={styles.emocaoHeader}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ fontSize: "32px" }}>{emocao.icone}</span>
                <div>
                  <label style={{ fontSize: "16px", fontWeight: "600" }}>
                    {emocao.label}
                  </label>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {emocao.descricao}
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#2563eb",
                  minWidth: "48px",
                  textAlign: "right",
                }}
              >
                {emocoes_valores[emocao.id]}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              value={emocoes_valores[emocao.id]}
              onChange={(e) =>
                handleSliderChange(emocao.id, parseInt(e.target.value))
              }
              style={styles.slider}
            />

            <div style={styles.sliderLabels}>
              <span>Nada</span>
              <span>Bastante</span>
              <span>Máximo</span>
            </div>
          </div>
        ))}

        {erro && <div style={styles.errorBox}>⚠️ {erro}</div>}
      </div>

      <div style={styles.cardFooter}>
        <button onClick={reiniciarQuestionario} style={styles.buttonOutline}>
          Resetar
        </button>

        <button
          onClick={finalizarQuestionario}
          disabled={carregando}
          style={{ ...styles.buttonPrimary, opacity: carregando ? 0.5 : 1 }}
        >
          {carregando ? "Analisando..." : "Analisar Emoções"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: "672px",
    margin: "0 auto",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  cardHeader: {
    padding: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  cardContent: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  cardFooter: {
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    borderTop: "1px solid #e5e7eb",
  },
  emocaoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  emocaoHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slider: {
    width: "100%",
    height: "8px",
    backgroundColor: "#d1d5db",
    borderRadius: "4px",
    appearance: "none",
    cursor: "pointer",
    accentColor: "#2563eb",
  },
  sliderLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#6b7280",
    paddingLeft: "4px",
    paddingRight: "4px",
  },
  buttonPrimary: {
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  buttonOutline: {
    padding: "10px 16px",
    backgroundColor: "transparent",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  mutedBox: {
    backgroundColor: "#f3f4f6",
    padding: "16px",
    borderRadius: "6px",
  },
  genresContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  genreTag: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "8px 12px",
    borderRadius: "9999px",
    fontSize: "14px",
  },
  tracksList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  trackItem: {
    padding: "8px",
    backgroundColor: "#f9fafb",
    borderRadius: "4px",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
  },
};
