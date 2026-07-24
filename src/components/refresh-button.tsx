"use client";

import { useState } from "react";

import Button from "@/components/ui/button";
import { runRefresh } from "@/lib/store";

type State = "idle" | "running" | "done" | "quiet";

/** The real button triggers a Cloud Run pipeline execution and polls it for
 * minutes. The demo compresses that into a six-second run that lands a
 * handful of fresh fictional postings. */
export function RefreshButton() {
  const [state, setState] = useState<State>("idle");
  const [added, setAdded] = useState(0);

  function trigger() {
    if (state === "running") return;
    setState("running");
    runRefresh((n) => {
      setAdded(n);
      setState(n > 0 ? "done" : "quiet");
      setTimeout(() => setState("idle"), 6000);
    });
  }

  const label = {
    idle: "⟳ Refresh jobs",
    running: "Fetching fresh jobs…",
    done: `✓ Done, ${added} fresh job${added === 1 ? "" : "s"} in`,
    quiet: "✓ Done, nothing new this run",
  }[state];

  return (
    <Button variant="ghost" size="sm" onClick={trigger} busy={state === "running"}
            data-tour="refresh"
            title="In the real console this triggers the Cloud Run pipeline (roughly 3 to 6 minutes). The demo replays a run in six seconds.">
      {label}
    </Button>
  );
}
