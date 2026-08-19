'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getById, watchSource, type CatalogItem } from '@/lib/catalog';
import { useLibrary } from '@/components/library-provider';

type PlayerState = {
  play: (item: CatalogItem, opts?: { label?: string; src?: string }) => void;
  close: () => void;
  active: CatalogItem | null;
  label: string;
  src: string | null;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [sourceOverride, setSourceOverride] = useState<string | null>(null);
  const { markWatched } = useLibrary();

  const active = activeId ? getById(activeId) ?? null : null;
  const src = sourceOverride ?? (active ? watchSource(active) : null);

  const play = useCallback((item: CatalogItem, opts?: { label?: string; src?: string }) => {
    setLabel(opts?.label ?? '');
    setSourceOverride(opts?.src ?? null);
    setActiveId(item.id);
    markWatched(item.id, 0.05);
  }, [markWatched]);

  const close = useCallback(() => {
    setActiveId(null);
    setSourceOverride(null);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveId(null);
        setSourceOverride(null);
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeId]);

  const value = useMemo(
    () => ({ play, close, active, label, src }),
    [play, close, active, label, src],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {active && (
        <div
          className="fixed inset-0 z-[90] flex flex-col bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="min-w-0">
              <p className="truncate font-display text-lg text-ink md:text-xl">
                {active.title}
              </p>
              {label && (
                <p className="truncate text-xs text-muted-foreground">{label}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground sm:inline-flex">
                Full HD
              </span>
              <button
                onClick={close}
                aria-label="Fechar reprodutor"
                className="grid h-10 w-10 place-items-center rounded-full border border-border text-ink transition hover:border-primary hover:text-primary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-6xl flex-1 px-3 pb-6 md:px-6">
            {src ? (
              <div className="relative h-full w-full overflow-hidden rounded-lg bg-black ring-1 ring-border">
                <iframe
                  key={src}
                  src={src}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={active.title}
                />
              </div>
            ) : (
              <div className="grid h-full w-full place-items-center rounded-lg bg-surface ring-1 ring-border">
                <div className="max-w-sm px-6 text-center">
                  <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="font-display text-xl">Reprodução em breve</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {active.title} ainda não tem um player associado neste acervo.
                    Adicione à sua lista para acompanhar quando chegar.
                  </p>
                  <button
                    onClick={close}
                    className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
                  >
                    Entendi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer deve ser usado dentro de PlayerProvider');
  return ctx;
}
