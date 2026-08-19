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
import { ALL_ITEMS, getById, type CatalogItem } from '@/lib/catalog';

type HistoryEntry = { id: string; pct: number; at: number };

type LibraryState = {
  history: HistoryEntry[];
  myList: string[];
  isInList: (id: string) => boolean;
  toggleList: (id: string) => void;
  markWatched: (id: string, pct: number) => void;
  continueWatching: CatalogItem[];
  recommendations: CatalogItem[];
  watchedIds: Set<string>;
};

const LibraryContext = createContext<LibraryState | null>(null);

const HISTORY_KEY = 'cine-tv-history-v1';
const LIST_KEY = 'cine-tv-list-v1';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    readJson<HistoryEntry[]>(HISTORY_KEY, []),
  );
  const [myList, setMyList] = useState<string[]>(() =>
    readJson<string[]>(LIST_KEY, []),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* storage indisponível */
    }
  }, [history]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LIST_KEY, JSON.stringify(myList));
    } catch {
      /* storage indisponível */
    }
  }, [myList]);

  const toggleList = useCallback((id: string) => {
    setMyList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const isInList = useCallback(
    (id: string) => myList.includes(id),
    [myList],
  );

  const markWatched = useCallback((id: string, pct: number) => {
    setHistory((prev) => [
      { id, pct, at: Date.now() },
      ...prev.filter((h) => h.id !== id),
    ]);
  }, []);

  const watchedIds = useMemo(
    () => new Set(history.map((h) => h.id)),
    [history],
  );

  const continueWatching = useMemo(
    () =>
      history
        .filter((h) => h.pct < 1)
        .map((h) => ({ entry: h, item: getById(h.id) }))
        .filter((x): x is { entry: HistoryEntry; item: CatalogItem } => !!x.item)
        .sort((a, b) => b.entry.at - a.entry.at)
        .slice(0, 12)
        .map((x) => x.item),
    [history],
  );

  const recommendations = useMemo(() => {
    const counts = new Map<string, number>();
    history.forEach((h) => {
      const item = getById(h.id);
      if (!item) return;
      item.genres.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1));
      item.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 0.5));
    });
    const isCold = counts.size === 0;
    const scored = ALL_ITEMS.map((item) => {
      if (watchedIds.has(item.id)) return { item, score: -1 };
      let score = 0;
      if (!isCold) {
        item.genres.forEach((g) => (score += counts.get(g) ?? 0));
        item.tags.forEach((t) => (score += (counts.get(t) ?? 0) * 0.5));
      } else {
        score = item.featured ? 2 : 0;
      }
      return { item, score };
    });
    const sorted = scored.filter((s) => s.score > -1).sort((a, b) => b.score - a.score);
    if (isCold) return sorted.slice(0, 12).map((s) => s.item);
    // garantia de que sempre haja algo relevante
    return sorted
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((s) => s.item);
  }, [history, watchedIds]);

  const value: LibraryState = {
    history,
    myList,
    isInList,
    toggleList,
    markWatched,
    continueWatching,
    recommendations,
    watchedIds,
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryState {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary deve ser usado dentro de LibraryProvider');
  return ctx;
}
