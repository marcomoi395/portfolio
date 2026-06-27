# Jekyll Dev Flow

## Summary

- Repo is Ruby/Jekyll project, not JS app. `code-verified` via `Gemfile`, `dev-portfolio-blog.gemspec`, `Dockerfile`, `README.md`.
- Target runtime is Ruby 3.2.x and Jekyll 4.4. `doc-verified` via `README.md` and `dev-portfolio-blog.gemspec`.
- Native local dev flow: `bundle install` then `bundle exec jekyll serve`, open `http://localhost:4000`. `doc-verified`.
- Docker local dev flow is recommended: `docker compose up --build`, open `http://localhost:4000`, stop with `docker compose down`. `doc-verified` via `README.md` and `compose.yml`.
- Source is mounted into container at `.:/app`, so Jekyll rebuilds when files change. `code-verified` via `compose.yml`.
- Bun is not current runtime for this repo. `code-verified` via absence of `package.json` plus Ruby/Jekyll files and Docker/README evidence.

## Details

This repo behaves like a normal Jekyll theme/site. Local edits are expected to hot-rebuild through Jekyll refresh, not via a Bun-based dev server.

## Evidence

- `doc-verified`: `README.md` lines 177-191
- `code-verified`: `Gemfile`
- `code-verified`: `dev-portfolio-blog.gemspec`
- `code-verified`: `Dockerfile`
- `code-verified`: `compose.yml`

## Use When

- Future work needs local run instructions.
- Future work needs stack identification or dev environment setup.
- Future work asks whether Bun can replace current runtime.

## Do Not Use When

- Task is unrelated to local development or stack discovery.
- Task changes only content or styling with no environment implications.

## Last Updated

- 2026-06-27