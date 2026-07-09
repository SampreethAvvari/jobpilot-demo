"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import { Nav } from "@/components/nav";

/** The real console is desktop-first behind IAP; the public demo gets a
 * proper phone menu. Portaled to body: the sticky header's backdrop-filter
 * would otherwise become the containing block for the fixed drawer. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        aria-label="Open menu"
        className="btn-ghost px-3 py-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        ☰ menu
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[70] flex" onClick={() => setOpen(false)}>
          <div
            className="h-full w-64 overflow-y-auto pb-8 rise"
            style={{ background: "var(--ink-2)", borderRight: "1px solid var(--line)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-6">
              <div className="display text-lg font-extrabold tracking-tight">
                JOB<span style={{ color: "var(--amber)" }}>PILOT</span>
              </div>
              <button aria-label="Close menu" className="btn-ghost px-2 py-1 text-xs"
                      onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <Nav />
          </div>
          <div className="flex-1" style={{ background: "rgba(5,7,9,0.6)" }} />
        </div>,
        document.body,
      )}
    </div>
  );
}
