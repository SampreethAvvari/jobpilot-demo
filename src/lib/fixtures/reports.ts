// Fictional tailoring transparency reports and master-resume judge reports,
// mirroring the shapes the real console renders. Keyword quotes are real
// substrings of the fixture postings in jd.ts.

export type KeywordFate = {
  keyword: string;
  jd_quote: string;
  in_baseline: boolean;
  action: "already_present" | "added" | "not_addable";
  section: string;
  before: string;
  after: string;
  reason: string;
};

export type JudgeReport = {
  score?: number;
  breakdown?: Record<string, number>;
  keyword_coverage?: number;
  attempts?: number;
  issues?: string[];
};

export type TailorReport = {
  precision: string;
  jd: { summary: string; requirements: string[]; nice_to_haves: string[] };
  keywords: KeywordFate[];
  resume_rationale: string;
  cover_rationale: string;
  master_suggestions: string[];
  diff_sections: { section: string; baseline: string; tailored: string }[];
  diff_pdf: string;
  ats: JudgeReport;
};

export type MasterReport = {
  timestamp: string;
  kind: "master";
  key: string;
  score: number;
  report: {
    score: number;
    breakdown: Record<string, number>;
    keyword_coverage: number;
    pages: number;
    words: number;
    attempts: number;
    issues: string[];
  };
};

const SUMMARY_BASE =
  "AI engineer with production LLM and retrieval experience: recommendation models at Halespring, multimodal research at Lakeshore, and open-source tools with 12k installs.";

