// components/LogoutButton.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LogoutButton() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handle} disabled={loading}>
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}
