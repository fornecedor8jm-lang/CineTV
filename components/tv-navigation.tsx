'use client';

import { useEffect } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const REMOTE_BACK_KEYS = new Set(['XF86Back', 'BrowserBack', 'GoBack', 'Back']);
const DIRECTIONS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

function visible(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && styles.visibility !== 'hidden' && styles.display !== 'none';
}

function moveFocus(key: string) {
  const current = document.activeElement as HTMLElement | null;
  if (!current || !visible(current)) return;

  const currentRect = current.getBoundingClientRect();
  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2,
  };
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((candidate) => candidate !== current && visible(candidate) && !candidate.closest('[aria-hidden="true"]'))
    .map((candidate) => {
      const rect = candidate.getBoundingClientRect();
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const dx = center.x - currentCenter.x;
      const dy = center.y - currentCenter.y;
      const primary = key === 'ArrowLeft' || key === 'ArrowRight' ? dx : dy;
      const secondary = key === 'ArrowLeft' || key === 'ArrowRight' ? dy : dx;
      const direction = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
      if (primary * direction <= 4) return null;
      return {
        candidate,
        score: Math.abs(primary) + Math.abs(secondary) * 2,
      };
    })
    .filter((entry): entry is { candidate: HTMLElement; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score);

  const next = candidates[0]?.candidate;
  if (next) {
    next.focus({ preventScroll: true });
    next.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }
}

export function TvNavigation() {
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const tvUserAgent = /Android TV|GoogleTV|SMART-TV|SmartTV|AFT[A-Z0-9]|BRAVIA|NetCast/i.test(userAgent);
    const largeRemoteScreen = window.matchMedia('(min-width: 1200px) and (hover: none) and (pointer: coarse)').matches;
    document.documentElement.classList.toggle('tv-mode', tvUserAgent || largeRemoteScreen);

    const initialFocus = window.setTimeout(() => {
      const first = document.querySelector<HTMLElement>('[data-tv-primary], [data-tv-focus], header a[href], main a[href], main button');
      first?.focus({ preventScroll: true });
    }, 250);
    const onKeyDown = (event: KeyboardEvent) => {
      if (REMOTE_BACK_KEYS.has(event.key)) {
        event.preventDefault();
        window.history.back();
        return;
      }
      if (DIRECTIONS.has(event.key)) {
        const target = event.target as HTMLElement | null;
        if (target?.matches('input,textarea,select,[contenteditable="true"]')) return;
        event.preventDefault();
        moveFocus(event.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(initialFocus);
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.classList.remove('tv-mode');
    };
  }, []);

  return null;
}
