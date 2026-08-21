import { NextResponse } from 'next/server';
import { issueLoginCode, normalizeEmail } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email ?? '');
    if (!email || !email.includes('@') || email.length > 254) {
      return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    }

    await issueLoginCode(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível enviar o código.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
