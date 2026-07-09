// Fictional job descriptions. Flagship jobs get hand-written postings; every
// other row gets a believable generated one so the posting view never runs dry.

import type { Job } from "../types";

const HAND: Record<string, string> = {
  "mw-fde": `Marrowstone AI builds retrieval-grounded assistants for insurance and logistics operators. Forward Deployed Engineers own a customer from kickoff to production: you sit with claims teams, map their mess, and ship the assistant that survives it.

What you'll do
• Embed with 2 to 3 enterprise customers at a time; run discovery, then build
• Stand up retrieval pipelines over customer document stores (RAG, hybrid search)
• Write evals that encode each customer's definition of correct before launch
• Ship guardrails: PII scrubbing, refusal behavior, audit trails
• Demo weekly to stakeholders who do not write code

What we need
• 0 to 2 years shipping production Python or TypeScript
• Hands-on LLM integration work: prompts, function calling, structured output
• Evidence you can hold a room: teaching, demos, or customer-facing projects
• SQL fluency; comfort reading unfamiliar schemas fast

Nice to have
• Go services experience; Postgres at scale
• An open-source project people actually use

Visa sponsorship: we sponsor H-1B and have done so for recent grads.`,

  "oc-aie": `Osprey Compute runs an inference cloud for open-weight models. The Applied Models team makes new checkpoints fast, cheap, and measurably good before customers see them.

The work
• Build and maintain the eval harness that gates every model release
• Quantize and serve new checkpoints (vLLM, TensorRT-LLM); chase tokens/sec
• Design regression suites that catch quality drops before deploys
• Publish honest model cards: latency, cost, quality trade-offs per task

You
• Strong PyTorch fundamentals; you have fine-tuned something real
• You treat evals as engineering, not vibes: datasets, metrics, CI
• Python that other people can read; Kubernetes does not scare you
• 0 to 2 years experience or an M.S. with substantial project work

We sponsor work visas including H-1B transfers and new petitions.`,

  "bl-mle": `Bluewater Ledger is a payments platform for mid-market banks. The Risk team builds the models that decide, in 40 milliseconds, whether a transaction is fraud.

Responsibilities
• Own features end to end: ideation, backtest, feature store, online serving
• Ship gradient-boosted and neural models under strict latency budgets
• Build drift monitoring that pages before precision falls
• Partner with analysts to turn case reviews into labeled data

Requirements
• ML fundamentals you can defend at a whiteboard: bias/variance, calibration, PR curves
• Production Python plus SQL over large event streams (BigQuery or similar)
• Some payments, fintech, or fraud exposure strongly preferred
• B.S./M.S. in CS or related; new grads with strong internships welcome

Bluewater Ledger sponsors employment visas for exceptional candidates.`,

  "qz-sde": `Quartzline Systems builds the replicated block store behind three of the ten largest SaaS providers. The Distributed Storage team owns the write path.

You will
• Work in Go on the replication pipeline: consensus, backpressure, recovery
• Instrument everything; our SLOs are public inside the company
• Reproduce gnarly failures in the deterministic simulator before fixing them
• Review designs with engineers who have been doing this for a decade

You have
• Systems fundamentals: memory, concurrency, the fallacies of distributed computing
• Production experience in Go, Rust, or C++ (internships count)
• The patience to make a change boring before making it fast
• B.S./M.S. in CS or equivalent

Visa status: case-by-case sponsorship; strong candidates encouraged regardless.`,

  "tg-fde": `Tidegate Analytics deploys a data platform for regional logistics firms. Forward Deployed Engineers turn a signed contract into a live deployment in eight weeks.

The job
• Run discovery workshops with dispatchers, then model their data honestly
• Build ingestion from whatever exists: CSVs on FTP, ancient SQL Server, spreadsheets
• Configure dashboards the customer keeps using after you leave
• Feed what you learn back into the product as specs the core team can build

About you
• SQL you could teach; Python for glue and cleanup
• You have shipped something with a real deadline and a real user
• Clear writer, calm presenter, good listener
• Travel up to 30% within the US

We support work authorization needs including H-1B sponsorship.`,

  "sc-mle": `Saltcreek Robotics automates cold-storage warehouses. The Perception team turns camera streams into decisions a forklift can trust.

What you'll build
• Detection and embedding models for pallets, labels, and people
• The data engine: curation, auto-labeling, hard-negative mining
• Eval suites tied to warehouse KPIs, not just mAP
• Deployment pipelines to edge GPUs with frozen dependencies

What we look for
• PyTorch depth: you have trained, debugged, and shipped a vision model
• Understanding of contrastive and multimodal methods (CLIP-family)
• Comfort with data work: most wins here are dataset wins
• M.S. with research experience or equivalent shipped work

H-1B sponsorship available for the right candidate.`,

  "eb-aie": `Emberline builds developer tools with a code assistant at the core. The Copilot Features team ships the completions, chat, and refactor flows our 40k developers use daily.

Day to day
• Prototype and ship assistant features in TypeScript end to end
• Design prompt and context strategies; measure them with offline evals plus A/Bs
• Build telemetry that tells us when the model is wrong and why
• Tune latency: caching, streaming, speculative UX

Requirements
• Shipped LLM-backed features or serious side projects (show us)
• Strong TypeScript or Python; taste for developer experience
• An eval mindset: you distrust demos, including your own
• 0 to 3 years experience

We sponsor visas, including for new grads on OPT.`,

  "kf-sde": `Kestrel Freight runs a marketplace matching shippers with carriers. The Marketplace team owns pricing, matching, and the event backbone they ride on.

You will
• Build Go services for load pricing and carrier matching
• Design event flows that stay correct when a truck cancels at 2 a.m.
• Own idempotency, retries, and reconciliation for money-adjacent paths
• Profile and fix the slow parts; we publish p99s internally

You bring
• Production experience with Go or a typed backend language
• PostgreSQL fluency: schemas, indexes, query plans
• Instinct for failure modes; you write the runbook with the feature
• 0 to 2 years experience or strong internships

Sponsorship: reviewed case by case; we have sponsored H-1B before.`,
};

const GEN_INTRO = [
  "%c is hiring a %t to join a small team with real ownership.",
  "%c builds software operators rely on daily; the %t role sits at the center of it.",
  "As a %t at %c you will ship weekly and own what you ship.",
];
const GEN_BULLETS = [
  "Design, build, and operate production services with observability from day one",
  "Work directly with users; turn feedback into shipped improvements",
  "Write tests and evals that keep quality honest as the team moves fast",
  "Collaborate in code review; leave things clearer than you found them",
  "Own features end to end, from design doc to dashboard",
];
const GEN_REQS = [
  "Strong fundamentals in Python, TypeScript, or Go",
  "SQL fluency and comfort with production data",
  "Evidence of shipped work: internships, projects, or open source",
  "Clear written communication",
  "0 to 2 years of professional experience",
];

/** The posting text for any job: hand-written when we have it, generated
 * otherwise. Deterministic per job id. */
export function jdFor(job: Job): string {
  const hand = HAND[job.id];
  if (hand) return hand;
  let h = 0;
  for (const ch of job.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const intro = GEN_INTRO[h % GEN_INTRO.length]
    .replace("%c", job.company)
    .replace("%t", job.title);
  const bullets = [...GEN_BULLETS].slice(0, 4).map((b) => `• ${b}`).join("\n");
  const reqs = [...GEN_REQS].slice(0, 4).map((b) => `• ${b}`).join("\n");
  return `${intro}\n\nWhat you'll do\n${bullets}\n\nWhat we look for\n${reqs}\n\nLocation: ${job.location}.`;
}
