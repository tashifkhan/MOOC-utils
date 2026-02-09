"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUserNotifications, markNotificationRead } from "@/lib/api";
import type { User, Notification } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  BellRing,
  Check,
  Circle,
  Inbox,
} from "lucide-react";

interface NotificationInboxProps {
  user: User;
}

export function NotificationInbox({ user }: NotificationInboxProps) {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
  } = useQuery({
    queryKey: ["notifications", user.id],
    queryFn: () => listUserNotifications(user.id),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", user.id],
      });
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-primary" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {notifications.length > 0
            ? `${notifications.length} notification${notifications.length > 1 ? "s" : ""} total`
            : "No notifications yet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Your inbox is empty.</p>
            <p className="text-sm mt-1">
              Notifications will appear here when your subscribed courses post
              announcements.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                  notification.is_read
                    ? "bg-transparent"
                    : "bg-primary/5 border border-primary/10"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {notification.is_read ? (
                    <Check className="w-4 h-4 text-muted-foreground/50" />
                  ) : (
                    <Circle className="w-4 h-4 text-primary fill-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span
                      className={cn(
                        notification.is_read
                          ? "text-muted-foreground"
                          : "font-medium text-foreground"
                      )}
                    >
                      New announcement
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      for subscription #{notification.subscription_id}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(notification.sent_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}
                    {notification.channel_id != null &&
                      ` \u00B7 Channel #${notification.channel_id}`}
                  </p>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markReadMutation.mutate(notification.id)}
                    disabled={markReadMutation.isPending}
                    className="shrink-0"
                  >
                    {markReadMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    <span className="ml-1">Read</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
