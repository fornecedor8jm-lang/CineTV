'use client';

import { useMemo } from 'react';
import { Hero } from '@/components/hero';
import { Row } from '@/components/row';
import { MovieCard } from '@/components/movie-card';
import { useLibrary } from '@/components/library-provider';
import { ALL_ITEMS, featuredItems } from '@/lib/catalog';

export default function Home() {
  const { recommendations, continueWatching, myList, history } = useLibrary();

  const heroItem = useMemo(() => featuredItems()[0] ?? ALL_ITEMS[0], []);
  const movies = useMemo(() => ALL_ITEMS.filter((i) => i.type === 'Filme'), []);
  const series = useMemo(() => ALL_ITEMS.filter((i) => i.type === 'Série'), []);
  const animes = useMemo(() => ALL_ITEMS.filter((i) => i.type === 'Anime'), []);
  const launches = useMemo(
    () => ALL_ITEMS.filter((i) => i.year?.includes('2026')).slice(0, 10),
    [],
  );
  const listItems = useMemo(
    () => myList.map((id) => ALL_ITEMS.find((i) => i.id === id)).filter(Boolean),
    [myList],
  );

  const ContinueCard = ({ id }: { id: string }) => {
    const item = ALL_ITEMS.find((i) => i.id === id);
    if (!item) return null;
    const entry = history.find((h) => h.id === id);
    const pct = Math.round((entry?.pct ?? 0) * 100);
    return (
      <div className="w-[150px] shrink-0 sm:w-[168px]">
        <div className="relative">
          <MovieCard item={item} />
          <div className="absolute inset-x-1 bottom-1 h-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Continuar em {pct}%
        </p>
      </div>
    );
  };

  return (
    <div>
      <Hero item={heroItem} />

      <div className="mx-auto -mt-4 max-w-7xl space-y-12 px-4 pb-4 sm:px-6">
        {continueWatching.length > 0 && (
          <Row
            title="Continue assistindo"
            eyebrow="De onde você parou"
            items={continueWatching}
            onCard={(item) => <ContinueCard id={item.id} />}
          />
        )}

        {recommendations.length > 0 && (
          <Row
            title="Feito para você"
            eyebrow="Recomendações personalizadas"
            items={recommendations}
            href="/browse"
          />
        )}

        {listItems.length > 0 && (
          <Row
            title="Minha lista"
            eyebrow="Seu acervo"
            items={listItems as typeof ALL_ITEMS}
            href="/browse?list=1"
          />
        )}

        <Row
          title="Lançamentos 2026"
          eyebrow="Recém-chegados"
          items={launches}
          href="/browse?year=2026"
        />

        <Row
          title="Séries em destaque"
          eyebrow="Maratonar"
          items={series.slice(0, 12)}
          href="/browse?type=Série"
        />

        <Row
          title="Filmes em HD"
          eyebrow="Duração de cinema"
          items={movies}
          href="/browse?type=Filme"
        />

        {animes.length > 0 && (
          <Row
            title="Animes"
            eyebrow="Do Japão para você"
            items={animes}
            href="/browse?type=Anime"
          />
        )}
      </div>
    </div>
  );
}
