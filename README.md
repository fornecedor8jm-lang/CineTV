# Cine TV

Streaming de filmes e séries em alta definição, com recomendações personalizadas feitas para o seu gosto. Navegue pelo acervo, marque títulos na sua lista e assista no player integrado.

## Sobre o acervo

O catálogo reúne **35 títulos** (filmes, séries e animes) com player de reprodução disponível. Os títulos sem reprodução ativa ("filme/episódio não encontrado") foram removidos para garantir que tudo no app seja assistível.

## Funcionalidades

- **Página inicial** — título em destaque, carrosséis por categoria e seção "Para você".
- **Recomendações personalizadas** — aprendem com o histórico do que você assiste e ficam salvas no seu navegador.
- **Continue assistindo** — acompanha o progresso dos títulos.
- **Minha lista** — salve títulos para ver depois.
- **Catálogo completo** — busca, filtros por tipo e gênero, e ordenação.
- **Página de detalhes** — sinopse, nota IMDb, temporadas e episódios das séries.
- **Player em tela cheia** — reprodução de filmes e séries.

## Tecnologia

- Next.js 16 (App Router)
- React 19 / TypeScript 5
- Tailwind CSS 4
- Vercel Analytics + Umami opcional

## Como rodar

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Configure as variáveis de ambiente (copie `.env.example` para `.env`; as variáveis de analytics são opcionais).

3. Inicie o servidor de desenvolvimento (porta 13000):
   ```bash
   pnpm dev
   ```

4. Verifique as mudanças:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

## Estrutura

- `app/` — rotas do App Router (`/`, `/browse`, `/title/[id]`).
- `components/` — cabeçalho, cartões, carrosséis, player e provedores.
- `lib/` — `data.ts` (catálogo) e `catalog.ts` (utilitários).
- `public/posters/` — imagens dos títulos.
