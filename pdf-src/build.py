"""Generate the demo's fictional PDFs: four Jane Doe master resumes, the
tailored variants whose edits mirror the transparency-report diffs in
src/lib/fixtures/reports.ts, and a cover letter per flagship job.

Run from pdf-src/:  python build.py
Outputs land in ../public/resumes/.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "out"
DEST = HERE.parent / "public" / "resumes"

CONTACT = (
    r"New York, NY \textbar{} \href{mailto:jane@janedoe.dev}{jane@janedoe.dev} "
    r"\textbar{} \href{https://www.linkedin.com/in/janedoe}{linkedin.com/in/janedoe} "
    r"\textbar{} \href{https://github.com/janedoe}{github.com/janedoe} "
    r"\textbar{} \href{https://janedoe.dev}{janedoe.dev}"
)

# ── Content blocks (single source of truth; tailored resumes substitute) ────

SUMMARY = {
    "AIE": (
        "AI engineer focused on LLM applications that can prove they work: retrieval "
        "with citations, structured output, and regression evals in CI. Production "
        "background in recommendation models and payments APIs."
    ),
    "FDE": (
        "AI engineer with production LLM and retrieval experience: recommendation "
        "models at Halespring, multimodal research at Lakeshore, and open-source "
        "tools with 12k installs."
    ),
    "MLE": (
        "ML engineer across the full loop: feature stores, training, evaluation, and "
        "serving. Shipped a two-tower recommendation model through an A/B test and "
        "fine-tuned CLIP-family models in a research lab."
    ),
    "SDE": (
        "Software engineer with two years of production payments APIs in Go and "
        "PostgreSQL, plus recent ML systems work. Writes boring, observable services "
        "and the runbooks that keep them boring."
    ),
}

B_TWOTOWER = (
    "Built a two-tower retrieval model for cold-start recommendations, lifting "
    "click-through 14\\% in the A/B test."
)
B_FEATURESTORE = (
    "Designed the feature store on BigQuery powering 30+ online features with "
    "hourly freshness SLAs."
)
B_DEMOS = (
    "Presented results weekly to non-technical merchandising stakeholders during "
    "the rollout."
)
B_PAYMENTS = "Built payments APIs in Go and PostgreSQL serving 40k merchants."
B_P99 = "Cut p99 latency on the payments API from 220ms to 80ms."
B_RUNBOOKS = "Ran incident reviews; wrote the retry and reconciliation runbooks still in use."
B_CLIP = (
    "Fine-tuned CLIP-family models on a 2M-image corpus, lifting top-1 recall 9 points."
)
B_EVALTOOL = "Built evaluation tooling adopted lab-wide; runs on every training PR."
P_LEDGERLIGHT = (
    "Fine-tuned DistilBERT spend classifier behind FastAPI; 12k installs, usage "
    "dashboard included."
)
P_ATLAS = "Local-first RAG note assistant with pgvector and Next.js."
P_SIGNALCAST = "An eval harness that catches prompt regressions in CI."


def resume_tex(summary: str, halespring: list[str], brightpath: list[str],
               clip: str, atlas: str, signalcast: str) -> str:
    items = lambda bs: "\n".join(f"  \\item {b}" for b in bs)  # noqa: E731
    return rf"""\documentclass[10pt]{{article}}
\input{{_preamble}}
% Fictional demo resume for JobPilot's public demo. Jane Doe does not exist.
\begin{{document}}

\name{{JANE DOE}}
\contactline{{{CONTACT}}}

\section{{Summary}}
{summary}

\section{{Skills}}
\textbf{{Languages:}} Python, TypeScript, Go, SQL \\
\textbf{{AI / LLM:}} PyTorch, RAG, evaluation, fine-tuning, prompt engineering \\
\textbf{{Backend / Frontend:}} FastAPI, event-driven services, React, Next.js \\
\textbf{{Cloud / MLOps:}} GCP, AWS, Docker, Kubernetes, Terraform, CI/CD, monitoring \\
\textbf{{Databases:}} PostgreSQL, Redis, BigQuery

