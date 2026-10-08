# qminlab.com

Homepage of Qmin Lab, a one-person studio making apps, programs and games.

- Next.js (App Router, static export) · GSAP ScrollTrigger · react-three-fiber · next-intl (EN / KO)
- `npm run dev` for local work, `npm run build` writes the static site to `out/`, `npm run typecheck` runs `tsc`.

## Deploy (Cloudflare Pages)

The site is a static export, so Cloudflare Pages serves it as plain files.

- Framework preset: Next.js (Static HTML Export)
- Build command: `npx next build`
- Build output directory: `out`

`/` sends Korean browsers to `/ko/` and everyone else to `/en/`.
