"use client";

// The copilot chat, demo edition. The real one is live Gemini grounded in a
// knowledge pack plus the job's description; this one replays recorded
// answers with a typing effect and says so on every message. It never fakes
// a live model.

import { useEffect, useRef, useState } from "react";

import type { Job } from "@/lib/types";
import Button from "@/components/ui/button";
import { ASSISTANT_CHIPS, chipsFor, FREE_TEXT_REPLY, type CannedTurn } from "@/lib/fixtures/chats";

type Msg = { role: "user" | "model"; text: string; done: boolean };

const WORDS_PER_TICK = 4;
const TICK_MS = 26;

export function DemoChat({ lockedJob }: { lockedJob?: Job }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const chips: CannedTurn[] = lockedJob ? chipsFor(lockedJob) : ASSISTANT_CHIPS;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function playAnswer(answer: string) {
    setTyping(true);
    const words = answer.split(/(\s+)/); // keep whitespace tokens for exact layout
    let idx = 0;
    setMessages((ms) => [...ms, { role: "model", text: "", done: false }]);
    timer.current = setInterval(() => {
      idx = Math.min(words.length, idx + WORDS_PER_TICK * 2);
      const text = words.slice(0, idx).join("");
      const finished = idx >= words.length;
      setMessages((ms) => {
        const copy = [...ms];
        copy[copy.length - 1] = { role: "model", text, done: finished };
        return copy;
      });
      if (finished && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
        setTyping(false);
      }
    }, TICK_MS);
  }

  function ask(turn: CannedTurn) {
    if (typing) return;
    setMessages((ms) => [...ms, { role: "user", text: turn.question, done: true }]);
    setTimeout(() => playAnswer(turn.answer), 350);
  }

  function sendFree() {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    setMessages((ms) => [...ms, { role: "user", text, done: true }]);
    setTimeout(() => playAnswer(FREE_TEXT_REPLY), 350);
  }

  // The tour plays the first chip without needing a click.
  useEffect(() => {
    const onPlay = () => { if (messages.length === 0 && !typing) ask(chips[0]); };
    window.addEventListener("demo:play-chip", onPlay);
    return () => window.removeEventListener("demo:play-chip", onPlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, typing]);

  function clearChat() {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    setTyping(false);
    setMessages([]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-wrap items-center gap-2 p-3 text-xs">
        {lockedJob ? (
          <span style={{ color: "var(--ink-55)" }}>
            Job: <b style={{ color: "var(--ink)" }}>{lockedJob.company}</b> · {lockedJob.title}
          </span>
        ) : (
          <span style={{ color: "var(--ink-55)" }}>
            Grounded in the pilot&apos;s resumes, GitHub, portfolio, and knowledge pack.
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <span className="recorded-tag">recorded demo · live Gemini in the real console</span>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}
                    title="Start fresh; nothing is saved in the real console either">
              ⟳ clear
            </Button>
          )}
        </span>
      </div>

      <div className="card flex min-h-[38vh] flex-col gap-3 p-4" data-tour="chat-messages">
        {messages.length === 0 && (
          <p className="text-xs" style={{ color: "var(--ink-35)" }}>
            {lockedJob
              ? "Answers stay grounded in Jane's real background and this job's description: resume rewrites, cover letters, and application answers in STAR form. Pick a question below."
              : "Answers use Jane's background only, never invented facts. Pick a question below to see how the copilot writes."}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "model" ? "card text-sm" : "text-sm"}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              whiteSpace: "pre-wrap",
              color: "var(--ink)",
              background: m.role === "user" ? "var(--blue-soft)" : undefined,
              borderLeft: m.role === "model" ? "2px solid var(--blue)" : undefined,
              padding: "8px 12px",
              borderRadius: m.role === "user" ? 12 : undefined,
            }}
          >
            <span className={m.role === "model" && !m.done ? "type-cursor" : undefined}>
              {m.text}
            </span>
            {m.role === "model" && m.done && (
              <div className="recorded-tag mt-1.5">recorded demo response</div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-2" data-tour="chat-chips">
        {chips.map((c) => (
          <button key={c.question} className="chip" disabled={typing} onClick={() => ask(c)}>
            {c.question}
          </button>
        ))}
      </div>

      <div className="card flex items-end gap-2 p-3">
        <textarea
          className="input grow text-sm"
          style={{ height: "auto", minHeight: "3.5rem", padding: "8px 12px", lineHeight: 1.5 }}
          placeholder="Type anything; the demo will explain what the live copilot would do…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFree(); }
          }}
        />
        <Button disabled={typing || !input.trim()} onClick={sendFree}>
          Send
        </Button>
      </div>
    </div>
  );
}
