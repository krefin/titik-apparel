"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

type User = {
  id: number | string;
  name?: string;
  email?: string;
  role?: "admin" | "customer" | string | null;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await api.get("/api/auth/me");
        if (!mounted) return;
        if (me.data?.success) setUser(me.data.data as User);
      } catch {
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // login: post login, then fetch /me and set user. Returns user for caller.
  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    // will throw if network/server error -> handle in caller
    const res = await api.post("/api/auth/login", { email, password });
    if (!res.data?.success) {
      throw new Error(res.data?.message ?? "Login failed");
    }

    // get profile (cookie httpOnly used)
    const me = await api.get("/api/auth/me");
    if (!me.data?.success) {
      // If /me fails, ensure we clear state and inform caller
      setUser(null);
      throw new Error(me.data?.message ?? "Failed to fetch profile");
    }

    setUser(me.data.data as User);
    return me.data.data as User;
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* ignore */
    }
    setUser(null);
    router.push("/auth/user/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
