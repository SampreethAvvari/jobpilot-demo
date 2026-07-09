// Fictional cold-outreach records and the drafted emails behind them.
// In the real console a draft link opens Gmail; in the demo it opens an
// in-app preview of the drafted email. Nothing here was ever sent, which is
// also true of the real system until its pilot clicks send.

import type { Outreach } from "../types";
import { fmtStamp, hoursAgo, daysAgo } from "./time";

export type DraftEmail = { to: string; subject: string; body: string; attachments: string[] };

const SIGNATURE = `Jane Doe
janedoe.dev · linkedin.com/in/janedoe · github.com/janedoe`;

/** Company-level outreach drafts, keyed "co-<row-company-slug>". */
export const OUTREACH_DRAFTS: Record<string, DraftEmail> = {
  "co-marrowstone": {
    to: "careers@marrowstoneai.example",
    subject: "Forward Deployed Engineer · shipped RAG with eval coverage",
    body: `Hi Marrowstone team,

I build retrieval systems that hold up in front of users. Atlas Notes is my local-first RAG assistant (pgvector, hybrid search); Signalcast is the eval harness I wrote because I stopped trusting my own demos. At Halespring I shipped a two-tower retrieval model that lifted click-through 14% and presented the results to non-technical stakeholders weekly.

Your FDE posting reads like that combination. Resume and a tailored cover letter attached; happy to walk through any of the projects live.

${SIGNATURE}`,
    attachments: ["Jane_Doe_FDE.pdf", "Cover_Marrowstone.pdf"],
  },
  "co-osprey": {
    to: "talent@ospreycompute.example",
    subject: "AI Engineer, Applied Models · eval harnesses and quantized serving",
    body: `Hi Osprey team,

I wrote Signalcast, an eval harness that gates merges on regression suites, because prompt changes kept shipping quality drops. In my lab work I fine-tuned CLIP-family models (top-1 recall +9 points) and served int8-quantized checkpoints for the group.

Gating model releases on evals is how I already work. Resume attached; I would love to talk about the harness design.

${SIGNATURE}`,
    attachments: ["Jane_Doe_AIE.pdf", "Cover_Osprey.pdf"],
  },
  "co-driftwood": {
    to: "jobs@driftwoodmetrics.example",
    subject: "AI Engineer, Insights · NL-to-SQL with honest evals",
    body: `Hi Driftwood team,

Your Insights role is close to what I build for fun: Atlas Notes answers questions over private notes with retrieval and citations, and refuses when the context is thin. I also maintain Signalcast, an eval harness that catches prompt regressions in CI.

I would enjoy making NL-to-SQL answers as accountable. Resume attached.

${SIGNATURE}`,
    attachments: ["Jane_Doe_AIE.pdf"],
  },
  "co-brightmoor": {
    to: "",
    subject: "Research Engineer, Eval Infrastructure · Signalcast author",
    body: `Hi Brightmoor team,

Signalcast, my open-source eval harness, exists because I wanted regression evals in CI with failure tagging, not dashboards nobody reads. Your eval-infrastructure posting describes the production version of that idea.

Resume attached; the harness README has a two-minute architecture sketch.

${SIGNATURE}`,
    attachments: ["Jane_Doe_MLE.pdf"],
  },
  "co-lanternfish": {
    to: "recruiting@lanternfishai.example",
    subject: "AI Engineer, Retrieval · hybrid search plus reranking, measured",
    body: `Hi Lanternfish team,

I applied to your Retrieval opening this week; adding a direct note. Atlas Notes runs hybrid retrieval with a reranker, and every ranking change lands behind Signalcast evals. My lab work moved top-1 recall 9 points on a 2M-image corpus.

Happy to share eval traces from either project.

${SIGNATURE}`,
    attachments: ["Jane_Doe_AIE.pdf", "Cover_Lanternfish.pdf"],
  },
};

