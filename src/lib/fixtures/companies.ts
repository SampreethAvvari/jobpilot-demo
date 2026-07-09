// The fictional company watchlist. Every company here is invented; any
// resemblance to a real employer is accidental. ATS mix mirrors the real
// pipeline's seven adapters.

import type { Company } from "../types";
import { fmtStamp, hoursAgo } from "./time";

type Seed = {
  company: string;
  ats: string;
  slug: string;
  status?: string; // default "active"
  jobsLastFetch: string;
  notes?: string;
  checkedMinsAgo?: number;
};

const SEEDS: Seed[] = [
  { company: "Marrowstone AI", ats: "greenhouse", slug: "marrowstoneai", jobsLastFetch: "6" },
  { company: "Osprey Compute", ats: "ashby", slug: "ospreycompute", jobsLastFetch: "4" },
  { company: "Bluewater Ledger", ats: "greenhouse", slug: "bluewaterledger", jobsLastFetch: "9" },
  { company: "Quartzline Systems", ats: "lever", slug: "quartzline", jobsLastFetch: "5" },
  { company: "Tidegate Analytics", ats: "smartrecruiters", slug: "TidegateAnalytics", jobsLastFetch: "3" },
  { company: "Emberline", ats: "ashby", slug: "emberline", jobsLastFetch: "7" },
  { company: "Saltcreek Robotics", ats: "greenhouse", slug: "saltcreekrobotics", jobsLastFetch: "8" },
  { company: "Kestrel Freight", ats: "greenhouse", slug: "kestrelfreight", jobsLastFetch: "11" },
  { company: "Nimbus Forge", ats: "ashby", slug: "nimbusforge", jobsLastFetch: "2" },
  { company: "Halcyon Grid", ats: "workday", slug: "halcyongrid/wd5/careers", jobsLastFetch: "13" },
  { company: "Coppervale", ats: "greenhouse", slug: "coppervale", jobsLastFetch: "4" },
  { company: "Thistledown Health", ats: "lever", slug: "thistledownhealth", jobsLastFetch: "6" },
  { company: "Wrenfield Data", ats: "smartrecruiters", slug: "WrenfieldData", jobsLastFetch: "2" },
  { company: "Veridian Loop", ats: "workable", slug: "veridian-loop", jobsLastFetch: "3" },
  { company: "Pinebarrel", ats: "recruitee", slug: "pinebarrel", jobsLastFetch: "1" },
  { company: "Cinderpath", ats: "lever", slug: "cinderpath", jobsLastFetch: "5" },
  { company: "Northgale", ats: "workday", slug: "northgale/wd1/external", jobsLastFetch: "9" },
  { company: "Brightmoor Labs", ats: "ashby", slug: "brightmoorlabs", jobsLastFetch: "4" },
  { company: "Stonebridge Signal", ats: "lever", slug: "stonebridgesignal", jobsLastFetch: "2" },
  { company: "Cloudmarrow", ats: "workable", slug: "cloudmarrow", jobsLastFetch: "6" },
  { company: "Ironvale Security", ats: "greenhouse", slug: "ironvale", jobsLastFetch: "7" },
  { company: "Driftwood Metrics", ats: "ashby", slug: "driftwoodmetrics", jobsLastFetch: "3" },
  { company: "Sunhollow Energy", ats: "workday", slug: "sunhollow/wd3/jobs", jobsLastFetch: "5" },
  { company: "Palefire Studio", ats: "recruitee", slug: "palefirestudio", jobsLastFetch: "2" },
  { company: "Lanternfish AI", ats: "lever", slug: "lanternfishai", jobsLastFetch: "8" },
  {
    company: "Gullwing Motors", ats: "greenhouse", slug: "gullwingmotors",
    status: "error: 404 since 2026-06-28", jobsLastFetch: "0",
    notes: "board moved or renamed; resolver will retry",
  },
  {
    company: "Meridian Rail", ats: "", slug: "",
    status: "unsupported", jobsLastFetch: "0",
    notes: "custom careers portal; covered by the aggregator sources",
  },
  {
    company: "Fernbank Bio", ats: "", slug: "",
    status: "pending", jobsLastFetch: "0",
    notes: "added this morning; resolver picks it up next run",
  },
];

export function buildCompanies(now: number): Company[] {
  return SEEDS.map((s, i) => ({
    row: i + 2,
    company: s.company,
    careersUrl: s.slug ? `https://example.com/careers/${s.slug.split("/")[0]}` : "",
    ats: s.ats,
    slug: s.slug,
    status: s.status ?? "active",
    lastChecked: fmtStamp(hoursAgo(now, (s.checkedMinsAgo ?? ((i * 7) % 28) + 4) / 60)),
    jobsLastFetch: s.jobsLastFetch,
    notes: s.notes ?? "",
  }));
}
