# adapt-next

A modern, schema-driven course **authoring tool** inspired by
[`adapt_authoring`](https://github.com/adaptlearning/adapt_authoring), rebuilt on a current stack so it
can be embedded in a learning platform.

- **Stack:** Next.js 15 (App Router) · TypeScript · PostgreSQL + Prisma · TanStack Query · Zustand ·
  dnd-kit · Ajv · TipTap · Tailwind.
- **Shape:** a **pnpm monorepo**. The renderer and content schemas are isolated packages so the host
  platform can import them without dragging in the editor or server.

```
adapt-next/
├─ apps/studio/            # Next.js app: schema-driven editor UI + REST API (+ Prisma)
└─ packages/
   ├─ content-schemas/     # JSON-Schema content types + Ajv validation (no React/Next/Prisma)
   └─ renderer/            # portable <CourseRenderer/> (React only; no app/server deps)
```

## Content model

The Adapt content tree is preserved: **Course → ContentObject (menu/page) → Article → Block →
Component**. Every editable field is declared in JSON Schema; the editor *generates its forms from
those schemas* (the `SchemaForm` component), and per-component settings are stored as JSON Schema-
validated JSONB. Five components ship: `text`, `graphic`, `media`, `mcq`, `accordion`.

## Run locally

Prerequisites: **Node ≥ 20**, **pnpm 10**, **PostgreSQL** running locally.

```bash
# 1. install
pnpm install

# 2. point Prisma at your database
cp apps/studio/.env.example apps/studio/.env      # edit DATABASE_URL if needed
#   default: postgresql://adapt:adapt@localhost:5432/adapt_next
#   create that role/db, e.g.:
#   sudo -u postgres psql -c "CREATE ROLE adapt LOGIN PASSWORD 'adapt' CREATEDB;"
#   sudo -u postgres psql -c "CREATE DATABASE adapt_next OWNER adapt;"

# 3. migrate + seed a demo course (2 pages, all 5 component types)
pnpm --filter @adapt-next/studio exec prisma migrate dev
pnpm --filter @adapt-next/studio db:seed

# 4. run
pnpm dev            # http://localhost:3000  → /projects
```

## Verify

```bash
pnpm build                                            # type-checks + compiles all routes
pnpm --filter @adapt-next/content-schemas test        # Ajv validation unit tests
# portable render (renderer + React only, no studio imports):
cd apps/studio && TSX_TSCONFIG_PATH=../../tsconfig.base.json pnpm exec tsx scripts/render-check.ts
```

End-to-end: open `/projects` → create a course → add pages (drag to reorder) → add
articles/blocks/components → edit properties in the right-hand schema-driven panel (autosaves) →
**Preview** to interact with the MCQ.

## REST API (the portable boundary)

```
GET/POST   /api/courses                 GET/PATCH/DELETE /api/courses/:id
GET        /api/courses/:id/tree        GET /api/courses/:id/preview   (renderer JSON)
GET        /api/schemas
POST       /api/content/:type           PATCH/DELETE /api/content/:type/:id
POST       /api/content/:type/reorder   POST /api/content/:type/:id/move
```
`:type ∈ contentobject | article | block | component`. Component writes validate `properties` against
the component's JSON Schema (Ajv) and 400 on failure.

## Add a component type

1. Add `packages/content-schemas/src/components/<key>/{schema.json,defaults.json}`
   (JSON Schema with `x-ui` widget hints).
2. Register it in `packages/content-schemas/src/registry.ts` (one manifest line).
3. Add a renderer in `packages/renderer/src/components/<Name>.tsx` and register it in
   `register-builtins.ts`.

No changes to the editor, `SchemaForm`, or API are needed — it appears in the component picker and
gets an auto-generated, validated property form.

## Roadmap (designed-for, not yet built)

Adapt-compatible SCORM/HTML5 export (a pure transform over `publish.service.ts`), asset library,
theming, extensions, tags, multi-tenant orgs, roles/permissions, import, platform SSO.
