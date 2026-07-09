// Type contract mirrored from the real console (job-pilot/ui/src/lib/types.ts).
// In the real product these rows live in a Google Sheet; here they are
// fictional fixtures held in a client-side store.

export const ROLES = ["FDE", "AIE", "MLE", "DE", "DS", "SWE", "Other"] as const;
// The four master resumes a job can be matched to (scorer's resume_variant).
export const RESUME_VARIANTS = ["FDE", "AIE", "MLE", "SDE"] as const;

export const STATUSES = [
  "New", "Applied", "Outreach sent", "Response", "Interview", "Offer", "Rejected",
  "Dismissed",
] as const;

export type Job = {
  row: number;
  dateFound: string;
  id: string;
  title: string;
  company: string;
  location: string;
  remote: string;
  posted: string;
  postedAge: string;
  url: string;
  source: string;
  fit: number | null;
  why: string;
  sponsorship: string;
  resumeVariant: string;
  status: string;
  notes: string;
  appliedDate: string;
  lastReply: string;
  replyClass: string;
  tailoredResume: string;
  coverLetter: string;
  jdKeywords: string;
  contact: string;
  draft: string;
  findPeople: string;
  role: string;
  resumeAts: string;
};

export type Outreach = {
  row: number;
  searchedAt: string;
  company: string;
  domain: string;
  variant: string;
  variantReason: string;
  subject: string;
  guessedEmails: string;
  draft: string;
  resume: string;
  coverLetter: string; // "yes" | "no"
  status: string;
  notes: string;
  emailsFound: string;
};

export type Company = {
  row: number;
  company: string;
  careersUrl: string;
  ats: string;
  slug: string;
  status: string;
  lastChecked: string;
  jobsLastFetch: string;
  notes: string;
};
