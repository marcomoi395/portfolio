# Jekyll Local Development

## Scope
- Applies to: `Gemfile`, `dev-portfolio-blog.gemspec`, `Dockerfile`, `compose.yml`, `README.md`, `_config.yml`
- Does not apply to: JS-only tooling, non-Jekyll apps, package.json-based workflows

## Rules
- Use `bundle install` before any local Jekyll run when dependencies are not installed.
- Use `docker compose up --build` as default local development flow for this repo.
- Use `bundle exec jekyll serve` only when explicitly debugging native Docker-free behavior.
- Use `http://localhost:4000` as local site URL.
- Treat Docker flow as preferred when matching repo docs.
- Do not replace Ruby/Jekyll workflow with Bun unless repo adds explicit Bun support.
- Keep edits aligned with Jekyll rebuild-on-change behavior; source files are mounted into container.

## Examples

```sh
# good
bundle install
bundle exec jekyll serve
```

```sh
# good
docker compose up --build
```

```sh
# bad
bun run dev
```
