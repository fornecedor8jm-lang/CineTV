import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      user: user
        ? { id: user.id, email: user.email, name: user.name, plan: user.plan }
        : null,
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