/** The per-job outreach draft opened from a job row's Draft link. */
export const JOB_DRAFTS: Record<string, DraftEmail> = {
  "sb-fde": {
    to: "careers@stonebridgesignal.example",
    subject: "Solutions Engineer · prototypes customers can keep",
    body: `Hi Stonebridge team,

I like pre-sales work where the demo is real code. Ledgerlight, my open-source spend classifier, went from idea to 12k installs because the first demo was already the product. At Halespring I presented working prototypes to stakeholders weekly during the rollout.

Resume and cover letter attached for the Solutions Engineer opening.

${SIGNATURE}`,
    attachments: ["Jane_Doe_FDE.pdf", "Cover_Stonebridge.pdf"],
  },
};

export function buildOutreach(now: number): Outreach[] {
  const rows: Array<Omit<Outreach, "row">> = [
    {
      searchedAt: fmtStamp(hoursAgo(now, 4)),
      company: "Marrowstone AI", domain: "marrowstoneai.example",
      variant: "FDE", variantReason: "customer-facing delivery role; FDE master leads with stakeholder work",
      subject: "Forward Deployed Engineer · shipped RAG with eval coverage",
      guessedEmails: "", draft: "demo:outreach:co-marrowstone",
      resume: "/resumes/jane-doe-fde.pdf", coverLetter: "yes",
      status: "Drafted", notes: "",
      emailsFound: "careers@marrowstoneai.example (careers page)",
    },
    {
      searchedAt: fmtStamp(hoursAgo(now, 7)),
      company: "Osprey Compute", domain: "ospreycompute.example",
      variant: "AIE", variantReason: "model-serving and evals role; AIE master matches",
      subject: "AI Engineer, Applied Models · eval harnesses and quantized serving",
      guessedEmails: "", draft: "demo:outreach:co-osprey",
      resume: "/resumes/jane-doe-aie.pdf", coverLetter: "yes",
      status: "Drafted", notes: "",
      emailsFound: "talent@ospreycompute.example (job post footer)",
    },
    {
      searchedAt: fmtStamp(hoursAgo(now, 26)),
      company: "Driftwood Metrics", domain: "driftwoodmetrics.example",
      variant: "AIE", variantReason: "auto-picked: NL-to-SQL product, AIE strongest overlap",
      subject: "AI Engineer, Insights · NL-to-SQL with honest evals",
      guessedEmails: "", draft: "demo:outreach:co-driftwood",
      resume: "/resumes/jane-doe-aie.pdf", coverLetter: "no",
      status: "Drafted", notes: "",
      emailsFound: "jobs@driftwoodmetrics.example (careers page)",
    },
    {
      searchedAt: fmtStamp(hoursAgo(now, 30)),
      company: "Brightmoor Labs", domain: "brightmoorlabs.example",
      variant: "MLE", variantReason: "eval-infrastructure role; MLE master carries the research work",
      subject: "Research Engineer, Eval Infrastructure · Signalcast author",
      guessedEmails: "hello@brightmoorlabs.example (low confidence, left unaddressed)",
      draft: "demo:outreach:co-brightmoor",
      resume: "/resumes/jane-doe-mle.pdf", coverLetter: "no",
      status: "Drafted", notes: "no published careers email; draft left unaddressed",
      emailsFound: "",
    },
    {
      searchedAt: fmtStamp(daysAgo(now, 2)),
      company: "Lanternfish AI", domain: "lanternfishai.example",
      variant: "AIE", variantReason: "retrieval role; AIE master leads with Atlas Notes",
      subject: "AI Engineer, Retrieval · hybrid search plus reranking, measured",
      guessedEmails: "", draft: "demo:outreach:co-lanternfish",
      resume: "/resumes/jane-doe-aie.pdf", coverLetter: "yes",
      status: "Drafted", notes: "sent by Jane two days ago; interview loop underway",
      emailsFound: "recruiting@lanternfishai.example (careers page)",
    },
  ];
  return rows.map((r, i) => ({ ...r, row: i + 2 })); // already newest first
}
