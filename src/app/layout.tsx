import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import "driver.js/dist/driver.css";

import { Nav } from "@/components/nav";
import { MobileNav } from "@/components/mobile-nav";
import { RefreshButton } from "@/components/refresh-button";
import { StoreReseed } from "@/lib/store";
import { TourLauncher } from "@/components/tour";
import { ToastProvider } from "@/components/ui/toast";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "JobPilot · live demo",
  description:
    "A hands-on demo of JobPilot, the open-source job-hunt autopilot. Fictional data, real product.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        <ToastProvider>
          <StoreReseed />
          <div className="demo-strip">
            <span>
              <b>Demo</b> · fictional pilot, fictional companies · nothing here is a real
              job posting
            </span>
          </div>
          <div className="flex min-h-screen">
            <aside
              className="hidden w-56 shrink-0 flex-col border-r md:flex"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <div className="px-5 pt-6 pb-8">
                <div className="font-display text-lg font-extrabold tracking-tight">
                  JOB<span style={{ color: "var(--blue)" }}>PILOT</span>
                </div>
                <div className="eyebrow mt-1">console · demo</div>
              </div>
              <Nav />
              <div className="mt-auto px-5 pb-6">
                <div className="eyebrow">pilot</div>
                <div className="mt-1 text-xs" style={{ color: "var(--ink-55)" }}>
                  Jane Doe (fictional)
                </div>
                <a
                  className="mt-3 block text-[11px] hover:underline"
                  style={{ color: "var(--ink-35)" }}
                  href="https://github.com/SampreethAvvari/job-pilot"
                  target="_blank" rel="noopener"
                >
                  the real thing ↗
                </a>
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <header
                className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b px-5 py-3"
                style={{ borderColor: "var(--line)", background: "var(--surface)" }}
              >
                <div className="flex items-center gap-2 md:hidden">
                  <MobileNav />
                  <div className="font-display text-sm font-bold tracking-tight">
                    JOB<span style={{ color: "var(--blue)" }}>PILOT</span>
                  </div>
                </div>
                <div className="eyebrow hidden md:block">
                  every 6h · 00/06/12/18 ET · 11 sources · demo replay
                </div>
                <div className="flex items-center gap-2">
                  <TourLauncher />
                  <RefreshButton />
                </div>
              </header>
              <main className="px-5 py-6">{children}</main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
