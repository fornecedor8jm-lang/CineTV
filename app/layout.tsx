import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { AgentationGuard } from '@/components/AgentationGuard';
import { HappySeedsWatermark } from '@/components/HappySeedsWatermark';
import { LibraryProvider } from '@/components/library-provider';
import { PlayerProvider } from '@/components/player-provider';
import { CineHeader } from '@/components/cine-header';
import { CineFooter } from '@/components/cine-footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cine TV — Streaming de Filmes e Séries em HD',
  description:
    'Assista a filmes, séries, novelas e canais ao vivo em alta definição, com recomendações personalizadas feitas para o seu gosto.',
  applicationName: 'Cine TV',
};

export const viewport = {
  themeColor: '#0b0a08',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300..700&display=swap"
          rel="stylesheet"
        />
        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body className="antialiased">
        <LibraryProvider>
          <PlayerProvider>
            <div className="flex min-h-screen flex-col">
              <CineHeader />
              <main className="flex-1">{children}</main>
              <CineFooter />
            </div>
          </PlayerProvider>
        </LibraryProvider>
        <HappySeedsWatermark />
        <AgentationGuard />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
