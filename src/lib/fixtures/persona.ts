// The demo pilot. Jane Doe is fictional, as is every employer, school, and
// project below. She exists so the console has a believable person to fly for.

export const PERSONA = {
  name: "Jane Doe",
  headline: "AI engineer · M.S. Computer Science, Lakeshore University (May 2026)",
  email: "jane@janedoe.dev",
  linkedin: "linkedin.com/in/janedoe",
  github: "github.com/janedoe",
  portfolio: "janedoe.dev",
  location: "New York, NY",
  sponsorship: "F-1 OPT, needs H-1B sponsorship",
  // The short grounding facts the canned copilot answers draw from.
  background: {
    education: [
      "M.S. Computer Science, Lakeshore University, May 2026 (GPA 3.9)",
      "B.Tech Computer Science, Coastal Institute of Technology, 2022",
    ],
    experience: [
      "ML engineering intern at Halespring (summer 2025): two-tower retrieval model for cold-start product recommendations, +14% click-through in the A/B, feature store on BigQuery",
      "Graduate research assistant, Lakeshore Vision Lab (2024 to 2026): multimodal retrieval, CLIP fine-tuning that lifted top-1 recall 9 points on a 2M-image corpus",
      "Software engineer at Brightpath Software (2022 to 2024): payments APIs in Go and PostgreSQL serving 40k merchants, cut p99 latency 220ms to 80ms",
    ],
    projects: [
      "Ledgerlight: open-source spend classifier, fine-tuned DistilBERT behind FastAPI, 12k installs",
      "Atlas Notes: local-first RAG note assistant with pgvector and Next.js",
      "Signalcast: an eval harness that catches prompt regressions in CI",
    ],
    skills:
      "Python, TypeScript, Go, SQL · PyTorch, RAG, evals, fine-tuning · FastAPI, React, Next.js · GCP, AWS, Docker, Kubernetes, Terraform · PostgreSQL, Redis, BigQuery",
  },
};

export const RESUME_PDFS: Record<string, string> = {
  AIE: "/resumes/jane-doe-aie.pdf",
  FDE: "/resumes/jane-doe-fde.pdf",
  MLE: "/resumes/jane-doe-mle.pdf",
  SDE: "/resumes/jane-doe-sde.pdf",
};
