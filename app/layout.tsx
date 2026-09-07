import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
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
  themeColor: "#2563eb",
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
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
