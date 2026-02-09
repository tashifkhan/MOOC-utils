"use client";

import Link from "next/link";
import { Bell, Puzzle, ArrowRight, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProductShowcase() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Tool</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the tool that fits your current needs. Both are free and open source.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Notice Reminders Card */}
          <Card className="relative overflow-hidden border-chart-1/20 hover:border-chart-1/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chart-1 to-chart-3" />
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center mb-4 text-chart-1">
                <Bell className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">Notice Reminders</CardTitle>
              <CardDescription>
                Stay updated with your Swayam/NPTEL courses without checking the portal daily.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {[
                  "Email notifications for announcements",
                  "Deadline reminders",
                  "Assignment updates",
                  "Exam alerts"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-chart-1" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link 
                href="/notice-reminders" 
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </CardFooter>
          </Card>

          {/* Assignment Solver Card */}
          <Card className="relative overflow-hidden border-chart-4/20 hover:border-chart-4/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chart-4 to-chart-5" />
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4 text-chart-4">
                  <Puzzle className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 hover:bg-chart-4/20">
                  Browser Extension
                </Badge>
              </div>
              <CardTitle className="text-2xl">Assignment Solver</CardTitle>
              <CardDescription>
                AI-powered assistance directly in your browser while you solve assignments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {[
                  "Instant AI hints",
                  "Concept explanations",
                  "Similar problem examples",
                  "Direct integration with course pages"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-chart-4" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link 
                href="/assignment-solver"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }), 
                  "w-full border-chart-4/20 hover:bg-chart-4/10 hover:text-chart-4"
                )}
              >
                View Extension
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
