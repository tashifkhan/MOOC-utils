import Link from "next/link";
import { Github, Heart, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-semibold text-lg">MOOC Utils</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Open-source tools to help you succeed in your NPTEL and SWAYAM courses.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com/tashifkhan/MOOC-utils"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/notice-reminders" className="hover:text-foreground transition-colors">
                  Notice Reminders
                </Link>
              </li>
              <li>
                <Link href="/assignment-solver" className="hover:text-foreground transition-colors">
                  Assignment Solver
                </Link>
              </li>
              <li>
                <Link href="/notice-reminders/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a 
                  href="https://github.com/tashifkhan/MOOC-utils" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/tashifkhan/MOOC-utils/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Report an Issue
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/tashifkhan/MOOC-utils/releases" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/#faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/tashifkhan/MOOC-utils/discussions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Discussions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MOOC Utils. Open source under MIT License.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by 
            <a 
              href="https://github.com/tashifkhan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              Tashif Khan
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
