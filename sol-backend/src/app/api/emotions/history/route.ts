// sol-backend/src/app/api/emotions/history/route.ts

export async function GET(request: NextRequest) {
  const userId = await validateToken(request.headers.get('authorization'));
  
  const history = await prisma.emotionalHistory.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 20
  });
  
  return NextResponse.json({ history });
}