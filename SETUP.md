# Föreningsportalen — setup & deploy

En portal för bostadsrättsföreningar: felanmälan, upphandling med bud från
hantverkare, anslagstavla/dokument och bokningar.

## Arkitektur (ren arkitektur)

- **`src/core/`** – domänen. Entiteter, ports (interfaces) och use-cases. Helt
  fri från Next.js och Prisma. *Detta är den låsta kärnan.*
- **`src/infra/`** – adaptrar: Prisma-repos, lösenordshashning (scrypt),
  session (jose JWT i cookie). Utbytbart bakom portarna.
- **`src/app/`** – Next.js-leveranslagret: sidor + server actions som anropar
  use-cases via `getContext()` (composition root i `src/infra/container.ts`).

Beroenderiktningen pekar inåt: `app → core ← infra`.

## Lokalt

1. Skapa en Postgres-databas (t.ex. en gratis Neon-databas).
2. Lägg connection-stringen i `.env`:
   ```
   DATABASE_URL="postgresql://…"
   SESSION_SECRET="<minst 16 tecken, slumpa fram>"
   ```
3. Pusha schemat och seed:a demodata:
   ```
   npm run db:push
   npm run db:seed
   ```
4. Starta:
   ```
   npm run dev
   ```

Demokonto efter seed: `styrelse@solrosen.se` / `losenord123`.

## Deploy till Vercel

1. Skapa en **Neon Postgres**-databas (eller via Vercel Storage).
2. Importera repot i Vercel. Sätt miljövariabler i projektet:
   - `DATABASE_URL` – Neon connection string (pooled).
   - `SESSION_SECRET` – en lång slumpsträng.
3. Build command är redan `prisma generate && next build` (via package.json).
4. Kör schemat mot Neon en gång (lokalt med Neon-URL i `.env`):
   ```
   npm run db:push
   npm run db:seed   # valfritt, demodata
   ```
5. Deploya. Dela `/registrera` med föreningar, och styrelsens
   inbjudningslänk (`/ga-med/<brfId>`) med boende.

Den publika budlänken för hantverkare ligger på `/uppdrag/<token>` och kräver
ingen inloggning.
