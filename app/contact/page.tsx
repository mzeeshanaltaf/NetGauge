import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact & Feedback — netgauge",
  description: "Share feedback, report a bug, suggest a feature, or request deletion of your data.",
};

// Short error codes set by the API route's redirect (?error=...) mapped to
// human-readable copy. Keep keys in sync with app/api/contact/route.ts's fail() calls.
const ERROR_MESSAGES: Record<string, string> = {
  fields: "Please fill in all fields.",
  email: "Please enter a valid email address.",
  length: "Message must be 5000 characters or fewer.",
  rate: "Too many submissions. Please try again later.",
  server: "Service is temporarily unavailable. Please try again later.",
  parse: "Invalid submission. Please try again.",
};

type Props = {
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const { sent, error } = await searchParams;
  const initialError = error
    ? ERROR_MESSAGES[error] ?? "Something went wrong. Please try again."
    : undefined;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 pt-16 pb-24">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Contact &amp; Feedback
        </h1>
        <p className="max-w-md text-sm text-muted-foreground md:text-base">
          Found a bug, have an idea, or want to request deletion of your data? Send us a
          message — we read everything.
        </p>
      </div>

      <div className="mt-12 w-full rounded-2xl border border-border p-6 sm:p-8">
        <ContactForm initialSuccess={!!sent} initialError={initialError} />
      </div>
    </div>
  );
}
