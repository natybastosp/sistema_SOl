/**
 * Serviço para gerenciar autenticação e token do Spotify
 */

export async function getSpotifyToken(): Promise<string> {
  try {
    const response = await fetch("/api/spotify/auth");
    const data = await response.json();

    if (!data.success || !data.data.connected) {
      throw new Error("Not connected to Spotify");
    }

    return data.data.accessToken || "";
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    throw error;
  }
}

export async function checkSpotifyConnection(): Promise<boolean> {
  try {
    const response = await fetch("/api/spotify/auth");
    const data = await response.json();
    return data.success && data.data.connected;
  } catch (error) {
    return false;
  }
}

export async function disconnectSpotify(): Promise<boolean> {
  try {
    const response = await fetch("/api/spotify/auth", {
      method: "DELETE",
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error disconnecting Spotify:", error);
    return false;
  }
}

export async function initiateSpotifyLogin(): Promise<void> {
  try {
    // Obter o token JWT do localStorage (mesmo nome que authService usa)
    const authToken = localStorage.getItem("sol-auth-token");
    if (!authToken) {
      throw new Error("Not authenticated - faça login primeiro");
    }

    // Fazer POST para obter a URL de autorização
    const response = await fetch("/api/spotify/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (!data.success || !data.authUrl) {
      throw new Error("Failed to get authorization URL");
    }

    // Guardar o stateToken para validação posterior
    localStorage.setItem("spotify_state_token", data.stateToken);

    // Redirecionar para Spotify
    window.location.href = data.authUrl;
  } catch (error) {
    console.error("Error initiating Spotify login:", error);
    alert("Erro ao conectar com Spotify. Tente novamente.");
  }
}
