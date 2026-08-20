'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MovieCard } from '@/components/movie-card';
import { useLibrary } from '@/components/library-provider';
import { ALL_ITEMS, allGenres, type CatalogItem } from '@/lib/catalog';

const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const TYPES = [
  { key: 'Todos', label: 'Todos' },
  { key: 'Filme', label: 'Filmes' },
  { key: 'Série', label: 'Séries' },
  { key: 'Anime', label: 'Animes' },
  { key: 'Canal', label: 'Canais ao vivo' },
];

function Catalog() {
  const params = useSearchParams();
  const router = useRouter();
  const { myList } = useLibrary();

  const paramsKey = params.toString();
  const initialQ = params.get('q') ?? '';
  const initialType = params.get('type') ?? 'Todos';
  const initialGenre = params.get('genre') ?? 'Todos';
  const initialSort = params.get('sort') ?? 'relevancia';
  const onlyList = params.get('list') === '1';
  const only2026 = params.get('year') === '2026';

  const [query, setQuery] = useState(initialQ);
  const [type, setType] = useState(initialType);
  const [genre, setGenre] = useState(initialGenre);
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    setQuery(params.get('q') ?? '');
    setType(params.get('type') ?? 'Todos');
    setGenre(params.get('genre') ?? 'Todos');
    setSort(params.get('sort') ?? 'relevancia');
  }, [paramsKey]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (type !== 'Todos') next.set('type', type);
    if (genre !== 'Todos') next.set('genre', genre);
    if (sort !== 'relevancia') next.set('sort', sort);
    if (onlyList) next.set('list', '1');
    if (only2026) next.set('year', '2026');
    const timer = window.setTimeout(() => {
      router.replace(`/browse${next.toString() ? `?${next.toString()}` : ''}`);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, type, genre, sort, onlyList, only2026, router]);

  const genres = useMemo(() => ['Todos', ...allGenres()], []);

  const filtered = useMemo(() => {
    let items: CatalogItem[] = onlyList
      ? myList.map((id) => ALL_ITEMS.find((i) => i.id === id)).filter(Boolean) as CatalogItem[]
      : [...ALL_ITEMS];

    if (only2026) {
      items = items.filter((i) => i.year?.includes('2026'));
    }
    if (type !== 'Todos') items = items.filter((i) => i.type === type);
    if (genre !== 'Todos') items = items.filter((i) => i.genres.includes(genre));

    const q = normalizeText(query.trim());
    if (q) {
      items = items.filter((i) =>
        normalizeText([i.title, i.synopsis, ...i.genres, ...i.tags].join(' ')).includes(q),
      );
    }

    if (sort === 'ano') items.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
    if (sort === 'nota')
      items.sort((a, b) => (b.imdbRating ?? 0) - (a.imdbRating ?? 0));
    if (sort === 'titulo') items.sort((a, b) => a.title.localeCompare(b.title, 'pt'));

    return items;
  }, [query, type, genre, sort, onlyList, only2026, myList]);

  const title = onlyList
    ? 'Minha lista'
    : only2026
      ? 'Lançamentos 2026'
      : type === 'Canal'
        ? 'Canais ao vivo'
        : 'Catálogo completo';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="eyebrow">Cine TV</p>
        <h1 className="mt-1 font-display text-4xl font-semibold text-ink">
          {title}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {onlyList
            ? 'Os títulos que você salvou para assistir depois.'
            : `${filtered.length} de ${ALL_ITEMS.length} títulos disponíveis em alta definição.`}
        </p>
      </header>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                aria-pressed={type === t.key}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  type === t.key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-white/10 text-muted-foreground hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar título, gênero…"
                aria-label="Buscar título, gênero ou palavra-chave"
                className="h-9 w-56 rounded-full border border-white/10 bg-white/5 pl-9 pr-9 text-sm text-ink placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Limpar busca"
                  className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-ink"
                >
                  ×
                </button>
              )}
            </div>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="h-9 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-ink focus:border-primary/60 focus:outline-none"
              aria-label="Filtrar por gênero"
            >
              {genres.map((g) => (
                <option key={g} value={g} className="bg-surface text-ink">
                  {g === 'Todos' ? 'Todos os gêneros' : g}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-ink focus:border-primary/60 focus:outline-none"
              aria-label="Ordenar"
            >
              <option value="relevancia" className="bg-surface text-ink">Relevância</option>
              <option value="titulo" className="bg-surface text-ink">Título A–Z</option>
              <option value="ano" className="bg-surface text-ink">Ano</option>
              <option value="nota" className="bg-surface text-ink">Melhor nota</option>
            </select>
          </div>
        </div>
        {(query || genre !== 'Todos' || type !== 'Todos' || sort !== 'relevancia') && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
            <span>Filtros ativos:</span>
            {query && <span className="rounded-full bg-primary/15 px-2.5 py-1 text-primary">Busca: {query}</span>}
            {type !== 'Todos' && <span className="rounded-full bg-white/10 px-2.5 py-1 text-ink">{type}</span>}
            {genre !== 'Todos' && <span className="rounded-full bg-white/10 px-2.5 py-1 text-ink">{genre}</span>}
            {sort !== 'relevancia' && <span className="rounded-full bg-white/10 px-2.5 py-1 text-ink">Ordenação personalizada</span>}
            <button
              type="button"
              onClick={() => { setQuery(''); setGenre('Todos'); setType('Todos'); setSort('relevancia'); }}
              className="rounded-full border border-primary/40 px-2.5 py-1 text-primary hover:bg-primary/10"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 grid place-items-center rounded-xl border border-dashed border-white/15 py-20 text-center">
          <div>
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
            <p className="font-display text-xl text-ink">
              {query ? `Nenhum título encontrado para “${query}”` : 'Nada por aqui ainda'}
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Nenhum título corresponde aos filtros atuais. Tente outra combinação ou limpe os filtros.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setGenre('Todos');
                setType('Todos');
                setSort('relevancia');
              }}
              className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      ) : (
        <div className="catalog-grid mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => (
            <MovieCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Browse() {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <Catalog />
    </Suspense>
  );
}
