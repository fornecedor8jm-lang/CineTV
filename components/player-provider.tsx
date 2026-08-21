'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const [isPortrait, setIsPortrait] = useState(false);
  const [orientationBlocked, setOrientationBlocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { markWatched } = useLibrary();

  const active = activeId ? getById(activeId) ?? null : null;
  const src = sourceOverride ?? (active ? watchSource(active) : null);

  const play = useCallback((item: CatalogItem, opts?: { label?: string; src?: string }) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setLabel(opts?.label ?? '');
    setSourceOverride(opts?.src ?? null);
    setLoadError(false);
    setIsLoading(true);
    setRetryNonce(0);
    setActiveId(item.id);
    markWatched(item.id, 0.05);
  }, [markWatched]);

  const close = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen().catch(() => undefined);
    }
    if ('orientation' in screen && typeof screen.orientation.unlock === 'function') {
      screen.orientation.unlock();
    }
    setActiveId(null);
    setSourceOverride(null);
    setOrientationBlocked(false);
    setIsFullscreen(false);
    setIsLoading(false);
    setLoadError(false);
    previousFocusRef.current?.focus({ preventScroll: true });
    previousFocusRef.current = null;
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!playerRef.current) return;
      if (!document.fullscreenElement && playerRef.current.requestFullscreen) {
        await playerRef.current.requestFullscreen();
      }
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (value: 'landscape' | 'portrait') => Promise<void>;
      };
      if (typeof orientation.lock === 'function') {
        await orientation.lock('landscape');
      }
      setOrientationBlocked(false);
    } catch {
      setOrientationBlocked(true);
    }
  }, []);

  const retryPlayback = useCallback(() => {
    setLoadError(false);
    setIsLoading(true);
    setRetryNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const focusTimer = window.setTimeout(() => {
      const closeButton = document.querySelector<HTMLElement>('[data-tv-player-close]');
      closeButton?.focus({ preventScroll: true });
      closeButton?.scrollIntoView({ block: 'nearest' });
    }, 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const media = window.matchMedia('(orientation: portrait)');
    const syncOrientation = () => setIsPortrait(media.matches);
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    syncOrientation();
    syncFullscreen();
    media.addEventListener('change', syncOrientation);
    document.addEventListener('fullscreenchange', syncFullscreen);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(focusTimer);
      media.removeEventListener('change', syncOrientation);
      document.removeEventListener('fullscreenchange', syncFullscreen);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if ('orientation' in screen && typeof screen.orientation.unlock === 'function') {
        screen.orientation.unlock();
      }
    };
  }, [activeId, close]);

  const value = useMemo(
    () => ({ play, close, active, label, src }),
    [play, close, active, label, src],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {active && (
        <div
          ref={playerRef}
          className="tv-player-shell fixed inset-0 z-[90] flex flex-col bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
        >
          {isPortrait && orientationBlocked && (
            <div className="mx-4 mt-3 rounded-lg border border-primary/40 bg-primary/15 px-4 py-3 text-sm text-primary md:mx-6">
              Gire o celular para assistir em modo paisagem. O navegador bloqueou a rotação automática; use o botão de tela cheia do player se necessário.
            </div>
          )}
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
                type="button"
                onClick={() => void enterFullscreen()}
                aria-label={isFullscreen ? 'Tela cheia ativada' : 'Abrir em tela cheia e modo paisagem'}
                className="inline-flex rounded-full border border-border px-3 py-2 text-xs text-ink transition hover:border-primary hover:text-primary"
              >
                {isFullscreen ? 'Tela cheia' : 'Tela cheia'}
              </button>
              <button
                type="button"
                onClick={close}
                data-tv-player-close
                aria-label="Fechar player"
                className="grid h-12 w-12 place-items-center rounded-full border border-border text-ink transition hover:border-primary hover:text-primary"
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
                  key={`${src}-${retryNonce}`}
                  src={src}
                  className="h-full w-full"
                  allow="autoplay *; encrypted-media *; picture-in-picture *; fullscreen *; clipboard-write *; accelerometer *; gyroscope *; web-share *"
                  allowFullScreen
                  title={active.title}
                  onLoad={() => {
                    setIsLoading(false);
                    setLoadError(false);
                  }}
                  onError={() => {
                    setIsLoading(false);
                    setLoadError(true);
                  }}
                />
                {isLoading && !loadError && (
                  <div className="absolute inset-0 grid place-items-center bg-black/70 text-sm text-ink" role="status">
                    Carregando vídeo…
                  </div>
                )}
                {loadError && (
                  <div className="absolute inset-0 grid place-items-center bg-black/85 px-6 text-center text-ink" role="alert">
                    <div>
                      <p className="font-display text-xl">Não foi possível carregar o vídeo.</p>
                      <p className="mt-2 text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
                      <button
                        type="button"
                        onClick={retryPlayback}
                        className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                )}
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
