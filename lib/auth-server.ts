import 'server-only';

import { createHash, randomBytes, randomInt } from 'node:crypto';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { authCodes, sessions, users } from '@/db/schemas/auth';

export const SESSION_COOKIE = 'cine_tv_session';
const CODE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function createCode(): string {
  const configured = process.env.NODE_ENV !== 'production' ? process.env.AUTH_DEV_CODE : undefined;
  return configured && /^\d{6}$/.test(configured)
    ? configured
    : randomInt(100000, 1000000).toString();
}

function createSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function sendLoginCode(email: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_FROM_EMAIL;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== 'production' && process.env.AUTH_DEV_CODE === code) return;
    throw new Error('O serviço de e-mail não está configurado.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Seu código de acesso ao Cine TV',
      text: `Seu código de acesso ao Cine TV é ${code}. Ele expira em 10 minutos.`,
      html: `<p>Seu código de acesso ao Cine TV é:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p><p>Esse código expira em 10 minutos.</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error('Não foi possível enviar o código de acesso.');
  }
}

export async function issueLoginCode(rawEmail: string): Promise<void> {
  const email = normalizeEmail(rawEmail);
  const code = createCode();
  const now = new Date();

  await db.insert(authCodes).values({
    email,
    codeHash: hashValue(code),
    expiresAt: new Date(now.getTime() + CODE_TTL_MS),
  });

  try {
    await sendLoginCode(email, code);
  } catch (error) {
    await db
      .update(authCodes)
      .set({ usedAt: now })
      .where(and(eq(authCodes.email, email), eq(authCodes.codeHash, hashValue(code))));
    throw error;
  }
}

export async function createSessionForEmail(rawEmail: string, rawCode: string) {
  const email = normalizeEmail(rawEmail);
  const codeHash = hashValue(rawCode.trim());
  const now = new Date();

  const candidates = await db
    .select()
    .from(authCodes)
    .where(
      and(
        eq(authCodes.email, email),
        eq(authCodes.codeHash, codeHash),
        isNull(authCodes.usedAt),
        gt(authCodes.expiresAt, now),
      ),
    )
    .orderBy(desc(authCodes.createdAt))
    .limit(1);

  const authCode = candidates[0];
  if (!authCode || authCode.attempts >= MAX_CODE_ATTEMPTS) {
    throw new Error('Código inválido ou expirado.');
  }

  await db.update(authCodes).set({ usedAt: now }).where(eq(authCodes.id, authCode.id));

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = existing[0]
    ? (
        await db
          .update(users)
          .set({ emailVerifiedAt: now, lastLoginAt: now })
          .where(eq(users.id, existing[0].id))
          .returning()
      )[0]
    : (
        await db
          .insert(users)
          .values({ email, emailVerifiedAt: now, lastLoginAt: now })
          .returning()
      )[0];

  const token = createSessionToken();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db.insert(sessions).values({
    userId: user.id,
    tokenHash: hashValue(token),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });

  return user;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const now = new Date();
  const result = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashValue(token)),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now),
      ),
    )
    .limit(1);

  return result[0]?.user ?? null;
}

export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, hashValue(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}
