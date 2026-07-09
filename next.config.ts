import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Cloudflare Pages serves /route/index.html cleanly with trailing slashes.
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    // The fixture store seeds from this at build so the prerendered HTML
    // carries real content; the client reseeds to visit time after mount.
    // Ages are offset-based, so the swap is invisible.
    NEXT_PUBLIC_BUILD_TS: String(Date.now()),
  },
};

export default nextConfig;
