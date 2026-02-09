"use client";

import { cn } from "@/lib/utils";
import { Bell, Puzzle, ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.45_0.12_183/0.3),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_60%_40%_at_70%_120%,oklch(0.35_0.08_280/0.15),transparent)]" />
        
        {/* Geometric decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 border border-primary/20 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute bottom-32 right-16 w-48 h-48 border border-primary/10 rotate-45 animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary/40 rounded-full animate-[bounce_3s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary/30 rounded-full animate-[bounce_2s_ease-in-out_infinite_0.5s]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.7 0.12 183) 1px, transparent 1px),
                              linear-gradient(90deg, oklch(0.7 0.12 183) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>Tools for MOOC learners</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <span className="block text-foreground">Your MOOC</span>
            <span className="block bg-gradient-to-r from-primary via-chart-2 to-chart-1 bg-clip-text text-transparent">
              Superpower Suite
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Two powerful tools to ace your online courses: instant assignment help 
            and smart course notifications. Never miss a deadline again.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <a
              href="#signup"
              className={cn(buttonVariants({ size: "lg" }), "group text-base px-8 h-12")}
            >
              <Bell className="w-5 h-5 mr-2" />
              Get Notifications
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#extension"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "text-base px-8 h-12")}
            >
              <Puzzle className="w-5 h-5 mr-2" />
              Download Extension
            </a>
          </div>
        </div>

        {/* Feature preview cards */}
        <div className="mt-24 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
          <FeaturePreview
            icon={<Bell className="w-6 h-6" />}
            title="Notice Reminders"
            description="Subscribe to courses and get instant alerts for announcements, deadlines, and updates."
            accent="from-chart-1 to-chart-3"
          />
          <FeaturePreview
            icon={<Puzzle className="w-6 h-6" />}
            title="Assignment Solver"
            description="Browser extension that helps you understand and solve NPTEL assignments with AI assistance."
            accent="from-chart-4 to-chart-5"
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-2.5 bg-muted-foreground/50 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}

function FeaturePreview({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
      {/* Gradient accent line */}
      <div className={cn("absolute top-0 left-6 right-6 h-px bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity", accent)} />
      
      <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4", accent)}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
