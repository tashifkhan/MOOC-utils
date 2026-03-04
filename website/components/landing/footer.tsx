import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="container mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-primary-foreground font-display font-bold text-sm leading-none">
                  M
                </span>
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                MOOC Utils
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              Open-source tools to help you succeed in your NPTEL and SWAYAM
              courses.
            </p>
            <a
              href="https://github.com/tashifkhan/MOOC-utils"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">
              Products
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-muted-foreground/50 cursor-not-allowed select-none inline-flex items-center gap-2">
                  Notice Reminders
                  <span className="text-[9px] font-mono font-bold bg-primary/12 text-primary px-1.5 py-0.5 rounded uppercase tracking-wide leading-none">
                    Soon
                  </span>
                </span>
              </li>
              <li>
                <Link
                  href="/assignment-solver"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Assignment Solver
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">
              Resources
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://github.com/tashifkhan/MOOC-utils"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tashifkhan/MOOC-utils/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Report an Issue
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tashifkhan/MOOC-utils/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">
              Community
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/#faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/tashifkhan/MOOC-utils/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Discussions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
          <p>© {new Date().getFullYear()} MOOC Utils — MIT License</p>
          <p>
            Built by{" "}
            <a
              href="https://github.com/tashifkhan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline underline-offset-2"
            >
              Tashif Khan
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
