import { catalog, type CatalogItem } from './data';

export type { CatalogItem, Season } from './data';

export const ALL_ITEMS: CatalogItem[] = catalog;

export const FILME = 'Filme';
export const SERIE = 'Série';
export const ANIME = 'Anime';
export const CANAL = 'Canal';
export const TYPES = [FILME, SERIE, ANIME, CANAL] as const;

export function getById(id: string): CatalogItem | undefined {
  return ALL_ITEMS.find((i) => i.id === id);
}

/** URL de reprodução disponível para o título, ou null. */
export function watchSource(item: CatalogItem): string | null {
  if (item.watchUrl) return item.watchUrl;
  if (item.embedPlayId) return `https://embedplayapi.top/embed/${item.embedPlayId}`;
  return null;
}

export function isSeries(item: CatalogItem): boolean {
  return item.type === SERIE || item.type === ANIME;
}

export function seasonCount(item: CatalogItem): number {
  return item.seriesSeasons?.length ?? 0;
}

export function totalEpisodes(item: CatalogItem): number {
  return (item.seriesSeasons ?? []).reduce((n, s) => n + s.episodes.length, 0);
}

export function allGenres(): string[] {
  const set = new Set<string>();
  for (const i of ALL_ITEMS) i.genres.forEach((g) => set.add(g));
  return Array.from(set).sort();
}

export function featuredItems(): CatalogItem[] {
  const f = ALL_ITEMS.filter((i) => i.featured);
  return f.length > 0 ? f : ALL_ITEMS.filter((i) => i.type === SERIE).slice(0, 3);
}

export function typeLabel(item: CatalogItem): string {
  return item.type;
}

export function metaLine(item: CatalogItem): string {
  const parts: string[] = [];
  if (item.year) parts.push(item.year);
  if (item.type === FILME) {
    const m = item.seasons.match(/\d+h\d+/i) || item.seasons.match(/\d+h\d+/i);
    if (m) parts.push(m[0].toUpperCase());
  } else if (seasonCount(item) > 0) {
    parts.push(
      `${seasonCount(item)} ${seasonCount(item) === 1 ? 'temporada' : 'temporadas'}`,
    );
  } else if (item.seasons) {
    parts.push(item.seasons);
  }
  if (item.imdbRating) parts.push(`IMDb ${item.imdbRating.toFixed(1)}`);
  return parts.join(' · ');
}

export function qualityLabel(item: CatalogItem): string {
  const s = item.seasons || '';
  if (/HDCAM/i.test(s)) return 'HDCAM';
  if (/WEB-DL/i.test(s)) return 'WEB-DL';
  if (/Full HD/i.test(item.language)) return 'Full HD';
  if (/HD/i.test(s) && !/HDCAM/i.test(s)) return 'HD';
  return 'HD';
}
