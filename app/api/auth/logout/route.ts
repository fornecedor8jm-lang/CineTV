import { NextResponse } from 'next/server';
import { revokeCurrentSession } from '@/lib/auth-server';

export async function POST() {
  try {
    await revokeCurrentSession();
  } finally {
    return NextResponse.json({ ok: true });
  }
}
