"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { getUserByEmail } from "@/lib/api";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight, Search, KeyRound } from "lucide-react";
import Link from "next/link";

const emailSchema = z.string().email("Please enter a valid email address");

interface UserLookupProps {
  onUserFound: (user: User) => void;
}

export function UserLookup({ onUserFound }: UserLookupProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const lookupMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const result = emailSchema.safeParse(emailAddress);
      if (!result.success) {
        throw new Error(result.error.issues[0].message);
      }
      const user = await getUserByEmail(emailAddress);
      if (!user) {
        throw new Error(
          "No account found with this email. Subscribe to a course first!"
        );
      }
      return user;
    },
    onSuccess: (user) => {
      onUserFound(user);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Something went wrong");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    lookupMutation.mutate(email);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center mx-auto mb-5">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access your dashboard</h2>
        <p className="text-muted-foreground">
          Enter the email you used when subscribing to courses
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lookup-email">Email address</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="lookup-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              className={cn("pl-10", error ? "border-destructive" : "")}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={lookupMutation.isPending || !email}
          className="w-full"
        >
          {lookupMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="ml-2">Looking up...</span>
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Don{"'"}t have an account?{" "}
        <Link href="/#signup" className="text-primary hover:underline">
          Subscribe to a course
        </Link>{" "}
        first.
      </p>
    </div>
  );
}
