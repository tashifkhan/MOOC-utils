"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthStatus, OtpRequestResponse, User } from "@/lib/types";
import { getMe, logout, refreshSession, requestOtp, verifyOtp } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  requestOtp: (email: string) => Promise<OtpRequestResponse>;
  verifyOtp: (email: string, code: string) => Promise<AuthStatus>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadSession = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleRequestOtp = useCallback(async (email: string) => {
    return requestOtp(email);
  }, []);

  const handleVerifyOtp = useCallback(async (email: string, code: string) => {
    const status = await verifyOtp(email, code);
    setUser(status.user);
    return status;
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    router.push("/notice-reminders");
  }, [router]);

  const handleRefresh = useCallback(async () => {
    try {
      const status = await refreshSession();
      setUser(status.user);
    } catch {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      requestOtp: handleRequestOtp,
      verifyOtp: handleVerifyOtp,
      logout: handleLogout,
      refresh: handleRefresh,
      setUser,
    }),
    [
      user,
      isLoading,
      handleRequestOtp,
      handleVerifyOtp,
      handleLogout,
      handleRefresh,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
