// Next 16's static export writes segment-cache payloads as nested files
// (out/jobs/__next.jobs/__PAGE__.txt) while the client prefetches the flat
// dotted name (/jobs/__next.jobs.__PAGE__.txt). On a plain static host those
// prefetches 404 (harmlessly, but noisily). This copies each nested payload
// to its flat name so prefetch works everywhere.

import { cpSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../out", import.meta.url));

let copied = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      flatten(p, dirname(p), name);
    } else {
      walk(p);
    }
  }
}

function flatten(nextDir, parent, prefix) {
  for (const name of readdirSync(nextDir)) {
    const p = join(nextDir, name);
    if (statSync(p).isDirectory()) {
      flatten(p, parent, `${prefix}.${name}`);
    } else {
      cpSync(p, join(parent, `${prefix}.${basename(name)}`));
      copied++;
    }
  }
}

walk(OUT);
console.log(`flatten-rsc: ${copied} payload alias(es) written under ${relative(process.cwd(), OUT)}`);
