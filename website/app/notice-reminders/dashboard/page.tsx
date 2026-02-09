"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserLookup } from "@/components/notice-reminders/user-lookup";
import { NotificationInbox } from "@/components/notice-reminders/notification-inbox";
import { SubscriptionManager } from "@/components/notice-reminders/subscription-manager";
import { UserProfile } from "@/components/notice-reminders/user-profile";
import { AddSubscription } from "@/components/notice-reminders/add-subscription";
import { Footer } from "@/components/landing";
import type { User } from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  if (!user) {
    return (
      <main className="min-h-screen pt-16 flex flex-col bg-muted/5 dark:bg-background">
        <div className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-8 shadow-lg border-muted-foreground/10 bg-card/80 backdrop-blur-sm">
                    <UserLookup onUserFound={setUser} />
                </Card>
            </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 bg-muted/10 dark:bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user.name || user.email}</p>
            </div>
            <div className="flex gap-3">
                <AddSubscription user={user} />
                <Button variant="outline" onClick={() => setUser(null)}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Notifications & Subs */}
          <div className="lg:col-span-2 space-y-8">
            <NotificationInbox user={user} />
            <SubscriptionManager user={user} />
          </div>

          {/* Right Column: Profile & Settings */}
          <div className="space-y-8">
            <UserProfile user={user} onLogout={() => setUser(null)} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
