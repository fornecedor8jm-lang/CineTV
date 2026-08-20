import Link from 'next/link';
import { ALL_ITEMS } from '@/lib/catalog';

const catalogCount = ALL_ITEMS.length;

export function CineFooter() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="font-display text-lg font-semibold text-ink">
              Cine<span className="text-primary">TV</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Streaming com {catalogCount} títulos entre filmes, séries, novelas e canais ao vivo em alta definição, com recomendações personalizadas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-2">
            <p className="eyebrow">Navegar</p>
            <Link href="/" className="block text-muted-foreground hover:text-ink">Início</Link>
            <Link href="/browse" className="block text-muted-foreground hover:text-ink">Catálogo completo</Link>
            <Link href="/browse?type=Filme" className="block text-muted-foreground hover:text-ink">Filmes</Link>
            <Link href="/browse?type=Série" className="block text-muted-foreground hover:text-ink">Séries</Link>
            <Link href="/browse?type=Canal" className="block text-muted-foreground hover:text-ink">Canais ao vivo</Link>
          </div>
          <div className="space-y-2">
            <p className="eyebrow">Coleções</p>
            <Link href="/browse?type=Anime" className="block text-muted-foreground hover:text-ink">Animes</Link>
            <Link href="/browse?list=1" className="block text-muted-foreground hover:text-ink">Minha lista</Link>
            <Link href="/browse?year=2026" className="block text-muted-foreground hover:text-ink">Lançamentos 2026</Link>
          </div>
          <div className="space-y-2">
            <p className="eyebrow">Qualidade</p>
            <p className="text-muted-foreground">Full HD · HDCAM · WEB-DL</p>
            <p className="text-muted-foreground">Dublado e legendado</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-muted-foreground">
        Cine TV · acervo com {catalogCount} títulos · recomendações personalizadas
      </div>
    </footer>
  );
}
