"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSubscriptions,
  deleteSubscription,
  listCourses,
  listAnnouncements,
} from "@/lib/api";
import type { User, Subscription, Course, Announcement } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";

interface SubscriptionManagerProps {
  user: User;
}

export function SubscriptionManager({ user }: SubscriptionManagerProps) {
  const queryClient = useQueryClient();
  const [expandedSub, setExpandedSub] = useState<number | null>(null);

  const { data: subscriptions = [], isLoading: loadingSubs } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => listSubscriptions(),
    select: (subs) => subs.filter((s) => s.user_id === user.id),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

  const getCourseForSub = useCallback(
    (sub: Subscription): Course | undefined => {
      return courses.find((c) => c.id === sub.course_id);
    },
    [courses]
  );

  const toggleExpand = useCallback((subId: number) => {
    setExpandedSub((prev) => (prev === subId ? null : subId));
  }, []);

  if (loadingSubs) {
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
          <BookOpen className="w-5 h-5 text-primary" />
          Your Subscriptions
        </CardTitle>
        <CardDescription>
          {subscriptions.length > 0
            ? `Tracking ${subscriptions.length} course${subscriptions.length > 1 ? "s" : ""}`
            : "No active subscriptions"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No subscriptions yet.</p>
            <p className="text-sm mt-1">
              Head to the{" "}
              <Link href="/#signup" className="text-primary hover:underline">
                home page
              </Link>{" "}
              to subscribe to courses.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const course = getCourseForSub(sub);
              const isExpanded = expandedSub === sub.id;

              return (
                <div
                  key={sub.id}
                  className={cn(
                    "rounded-xl border transition-all duration-200",
                    isExpanded
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-chart-1 to-chart-3 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {course?.title ?? `Course #${sub.course_id}`}
                      </p>
                      {course && (
                        <p className="text-sm text-muted-foreground truncate">
                          {course.instructor} &middot; {course.institute}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={sub.is_active ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {sub.is_active ? "Active" : "Paused"}
                    </Badge>
                    <button
                      onClick={() => toggleExpand(sub.id)}
                      className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="h-px bg-border/50" />

                      {/* Announcements preview */}
                      {course && (
                        <AnnouncementPreview courseCode={course.code} />
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-muted-foreground">
                          Subscribed{" "}
                          {new Date(sub.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(sub.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span className="ml-1.5">Unsubscribe</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnnouncementPreview({ courseCode }: { courseCode: string }) {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements", courseCode],
    queryFn: () => listAnnouncements(courseCode),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Loading announcements...
      </div>
    );
  }

  const recent = announcements.slice(0, 3);

  if (recent.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-1">
        No announcements yet for this course.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Megaphone className="w-3 h-3" />
        Recent Announcements
      </p>
      {recent.map((a: Announcement) => (
        <div
          key={a.id}
          className="p-3 rounded-lg bg-muted/30 border border-border/30"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug">{a.title}</p>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(a.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {a.content && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {a.content}
            </p>
          )}
        </div>
      ))}
      {announcements.length > 3 && (
        <p className="text-xs text-muted-foreground">
          +{announcements.length - 3} more announcement
          {announcements.length - 3 > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
