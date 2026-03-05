import { Footer } from "@/components/landing";
import { Shield, Database, Share2, Lock, Trash2, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — MOOC Utils",
  description:
    "Privacy policy for MOOC Utils tools including the Assignment Solver browser extension. Learn what data is collected, how it is used, and with whom it is shared.",
};

const LAST_UPDATED = "March 6, 2026";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-xl font-display font-bold tracking-tight">{title}</h2>
      </div>
      <div className="pl-12 space-y-3 text-muted-foreground leading-relaxed text-sm">
        {children}
      </div>
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-border/50 last:border-0 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-20">
      {/* Header */}
      <div className="container mx-auto px-6 py-14 max-w-3xl">
        <div className="flex items-center justify-center gap-2.5 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="h-px w-8 bg-primary shrink-0" />
          <span className="font-mono text-[11px] text-primary uppercase tracking-[0.25em]">
            Legal
          </span>
          <div className="h-px w-8 bg-primary shrink-0" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight text-center">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-center text-sm font-mono">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      {/* Scope banner */}
      <div className="border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-6 py-5 max-w-3xl">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This policy applies to all MOOC Utils products, including the{" "}
            <Link
              href="/assignment-solver"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Assignment Solver
            </Link>{" "}
            browser extension for NPTEL and SWAYAM. By installing or using any MOOC
            Utils product you agree to the practices described below.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-6 py-16 max-w-3xl space-y-14">

        {/* 1. Data We Collect */}
        <Section icon={Database} title="Data We Collect">
          <p>
            The Assignment Solver extension collects only the minimum data required
            to answer assignment questions using Google&apos;s Gemini AI. No account is
            created and no data is collected by MOOC Utils servers.
          </p>

          <div className="rounded-xl border border-border/60 bg-card overflow-hidden mt-4">
            <div className="px-4 py-2.5 bg-muted/40 border-b border-border/50">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Data inventory
              </span>
            </div>
            <div className="px-4 divide-y divide-border/40">
              <DataRow
                label="Gemini API Key"
                value="Entered manually by you. Stored in browser.storage.local on your device only. Never sent to MOOC Utils."
              />
              <DataRow
                label="Assignment HTML"
                value="The raw HTML of the assignment question container on the NPTEL/SWAYAM page you are viewing. Sent to Google Gemini to generate answers."
              />
              <DataRow
                label="Page Screenshots"
                value="Up to 8 JPEG screenshots (60% quality) taken by scrolling through the assignment page. Sent to Google Gemini alongside the HTML."
              />
              <DataRow
                label="Page URL & Title"
                value="The URL and document title of the assignment page. Sent to Google Gemini as context. Never logged or stored by MOOC Utils."
              />
              <DataRow
                label="Model Preferences"
                value="Your selected Gemini model name and reasoning level. Stored in browser.storage.local on your device only."
              />
            </div>
          </div>

          <p className="pt-2">
            <strong className="text-foreground">Not collected:</strong> your name,
            email address, student ID, NPTEL login credentials, browsing history
            outside NPTEL/SWAYAM assignment pages, any form inputs you have already
            entered on the page, or any usage analytics.
          </p>
        </Section>

        {/* 2. How We Use Your Data */}
        <Section icon={Shield} title="How We Use Your Data">
          <p>
            All data collected is used solely to generate AI-powered answers and
            explanations for the assignment you are currently viewing:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-1">
            <li>
              Assignment HTML and screenshots are sent to Google Gemini to extract
              question structures and produce answers with reasoning.
            </li>
            <li>
              Your Gemini API key authenticates these requests directly to Google on
              your behalf.
            </li>
            <li>
              Model preferences determine which Gemini model variant handles your
              request.
            </li>
          </ul>
          <p>
            MOOC Utils does not use your data for advertising, profiling, training
            machine-learning models, or any purpose other than providing the
            service directly to you.
          </p>
        </Section>

        {/* 3. Data Sharing */}
        <Section icon={Share2} title="Data Sharing & Third Parties">
          <p>
            The only third party that receives any data is{" "}
            <strong className="text-foreground">Google LLC</strong> through the
            Gemini API endpoint{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              generativelanguage.googleapis.com
            </code>
            . This transfer is necessary for the core AI feature to function.
          </p>
          <p>
            Google&apos;s handling of data submitted to the Gemini API is governed by
            the{" "}
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Google Gemini API Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Google Privacy Policy
            </a>
            . We recommend reviewing those documents.
          </p>
          <p>
            No other data is transmitted to MOOC Utils servers or any other third
            party. The extension contains no analytics SDK, crash reporter, or
            telemetry of any kind.
          </p>
        </Section>

        {/* 4. Data Storage & Retention */}
        <Section icon={Lock} title="Data Storage & Retention">
          <p>
            All data is stored exclusively in{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
              browser.storage.local
            </code>{" "}
            on your own device. This storage is:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-1">
            <li>Local-only — never synced to the cloud or any server.</li>
            <li>
              Scoped to the extension — inaccessible to websites or other extensions.
            </li>
            <li>
              Retained until you clear it manually or uninstall the extension.
            </li>
          </ul>
          <p>
            The last extraction result (questions and AI-generated answers) is
            cached in local storage to allow export but is overwritten on the next
            solve operation.
          </p>
        </Section>

        {/* 5. Your Rights & Controls */}
        <Section icon={Trash2} title="Your Rights & Controls">
          <p>You have full control over the data the extension holds:</p>
          <ul className="list-disc list-inside space-y-2 pl-1">
            <li>
              <strong className="text-foreground">Delete all data</strong> — uninstall
              the extension. All local storage is wiped automatically.
            </li>
            <li>
              <strong className="text-foreground">Clear cached results</strong> —
              open the extension settings and clear the stored extraction.
            </li>
            <li>
              <strong className="text-foreground">Revoke API access</strong> — delete
              or regenerate your Gemini API key at any time via{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
              >
                Google AI Studio
              </a>
              .
            </li>
          </ul>
          <p>
            Because we do not collect or store any data on our servers, there is
            nothing for us to retrieve, export, or delete on your behalf.
          </p>
        </Section>

        {/* 6. Contact */}
        <Section icon={Mail} title="Contact">
          <p>
            Questions or concerns about this policy can be raised by opening an
            issue on our{" "}
            <a
              href="https://github.com/tashifkhan/MOOC-utils/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              GitHub repository
            </a>
            .
          </p>
          <p>
            We may update this policy as the extension evolves. Material changes
            will be noted in the repository changelog. The &quot;Last updated&quot; date at
            the top of this page always reflects the current version.
          </p>
        </Section>
      </div>

      <Footer />
    </main>
  );
}
