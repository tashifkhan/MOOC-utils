import { Bell, Puzzle, Zap, Shield, Search, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    category: "Notice Reminders",
    accent: "from-chart-1 to-chart-3",
    items: [
      {
        icon: <Search className="w-5 h-5" />,
        title: "Course Discovery",
        description: "Search thousands of SWAYAM/NPTEL courses instantly",
      },
      {
        icon: <Bell className="w-5 h-5" />,
        title: "Smart Alerts",
        description: "Get notified via email or Telegram when new announcements drop",
      },
      {
        icon: <Clock className="w-5 h-5" />,
        title: "Deadline Tracking",
        description: "Never miss assignment deadlines or exam dates",
      },
    ],
  },
  {
    category: "Assignment Solver",
    accent: "from-chart-4 to-chart-5",
    items: [
      {
        icon: <Puzzle className="w-5 h-5" />,
        title: "One-Click Analysis",
        description: "Analyze MCQ questions directly on the assignment page",
      },
      {
        icon: <Zap className="w-5 h-5" />,
        title: "AI-Powered Help",
        description: "Get explanations and hints powered by Gemini AI",
      },
      {
        icon: <Shield className="w-5 h-5" />,
        title: "Privacy First",
        description: "Your API key stays local. No data collection.",
      },
    ],
  },
];

export function Features() {
  return (
    <section className="py-24 relative" id="features">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent"> succeed</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Two complementary tools designed specifically for MOOC learners
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {features.map((section, sectionIndex) => (
            <div key={section.category} className="space-y-6">
              {/* Category header */}
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", section.accent)}>
                  {sectionIndex === 0 ? (
                    <Bell className="w-5 h-5 text-white" />
                  ) : (
                    <Puzzle className="w-5 h-5 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-semibold">{section.category}</h3>
              </div>

              {/* Feature cards */}
              <div className="space-y-4">
                {section.items.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="group p-5 rounded-xl bg-card/30 border border-border/50 hover:border-primary/20 hover:bg-card/50 transition-all duration-300"
                    style={{
                      animationDelay: `${(sectionIndex * 3 + index) * 100}ms`,
                    }}
                  >
                    <div className="flex gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        "bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary"
                      )}>
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
