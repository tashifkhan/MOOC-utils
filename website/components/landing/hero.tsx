"use client";

import { cn } from "@/lib/utils";
import { Puzzle, ArrowRight, Zap, Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {/* Warm radial from top-right */}
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(ellipse_at_top_right,oklch(0.52_0.17_56/0.07),transparent_65%)]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.50_0.12_232/0.05),transparent_60%)]" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Vertical rule */}
        <div className="absolute inset-y-0 left-[9%] w-px bg-gradient-to-b from-transparent via-border to-transparent hidden lg:block" />
      </div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 xl:gap-24 items-center min-h-screen py-28 lg:py-32">
          {/* ─── Left: Text ─────────────────────────────────────── */}
          <div className="space-y-8 lg:pl-8">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="h-px w-8 bg-primary shrink-0" />
              <span className="font-mono text-[11px] text-primary uppercase tracking-[0.25em]">
                Tools for MOOC Learners
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-bold leading-[0.9] tracking-tight animate-in fade-in slide-in-from-left-6 duration-700 delay-100"
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
            >
              <span className="block text-foreground">Ace every</span>
              <span className="block italic text-primary">NPTEL</span>
              <span className="block text-foreground">assignment.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-sm leading-relaxed animate-in fade-in duration-700 delay-200">
              The #1 study toolkit for NPTEL & SWAYAM students. AI-powered
              assignment help and smart course notifications for MOOC learners.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link
                href="/assignment-solver"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group h-12 px-7 text-base gap-2.5",
                )}
              >
                <Puzzle className="w-4 h-4" />
                Download Extension
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Notice Reminders — Coming Soon */}
              <div className="relative group/soon inline-flex">
                <div
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "h-12 px-7 text-base gap-2.5 cursor-not-allowed opacity-50 pointer-events-none select-none",
                  )}
                  aria-disabled="true"
                >
                  <img
                    src="/logo-reminders.png"
                    alt=""
                    className="w-4 h-4 grayscale opacity-50"
                  />
                  Get Notifications
                </div>
                <span className="absolute -top-2.5 -right-2.5 bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full leading-none shadow-sm">
                  Soon
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 pt-2 animate-in fade-in duration-700 delay-500">
              <div>
                <div className="font-display text-2xl font-bold leading-none">
                  5k+
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Courses indexed
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="font-display text-2xl font-bold leading-none">
                  Free
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Always open source
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <div className="font-display text-2xl font-bold leading-none">
                  MIT
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Licensed
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right: Visual mockup ────────────────────────────── */}
          <div className="relative hidden lg:block animate-in fade-in slide-in-from-right-8 duration-700 delay-400">
            {/* Assignment Solver browser mockup */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-muted/60 border-b border-border px-4 py-2.5 flex items-center gap-2.5">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-background/70 rounded-md px-3 py-1 text-[11px] font-mono text-muted-foreground truncate">
                  nptel.swayam.gov.in / week-8-assignment
                </div>
                <div className="shrink-0 w-7 h-5 relative flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo-solver.png"
                    alt="Solver Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Page content */}
              <div className="p-6 space-y-5">
                <div className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                  Week 8 · Programming Assignment · 10 Questions
                </div>

                {/* MCQ question */}
                <div className="space-y-3">
                  <p className="text-sm font-medium leading-relaxed">
                    Q3. Which algorithm has the best average-case time
                    complexity for sorting a large, random dataset?
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        label: "A",
                        text: "Bubble Sort — O(n²)",
                        correct: false,
                      },
                      {
                        label: "B",
                        text: "Merge Sort — O(n log n)",
                        correct: true,
                      },
                      {
                        label: "C",
                        text: "Counting Sort — O(n + k)",
                        correct: false,
                      },
                      {
                        label: "D",
                        text: "Insertion Sort — O(n²)",
                        correct: false,
                      },
                    ].map((opt) => (
                      <div
                        key={opt.label}
                        className={cn(
                          "text-xs px-3 py-2 rounded-lg border flex items-center gap-2.5",
                          opt.correct
                            ? "bg-chart-4/10 border-chart-4/40 text-chart-4 font-medium"
                            : "bg-muted/30 border-border/40 text-muted-foreground",
                        )}
                      >
                        <span className="font-mono text-[10px] opacity-60 shrink-0 w-4">
                          {opt.label}.
                        </span>
                        {opt.text}
                        {opt.correct && (
                          <span className="ml-auto text-[9px] font-mono opacity-70">
                            ✓
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI analysis panel */}
                <div className="bg-primary/6 border border-primary/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
                      <Zap className="w-3 h-3 text-primary fill-primary" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wide">
                      AI Analysis
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Merge Sort uses a divide-and-conquer approach, splitting the
                    array in half recursively. Its O(n log n) complexity holds
                    in all cases, making it reliable for large datasets...
                  </p>
                  <div className="flex gap-1.5 pt-0.5">
                    {["Stability", "Divide & Conquer", "O(n log n)"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono bg-primary/10 text-primary/80 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Coming Soon — Notice Reminders card */}
            <div className="absolute -bottom-8 -left-10 w-58 bg-card border border-border/70 rounded-xl p-4 shadow-xl grayscale opacity-45 select-none pointer-events-none">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 overflow-hidden flex items-center justify-center">
                    <img
                      src="/logo-reminders.png"
                      alt="Reminders Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Notice Reminders
                  </span>
                </div>
                <Lock className="w-3 h-3 text-muted-foreground/50" />
              </div>
              <p className="text-[11px] text-muted-foreground/70 leading-tight mb-3">
                NPTEL · Data Structures Week 9 quiz now open. Deadline in 3
                days.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-muted-foreground/20" />
                <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest shrink-0">
                  Coming Soon
                </span>
                <div className="flex-1 h-px bg-muted-foreground/20" />
              </div>
            </div>

            {/* Decorative blurs */}
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-primary/6 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-16 right-10 w-40 h-40 bg-chart-4/6 rounded-full blur-2xl -z-10" />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="w-5 h-8 rounded-full border border-muted-foreground/40 flex items-start justify-center p-1.5">
          <div className="w-1 h-1.5 bg-muted-foreground/60 rounded-full animate-[bounce_1.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}
