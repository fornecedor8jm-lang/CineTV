'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Episode } from '@/lib/data';
import {
  getById,
  isSeries,
  metaLine,
  qualityLabel,
  totalEpisodes,
  seasonCount,
  ALL_ITEMS,
} from '@/lib/catalog';
import { useLibrary } from '@/components/library-provider';
import { usePlayer } from '@/components/player-provider';
import { Row } from '@/components/row';

export default function TitlePage() {
  const { id } = useParams<{ id: string }>();
  const item = useMemo(() => getById(id), [id]);
  const [season, setSeason] = useState(1);
  const { isInList, toggleList, markWatched } = useLibrary();
  const { play } = usePlayer();

  useEffect(() => {
    if (item && item.type === 'Série' && item.seriesSeasons?.length) {
      setSeason(item.seriesSeasons[0].number);
    }
  }, [item]);

  if (!item) {
    return (
      <div className="mx-auto grid max-w-2xl place-items-center px-4 py-24 text-center">
        <p className="font-display text-2xl text-ink">Título não encontrado</p>
        <Link
          href="/browse"
          className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const inList = isInList(item.id);
  const related = ALL_ITEMS.filter(
    (i) => i.id !== item.id && i.genres.some((g) => item.genres.includes(g)),
  ).slice(0, 10);
  const currentSeason = item.seriesSeasons?.find((s) => s.number === season);
  const series = isSeries(item);
  const src = item.watchUrl || (item.embedPlayId ? `https://embedplayapi.top/embed/${item.embedPlayId}` : '');

  const playNow = () => {
    play(item);
    markWatched(item.id, 0.05);
  };
  const playEpisode = (episode: Episode) => {
    play(item, { label: `${item.title} · ${episode.title}`, src: episode.watchUrl });
    markWatched(item.id, 0.05);
  };

  return (
    <div className="pb-6">
      {/* Backdrop */}
      <div className="relative h-72 overflow-hidden md:h-96">
        <Image
          src={item.hero || item.poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <Link
          href="/browse"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3.5 py-1.5 text-sm text-ink backdrop-blur transition hover:bg-black/70"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          Catálogo
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-40 flex flex-col gap-8 md:-mt-44 md:flex-row">
          {/* Poster */}
          <div className="relative mx-auto w-52 shrink-0 md:mx-0 md:w-64">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-white/10 shadow-2xl shadow-black/60">
              <Image src={item.poster} alt={item.title} fill sizes="256px" className="object-cover" />
            </div>
            <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              {qualityLabel(item)}
            </span>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 pt-6 md:pt-16">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                {item.type}
              </span>
              {item.imdbRating && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-ink">
                  ★ IMDb {item.imdbRating.toFixed(1)}
                </span>
              )}
              {item.rating && (
                <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  +{item.rating}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">
              {item.title}
            </h1>

            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {metaLine(item)}
            </p>

            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink/85 text-pretty">
              {item.synopsis}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {src ? (
                <button
                  onClick={playNow}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  Assistir agora
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-muted-foreground">
                  Reprodução em breve
                </span>
              )}
              <button
                onClick={() => toggleList(item.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition ${
                  inList
                    ? 'border-primary/60 text-primary'
                    : 'border-white/15 text-ink hover:border-primary/60 hover:text-primary'
                }`}
              >
                {inList ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                )}
                {inList ? 'Na minha lista' : 'Minha lista'}
              </button>
              {item.trailerUrl && (
                <a
                  href={item.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-ink transition hover:border-primary/60 hover:text-primary"
                >
                  Trailer
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
                </a>
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {item.language && item.language !== 'Não informado' && (
                <p><span className="text-ink">Idioma:</span> {item.language}</p>
              )}
              {item.availability && item.availability !== 'Player EmbedPlay' && (
                <p><span className="text-ink">Disponibilidade:</span> {item.availability}</p>
              )}
              {series && seasonCount(item) > 0 && (
                <p><span className="text-ink">{seasonCount(item)} temporadas</span> · {totalEpisodes(item)} episódios</p>
              )}
            </div>

            {item.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {item.genres.map((g) => (
                  <Link
                    key={g}
                    href={`/browse?type=${item.type}&genre=${encodeURIComponent(g)}`}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-ink"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Temporadas / episódios */}
        {series && currentSeason && (
          <div className="mt-12">
            <h2 className="font-display text-2xl text-ink">Temporadas e episódios</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(item.seriesSeasons ?? []).map((s) => (
                <button
                  key={s.number}
                  onClick={() => setSeason(s.number)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    season === s.number
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-white/10 text-muted-foreground hover:text-ink'
                  }`}
                >
                  Temporada {s.number}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              {currentSeason.episodes.map((ep) => (
                <div
                  key={ep.number}
                  className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-primary/40 hover:bg-white/[0.06]"
                >
                  <button
                    onClick={() => playEpisode(ep)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-ink transition hover:border-primary hover:text-primary"
                    aria-label={`Assistir episódio ${ep.number}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      <span className="text-muted-foreground">EP {ep.number}</span>{' '}
                      {ep.title}
                    </p>
                    {ep.synopsis && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {ep.synopsis}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relacionados */}
        {related.length > 0 && (
          <div className="mt-14">
            <Row
              title="Títulos relacionados"
              eyebrow={`Do gênero ${item.genres[0]}`}
              items={related}
              href={`/browse?genre=${encodeURIComponent(item.genres[0])}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
