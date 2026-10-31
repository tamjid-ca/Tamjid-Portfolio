import { NextResponse } from 'next/server';
import { getCachedPublicPortfolioData } from '@/lib/cache/portfolio-cache';
import { getDatabaseStatus } from '@/lib/mongodb/connection';

export async function GET() {
  const data = await getCachedPublicPortfolioData();
  const status = getDatabaseStatus();

  return NextResponse.json(
    {
      ok: true,
      databaseConnected: status.connected,
      data,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
