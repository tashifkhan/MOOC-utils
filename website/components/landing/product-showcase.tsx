"use client";

import Link from "next/link";
import { Bell, Puzzle, ArrowRight, CheckCircle2, Lock, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductShowcase() {
  return (
    <section className="py-24 border-t border-border/50" id="tools">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6 bg-primary shrink-0" />
              <span className="font-mono text-[11px] text-primary uppercase tracking-[0.25em]">
                Our Tools
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-[0.95] tracking-tight">
              Two tools.
              <br />
              <span className="text-muted-foreground font-normal italic">
                One mission.
              </span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xs leading-relaxed text-sm md:self-end">
            Both tools are free and open source, built specifically for NPTEL
            and SWAYAM learners.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* ── Assignment Solver — ACTIVE ───────────────────────── */}
          <div className="group relative flex flex-col bg-card border border-border hover:border-chart-4/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-chart-4/5">
            {/* Top accent bar */}
            <div className="h-0.5 bg-gradient-to-r from-chart-4 to-chart-5" />

            <div className="p-8 flex flex-col flex-1 gap-6">
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <Puzzle className="w-5 h-5 text-chart-4" />
                </div>
                <span className="text-[11px] font-mono bg-chart-4/8 text-chart-4 border border-chart-4/20 px-2.5 py-1 rounded-full">
                  Browser Extension
                </span>
              </div>

              {/* Copy */}
              <div>
                <h3 className="font-display text-2xl font-bold mb-2 tracking-tight">
                  Assignment Solver
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  AI-powered assistance embedded in your browser while you work
                  through NPTEL assignments — no tab-switching required.
                </p>
              </div>

              {/* Features list */}
              <ul className="space-y-2.5 flex-1">
                {[
                  "Instant AI hints for MCQ questions",
                  "Concept explanations in plain language",
                  "Similar problem examples from literature",
                  "Direct integration with NPTEL course pages",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-chart-4 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/assignment-solver"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full group/btn h-12 bg-chart-4 hover:bg-chart-4/90 text-white border-0 gap-2"
                )}
              >
                View Extension
                <ArrowRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── Notice Reminders — COMING SOON ───────────────────── */}
          <div className="relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden grayscale opacity-55 pointer-events-none select-none">
            {/* Top accent bar */}
            <div className="h-0.5 bg-gradient-to-r from-chart-1 to-chart-2" />

            {/* Diagonal Coming Soon ribbon */}
            <div className="absolute top-0 right-0 w-40 h-40 overflow-hidden pointer-events-none z-10">
              <div className="absolute top-7 right-[-2.5rem] rotate-45 bg-foreground text-background text-[9px] font-mono font-bold uppercase tracking-[0.18em] px-10 py-1.5 shadow-sm">
                Coming Soon
              </div>
            </div>

            <div className="p-8 flex flex-col flex-1 gap-6">
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[11px] font-mono bg-muted text-muted-foreground border border-border px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  In Development
                </span>
              </div>

              {/* Copy */}
              <div>
                <h3 className="font-display text-2xl font-bold mb-2 tracking-tight">
                  Notice Reminders
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Stay on top of your SWAYAM/NPTEL courses without checking
                  the portal every day.
                </p>
              </div>

              {/* Features list */}
              <ul className="space-y-2.5 flex-1">
                {[
                  "Email notifications for new announcements",
                  "Deadline reminders before they pass",
                  "Assignment updates when posted",
                  "Exam schedule and alert notifications",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Disabled CTA */}
              <div
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "w-full h-12 cursor-not-allowed gap-2 justify-center"
                )}
                aria-disabled="true"
              >
                <Lock className="w-4 h-4" />
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
