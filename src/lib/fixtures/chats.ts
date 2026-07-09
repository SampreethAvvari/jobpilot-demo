// Recorded copilot conversations. In the real console this is live Gemini,
// grounded in a knowledge pack plus the job's description. The demo replays
// answers written the way the guardrailed assistant actually responds:
// persona facts only, STAR structure on request, no invented experience.

import type { Job } from "../types";

export type CannedTurn = { question: string; answer: string };

const FIT_MW = `Three concrete overlaps.

1. Customer-embedded shipping. The posting's core is discovery with claims teams, then building. At Halespring, Jane ran onboarding interviews with merchandising stakeholders and demoed the retrieval model weekly to people who do not write code. That is the FDE working loop at intern scale.

2. RAG with evals before launch. Marrowstone wants evals that encode each customer's definition of correct. Jane built Signalcast for exactly that reason, and Atlas Notes is a shipped retrieval product with hybrid search.

3. Their integration stack. Go and Postgres from two years of payments APIs at Brightpath cover the plumbing half of the role.

The honest gap: no insurance domain experience. Lead with the loop, not the domain.`;

const WHY_MW = `Here is a 120-word answer in Jane's voice, facts from her background only:

"I want the job where the model meets the claims adjuster. I have built the pieces separately: a retrieval assistant with hybrid search, an eval harness that gates releases, and a recommendation model I demoed weekly to non-technical stakeholders. Marrowstone is the role that makes those one job. I also like that your posting treats guardrails and audit trails as first-class work rather than compliance chores; that matches how I built audit logging into my internship project. And you deploy into insurance and logistics, industries where wrong answers cost real money, which is exactly where eval discipline earns its keep."`;

const FOLLOWUP_MW = `Subject: Forward Deployed Engineer application · Jane Doe

Hi <recruiter name>,

I applied to the Forward Deployed Engineer opening this week. One pointer that may help the review: Atlas Notes (github.com/janedoe) is a working retrieval assistant with hybrid search, and Signalcast is the eval harness I use to gate its releases. Both are close to the shape of work in your posting.

Happy to share a short demo either way.

Jane`;

const GAPS_MW = `Two gaps worth preparing for, honestly framed.

1. Insurance domain. You have none. Prepare a 60-second answer on how you learn a domain fast: the Halespring onboarding interviews are your evidence, since you went from zero merchandising knowledge to a shipped model in one summer.

2. Years of production experience. The posting says 0 to 2, so you qualify, but your production time is one internship plus Brightpath. Frame Brightpath as two years of real on-call, deploys, and postmortems, because it was.

Do not defend the gaps by stretching facts; the resume tailor already refused to add insurance keywords, and an interviewer will respect the same honesty.`;

const FIT_OC = `Strong fit on the eval half, credible on the serving half.

The eval harness requirement is Signalcast, nearly verbatim: regression suites, CI gating, failure tagging. Say the phrase "I stopped trusting my own demos" and mean it.

On serving: the lab work included int8-quantized checkpoints for group-wide inference. That is smaller scale than Osprey's cloud, but it is a real serving story with a quality-versus-cost trade-off you personally measured.

Gap: no vLLM or TensorRT-LLM in production. You have read the vLLM scheduler source for Atlas Notes batching decisions; that is a legitimate talking point, not a resume line.`;

const STAR_OC = `STAR answer for "tell me about a hard technical problem":

Situation: At the Lakeshore Vision Lab, retrieval quality collapsed every time a teammate fine-tuned on new data, and nobody noticed until a weekly review.

Task: Make quality drops visible before they merged, without slowing the lab down.

Action: Jane built Signalcast: a fixed eval set with per-slice metrics, run in CI on every training PR, with failures tagged by slice so the diff pointed at the cause. She negotiated a 90-second runtime budget so the lab would actually keep it enabled.

Result: Three regressions caught in the first month, including a 9-point top-1 recall drop from a bad augmentation flag. The harness became the lab default and is now open source.`;

const FIT_BL = `The domain match does the work here.

Bluewater wants fraud models under a 40ms budget from someone with payments exposure. Jane has two years of payments APIs at Brightpath, including the p99 220ms-to-80ms story, which proves she thinks in latency budgets. Halespring adds the modeling side: a two-tower model behind a feature store on BigQuery.

The drift-monitoring requirement maps to Signalcast's score-drift alerts.

Gap: her models were recommendations, not fraud. The transferable claim is ranking under class imbalance plus feature freshness, both of which fraud shares.`;

const FIT_QZ = `This one is a systems-fundamentals bet.

Direct evidence: Go in production for two years, the p99 latency win driven by tracing, and a habit of making changes boring before fast, which their posting explicitly values.

Honest gap: no shipped consensus code, only coursework. The tailor left that keyword out on purpose. If asked, say the course project (a Raft implementation) taught you the vocabulary, and the Brightpath incident reviews taught you the fear.`;

const FIT_TG = `Match the deployment rhythm, not just the skills.

Tidegate ships a data platform in eight weeks per customer. Jane's Ledgerlight went idea to launch in nine weeks with real users, and her Halespring summer had a hard demo every Friday. That cadence evidence matters more than any single tool.

SQL is her strongest interview surface; the posting says "SQL you could teach" and she has TA'd the database course.

Gap: logistics vocabulary. Skim a dispatcher's day before the interview.`;

