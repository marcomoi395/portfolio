# Cloudflare Pages Deployment

## Summary

- Repo deploy target is Cloudflare Pages via Git integration; GitHub Actions is CI-only now.
- CI triggers on `push` and `pull_request` to `main`.
- Cloudflare Pages production branch should be `main`.
- Build command is `bundle exec jekyll build`; output directory is `_site`.
- Local runtime stays Docker-first: `docker compose up --build`.
- Public origin remains `https://portfolio.youngmarco.page`.
- To keep generated output clean, exclude `README.md`, `dev-portfolio-blog.gemspec`, and `data/cloudflare-pages-plan.md` from Jekyll output.
- `RUBY_VERSION=3.2.0` matches repo Ruby baseline and Pages build runtime expectation.

## Details

- Cloudflare Pages should own deploys; no GitHub Pages branch deploy or `sample-site` publishing remains in workflow.
- Generated site must not contain legacy `/dev-portfolio-blog` text anywhere in `_site`.
- The repo's plan file under `data/` is source material, not site content, so it must stay out of Pages output.
- Custom domain stays `portfolio.youngmarco.page`; keep domain values as variables in future config/docs when possible.

## Evidence

- `user-stated`: user asked to use Docker locally and to use variables for domain/dynamic data.
- `code-verified`: `.github/workflows/main.yml` changed to CI-only on `main`.
- `code-verified`: `_config.yml` sets `url: "https://portfolio.youngmarco.page"`.
- `test-verified`: Docker build and scan of `_site` confirmed no `/dev-portfolio-blog` remains after exclusions.
- `doc-verified`: Cloudflare Pages plan in `data/cloudflare-pages-plan.md`.

## Use When

- Future work touches Cloudflare Pages deploy, domain setup, or CI branch behavior.
- Future work touches Jekyll build output or source-file exclusions.
- Future work needs exact local dev/deploy contract for this repo.

## Do Not Use When

- Task is only styling/content change with no deploy or environment impact.
- Task is generic Jekyll guidance not specific to this repo.

## Last Updated

- 2026-06-27