"use client";

import Link from "next/link";
import { MoveLeft, HelpCircle, BookOpen, Puzzle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
      
      <div className="relative mb-12">
        {/* Logos as visual anchors */}
        <div className="absolute -top-16 -left-16 w-32 h-32 opacity-10 blur-xl animate-pulse select-none pointer-events-none">
          <img src="/logo-solver.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 opacity-10 blur-xl animate-pulse delay-700 select-none pointer-events-none">
          <img src="/logo-reminders.png" alt="" className="w-full h-full object-contain" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <h1 className="font-display text-8xl md:text-9xl font-black text-primary/15 select-none tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-28 md:h-28 p-5 bg-background border border-border/60 rounded-[2.5rem] shadow-2xl rotate-12 hover:rotate-0 transition-all duration-500 cursor-default group">
              <img 
                src="/logo-solver.png" 
                alt="MOOC Utils" 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          This course is <span className="text-primary italic">out of syllabus</span>.
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg md:text-xl leading-relaxed">
          The page you&apos;re looking for has been moved, archived, or never existed in this semester&apos;s curriculum.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "gap-2 px-8 h-14 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5")}>
          <MoveLeft className="w-4 h-4" />
          Back to Campus
        </Link>
        <Link href="/assignment-solver" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 px-8 h-14 text-base font-semibold transition-all hover:bg-muted/80 hover:-translate-y-0.5")}>
          <Puzzle className="w-4 h-4" />
          Assignment Solver
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="group p-8 rounded-3xl border border-border/50 bg-card hover:bg-muted/30 transition-all duration-300 text-left space-y-4 hover:border-primary/20 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-base leading-none">Course Catalog</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Explore our suite of tools designed specifically for NPTEL & SWAYAM learners.</p>
          </div>
        </div>

        <div className="group p-8 rounded-3xl border border-border/50 bg-card hover:bg-muted/30 transition-all duration-300 text-left space-y-4 hover:border-primary/20 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <Puzzle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-base leading-none">AI Assistant</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Stuck on a tricky assignment? Our solver uses advanced AI to help you learn faster.</p>
          </div>
        </div>

        <div className="group p-8 rounded-3xl border border-border/50 bg-card hover:bg-muted/30 transition-all duration-300 text-left space-y-4 hover:border-primary/20 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-base leading-none">Support Desk</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Think you found a bug in the system? Let us know so we can fix it for the next batch.</p>
          </div>
        </div>
      </div>
      
      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent -z-10" />
    </div>
  );
}
