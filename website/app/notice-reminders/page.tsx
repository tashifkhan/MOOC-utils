import { SignupFlow } from "@/components/notice-reminders/signup-flow";
import { Footer } from "@/components/landing";

export default function Page() {
  return (
    <main className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center mb-4">
           <h1 className="text-4xl font-bold mb-4">Notice Reminders</h1>
           <p className="text-muted-foreground text-lg">
             Subscribe to your courses and get instant notifications for new announcements.
           </p>
        </div>
        <SignupFlow />
      </div>
      <Footer />
    </main>
  );
}