export const TAILOR_REPORTS: Record<string, TailorReport> = {
  "mw-fde": {
    precision: "full",
    jd: {
      summary:
        "Customer-embedded engineer shipping retrieval-grounded assistants for insurance and logistics; discovery to production, with evals and guardrails as first-class work.",
      requirements: [
        "0 to 2 years shipping production Python or TypeScript",
        "Hands-on LLM integration: prompts, function calling, structured output",
        "Evidence of holding a room: teaching, demos, customer-facing work",
        "SQL fluency, fast on unfamiliar schemas",
      ],
      nice_to_haves: ["Go services experience; Postgres at scale", "An open-source project people actually use"],
    },
    keywords: [
      {
        keyword: "RAG",
        jd_quote: "Stand up retrieval pipelines over customer document stores (RAG, hybrid search)",
        in_baseline: true,
        action: "already_present",
        section: "Projects",
        before: "",
        after: "",
        reason: "Atlas Notes already states hybrid retrieval with pgvector.",
      },
      {
        keyword: "evals",
        jd_quote: "Write evals that encode each customer's definition of correct before launch",
        in_baseline: true,
        action: "already_present",
        section: "Projects",
        before: "",
        after: "",
        reason: "Signalcast bullet covers regression evals in CI.",
      },
      {
        keyword: "guardrails",
        jd_quote: "Ship guardrails: PII scrubbing, refusal behavior, audit trails",
        in_baseline: false,
        action: "added",
        section: "Experience · Halespring",
        before:
          "Built a two-tower retrieval model for cold-start recommendations, lifting click-through 14% in the A/B test.",
        after:
          "Built a two-tower retrieval model for cold-start recommendations with output guardrails and audit logging, lifting click-through 14% in the A/B test.",
        reason: "Guardrail and audit work was real but unstated; surfaced it in the existing bullet.",
      },
      {
        keyword: "stakeholder demos",
        jd_quote: "Demo weekly to stakeholders who do not write code",
        in_baseline: false,
        action: "added",
        section: "Summary",
        before: SUMMARY_BASE,
        after:
          SUMMARY_BASE.replace(
            "open-source tools with 12k installs.",
            "open-source tools with 12k installs, presented weekly to non-technical stakeholders during the Halespring rollout.",
          ),
        reason: "Weekly demo cadence was part of the internship; the summary now says so.",
      },
      {
        keyword: "insurance domain",
        jd_quote: "retrieval-grounded assistants for insurance and logistics operators",
        in_baseline: false,
        action: "not_addable",
        section: "",
        before: "",
        after: "",
        reason: "No insurance work exists in the background. The tailor never invents experience.",
      },
    ],
    resume_rationale:
      "Led with the FDE master because the role scores on customer-facing delivery. Reordered Projects above Research, expanded the Halespring bullet with the guardrail work, and quantified the demo cadence. Nothing was invented; two facts were surfaced.",
    cover_rationale:
      "Three short paragraphs: the Tidegate-style discovery instinct, the Ledgerlight launch as proof of shipping under ambiguity, and a direct sponsorship note since the posting invites it.",
    master_suggestions: [
      "If Jane completes an insurance-data side project, the FDE master should mention the domain explicitly.",
      "Consider a one-line metric for the weekly stakeholder demos (attendance or decisions unblocked).",
    ],
    diff_sections: [
      {
        section: "Summary",
        baseline: SUMMARY_BASE,
        tailored: SUMMARY_BASE.replace(
          "open-source tools with 12k installs.",
          "open-source tools with 12k installs, presented weekly to non-technical stakeholders during the Halespring rollout.",
        ),
      },
      {
        section: "Experience · Halespring",
        baseline:
          "Built a two-tower retrieval model for cold-start recommendations, lifting click-through 14% in the A/B test.",
        tailored:
          "Built a two-tower retrieval model for cold-start recommendations with output guardrails and audit logging, lifting click-through 14% in the A/B test.",
      },
    ],
    diff_pdf: "",
    ats: {
      score: 94,
      breakdown: { impact: 33, brevity: 19, style: 14, sections: 15, soft_skills: 13 },
      keyword_coverage: 0.92,
      attempts: 3,
      issues: ["One bullet ends without a number (Education section)."],
    },
  },

  "oc-aie": {
    precision: "full",
    jd: {
      summary:
        "Eval-harness and serving work that gates model releases on an inference cloud: quantization, regression suites, honest model cards.",
      requirements: [
        "Strong PyTorch fundamentals with real fine-tuning work",
        "Evals as engineering: datasets, metrics, CI",
        "Readable Python; Kubernetes comfort",
      ],
      nice_to_haves: ["vLLM or TensorRT-LLM exposure", "Published benchmarks or model cards"],
    },
    keywords: [
      {
        keyword: "eval harness",
        jd_quote: "Build and maintain the eval harness that gates every model release",
        in_baseline: true,
        action: "already_present",
        section: "Projects",
        before: "",
        after: "",
        reason: "Signalcast is precisely this; the bullet already leads with it.",
      },
      {
        keyword: "quantization",
        jd_quote: "Quantize and serve new checkpoints (vLLM, TensorRT-LLM); chase tokens/sec",
        in_baseline: false,
        action: "added",
        section: "Research · Lakeshore Vision Lab",
        before:
          "Fine-tuned CLIP-family models on a 2M-image corpus, lifting top-1 recall 9 points.",
        after:
          "Fine-tuned CLIP-family models on a 2M-image corpus, lifting top-1 recall 9 points; served int8-quantized checkpoints for lab-wide inference.",
        reason: "The lab deployment used int8 quantization; now stated.",
      },
      {
        keyword: "regression suites",
        jd_quote: "Design regression suites that catch quality drops before deploys",
        in_baseline: true,
        action: "already_present",
        section: "Projects",
        before: "",
        after: "",
        reason: "Covered by the Signalcast CI bullet.",
      },
      {
        keyword: "TensorRT-LLM",
        jd_quote: "Quantize and serve new checkpoints (vLLM, TensorRT-LLM)",
        in_baseline: false,
        action: "not_addable",
        section: "",
        before: "",
        after: "",
        reason: "No TensorRT-LLM work in the background; listing tools unused would be invention.",
      },
    ],
    resume_rationale:
      "AIE master chosen. Moved Signalcast to the top project slot, surfaced the int8 serving detail in the research bullet, and tightened the skills line toward serving and evals.",
    cover_rationale:
      "Short and technical: the harness Jane built, the metric it moved, and why gating releases on evals matches how she already works.",
    master_suggestions: ["A tokens/sec or latency number for the lab serving work would strengthen the AIE master."],
    diff_sections: [
      {
        section: "Research · Lakeshore Vision Lab",
        baseline:
          "Fine-tuned CLIP-family models on a 2M-image corpus, lifting top-1 recall 9 points.",
        tailored:
          "Fine-tuned CLIP-family models on a 2M-image corpus, lifting top-1 recall 9 points; served int8-quantized checkpoints for lab-wide inference.",
      },
    ],
    diff_pdf: "",
    ats: {
      score: 93,
      breakdown: { impact: 32, brevity: 19, style: 14, sections: 15, soft_skills: 13 },
      keyword_coverage: 0.9,
      attempts: 4,
      issues: [],
    },
  },

  "bl-mle": {
    precision: "full",
    jd: {
      summary:
        "Real-time fraud models under 40ms budgets: feature store to online serving, drift monitoring, analyst partnership.",
      requirements: [
        "Defensible ML fundamentals: calibration, PR curves",
        "Production Python plus SQL over large event streams",
        "Payments or fraud exposure preferred",
      ],
      nice_to_haves: ["Feature-store experience", "Latency-budget serving"],
    },
    keywords: [
      {
        keyword: "feature store",
        jd_quote: "Own features end to end: ideation, backtest, feature store, online serving",
        in_baseline: true,
        action: "already_present",
        section: "Experience · Halespring",
        before: "",
        after: "",
        reason: "The BigQuery feature-store bullet covers it.",
      },
      {
        keyword: "drift monitoring",
        jd_quote: "Build drift monitoring that pages before precision falls",
        in_baseline: false,
        action: "added",
        section: "Projects · Signalcast",
        before: "An eval harness that catches prompt regressions in CI.",
        after: "An eval harness that catches prompt regressions and score drift in CI, alerting before quality drops ship.",
        reason: "Drift alerts are a Signalcast feature; the bullet now names them.",
      },
      {
        keyword: "payments",
        jd_quote: "Some payments, fintech, or fraud exposure strongly preferred",
        in_baseline: true,
        action: "already_present",
        section: "Experience · Brightpath",
        before: "",
        after: "",
        reason: "Two years of payments APIs already lead the experience section.",
      },
    ],
    resume_rationale:
      "MLE master with the Brightpath payments experience promoted above research: domain match outranks recency for this posting.",
    cover_rationale: "Opens on the 40ms constraint and the p99 story, closes on the analyst-partnership habit.",
    master_suggestions: [],
    diff_sections: [
      {
        section: "Projects · Signalcast",
        baseline: "An eval harness that catches prompt regressions in CI.",
        tailored:
          "An eval harness that catches prompt regressions and score drift in CI, alerting before quality drops ship.",
      },
    ],
    diff_pdf: "",
    ats: {
      score: 92,
      breakdown: { impact: 32, brevity: 18, style: 14, sections: 15, soft_skills: 13 },
      keyword_coverage: 0.89,
      attempts: 2,
      issues: ["Skills line slightly over one row at 10pt."],
    },
  },

  "qz-sde": {
    precision: "full",
    jd: {
      summary: "Go on the replicated write path: consensus, backpressure, deterministic-simulator debugging.",
      requirements: [
        "Systems fundamentals: memory, concurrency, distributed-systems failure modes",
        "Production Go, Rust, or C++ (internships count)",
      ],
      nice_to_haves: ["Public SLO culture", "Simulator-first debugging"],
    },
    keywords: [
      {
        keyword: "Go",
        jd_quote: "Work in Go on the replication pipeline: consensus, backpressure, recovery",
        in_baseline: true,
        action: "already_present",
        section: "Experience · Brightpath",
        before: "",
        after: "",
        reason: "Go is the first language on the Brightpath bullets.",
      },
      {
        keyword: "observability",
        jd_quote: "Instrument everything; our SLOs are public inside the company",
        in_baseline: false,
        action: "added",
        section: "Experience · Brightpath",
        before: "Cut p99 latency on the payments API from 220ms to 80ms.",
        after: "Cut p99 latency on the payments API from 220ms to 80ms, driven by tracing and dashboarded SLOs.",
        reason: "The latency win came from instrumentation; the bullet now credits it.",
      },
      {
        keyword: "consensus",
        jd_quote: "consensus, backpressure, recovery",
        in_baseline: false,
        action: "not_addable",
        section: "",
        before: "",
        after: "",
        reason: "Coursework only; no shipped consensus code to claim.",
      },
    ],
    resume_rationale: "SDE master, systems bullets first, project section trimmed to the two with production users.",
    cover_rationale: "One page on the boring-correctness instinct, with the p99 story as evidence.",
    master_suggestions: ["A distributed-systems side project would close the consensus gap honestly."],
    diff_sections: [
      {
        section: "Experience · Brightpath",
        baseline: "Cut p99 latency on the payments API from 220ms to 80ms.",
        tailored: "Cut p99 latency on the payments API from 220ms to 80ms, driven by tracing and dashboarded SLOs.",
      },
    ],
    diff_pdf: "",
    ats: {
      score: 91,
      breakdown: { impact: 31, brevity: 19, style: 13, sections: 15, soft_skills: 13 },
      keyword_coverage: 0.86,
      attempts: 5,
      issues: ["Two bullets open with the same verb (Built)."],
    },
  },

  "tg-fde": {
    precision: "full",
    jd: {
      summary: "Eight-week data-platform deployments for logistics firms: discovery workshops, scrappy ingestion, dashboards that stick.",
      requirements: ["Teachable SQL; Python for glue", "Shipped work with real deadlines", "Clear writing, calm presenting"],
      nice_to_haves: ["Logistics exposure", "Travel up to 30%"],
    },
    keywords: [
      {
        keyword: "discovery",
        jd_quote: "Run discovery workshops with dispatchers, then model their data honestly",
        in_baseline: false,
        action: "added",
        section: "Summary",
        before: SUMMARY_BASE,
        after: SUMMARY_BASE.replace("AI engineer", "AI engineer comfortable leading discovery sessions,"),
        reason: "Halespring onboarding interviews were discovery in practice; the summary now claims it plainly.",
      },
      {
        keyword: "dashboards",
        jd_quote: "Configure dashboards the customer keeps using after you leave",
        in_baseline: true,
        action: "already_present",
        section: "Projects",
        before: "",
        after: "",
        reason: "Ledgerlight ships a usage dashboard; already stated.",
      },
    ],
    resume_rationale: "FDE master with the customer-facing bullets promoted and research demoted to one line.",
    cover_rationale: "Names the eight-week deadline and answers it with the Ledgerlight launch timeline.",
    master_suggestions: [],
    diff_sections: [
      {
        section: "Summary",
        baseline: SUMMARY_BASE,
        tailored: SUMMARY_BASE.replace("AI engineer", "AI engineer comfortable leading discovery sessions,"),
      },
    ],
    diff_pdf: "",
    ats: {
      score: 90,
      breakdown: { impact: 31, brevity: 18, style: 13, sections: 15, soft_skills: 13 },
      keyword_coverage: 0.84,
      attempts: 3,
      issues: ["Summary runs to three lines; two preferred."],
    },
  },

  "sc-mle": {
    precision: "full",
    jd: {
      summary: "Perception for cold-storage automation: detection and embedding models, the data engine, warehouse-KPI evals.",
      requirements: ["PyTorch depth with a shipped vision model", "CLIP-family understanding", "Comfort with data curation"],
      nice_to_haves: ["Edge deployment", "Auto-labeling pipelines"],
    },
    keywords: [
      {
        keyword: "CLIP",
        jd_quote: "Understanding of contrastive and multimodal methods (CLIP-family)",
        in_baseline: true,
        action: "already_present",
        section: "Research",
        before: "",
        after: "",
        reason: "The vision-lab bullet names CLIP fine-tuning and the recall lift.",
      },
      {
        keyword: "data curation",
        jd_quote: "The data engine: curation, auto-labeling, hard-negative mining",
        in_baseline: false,
        action: "added",
        section: "Research · Lakeshore Vision Lab",
        before: "Fine-tuned CLIP-family models on a 2M-image corpus, lifting top-1 recall 9 points.",
        after:
          "Fine-tuned CLIP-family models on a 2M-image corpus, lifting top-1 recall 9 points; built the hard-negative mining pass that made the gain stick.",
        reason: "The mining pipeline was hers; now visible.",
      },
    ],
    resume_rationale: "MLE master, research first for a perception role, projects trimmed to ML-relevant two.",
    cover_rationale: "Short: the recall number, the data-engine instinct, and why warehouses are a good fit for eval-first habits.",
    master_suggestions: [],
    diff_sections: [
      {
        section: "Research · Lakeshore Vision Lab",
        baseline: "Fine-tuned CLIP-family models on a 2M-image corpus, lifting top-1 recall 9 points.",
        tailored:
          "Fine-tuned CLIP-family models on a 2M-image corpus, lifting top-1 recall 9 points; built the hard-negative mining pass that made the gain stick.",
      },
    ],
    diff_pdf: "",
    ats: {
      score: 91,
      breakdown: { impact: 32, brevity: 18, style: 13, sections: 15, soft_skills: 13 },
      keyword_coverage: 0.88,
      attempts: 4,
      issues: [],
    },
  },

  "eb-aie": {
    precision: "full",
    jd: {
      summary: "Code-assistant features end to end in TypeScript: prompt and context strategies, offline evals plus A/Bs, latency work.",
      requirements: ["Shipped LLM-backed features", "Strong TypeScript or Python", "An eval mindset"],
      nice_to_haves: ["Prompt caching", "Telemetry design"],
    },
    keywords: [
      {
        keyword: "prompt caching",
        jd_quote: "Tune latency: caching, streaming, speculative UX",
        in_baseline: false,
        action: "added",
        section: "Projects · Atlas Notes",
        before: "Local-first RAG note assistant with pgvector and Next.js.",
        after: "Local-first RAG note assistant with pgvector and Next.js; prompt caching cut median answer latency 38%.",
        reason: "The caching layer existed with a measured number; promoted into the bullet.",
      },
      {
        keyword: "telemetry",
        jd_quote: "Build telemetry that tells us when the model is wrong and why",
        in_baseline: true,
        action: "already_present",
        section: "Projects · Signalcast",
        before: "",
        after: "",
        reason: "Signalcast's failure-tagging covers it.",
      },
      {
        keyword: "A/B testing",
        jd_quote: "measure them with offline evals plus A/Bs",
        in_baseline: true,
        action: "already_present",
        section: "Experience · Halespring",
        before: "",
        after: "",
        reason: "The +14% click-through claim is an A/B result and reads as one.",
      },
    ],
    resume_rationale: "AIE master; Atlas Notes promoted to the top slot for the assistant-product match, caching metric surfaced.",
    cover_rationale: "Developer-tool voice: what she uses daily, what she would fix first, and the eval habit as the closer.",
    master_suggestions: ["The 38% caching number belongs in the AIE master permanently."],
    diff_sections: [
      {
        section: "Projects · Atlas Notes",
        baseline: "Local-first RAG note assistant with pgvector and Next.js.",
        tailored: "Local-first RAG note assistant with pgvector and Next.js; prompt caching cut median answer latency 38%.",
      },
    ],
    diff_pdf: "",
    ats: {
      score: 92,
      breakdown: { impact: 32, brevity: 19, style: 14, sections: 15, soft_skills: 12 },
      keyword_coverage: 0.9,
      attempts: 3,
      issues: [],
    },
  },

  "kf-sde": {
    precision: "full",
    jd: {
      summary: "Go services for load pricing and matching on an event backbone; idempotency and reconciliation on money paths.",
      requirements: ["Production Go or typed backend", "PostgreSQL fluency", "Failure-mode instinct"],
      nice_to_haves: ["Marketplace experience", "Event-driven design"],
    },
    keywords: [
      {
        keyword: "idempotency",
        jd_quote: "Own idempotency, retries, and reconciliation for money-adjacent paths",
        in_baseline: false,
        action: "added",
        section: "Experience · Brightpath",
        before: "Built payments APIs in Go and PostgreSQL serving 40k merchants.",
        after: "Built idempotent payments APIs in Go and PostgreSQL serving 40k merchants, with retry-safe webhooks and daily reconciliation.",
        reason: "Idempotency keys and reconciliation were core to the job; now explicit.",
      },
      {
        keyword: "event-driven",
        jd_quote: "Design event flows that stay correct when a truck cancels at 2 a.m.",
        in_baseline: false,
        action: "added",
        section: "Skills",
        before: "FastAPI, React, Next.js",
        after: "FastAPI, event-driven services, React, Next.js",
        reason: "Supported by the webhook pipeline work; a skills-line addition, not a new claim.",
      },
      {
        keyword: "freight",
        jd_quote: "matching shippers with carriers",
        in_baseline: false,
        action: "not_addable",
        section: "",
        before: "",
        after: "",
        reason: "No logistics background; left honest.",
      },
    ],
    resume_rationale: "SDE master with the Brightpath money-path bullets expanded; projects trimmed to backend-relevant work.",
    cover_rationale: "Two paragraphs on correctness under partial failure, ending with the 2 a.m. cancellation line mirrored back.",
    master_suggestions: [],
    diff_sections: [
      {
        section: "Experience · Brightpath",
        baseline: "Built payments APIs in Go and PostgreSQL serving 40k merchants.",
        tailored:
          "Built idempotent payments APIs in Go and PostgreSQL serving 40k merchants, with retry-safe webhooks and daily reconciliation.",
      },
    ],
    diff_pdf: "",
    ats: {
      score: 90,
      breakdown: { impact: 31, brevity: 18, style: 14, sections: 15, soft_skills: 12 },
      keyword_coverage: 0.85,
      attempts: 6,
      issues: ["One acronym (CRDT) used without expansion."],
    },
  },
  "nf-mle": {
    precision: "excerpt",
    jd: {
      summary: "ML platform work: feature pipelines, model registry, serving on Ray. Tailored from the stored excerpt after the posting page returned 403.",
      requirements: ["Feature-store and pipeline experience", "Production Python", "Monitoring instincts"],
      nice_to_haves: ["Ray", "Model-registry design"],
    },
    keywords: [
      {
        keyword: "feature store",
        jd_quote: "feature pipelines your models can trust",
        in_baseline: true,
        action: "already_present",
        section: "Experience · Halespring",
        before: "",
        after: "",
        reason: "The BigQuery feature-store bullet covers it.",
      },
      {
        keyword: "Ray",
        jd_quote: "serving and batch jobs run on Ray",
        in_baseline: false,
        action: "not_addable",
        section: "",
        before: "",
        after: "",
        reason: "No Ray work in the background; left honest.",
      },
    ],
    resume_rationale:
      "Tailored from the stored JD excerpt because the live page kept returning 403; precision marked accordingly.",
    cover_rationale: "Skipped: excerpt too thin to write a specific letter honestly.",
    master_suggestions: [],
    diff_sections: [],
    diff_pdf: "",
    ats: {
      score: 89,
      breakdown: { impact: 31, brevity: 18, style: 13, sections: 15, soft_skills: 12 },
      keyword_coverage: 0.8,
      attempts: 2,
      issues: ["Tailored from a stored excerpt; keyword coverage may undercount."],
    },
  },
};

