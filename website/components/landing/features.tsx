import { Bell, Puzzle, Zap, Shield, Search, Clock } from "lucide-react";

const assignmentFeatures = [
  {
    icon: <Puzzle className="w-5 h-5" />,
    title: "One-Click Analysis",
    description:
      "Analyse MCQ questions directly on the assignment page without leaving your browser.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "AI-Powered Hints",
    description:
      "Get explanations and hints powered by Gemini AI. Understand the why, not just the answer.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Privacy First",
    description:
      "Your Gemini API key stays local in your browser. Zero data sent to our servers.",
  },
];

const noticeFeatures = [
  {
    icon: <Search className="w-5 h-5" />,
    title: "Course Discovery",
    description:
      "Search thousands of SWAYAM/NPTEL courses and subscribe to the ones you're enrolled in.",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Smart Alerts",
    description:
      "Get notified via email the moment new announcements drop for your courses.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Deadline Tracking",
    description:
      "Never miss an assignment submission or exam — reminders sent well in advance.",
  },
];

export function Features() {
  return (
    <section className="py-24 border-t border-border/50" id="features">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-6 bg-primary shrink-0" />
            <span className="font-mono text-[11px] text-primary uppercase tracking-[0.25em]">
              Features
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-[0.95] tracking-tight max-w-xl">
            Everything you need{" "}
            <span className="italic text-muted-foreground font-normal">
              to succeed.
            </span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* ── Assignment Solver features — ACTIVE ─────────────── */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Puzzle className="w-4 h-4 text-chart-4" />
              </div>
              <h3 className="font-semibold text-base">Assignment Solver</h3>
              <span className="ml-auto text-[10px] font-mono text-chart-4 bg-chart-4/8 border border-chart-4/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Active
              </span>
            </div>

            <div className="space-y-3">
              {assignmentFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group p-5 rounded-xl bg-card/50 border border-border/60 hover:border-chart-4/25 hover:bg-card transition-all duration-300"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground group-hover:bg-chart-4/10 group-hover:text-chart-4 transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Notice Reminders features — COMING SOON ─────────── */}
          <div className="space-y-5 grayscale opacity-50 pointer-events-none select-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Notice Reminders</h3>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full uppercase tracking-wide">
                Coming Soon
              </span>
            </div>

            <div className="space-y-3">
              {noticeFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="p-5 rounded-xl bg-card/40 border border-border/50"
                  style={{ animationDelay: `${(index + 3) * 80}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
