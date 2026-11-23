import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeProvider } from "@/components/theme-provider";
import { WebApplicationJsonLd } from "@/components/json-ld";
import "./globals.css";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL;
const UMAMI_SCRIPT_URL = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: "netgauge — Internet Speed Test",
  description:
    "Measure download, upload, latency, jitter, and bufferbloat with per-use-case verdicts.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "netgauge",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0060ac" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* The test bytes come from the Worker, not this origin (see CLAUDE.md) —
            preconnecting shaves the DNS/TLS handshake off the first request. */}
        {WORKER_URL && <link rel="preconnect" href={WORKER_URL} crossOrigin="anonymous" />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex min-h-screen flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <WebApplicationJsonLd />
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
        {/* Self-hosted, cookieless Umami page-view analytics. Both vars are
            build-time (NEXT_PUBLIC_*), so the tag is absent unless they were
            set when the app was built. */}
        {UMAMI_SCRIPT_URL && UMAMI_WEBSITE_ID && (
          <Script src={UMAMI_SCRIPT_URL} data-website-id={UMAMI_WEBSITE_ID} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
