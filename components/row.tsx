'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CatalogItem } from '@/lib/catalog';
import { MovieCard } from '@/components/movie-card';

export function Row({
  title,
  eyebrow,
  items,
  href,
  onCard,
}: {
  title: string;
  eyebrow?: string;
  items: CatalogItem[];
  href?: string;
  onCard?: (item: CatalogItem) => ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="font-display text-2xl text-ink md:text-[26px]">{title}</h2>
        </div>
        {href && (
          <Link
            href={href}
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-primary sm:inline-flex"
          >
            Ver tudo
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        )}
      </div>
      <div className="no-scrollbar snap-row -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-1">
        {items.map((item) => (
          <div key={item.id} className="shrink-0">
            {onCard ? onCard(item) : <MovieCard item={item} />}
          </div>
        ))}
      </div>
    </section>
  );
}
