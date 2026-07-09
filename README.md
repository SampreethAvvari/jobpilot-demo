# JobPilot · public demo

A hands-on demo of [JobPilot](https://github.com/SampreethAvvari/job-pilot), the
open-source job-hunt autopilot. This is the real console UI running on
**fictional data**: Jane Doe does not exist, none of the companies are real, and
nothing here is a real job posting. Everything you click works; mutations live
in memory and reset on reload.

**Why a canned demo?** So it can be free for everyone, forever. The console's AI
moments (per-job copilot, score rationales, tailoring reports) are recorded
replays of how the real system behaves, labeled as such in the UI. The one live
model is the **Tailor** page, which runs a small open-weight model on Cloudflare
Workers AI's free allocation with Turnstile and daily caps.

## Layout

```
src/lib/fixtures/   the fictional dataset: jobs, companies, outreach, reports, chats
src/lib/store.ts    in-memory replacement for the real console's Google Sheet
src/components/     the console UI, adapted from job-pilot/ui
src/components/tour.tsx  the guided tour (driver.js)
pdf-src/            LaTeX sources + build script for the fictional PDFs
worker/             the live tailoring endpoint (Workers AI + KV + Turnstile)
```

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to out/
python pdf-src/build.py   # regenerate the fictional PDFs (needs pdflatex)
```

## Deploy

- **Site:** `npm run build`, then deploy `out/` to Cloudflare Pages
  (`wrangler pages deploy out`). Set `NEXT_PUBLIC_TAILOR_ENDPOINT` and
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` at build time to enable the live Tailor page;
  without them it shows a labeled sample instead.
- **Worker:** see `worker/wrangler.toml`. Free plan only: Workers AI free
  allocation, KV free tier, Turnstile. When the daily allocation runs out the
  worker returns 429 and the page falls back gracefully.

## The real thing

The production system (hourly pipeline, Gemini scoring, LaTeX tailoring with a
judge loop, Gmail outreach drafts, inbox watching) is MIT-licensed at
[SampreethAvvari/job-pilot](https://github.com/SampreethAvvari/job-pilot), with
a fork guide written to be handed to an AI coding agent:
[docs/FORK-SETUP.md](https://github.com/SampreethAvvari/job-pilot/blob/master/docs/FORK-SETUP.md).
Runs on your own Google Cloud billing for roughly $0 to $10 a month.

MIT © Sampreeth Avvari
