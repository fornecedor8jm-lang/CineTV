'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Não foi possível enviar o código.');
      setStep('code');
      setMessage('Enviamos um código para o seu e-mail.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o código.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Código inválido.');
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-ink">← Voltar para o catálogo</Link>
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Cine TV</p>
          <h1 className="mt-3 font-display text-3xl text-ink">Entre para continuar assistindo.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Salve sua Minha lista, histórico e progresso para acessar pelo site ou pelo aplicativo.
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={requestCode} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-ink" htmlFor="email">Seu e-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-ink outline-none transition focus:border-primary/70"
            />
            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? 'Enviando…' : 'Receber código'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mt-8 space-y-4">
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-ink">
              Código enviado para <strong>{email}</strong>.
            </div>
            <label className="block text-sm font-medium text-ink" htmlFor="code">Código de 6 dígitos</label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="h-14 w-full rounded-xl border border-white/10 bg-black/20 text-center text-2xl tracking-[0.45em] text-ink outline-none transition focus:border-primary/70"
            />
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="h-12 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Entrando…' : 'Confirmar e entrar'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setMessage(''); setError(''); }}
              className="w-full text-sm text-muted-foreground hover:text-ink"
            >
              Usar outro e-mail
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-primary" role="status">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
        <p className="mt-8 text-xs leading-5 text-muted-foreground">
          Você poderá sair da conta a qualquer momento. O acesso por e-mail não depende de uma conta Google.
        </p>
      </section>
    </main>
  );
}
