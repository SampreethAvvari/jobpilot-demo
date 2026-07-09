// Fixture timestamps are computed relative to the visit, so the demo always
// looks like a system that ran an hour ago, never like a stale screenshot.

export function hoursAgo(now: number, h: number): number {
  return now - h * 3600_000;
}

export function daysAgo(now: number, d: number): number {
  return now - d * 86400_000;
}

/** "YYYY-MM-DD HH:MM" in UTC, the sheet's posted-stamp format. */
export function fmtStamp(ms: number): string {
  return new Date(ms).toISOString().slice(0, 16).replace("T", " ");
}

/** "YYYY-MM-DD", the sheet's date format. */
export function fmtDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}
