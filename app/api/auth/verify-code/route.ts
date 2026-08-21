import { NextResponse } from 'next/server';
import { createSessionForEmail, normalizeEmail } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; code?: string };
    const email = normalizeEmail(body.email ?? '');
    const code = (body.code ?? '').trim();

    if (!email || !email.includes('@') || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Informe o e-mail e o código de 6 dígitos.' }, { status: 400 });
    }

    const user = await createSessionForEmail(email, code);
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível entrar.';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
