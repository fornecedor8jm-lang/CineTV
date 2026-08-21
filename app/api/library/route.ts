import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { watchHistory, watchlist } from '@/db/schemas/auth';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const [list, history] = await Promise.all([
    db.select({ titleId: watchlist.titleId }).from(watchlist).where(eq(watchlist.userId, user.id)),
    db
      .select({ titleId: watchHistory.titleId, progressSeconds: watchHistory.progressSeconds, durationSeconds: watchHistory.durationSeconds, completed: watchHistory.completed, updatedAt: watchHistory.updatedAt })
      .from(watchHistory)
      .where(eq(watchHistory.userId, user.id))
      .orderBy(desc(watchHistory.updatedAt)),
  ]);

  return NextResponse.json({
    list: list.map((entry) => entry.titleId),
    history: history.map((entry) => ({
      id: entry.titleId,
      pct: entry.durationSeconds > 0 ? entry.progressSeconds / entry.durationSeconds : 0,
      at: entry.updatedAt.getTime(),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const body = (await request.json()) as {
    action?: 'list-add' | 'list-remove' | 'history-upsert';
    titleId?: string;
    progressSeconds?: number;
    durationSeconds?: number;
  };
  const titleId = body.titleId?.trim();
  if (!titleId || !body.action) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });

  if (body.action === 'list-add') {
    const existing = await db.select({ id: watchlist.id }).from(watchlist).where(and(eq(watchlist.userId, user.id), eq(watchlist.titleId, titleId))).limit(1);
    if (!existing[0]) await db.insert(watchlist).values({ userId: user.id, titleId });
  }

  if (body.action === 'list-remove') {
    await db.delete(watchlist).where(and(eq(watchlist.userId, user.id), eq(watchlist.titleId, titleId)));
  }

  if (body.action === 'history-upsert') {
    const progressSeconds = Math.max(0, Math.floor(body.progressSeconds ?? 0));
    const durationSeconds = Math.max(0, Math.floor(body.durationSeconds ?? 0));
    const completed = durationSeconds > 0 && progressSeconds / durationSeconds >= 0.9;
    const existing = await db.select({ id: watchHistory.id }).from(watchHistory).where(and(eq(watchHistory.userId, user.id), eq(watchHistory.titleId, titleId))).limit(1);
    if (existing[0]) {
      await db.update(watchHistory).set({ progressSeconds, durationSeconds, completed, updatedAt: new Date() }).where(eq(watchHistory.id, existing[0].id));
    } else {
      await db.insert(watchHistory).values({ userId: user.id, titleId, progressSeconds, durationSeconds, completed });
    }
  }

  return NextResponse.json({ ok: true });
}
