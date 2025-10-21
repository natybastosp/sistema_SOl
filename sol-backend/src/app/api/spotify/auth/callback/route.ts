import { NextRequest, NextResponse } from "next/server";
import { spotifyAuthService } from "@/lib/spotifyAuth";

/**
 * GET /api/spotify/auth/callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extrair parâmetros que o Spotify mandou
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const stateToken = searchParams.get("stateToken"); // Vem da nossa URL

    // Verificar se o usuário negou a autorização
    if (error === "access_denied") {
      // Redirecionar para o frontend com mensagem de erro
      return NextResponse.redirect(
        new URL(
          "/dashboard?spotify_error=denied&message=Você precisa autorizar o app para usar o player",
          request.url
        )
      );
    }

    // Validar que recebemos todos os parâmetros necessários
    if (!code || !state || !stateToken) {
      console.error("❌ Parâmetros ausentes no callback:", {
        hasCode: !!code,
        hasState: !!state,
        hasStateToken: !!stateToken,
      });

      return NextResponse.redirect(
        new URL(
          "/dashboard?spotify_error=invalid&message=Callback inválido do Spotify",
          request.url
        )
      );
    }

    // Validar o token de state para prevenir ataques CSRF
    // Decodificar o stateToken que guardamos no início do fluxo
    let stateData;
    try {
      const decoded = Buffer.from(stateToken, "base64").toString("utf-8");
      stateData = JSON.parse(decoded);
    } catch (e) {
      console.error("❌ State token inválido:", e);
      return NextResponse.redirect(
        new URL(
          "/dashboard?spotify_error=security&message=Token de segurança inválido",
          request.url
        )
      );
    }

    // Verificar se o state bate com o que geramos
    if (stateData.state !== state) {
      console.error("❌ State não coincide. Possível ataque CSRF!");
      return NextResponse.redirect(
        new URL(
          "/dashboard?spotify_error=security&message=Falha na validação de segurança",
          request.url
        )
      );
    }

    // Verificar se o token de state não expirou (10 minutos de validade)
    const tenMinutesInMs = 10 * 60 * 1000;
    if (Date.now() - stateData.timestamp > tenMinutesInMs) {
      console.error("❌ State token expirado");
      return NextResponse.redirect(
        new URL(
          "/dashboard?spotify_error=expired&message=Token expirado. Tente novamente",
          request.url
        )
      );
    }

    console.log(
      `🔐 Processando callback do Spotify para usuário ${stateData.userId}`
    );

    // Trocar o código de autorização por tokens
    // Esta é a etapa crítica onde trocamos o "voucher" por "chaves" reais
    const { accessToken, refreshToken, expiresIn } =
      await spotifyAuthService.exchangeCodeForTokens(code);

    console.log("✅ Tokens obtidos com sucesso");

    // Pegar informações do perfil do usuário no Spotify
    // Isso nos dá o ID dele no Spotify e confirma que os tokens funcionam
    const spotifyProfile = await spotifyAuthService.getUserProfile(accessToken);

    console.log(
      `👤 Perfil obtido: ${spotifyProfile.displayName} (${spotifyProfile.product})`
    );

    // IMPORTANTE: Verificar se o usuário tem Spotify Premium
    // O Web Playback SDK só funciona com contas Premium
    if (spotifyProfile.product !== "premium") {
      console.warn(
        `⚠️ Usuário ${spotifyProfile.displayName} não tem Spotify Premium`
      );

      return NextResponse.redirect(
        new URL(
          "/dashboard?spotify_error=premium_required&message=O player do Spotify requer uma conta Premium. Por enquanto, você pode usar os previews de 30 segundos",
          request.url
        )
      );
    }

    // Salvar os tokens no banco de dados
    await spotifyAuthService.saveUserTokens(
      stateData.userId,
      accessToken,
      refreshToken,
      expiresIn,
      spotifyProfile.id
    );

    console.log(`✅ Tokens salvos para usuário ${stateData.userId}`);

    // Sucesso! Redirecionar de volta para o frontend
    return NextResponse.redirect(
      new URL(
        "/dashboard?spotify_connected=true&message=Spotify conectado com sucesso! Você já pode usar o player",
        request.url
      )
    );
  } catch (error: any) {
    console.error("❌ Erro no callback do Spotify:", error);

    // Redirecionar com erro genérico
    return NextResponse.redirect(
      new URL(
        `/dashboard?spotify_error=unknown&message=${encodeURIComponent(
          error.message || "Erro ao conectar com Spotify"
        )}`,
        request.url
      )
    );
  }
}