\section{{Work Experience}}
\entry{{ML Engineering Intern}}{{Halespring, New York, NY}}{{May 2025 -- Aug 2025}}{{}}
\begin{{itemize}}
{items(halespring)}
\end{{itemize}}
\entry{{Software Engineer}}{{Brightpath Software}}{{Jul 2022 -- Jul 2024}}{{}}
\begin{{itemize}}
{items(brightpath)}
\end{{itemize}}

\section{{Research}}
\entry{{Graduate Research Assistant}}{{Lakeshore Vision Lab}}{{Sep 2024 -- Present}}{{}}
\begin{{itemize}}
  \item {clip}
  \item {B_EVALTOOL}
\end{{itemize}}

\section{{Projects}}
\entrysimple{{Ledgerlight · open-source spend classifier \,(\href{{https://github.com/janedoe}}{{GitHub}})}}{{}}
\begin{{itemize}}
  \item {P_LEDGERLIGHT}
\end{{itemize}}
\entrysimple{{Atlas Notes · retrieval done honestly}}{{}}
\begin{{itemize}}
  \item {atlas}
\end{{itemize}}
\entrysimple{{Signalcast · evals as engineering}}{{}}
\begin{{itemize}}
  \item {signalcast}
\end{{itemize}}

\section{{Education}}
\entrysimple{{M.S. Computer Science · Lakeshore University (GPA 3.9)}}{{Aug 2024 -- May 2026}} \\
\entrysimple{{B.Tech Computer Science · Coastal Institute of Technology}}{{2018 -- 2022}}

\end{{document}}
"""


DEFAULTS = dict(
    halespring=[B_TWOTOWER, B_FEATURESTORE, B_DEMOS],
    brightpath=[B_PAYMENTS, B_P99, B_RUNBOOKS],
    clip=B_CLIP,
    atlas=P_ATLAS,
    signalcast=P_SIGNALCAST,
)

MASTERS = {v: dict(DEFAULTS, summary=SUMMARY[v]) for v in ("AIE", "FDE", "MLE", "SDE")}

# Tailored variants: substitutions mirror reports.ts diff_sections exactly.
TAILORED: dict[str, dict] = {
    "tailored-marrowstone-fde": dict(
        MASTERS["FDE"],
        summary=SUMMARY["FDE"].replace(
            "open-source tools with 12k installs.",
            "open-source tools with 12k installs, presented weekly to non-technical "
            "stakeholders during the Halespring rollout.",
        ),
        halespring=[
            "Built a two-tower retrieval model for cold-start recommendations with "
            "output guardrails and audit logging, lifting click-through 14\\% in the "
            "A/B test.",
            B_FEATURESTORE,
            B_DEMOS,
        ],
    ),
    "tailored-osprey-aie": dict(
        MASTERS["AIE"],
        clip=B_CLIP.rstrip(".")
        + "; served int8-quantized checkpoints for lab-wide inference.",
    ),
    "tailored-bluewater-mle": dict(
        MASTERS["MLE"],
        signalcast="An eval harness that catches prompt regressions and score drift "
        "in CI, alerting before quality drops ship.",
    ),
    "tailored-quartzline-sde": dict(
        MASTERS["SDE"],
        brightpath=[
            B_PAYMENTS,
            "Cut p99 latency on the payments API from 220ms to 80ms, driven by "
            "tracing and dashboarded SLOs.",
            B_RUNBOOKS,
        ],
    ),
    "tailored-tidegate-fde": dict(
        MASTERS["FDE"],
        summary=SUMMARY["FDE"].replace(
            "AI engineer", "AI engineer comfortable leading discovery sessions,"
        ),
    ),
    "tailored-saltcreek-mle": dict(
        MASTERS["MLE"],
        clip=B_CLIP.rstrip(".")
        + "; built the hard-negative mining pass that made the gain stick.",
    ),
    "tailored-emberline-aie": dict(
        MASTERS["AIE"],
        atlas="Local-first RAG note assistant with pgvector and Next.js; prompt "
        "caching cut median answer latency 38\\%.",
    ),
    "tailored-kestrel-sde": dict(
        MASTERS["SDE"],
        brightpath=[
            "Built idempotent payments APIs in Go and PostgreSQL serving 40k "
            "merchants, with retry-safe webhooks and daily reconciliation.",
            B_P99,
            B_RUNBOOKS,
        ],
    ),
    "tailored-nimbus-mle": dict(MASTERS["MLE"]),
}

# ── Cover letters ───────────────────────────────────────────────────────────

def cover_tex(company: str, role: str, paras: list[str]) -> str:
    body = "\n\n".join(paras)
    return rf"""\documentclass[11pt]{{article}}
\usepackage{{cmap}}
\usepackage[margin=1in]{{geometry}}
\usepackage[T1]{{fontenc}}
\usepackage[utf8]{{inputenc}}
\usepackage{{charter}}
\usepackage[hidelinks]{{hyperref}}
\pagestyle{{empty}}
\setlength{{\parindent}}{{0pt}}
\setlength{{\parskip}}{{0.7em}}
% Fictional demo cover letter for JobPilot's public demo.
\begin{{document}}

{{\LARGE\bfseries Jane Doe}}\par
{{\small {CONTACT}}}

\vspace{{1.2em}}
Hiring team, {company}\par
Re: {role}

\vspace{{0.6em}}
{body}

\vspace{{0.8em}}
Sincerely,\par
Jane Doe

\end{{document}}
"""


COVERS: dict[str, tuple[str, str, list[str]]] = {
    "cover-marrowstone-fde": ("Marrowstone AI", "Forward Deployed Engineer", [
        "I want the job where the model meets the claims adjuster. I have built the "
        "pieces separately: a retrieval assistant with hybrid search, an eval harness "
        "that gates releases, and a recommendation model I demoed weekly to "
        "non-technical stakeholders. Your Forward Deployed role makes those one job.",
        "Your posting treats guardrails and audit trails as first-class work. That "
        "matches how I built audit logging into my internship project, and why my "
        "eval harness exists at all: I stopped trusting my own demos.",
        "I am on F-1 OPT and will need H-1B sponsorship, which your posting welcomes. "
        "I would love to walk through any of these projects live.",
    ]),
    "cover-osprey-aie": ("Osprey Compute", "AI Engineer, Applied Models", [
        "Gating model releases on evals is how I already work. Signalcast, my "
        "open-source harness, runs regression suites in CI with failures tagged by "
        "slice; it caught a 9-point recall drop before it merged.",
        "On the serving side, I quantized and served CLIP-family checkpoints for my "
        "research lab, and I have chased enough latency at Brightpath to respect a "
        "tokens-per-second budget.",
        "Honest model cards are the part of your posting I like most. Quality claims "
        "with receipts are the whole point of my work so far.",
    ]),
    "cover-bluewater-mle": ("Bluewater Ledger", "Machine Learning Engineer, Risk", [
        "I spent two years keeping payments APIs correct and fast at Brightpath, so I "
        "know what a 40-millisecond budget feels like from the serving side.",
        "Since then I have added the modeling half: a two-tower recommendation model "
        "shipped through an A/B test at Halespring, behind a BigQuery feature store "
        "with hourly freshness SLAs, and drift alerts in my eval harness that page "
        "before quality falls.",
        "Fraud is where those two halves meet, and where partnering with analysts to "
        "turn case reviews into labels sounds like the job I want.",
    ]),
    "cover-quartzline-sde": ("Quartzline Systems", "Software Engineer, Distributed Storage", [
        "My favorite compliment at Brightpath was that my changes were boring. The "
        "p99 win on our payments API (220ms to 80ms) came from tracing and dashboards "
        "first, code second.",
        "I have two years of production Go, PostgreSQL depth, and runbooks still in "
        "use after I left. Consensus I know from coursework and a Raft implementation; "
        "your deterministic simulator is exactly how I would want to learn the rest.",
        "Public internal SLOs tell me the team means it about correctness. I would "
        "like to work on the write path.",
    ]),
    "cover-tidegate-fde": ("Tidegate Analytics", "Forward Deployed Engineer", [
        "Eight weeks from contract to live deployment is a rhythm I recognize: my "
        "open-source classifier went from idea to launch in nine, and my internship "
        "had a hard demo every Friday.",
        "Discovery is the part I enjoy. At Halespring I interviewed merchandising "
        "stakeholders before writing a line of the model, and the SQL I would use at "
        "your customers is the SQL I have TA'd.",
        "I travel happily, listen well, and leave dashboards people keep using.",
    ]),
    "cover-saltcreek-mle": ("Saltcreek Robotics", "ML Engineer, Perception", [
        "Most of my recall gain at the Lakeshore Vision Lab came from data, not "
        "architecture: the hard-negative mining pass I built made a 9-point top-1 "
        "improvement stick. Your posting says most wins are dataset wins; I have the "
        "receipts to agree.",
        "I train and debug PyTorch models daily, understand CLIP-family methods well "
        "enough to fine-tune them on a 2M-image corpus, and served the quantized "
        "results to the whole lab.",
        "Evals tied to warehouse KPIs rather than mAP is the sentence that made me "
        "apply.",
    ]),
    "cover-emberline-aie": ("Emberline", "AI Engineer, Copilot Features", [
        "I build assistant features and then distrust them properly. Atlas Notes, my "
        "retrieval assistant, answers with citations or refuses; its prompt caching "
        "cut median answer latency 38 percent.",
        "Signalcast, my eval harness, exists because demos lie. Offline evals plus "
        "A/Bs is exactly the loop I would want around completions and refactor flows.",
        "I write TypeScript end to end and care about developer experience the way "
        "your product requires.",
    ]),
    "cover-kestrel-sde": ("Kestrel Freight", "Software Engineer, Marketplace", [
        "Money-adjacent correctness is my background: idempotent payments APIs in Go "
        "and PostgreSQL for 40k merchants, retry-safe webhooks, and a daily "
        "reconciliation job that caught what the retries missed.",
        "A truck canceling at 2 a.m. reads like a payments failure with wheels. The "
        "runbook-with-the-feature habit transfers directly.",
        "I would enjoy owning pricing paths where the p99 is public inside the team.",
    ]),
    "cover-nimbus-mle": ("Nimbus Forge", "ML Platform Engineer", [
        "Feature pipelines your models can trust is the line from your posting I keep "
        "thinking about. I built the BigQuery feature store behind Halespring's "
        "recommendation model with hourly freshness SLAs.",
        "My eval harness, Signalcast, treats model quality like uptime: regression "
        "suites in CI, drift alerts, failure tags. That instinct belongs in a "
        "platform team.",
        "Ray is new to me and I have said so on my resume; the rest of the stack is "
        "not.",
    ]),
}

# Masters get simple names used across the app.
MASTER_FILES = {
    "jane-doe-aie": "AIE",
    "jane-doe-fde": "FDE",
    "jane-doe-mle": "MLE",
    "jane-doe-sde": "SDE",
}


def compile_tex(name: str, tex: str) -> None:
    src = OUT / f"{name}.tex"
    src.write_text(tex, encoding="utf-8")
    for _ in range(2):  # two passes for stable layout
        res = subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", src.name],
            cwd=OUT, capture_output=True, text=True,
        )
        if res.returncode != 0:
            print(res.stdout[-3000:])
            sys.exit(f"pdflatex failed for {name}")
    shutil.copy(OUT / f"{name}.pdf", DEST / f"{name}.pdf")
    print(f"ok  {name}.pdf")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    DEST.mkdir(parents=True, exist_ok=True)
    shutil.copy(HERE / "_preamble.tex", OUT / "_preamble.tex")

    for fname, variant in MASTER_FILES.items():
        m = MASTERS[variant]
        compile_tex(fname, resume_tex(m["summary"], m["halespring"], m["brightpath"],
                                      m["clip"], m["atlas"], m["signalcast"]))
    for fname, m in TAILORED.items():
        compile_tex(fname, resume_tex(m["summary"], m["halespring"], m["brightpath"],
                                      m["clip"], m["atlas"], m["signalcast"]))
    for fname, (company, role, paras) in COVERS.items():
        compile_tex(fname, cover_tex(company, role, paras))
    print(f"\nall PDFs in {DEST}")


if __name__ == "__main__":
    main()
