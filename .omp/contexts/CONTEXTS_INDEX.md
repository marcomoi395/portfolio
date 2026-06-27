# Contexts Index

Use this index to decide which `.omp/contexts/` files to read before starting work. Load only files relevant to current task.

## Context Files

| File | Topic | Use When | Last Updated |
|---|---|---|---|
| [`dev-flow.md`](dev-flow.md) | Jekyll dev flow | Local run, stack, environment, Bun question | 2026-06-27 |
| [`blog-posts.md`](blog-posts.md) | Blog post contract | Adding/editing posts, post metadata, blog index summary behavior | 2026-06-27 |
| [`cloudflare-pages-deployment.md`](cloudflare-pages-deployment.md) | Cloudflare Pages deployment | Pages deploy target, branch, domain, build, output exclusions | 2026-06-27 |

## Maintenance Rules

- Add one row for every file in `.omp/contexts/` except `CONTEXTS_INDEX.md`.
- Keep `Use When` specific enough to route future context loading.
- Update `Last Updated` when corresponding context file changes.
- Remove rows only when corresponding context file is deleted.