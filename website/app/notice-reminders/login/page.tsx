"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/landing";

const emailSchema = z.string().email("Please enter a valid email");
const codeSchema = z.string().min(6, "Enter the 6-digit code");

type Step = "email" | "code";

export default function LoginPage() {
  const { requestOtp, verifyOtp, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/notice-reminders/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  const isEmailValid = useMemo(() => emailSchema.safeParse(email).success, [email]);
  const isCodeValid = useMemo(() => codeSchema.safeParse(code).success, [code]);

  const handleRequest = async () => {
    setError("");
    setPending(true);
    try {
      await requestOtp(email);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setPending(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setPending(true);
    try {
      await verifyOtp(email, code);
      router.replace("/notice-reminders/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen pt-16 flex flex-col bg-muted/5 dark:bg-background">
      <div className="flex-1 container mx-auto px-6 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-lg border-muted-foreground/10 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Sign in with email</CardTitle>
              <CardDescription>
                {step === "email"
                  ? "We will send a one-time code to your inbox"
                  : "Enter the 6-digit code we just emailed you"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className="pl-10"
                    disabled={step === "code"}
                  />
                </div>
              </div>

              {step === "code" && (
                <div className="space-y-2">
                  <Label htmlFor="auth-code">Verification code</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="auth-code"
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setError("");
                      }}
                      placeholder="123456"
                      className="pl-10 tracking-[0.3em]"
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                {step === "code" ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("email")}
                    disabled={pending}
                  >
                    Edit email
                  </Button>
                ) : null}
                <Button
                  className="flex-1"
                  onClick={step === "email" ? handleRequest : handleVerify}
                  disabled={pending || (step === "email" ? !isEmailValid : !isCodeValid)}
                >
                  {pending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="ml-2">Please wait</span>
                    </>
                  ) : (
                    <>
                      {step === "email" ? "Send code" : "Verify"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  );
}
