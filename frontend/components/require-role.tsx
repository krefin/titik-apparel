// components/RequireRole.tsx
"use client";
import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

type Props = {
  children: ReactNode;
  role: "admin" | "customer";
  fallback?: string; // path to redirect if unauthorized
};

export default function RequireRole({ children, role, fallback }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/user/login");
      } else if (user.role !== role) {
        router.replace(fallback ?? "/"); // redirect to fallback or home
      }
    }
  }, [loading, user, role, router, fallback]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  if (user.role !== role) return null;

  return <>{children}</>;
}
