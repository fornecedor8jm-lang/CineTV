'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CatalogItem } from '@/lib/catalog';
import { isSeries, metaLine, qualityLabel } from '@/lib/catalog';
import { usePlayer } from '@/components/player-provider';
import { useLibrary } from '@/components/library-provider';

export function Hero({ item }: { item: CatalogItem }) {
  const { play } = usePlayer();
  const { isInList, toggleList } = useLibrary();
  const inList = isInList(item.id);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={item.hero || item.poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-[440px] max-w-7xl items-center px-4 pb-10 pt-20 sm:px-6 md:min-h-[520px] md:pt-24">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
              {qualityLabel(item)}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {isSeries(item) ? 'Série em destaque' : 'Filme em destaque'}
            </span>
          </div>

          <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-ink text-balance sm:text-5xl md:text-6xl">
            {item.title}
          </h1>

          <p className="mt-3 text-sm font-medium text-muted-foreground">
            {metaLine(item)}
          </p>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/80 text-pretty">
            {item.synopsis}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              data-tv-primary
              onClick={() => play(item)}
              className="tv-action-primary inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Assistir agora
            </button>
            <button
              onClick={() => toggleList(item.id)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-5 py-3 text-sm font-medium text-ink backdrop-blur transition hover:border-primary/60 hover:text-primary"
            >
              {inList ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              )}
              {inList ? 'Na minha lista' : 'Minha lista'}
            </button>
            <Link
              href={`/title/${item.id}`}
              className="inline-flex items-center gap-1.5 px-2 py-3 text-sm font-medium text-muted-foreground transition hover:text-ink"
            >
              Mais detalhes
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
