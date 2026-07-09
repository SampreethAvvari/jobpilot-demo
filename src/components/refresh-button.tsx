"use client";

import { useState } from "react";

import { runRefresh } from "@/lib/store";

type State = "idle" | "running" | "done" | "quiet";

/** The real button triggers a Cloud Run pipeline execution and polls it for
 * minutes. The demo compresses that into a six-second run that lands five
 * fresh fictional postings. */
export function RefreshButton() {
  const [state, setState] = useState<State>("idle");

  function trigger() {
    if (state === "running") return;
    setState("running");
    runRefresh((added) => {
      setState(added > 0 ? "done" : "quiet");
      setTimeout(() => setState("idle"), 6000);
    });
  }

  const label = {
    idle: "⟳ Refresh jobs",
    running: "Fetching fresh jobs…",
    done: "✓ Done, 5 fresh jobs in",
    quiet: "✓ Done, nothing new this run",
  }[state];

  return (
    <button onClick={trigger} disabled={state === "running"}
            data-tour="refresh"
            className="btn-amber px-4 py-1.5 text-xs"
            title="In the real console this triggers the Cloud Run pipeline (~3 to 6 minutes). The demo replays a run in six seconds.">
      {state === "running" && <span className="blink mr-1">●</span>}
      {label}
    </button>
  );
}
