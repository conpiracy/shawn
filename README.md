# ScriptAI - AI Video Script Writer

AI assistant for creating high-retention short-form video content for TikTok, Instagram Reels, and YouTube Shorts.

## Quick Start

1. **Add your OpenAI API key to `.env`:**
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   (An `.npmrc` file is included to handle dependency conflicts automatically)

3. **Run the app:**
   ```bash
   npm run dev
   ```

   **IMPORTANT**: You must run the dev server at least once before building. This generates:
   - Convex API types in `convex/_generated/`
   - TanStack Router types in `src/routeTree.gen.ts`

4. **Build for production:**
   ```bash
   npm run build
   ```

## Features

- **AI Chat Interface** - Generate hooks, scripts, and topic ideas
- **Script Library** - Save and organize your content
- **Supabase Database** - Persistent storage with RLS
- **Convex Backend** - Real-time, type-safe API
- **Stripe Integration** - Ready for Pro subscriptions
- **Authentication** - Email and social logins

## Tech Stack

- React + Vite + TanStack Router
- Convex (backend)
- Supabase (database)
- OpenAI GPT-4 Turbo
- Tailwind CSS

## Simplified Architecture

The AI feature is streamlined:
- **Single AI file** (`convex/ai.ts`) - 80 lines total, just calls OpenAI
- **No Zod in AI code** - Uses Convex's built-in validation (`v.*`)
- **Plain React state** - AI Writer uses simple `useState`, no forms library
- **Direct Supabase** - Database with RLS, no ORM

Note: Auth pages (login/settings) still use TanStack Form for validation.

## Project Structure

```
convex/
  ai.ts              # AI chat action
  app.ts             # User management

src/routes/_app/_auth/dashboard/
  _layout.ai-writer.tsx    # AI interface
  _layout.scripts.tsx      # Script library
```

## Known Issues

**Build requires types**: The project won't build until you run `npm run dev` at least once. This generates:
- Convex API types (`api.ai.*` functions)
- TanStack Router types (route definitions)

Both are auto-generated and gitignored.

## Deployment

Frontend: `npm run build` → deploy `dist/` to Netlify/Vercel
Backend: `npx convex deploy`
