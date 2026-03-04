"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Puzzle, Menu, X } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function NavHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden">
              <img
                src="/logo-solver.png"
                alt="MOOC Utils Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              MOOC Utils
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {/* Notice Reminders — Coming Soon */}
            <div className="relative">
              <span
                className="px-3 py-2 text-sm text-muted-foreground/50 rounded-md cursor-not-allowed select-none inline-flex items-center gap-1.5"
                aria-disabled="true"
                title="Coming soon"
              >
                Notice Reminders
                <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded uppercase tracking-wide leading-none">
                  Soon
                </span>
              </span>
            </div>

            {/* Assignment Solver */}
            <Link
              href="/assignment-solver"
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
            >
              Assignment Solver
            </Link>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <ModeToggle />
            <Link
              href="/assignment-solver"
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
            >
              <Puzzle className="w-4 h-4" />
              Get Extension
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-6 py-4 space-y-1">
            {/* Notice Reminders — Coming Soon (mobile) */}
            <div className="flex items-center justify-between px-3 py-2.5 text-sm text-muted-foreground/50 rounded-md cursor-not-allowed select-none">
              <span>Notice Reminders</span>
              <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded uppercase tracking-wide leading-none">
                Soon
              </span>
            </div>

            <Link
              href="/assignment-solver"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              Assignment Solver
            </Link>

            <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
              <div className="flex justify-end px-2">
                <ModeToggle />
              </div>
              <Link
                href="/assignment-solver"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "w-full justify-center gap-1.5",
                )}
              >
                <Puzzle className="w-4 h-4" />
                Get Extension
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
