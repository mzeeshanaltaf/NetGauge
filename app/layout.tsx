import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "netgauge — Internet Speed Test",
  description:
    "Measure download, upload, latency, jitter, and bufferbloat with per-use-case verdicts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex min-h-screen flex-col`}
      >
        <header className="flex h-16 items-center border-b border-border px-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            netgauge
          </Link>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="flex items-center justify-center gap-6 border-t border-border py-6 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </footer>
      </body>
    </html>
  );
}
