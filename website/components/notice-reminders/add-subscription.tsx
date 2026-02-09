"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { searchCourses, createSubscription } from "@/lib/api";
import type { User, Course } from "@/lib/types";
import { toast } from "sonner";

interface AddSubscriptionProps {
  user: User;
}

export function AddSubscription({ user }: AddSubscriptionProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const queryClient = useQueryClient();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Course search query
  const { data: courses = [], isLoading: isSearching } = useQuery({
    queryKey: ["courses", debouncedQuery],
    queryFn: () => searchCourses(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && open,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (courseCode: string) => {
      return createSubscription({
        user_id: user.id,
        course_code: courseCode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", user.id] });
      toast.success(`Subscribed to ${selectedCourse?.title}`);
      setOpen(false);
      resetState();
    },
    onError: (error) => {
        toast.error("Failed to subscribe. You might already be subscribed.");
        console.error(error);
    }
  });

  const resetState = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedCourse(null);
  };

  const handleSubscribe = () => {
    if (selectedCourse) {
      subscribeMutation.mutate(selectedCourse.code);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetState();
    }}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subscribe to a new course</DialogTitle>
          <DialogDescription>
            Search for a course to add to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {selectedCourse ? (
            <div className="p-3 rounded-lg border bg-primary/5 border-primary">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="font-medium text-sm">{selectedCourse.title}</p>
                        <p className="text-xs text-muted-foreground">{selectedCourse.code}</p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 -mr-2 -mt-2"
                        onClick={() => setSelectedCourse(null)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {debouncedQuery.length >= 2 && courses.length === 0 && !isSearching && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No courses found.
                </p>
              )}
              {courses.map((course) => (
                <button
                  key={course.code}
                  onClick={() => setSelectedCourse(course)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-start gap-3 border border-transparent hover:border-border"
                >
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                            {course.instructor} • {course.code}
                        </p>
                    </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubscribe} disabled={!selectedCourse || subscribeMutation.isPending}>
            {subscribeMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Subscribe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
