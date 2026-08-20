'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CatalogItem } from '@/lib/catalog';
import { qualityLabel } from '@/lib/catalog';
import { useLibrary } from '@/components/library-provider';
import { usePlayer } from '@/components/player-provider';

export function MovieCard({ item }: { item: CatalogItem }) {
  const { isInList, toggleList } = useLibrary();
  const inList = isInList(item.id);

  return (
    <div className="tv-card group relative w-[150px] shrink-0 sm:w-[168px]">
      <Link
        href={`/title/${item.id}`}
        className="relative block aspect-[2/3] w-full overflow-hidden rounded-md bg-surface ring-1 ring-white/5 transition duration-300 group-hover:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Image
          src={item.poster}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 150px, 168px"
          className="object-cover transition duration-500 group-hover:scale-[1.06] group-hover:brightness-[0.55]"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
        <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {qualityLabel(item)}
        </span>
      </Link>

      <button
        onClick={() => toggleList(item.id)}
        aria-label={inList ? 'Remover da minha lista' : 'Adicionar à minha lista'}
        className={`absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full text-ink backdrop-blur transition focus-visible:ring-2 focus-visible:ring-primary ${
          inList ? 'bg-primary text-primary-foreground' : 'bg-black/55 hover:bg-primary/90'
        }`}
      >
        {inList ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>

      <div className="mt-2 space-y-1">
        <Link
          href={`/title/${item.id}`}
          className="block truncate text-sm font-medium text-ink transition hover:text-primary focus-visible:rounded-sm"
          title={item.title}
        >
          {item.title}
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {item.type === 'Filme' ? (
            <span>Filme</span>
          ) : (
            <span>{item.year || 'Série'}</span>
          )}
          {item.imdbRating ? (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-primary">★ {item.imdbRating.toFixed(1)}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CardPlayButton({ item }: { item: CatalogItem }) {
  const { play } = usePlayer();
  return (
    <button
      onClick={() => play(item)}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      Assistir agora
    </button>
  );
}
