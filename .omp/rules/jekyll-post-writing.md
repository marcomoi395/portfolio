# Jekyll Blog Post Writing

## Scope
- Applies to: `content/_posts/*.md`
- Does not apply to: `content/pages/*.md`, `README.md`, layout files, or non-post content

## Rules
- Every post must start with YAML front matter.
- Use filename format `YYYY-MM-DD-kebab-slug.md`; keep slug lowercase, ASCII, and space-free.
- Put these front matter keys in this order: `layout`, `comments`, `title`, `categories`, `description`.
- Keep `layout: post` for blog posts.
- Set `comments` explicitly to `true` or `false`; do not omit it.
- Write `title` as a clear human-readable headline, not a raw filename.
- Use `categories` as a short array of relevant topic labels; keep it small and focused.
- Write `description` for every public post; make it a concise summary that includes primary topic keyword near start.
- Body headings should start at `##` or lower; do not add a second top-level `#` title in body.
- Keep paragraphs short; split long ideas into bullets or subheadings.
- Use ordered lists for procedures and unordered lists for collections or trade-offs.
- Use descriptive link text and avoid naked URLs in body.
- For images, prefer nearby explanatory text and make sure visual content still makes sense without image.
- Do not leave stray characters, typo lines, or orphan markdown tokens in body.
- Make post readable in list view first: first paragraph or `description` should tell user what post about.

## Examples

```md
---
layout: post
comments: true
title: Scale from zero to millions of users
categories: [System Design]
description: A guide to scaling a system from zero to millions of users.
---

## Overview

Short intro paragraph.

### Cache

- Point one
- Point two
```

```md
# bad: wrong file name and missing front matter
Scale from zero to millions of users
```

```md
---
layout: post
title: Bad Post
---

# Bad Post

Some text.
```
