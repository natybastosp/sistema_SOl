/**
 * Serviço Spotify v2 com Authorization Code Flow
 * User faz login diretamente no Spotify
 */

export async function initiateSpotifyAuthV2(): Promise<void> {
  try {
    // Obter token JWT do SoL
    const solToken = localStorage.getItem("sol-auth-token");
    if (!solToken) {
      throw new Error("Não autenticado - faça login no SoL primeiro");
    }

    // Solicitar URL de autorização ao backend
    console.log("🔄 Solicitando URL de autorização...");
    const response = await fetch("/api/spotify/auth/authorize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${solToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Falha ao gerar URL de autorização");
    }

    const data = (await response.json()) as {
      success: boolean;
      data: { authUrl: string; stateToken: string };
    };

    if (!data.success || !data.data.authUrl) {
      throw new Error("URL de autorização inválida");
    }

    // Guardar stateToken para validação após callback
    localStorage.setItem("spotify_state_token", data.data.stateToken);

    console.log("✅ Redirecionando para Spotify...");

    // Redirecionar para Spotify
    window.location.href = data.data.authUrl;
  } catch (error) {
    console.error("❌ Erro ao iniciar Spotify Auth:", error);
    alert(
      `Erro ao conectar com Spotify: ${error instanceof Error ? error.message : "Erro desconhecido"}`
    );
  }
}

/**
 * Processar callback do Spotify
 * Chamado quando o user retorna do Spotify após autorizar
 */
export async function handleSpotifyCallback(): Promise<{
  success: boolean;
  error?: string;
  spotifyId?: string;
}> {
  try {
    const params = new URLSearchParams(window.location.search);

    // Verificar se teve erro
    const error = params.get("error");
    if (error) {
      const description = params.get("description");
      return {
        success: false,
        error: `${error}: ${description}`,
      };
    }

    // Verificar sucesso
    const success = params.get("success");
    if (success !== "true") {
      return {
        success: false,
        error: "Callback inválido",
      };
    }

    const spotifyId = params.get("spotifyId");

    // Limpar stateToken do localStorage
    localStorage.removeItem("spotify_state_token");

    console.log("✅ Autorização Spotify concluída!");

    return {
      success: true,
      spotifyId: spotifyId || undefined,
    };
  } catch (error) {
    console.error("❌ Erro ao processar callback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Obter access token do Spotify do backend
 */
export async function getSpotifyAccessToken(): Promise<string> {
  try {
    const solToken = localStorage.getItem("sol-auth-token");
    if (!solToken) {
      throw new Error("Não autenticado");
    }

    const response = await fetch("/api/spotify/auth/token", {
      headers: {
        Authorization: `Bearer ${solToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao obter token");
    }

    const data = (await response.json()) as {
      success: boolean;
      data?: { accessToken: string };
    };

    if (!data.success || !data.data?.accessToken) {
      throw new Error("Token inválido");
    }

    return data.data.accessToken;
  } catch (error) {
    console.error("❌ Erro ao obter token Spotify:", error);
    throw error;
  }
}

/**
 * Desconectar Spotify
 */
export async function disconnectSpotify(): Promise<boolean> {
  try {
    const solToken = localStorage.getItem("sol-auth-token");
    if (!solToken) {
      throw new Error("Não autenticado");
    }

    const response = await fetch("/api/spotify/auth/disconnect", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${solToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao desconectar");
    }

    const data = (await response.json()) as { success: boolean };
    return data.success;
  } catch (error) {
    console.error("❌ Erro ao desconectar Spotify:", error);
    return false;
  }
}
