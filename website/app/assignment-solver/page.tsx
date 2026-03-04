import { ExtensionDownload } from "@/components/assignment-solver/extension-download";
import { Footer } from "@/components/landing";
import { Zap, BrainCircuit, BookOpen, GraduationCap, Trophy, Info } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assignment Solver for NPTEL & SWAYAM",
  description:
    "Instant AI-powered assignment help for NPTEL and SWAYAM students. Get explanations, hints, and learn concepts directly on your MOOC course page.",
  keywords: [
    "NPTEL Assignment Solver",
    "SWAYAM Assignment Help",
    "MOOC Course Helper",
    "NPTEL Solutions AI",
    "SWAYAM AI Tool",
    "MOOC Utils Extension",
    "NPTEL Exam Preparation Helper",
  ],
};

export default function Page() {
  return (
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="h-px w-8 bg-primary shrink-0" />
          <span className="font-mono text-[11px] text-primary uppercase tracking-[0.25em]">
            MOOC & NPTEL POWER TOOL
          </span>
          <div className="h-px w-8 bg-primary shrink-0" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
          AI-Powered <span className="italic text-primary">Assignment</span> Solver
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          The ultimate study companion for NPTEL and SWAYAM students. Get instant
          AI help, detailed explanations, and conceptual hints directly on your
          MOOC course pages without ever leaving the assignment.
        </p>
      </div>

      <ExtensionDownload />

      {/* Why Use section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold tracking-tight">
                Designed for NPTEL Learners
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: GraduationCap,
                    title: "Boost Your Grades",
                    desc: "Improve your internal marks by understanding every question thoroughly with AI assistance.",
                  },
                  {
                    icon: Trophy,
                    title: "Prepare for Exams",
                    desc: "Use the AI-generated explanations as study material to prepare for final NPTEL/SWAYAM certifications.",
                  },
                  {
                    icon: Info,
                    title: "Concept Clarification",
                    desc: "Don&apos;t just get the answer; learn the &apos;why&apos; behind it with detailed context and related topics.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-3xl -z-10 group-hover:bg-primary/20 transition-colors" />
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    <span className="ml-2 text-[10px] opacity-50 uppercase tracking-widest">
                      NPTEL Interface
                    </span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-lg">
                    <p className="text-xs opacity-70 mb-2">Q: Solve the differential equation...</p>
                    <div className="h-2 w-3/4 bg-primary/20 rounded mb-1" />
                    <div className="h-2 w-1/2 bg-primary/10 rounded" />
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary">AI ANSWER</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      The characteristic equation is r² + 2r + 1 = 0...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4 tracking-tight">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started with MOOC Utils is quick and easy. Simple, unobtrusive, and powerful.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-xl border border-border/60 hover:border-primary/40 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4 mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Open Assignment</h3>
              <p className="text-muted-foreground text-sm">
                Navigate to any assignment page on supported MOOC platforms like NPTEL or Swayam.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border/60 hover:border-primary/40 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4 mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Get AI Help</h3>
              <p className="text-muted-foreground text-sm">
                Click the &quot;Solve&quot; button next to any question to get an instant analysis and correct answer.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border/60 hover:border-primary/40 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4 mb-4 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Learn Concepts</h3>
              <p className="text-muted-foreground text-sm">
                Read the detailed AI-generated explanation to understand the underlying NPTEL course concepts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
