"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import { NotificationInbox } from "@/components/notice-reminders/notification-inbox";
import { SubscriptionManager } from "@/components/notice-reminders/subscription-manager";
import { UserProfile } from "@/components/notice-reminders/user-profile";
import { AddSubscription } from "@/components/notice-reminders/add-subscription";
import { Footer } from "@/components/landing";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <main className="min-h-screen pt-20 bg-muted/10 dark:bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                  <h1 className="text-3xl font-bold">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
              </div>
              <div className="flex gap-3">
                  {user && <AddSubscription />}
                  <Button variant="outline" onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                  </Button>
              </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Notifications & Subs */}
            <div className="lg:col-span-2 space-y-8">
              {user && <NotificationInbox />}
              {user && <SubscriptionManager />}
            </div>

            {/* Right Column: Profile & Settings */}
            <div className="space-y-8">
              {user && <UserProfile user={user} onLogout={logout} />}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </AuthGuard>
  );
}
