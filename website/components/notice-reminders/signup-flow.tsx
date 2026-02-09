"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Loader2, Check, X, ChevronLeft, ChevronRight, Mail, MessageCircle, Bell, Sparkles } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { searchCourses, completeSignup } from "@/lib/api";
import type { Course } from "@/lib/types";

// Form validation schemas
const emailSchema = z.string().email("Please enter a valid email");
const telegramSchema = z.string().min(1, "Telegram ID is required when enabled");

type Step = "search" | "account" | "success";

interface SignupData {
  selectedCourses: Course[];
  email: string;
  name: string;
  notifyEmail: boolean;
  notifyTelegram: boolean;
  telegramId: string;
}

const initialData: SignupData = {
  selectedCourses: [],
  email: "",
  name: "",
  notifyEmail: true,
  notifyTelegram: false,
  telegramId: "",
};

export function SignupFlow() {
  const [step, setStep] = useState<Step>("search");
  const [data, setData] = useState<SignupData>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Course search query
  const { data: courses = [], isLoading: isSearching } = useQuery({
    queryKey: ["courses", debouncedQuery],
    queryFn: () => searchCourses(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async () => {
      return completeSignup({
        email: data.email,
        name: data.name || undefined,
        notifyEmail: data.notifyEmail,
        notifyTelegram: data.notifyTelegram,
        telegramId: data.telegramId || undefined,
        courseCodes: data.selectedCourses.map((c) => c.code),
      });
    },
    onSuccess: () => {
      setStep("success");
    },
  });

  const toggleCourse = (course: Course) => {
    setData((prev) => {
      const exists = prev.selectedCourses.find((c) => c.code === course.code);
      return {
        ...prev,
        selectedCourses: exists
          ? prev.selectedCourses.filter((c) => c.code !== course.code)
          : [...prev.selectedCourses, course],
      };
    });
  };

  const validateAccountStep = () => {
    const newErrors: Record<string, string> = {};

    const emailResult = emailSchema.safeParse(data.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.issues[0].message;
    }

    if (data.notifyTelegram) {
      const telegramResult = telegramSchema.safeParse(data.telegramId);
      if (!telegramResult.success) {
        newErrors.telegramId = telegramResult.error.issues[0].message;
      }
    }

    if (!data.notifyEmail && !data.notifyTelegram) {
      newErrors.channels = "Select at least one notification channel";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === "search" && data.selectedCourses.length > 0) {
      setStep("account");
    } else if (step === "account") {
      if (validateAccountStep()) {
        signupMutation.mutate();
      }
    }
  };

  const handleBack = () => {
    if (step === "account") {
      setStep("search");
    }
  };

  const handleReset = () => {
    setStep("search");
    setData(initialData);
    setSearchQuery("");
    setDebouncedQuery("");
    setErrors({});
  };

  return (
    <section className="py-24 relative" id="signup">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,oklch(0.40_0.10_183/0.15),transparent)]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chart-1/10 text-chart-1 text-sm font-medium mb-4">
            <Bell className="w-4 h-4" />
            Course Notifications
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Never miss an announcement
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Subscribe to your courses and get instant notifications for new announcements
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["search", "account", "success"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : (["search", "account", "success"].indexOf(step) > i)
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div className={cn(
                  "w-12 h-0.5 mx-1 transition-colors",
                  ["search", "account", "success"].indexOf(step) > i ? "bg-primary/40" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Main content */}
        <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm">
          {step === "search" && (
            <>
              <CardHeader>
                <CardTitle>Find your courses</CardTitle>
                <CardDescription>
                  Search for SWAYAM/NPTEL courses and select the ones you want to track
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search courses by name, instructor, or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Selected courses */}
                {data.selectedCourses.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Selected ({data.selectedCourses.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {data.selectedCourses.map((course) => (
                        <Badge
                          key={course.code}
                          variant="secondary"
                          className="pl-2 pr-1 py-1 gap-1"
                        >
                          {course.title.slice(0, 30)}
                          {course.title.length > 30 && "..."}
                          <button
                            onClick={() => toggleCourse(course)}
                            className="ml-1 p-0.5 rounded hover:bg-muted-foreground/20 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search results */}
                {debouncedQuery.length >= 2 && (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {courses.length === 0 && !isSearching ? (
                      <p className="text-center text-muted-foreground py-8">
                        No courses found. Try a different search term.
                      </p>
                    ) : (
                      courses.map((course) => (
                        <CourseResult
                          key={course.code}
                          course={course}
                          selected={data.selectedCourses.some((c) => c.code === course.code)}
                          onToggle={() => toggleCourse(course)}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* Empty state */}
                {debouncedQuery.length < 2 && data.selectedCourses.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p>Start typing to search for courses</p>
                  </div>
                )}

                {/* Next button */}
                <Button
                  onClick={handleNext}
                  disabled={data.selectedCourses.length === 0}
                  className="w-full"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </>
          )}

          {step === "account" && (
            <>
              <CardHeader>
                <CardTitle>Your notification settings</CardTitle>
                <CardDescription>
                  Enter your details and choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={data.email}
                    onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Name (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={data.name}
                    onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Notification channels */}
                <div className="space-y-3">
                  <Label>Notification channels</Label>
                  {errors.channels && (
                    <p className="text-sm text-destructive">{errors.channels}</p>
                  )}
                  
                  {/* Email channel */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      data.notifyEmail
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                    onClick={() => setData((prev) => ({ ...prev, notifyEmail: !prev.notifyEmail }))}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        data.notifyEmail ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        data.notifyEmail ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50"
                      )}>
                        {data.notifyEmail && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>

                  {/* Telegram channel */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      data.notifyTelegram
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                    onClick={() => setData((prev) => ({ ...prev, notifyTelegram: !prev.notifyTelegram }))}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        data.notifyTelegram ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Telegram</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via Telegram bot</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        data.notifyTelegram ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50"
                      )}>
                        {data.notifyTelegram && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>

                  {/* Telegram ID input */}
                  {data.notifyTelegram && (
                    <div className="space-y-2 pl-13 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="telegramId">Telegram Username/ID</Label>
                      <Input
                        id="telegramId"
                        type="text"
                        placeholder="@username or chat ID"
                        value={data.telegramId}
                        onChange={(e) => setData((prev) => ({ ...prev, telegramId: e.target.value }))}
                        className={errors.telegramId ? "border-destructive" : ""}
                      />
                      {errors.telegramId && (
                        <p className="text-sm text-destructive">{errors.telegramId}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={signupMutation.isPending}
                    className="flex-1"
                  >
                    {signupMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        Subscribe
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Error message */}
                {signupMutation.isError && (
                  <p className="text-sm text-destructive text-center">
                    {signupMutation.error instanceof Error
                      ? signupMutation.error.message
                      : "Something went wrong. Please try again."}
                  </p>
                )}
              </CardContent>
            </>
          )}

          {step === "success" && (
            <CardContent className="py-12">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-chart-1 to-chart-3 flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">You{"'"}re all set!</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    You{"'"}ll receive notifications for {data.selectedCourses.length} course
                    {data.selectedCourses.length > 1 ? "s" : ""} via{" "}
                    {[
                      data.notifyEmail && "email",
                      data.notifyTelegram && "Telegram",
                    ]
                      .filter(Boolean)
                      .join(" and ")}
                    .
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {data.selectedCourses.map((course) => (
                    <Badge key={course.code} variant="secondary">
                      {course.title.slice(0, 25)}
                      {course.title.length > 25 && "..."}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" onClick={handleReset}>
                  Subscribe to more courses
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </section>
  );
}

function CourseResult({
  course,
  selected,
  onToggle,
}: {
  course: Course;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full p-4 rounded-lg border text-left transition-all",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50"
        )}>
          {selected && <Check className="w-3 h-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{course.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {course.instructor} • {course.institute}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Code: {course.code}
          </p>
        </div>
      </div>
    </button>
  );
}
