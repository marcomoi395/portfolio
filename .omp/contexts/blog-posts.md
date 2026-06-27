# Blog Post Contract

## Summary

- Blog posts live in `content/_posts/`.
- Post filename format is `yyyy-mm-dd-postname.md`.
- Required front matter in each post: `layout: post`, `comments`, `title`, `categories`, and `description`.
- `description` controls summary shown on blog index when present; otherwise index falls back to excerpt text.
- Site config uses `collections_dir: content`, so post collection is loaded from `content/_posts/`.
- `disqus.shortname` must be valid if comments are enabled.

## Details

- Blog index behavior: `description` is the preferred summary source for post cards/listing.
- Post pages still render full body content; summary text is only for listing/index use.
- New posts should be created inside `content/_posts/`, not `_posts/` at repo root.

## Evidence

- `doc-verified`: `README.md:156-174` documents post location, filename format, YAML front matter, and `description` behavior.
- `doc-verified`: `_config.yml:1-5` sets `collections_dir: content`.
- `doc-verified`: `_config.yml` disqus config notes valid shortname requirement.
- `code-verified`: existing posts in `content/_posts/*.md` use front matter and date-prefixed filenames.

## Use When

- Future work adds or edits blog posts.
- Future work needs to know where post metadata comes from.
- Future work needs blog index summary behavior.

## Do Not Use When

- Task only changes styling or layout outside posts.
- Task is unrelated to blog content or post metadata.

## Last Updated

- 2026-06-27