const FIT_SC = `Perception role, research evidence.

The CLIP fine-tuning work is the direct hit: 2M-image corpus, top-1 recall +9 points, and the hard-negative mining pass that made the gain stick. The posting says most wins are dataset wins; her mining pipeline is proof she believes it.

Gap: no edge deployment. The lab served int8-quantized checkpoints, which is adjacent, so frame edge as a constraint change rather than a new discipline.`;

const FIT_GENERIC = `Based on the stored description and Jane's background, the overlap is real but partial.

Strong: shipped Python and TypeScript, retrieval and eval work (Atlas Notes, Signalcast), and production API experience at Brightpath with measurable latency wins.

To verify in the posting: team size, on-call expectations, and how much of the role is the part Jane is strongest at. The fit score's one-line rationale in the Jobs table is the scorer's summary of exactly this trade-off.`;

const ANSWER_GENERIC = `A reusable 100-word template in Jane's voice, application-safe:

"I build AI systems that have to be right, not just impressive. My open-source eval harness, Signalcast, gates releases on regression suites because I stopped trusting demos. Atlas Notes, my retrieval assistant, answers with citations or refuses. At Halespring I shipped a recommendation model that lifted click-through 14%, and at Brightpath I spent two years keeping payments APIs fast and boring. I am looking for a team where that eval-first habit is an asset from week one."

Swap the last sentence for something specific to this company before using it.`;

export function chipsFor(job: Job): CannedTurn[] {
  const perJob: Record<string, CannedTurn[]> = {
    "mw-fde": [
      { question: "Why am I a good fit for this role?", answer: FIT_MW },
      { question: "Write my answer to 'Why Marrowstone?'", answer: WHY_MW },
      { question: "Draft a short follow-up email to the recruiter", answer: FOLLOWUP_MW },
      { question: "What gaps should I prepare to defend?", answer: GAPS_MW },
    ],
    "oc-aie": [
      { question: "Why am I a good fit for this role?", answer: FIT_OC },
      { question: "Answer 'tell me about a hard problem' in STAR form", answer: STAR_OC },
      { question: "What gaps should I prepare to defend?", answer: FIT_OC },
    ],
    "bl-mle": [
      { question: "Why am I a good fit for this role?", answer: FIT_BL },
      { question: "Write a 100-word 'why this company' answer", answer: ANSWER_GENERIC },
    ],
    "qz-sde": [
      { question: "Why am I a good fit for this role?", answer: FIT_QZ },
      { question: "Answer 'tell me about a hard problem' in STAR form", answer: STAR_OC },
    ],
    "tg-fde": [
      { question: "Why am I a good fit for this role?", answer: FIT_TG },
      { question: "Write a 100-word 'why this company' answer", answer: ANSWER_GENERIC },
    ],
    "sc-mle": [
      { question: "Why am I a good fit for this role?", answer: FIT_SC },
      { question: "Answer 'tell me about a hard problem' in STAR form", answer: STAR_OC },
    ],
  };
  return (
    perJob[job.id] ?? [
      { question: "Why am I a good fit for this role?", answer: FIT_GENERIC },
      { question: "Write a 100-word 'why this company' answer", answer: ANSWER_GENERIC },
    ]
  );
}

/** Chips for the standalone Assistant page (no job locked). */
export const ASSISTANT_CHIPS: CannedTurn[] = [
  {
    question: "Rewrite my summary for an AI platform role",
    answer: `Current summary:
"AI engineer with production LLM and retrieval experience: recommendation models at Halespring, multimodal research at Lakeshore, and open-source tools with 12k installs."

Platform-role rewrite, same facts, infrastructure emphasis:
"AI engineer who builds the plumbing that keeps models honest: an open-source eval harness (Signalcast) that gates releases in CI, quantized model serving for a research lab, and a retrieval assistant with measured latency wins. Production background in payments APIs at 40k-merchant scale."`,
  },
  {
    question: "Answer 'tell me about a project' in STAR form",
    answer: STAR_OC,
  },
  {
    question: "Write a cover letter opening for a fintech ML role",
    answer: `Opening paragraph, Jane's voice, facts only:

"I spent two years keeping payments APIs correct and fast at Brightpath, so I know what a 40-millisecond budget feels like from the serving side. Since then I have added the modeling half: a two-tower recommendation model shipped through an A/B test at Halespring, and an eval harness I built because model quality deserves the same monitoring as uptime. A fraud-modeling role is where those two halves meet."`,
  },
  {
    question: "What should I say about needing sponsorship?",
    answer: `Direct and early is the standard advice, and it is what the real pipeline does: the scorer already down-ranks postings whose text signals no sponsorship, so anything in your console is worth applying to.

A clean sentence for forms and conversations:
"I am on F-1 OPT with three years of work authorization including STEM extension, and I will need H-1B sponsorship down the line."

Never soften it into ambiguity; wasted interviews cost more than filtered applications.`,
  },
];

/** The reply typed answers fall back to when a visitor writes their own text. */
export const FREE_TEXT_REPLY = `In the real console this box is live: a guardrailed Gemini chat grounded in Jane's resumes, GitHub, portfolio, and this job's full description, and it will draft answers, rewrite bullets, and generate tailored PDFs on demand.

The demo replays recorded answers instead, so the suggested questions above are the ones that work here. For a live model on your own resume, try the Tailor page from the sidebar; to run the full copilot on your own data, see Run your own.`;
