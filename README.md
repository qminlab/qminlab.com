# qminlab.com

Homepage of Qmin Lab, a one-person studio making apps, programs and games.

- Next.js (App Router, static export) · GSAP ScrollTrigger · a small WebGL renderer for the CSS-transformed 3D specimens (src/components/three/gl.ts) · next-intl (EN / KO)
- Footer wordmark liquid metal: Paper Shaders `LiquidMetal` (src/components/LiquidWord.tsx), loaded lazily as a ~10KB chunk
- `npm run dev` for local work, `npm run build` writes the static site to `out/`, `npm run typecheck` runs `tsc`.

## Deploy (Cloudflare Pages)

The site is a static export, so Cloudflare Pages serves it as plain files.

- Framework preset: Next.js (Static HTML Export)
- Build command: `npx next build`
- Build output directory: `out`

`/` is redirected at the edge by a Pages Function (`functions/index.js`, picked up automatically from the repo root): the language last chosen in the header, else the browser language (Korean → `/ko/`, others → `/en/`), else country (KR → `/ko/`). `src/app/page.tsx` does the same in the browser as a fallback.
