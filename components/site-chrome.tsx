"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUIDES } from "@/lib/guides";
import { Logo } from "@/components/logo";

// /embed is loaded in an <iframe> on other people's sites — it must render
// chrome-less (no nav, no footer) and must not register the service worker,
// since that registration is scoped to this origin's whole install story,
// not to a widget borrowed by someone else's page.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEmbed = pathname?.startsWith("/embed") ?? false;

  useEffect(() => {
    if (isEmbed) return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability is a progressive enhancement — a failed registration
      // shouldn't break the page.
    });
  }, [isEmbed]);

  if (isEmbed) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border px-4">
        <Logo />
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="flex flex-col items-center gap-3 border-t border-border py-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          {GUIDES.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="hover:text-foreground">
              {guide.title}
            </Link>
          ))}
        </div>
        <p>
          Developed with 💖 by{" "}
          <a
            href="https://zeeshanai.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-foreground"
          >
            Zeeshan Altaf
          </a>
        </p>
      </footer>
    </>
  );
}
