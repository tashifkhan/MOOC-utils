import { ExtensionDownload } from "@/components/assignment-solver/extension-download";
import { Footer } from "@/components/landing";
import { Zap, BrainCircuit, BookOpen } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen pt-20">
       {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Assignment Solver</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your AI-powered study companion. Get instant help, explanations, and hints directly on your course pages.
        </p>
      </div>

      <ExtensionDownload />

      {/* How it Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, unobtrusive, and powerful.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             <div className="bg-card p-6 rounded-xl border">
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4 mb-4">
                   <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Open Assignment</h3>
                <p className="text-muted-foreground">Navigate to any assignment page on supported MOOC platforms (NPTEL, Swayam).</p>
             </div>
             <div className="bg-card p-6 rounded-xl border">
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4 mb-4">
                   <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Get AI Help</h3>
                <p className="text-muted-foreground">Click the "Solve" button next to any question to get an instant analysis and answer.</p>
             </div>
             <div className="bg-card p-6 rounded-xl border">
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4 mb-4">
                   <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Learn Concepts</h3>
                <p className="text-muted-foreground">Read the detailed explanation to understand the underlying concepts.</p>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
