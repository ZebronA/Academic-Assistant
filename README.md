# Academic Assistant

Academic state and next-action system for a single student.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase project.
4. In Supabase Auth, configure the site's URL and redirect URL for the local/deployed app.
5. Run `npm run dev`.

## Current MVP slice

- Supabase email magic-link authentication.
- Create study tasks.
- Persist tasks to the Supabase `tasks` table.
- List open tasks.
- Complete tasks.
- Application commands validate inputs before persistence.

State and priority calculation are deliberately not implemented yet; they are the next domain phases.