export function buildMasterReports(nowDate: string): Record<string, MasterReport> {
  const mk = (
    key: string,
    score: number,
    breakdown: Record<string, number>,
    coverage: number,
    words: number,
    attempts: number,
    issues: string[],
  ): MasterReport => ({
    timestamp: nowDate,
    kind: "master",
    key,
    score,
    report: { score, breakdown, keyword_coverage: coverage, pages: 1, words, attempts, issues },
  });
  return {
    AIE: mk("AIE", 93, { impact: 33, brevity: 19, style: 14, sections: 15, soft_skills: 12 }, 0.91, 468, 4, [
      "One bullet ends on commentary instead of a number.",
    ]),
    FDE: mk("FDE", 92, { impact: 32, brevity: 19, style: 14, sections: 15, soft_skills: 12 }, 0.89, 455, 3, []),
    MLE: mk("MLE", 91, { impact: 32, brevity: 18, style: 14, sections: 15, soft_skills: 12 }, 0.9, 471, 5, [
      "Skills line one word over the single-row budget.",
    ]),
    SDE: mk("SDE", 90, { impact: 31, brevity: 19, style: 13, sections: 15, soft_skills: 12 }, 0.87, 449, 7, [
      "Two bullets open with the same verb.",
      "Education line missing GPA (intentional; judge flags it anyway).",
    ]),
  };
}
