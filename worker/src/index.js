// JobPilot demo · live resume-tailoring preview.
// One endpoint, stateless by design: resume text in, suggestions out.
// Nothing is stored or logged except anonymous daily counters in KV.

const RESUME_CAP = 8000;
const JD_CAP = 6000;

const SYSTEM_PROMPT = `You are the tailoring engine of JobPilot, a job-application assistant with one hard rule: you may rephrase, reorder, and re-emphasize what the resume already says, but you may NEVER invent employers, titles, dates, tools, metrics, or experience that is not present in the input.

Given resume bullets and a job description, return STRICT JSON (no markdown, no commentary) with this exact shape:
{
  "suggestions": [
    {"before": "<an original bullet, verbatim>", "after": "<your rewrite targeted at the JD>", "targets": "<2-4 comma-separated JD themes the rewrite addresses>"}
  ],
  "covered": ["<JD keywords the rewritten resume now clearly covers>"],
  "not_addable": ["<JD requirements the resume cannot honestly claim; do not soften these>"]
}

Rules:
- 3 to 6 suggestions, each rewriting a real input bullet. Prefer the weakest bullets.
- Rewrites end on a concrete fact or number when the input contains one; never fabricate numbers.
- "not_addable" must list real gaps. An empty list is almost always wrong.
- Plain, direct language. No buzzwords, no em dashes.`;

function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(env, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(env) },
  });
}

async function verifyTurnstile(env, token, ip) {
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
  });
  const data = await res.json();
  return Boolean(data.success);
}

/** Increment a daily counter; true when still under the limit. */
async function underLimit(env, key, limit) {
  const day = new Date().toISOString().slice(0, 10);
  const fullKey = `${key}:${day}`;
  const current = parseInt((await env.RATELIMIT.get(fullKey)) ?? "0", 10);
  if (current >= limit) return false;
  // TTL slightly over a day so counters clean themselves up.
  await env.RATELIMIT.put(fullKey, String(current + 1), { expirationTtl: 90000 });
  return true;
}

function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no JSON in model output");
  return JSON.parse(text.slice(start, end + 1));
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(env) });
    }
    if (request.method !== "POST") {
      return json(env, 405, { error: "POST only" });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json(env, 400, { error: "invalid JSON body" });
    }

    const resume = String(body.resume ?? "").slice(0, RESUME_CAP).trim();
    const jd = String(body.jd ?? "").slice(0, JD_CAP).trim();
    if (resume.length < 120 || jd.length < 120) {
      return json(env, 400, { error: "resume and jd must each be at least 120 characters" });
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    if (!(await verifyTurnstile(env, body.token, ip))) {
      return json(env, 403, { error: "turnstile verification failed" });
    }

    // Anonymous daily caps: the whole demo stays inside the free allocation.
    if (!(await underLimit(env, "global", parseInt(env.GLOBAL_DAILY_LIMIT, 10)))) {
      return json(env, 429, { error: "the demo hit today's free limit" });
    }
    if (!(await underLimit(env, `ip:${ip}`, parseInt(env.IP_DAILY_LIMIT, 10)))) {
      return json(env, 429, { error: "per-visitor daily limit reached" });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `RESUME BULLETS:\n${resume}\n\nJOB DESCRIPTION:\n${jd}\n\nReturn the JSON now.`,
      },
    ];

    // One retry on malformed output, then give up cleanly. The page falls
    // back to a labeled sample, so a bad day here never breaks the demo.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await env.AI.run(env.MODEL, { messages, max_tokens: 1200 });
        const parsed = extractJson(result.response ?? "");
        if (!Array.isArray(parsed.suggestions)) throw new Error("missing suggestions");
        return json(env, 200, {
          suggestions: parsed.suggestions.slice(0, 6).map((s) => ({
            before: String(s.before ?? "").slice(0, 500),
            after: String(s.after ?? "").slice(0, 500),
            targets: String(s.targets ?? "").slice(0, 120),
          })),
          covered: (parsed.covered ?? []).slice(0, 10).map(String),
          not_addable: (parsed.not_addable ?? []).slice(0, 10).map(String),
        });
      } catch (e) {
        if (attempt === 1) {
          return json(env, 502, { error: `model call failed: ${e.message}` });
        }
      }
    }
  },
};
