import { NextRequest, NextResponse } from 'next/server';

// Função para validar o token de autorização
async function validateToken(token: string | null): Promise<string> {
  console.log("1. Token recebido para validação.");

  if (token && token.startsWith('Bearer ')) {
    // Simulação: retornar um ID de usuário falso
    return 'user_test_id_123';
  }

  throw new Error('Authorization token is missing or invalid');
}

// Função POST — obrigatória para Next.js reconhecer a rota
export async function POST(request: NextRequest) {
  console.log("2. Requisição POST recebida no endpoint /api/emotions/analyze.");

  try {
    // Validar token da requisição
    const userId = await validateToken(request.headers.get('authorization'));
    console.log(`3. Token validado para o usuário: ${userId}`);

    // Ler e exibir o corpo da requisição
    const body = await request.json();
    console.log("4. Corpo (Body) da requisição extraído:", body);

    // Simulação de recomendação com base na emoção
    const recommendation = {
      playlist: [
        { track: "Música de Teste 1", artist: "Artista Teste" },
        { track: "Música de Teste 2", artist: "Artista Teste" }
      ],
      receivedData: body
    };

    console.log("5. Enviando resposta de sucesso.");
    return NextResponse.json({
      success: true,
      recommendation
    });

  } catch (error: any) {
    console.error("ERRO DENTRO DA FUNÇÃO POST:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
