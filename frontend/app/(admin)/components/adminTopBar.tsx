"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthProvider";
import LogoutButton from "@/components/logout-button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminTopbar({
  sidebarOpen,
  toggleSidebar,
}: {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogin = () => {
    router.push("/auth/user/login");
  };
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:inline-flex"
        >
          <Menu />
        </Button>

        <span className="font-semibold tracking-wide">Dashboard Admin</span>
      </div>

      <div className="flex items-center gap-5">
        <Link href="/profile" className="text-sm text-gray-700">
          {user?.name ?? "Admin"}
        </Link>
        {user ? (
          <>
            <LogoutButton />
          </>
        ) : (
          <>
            <Button
              className="mt-4"
              onClick={() => {
                handleLogin();
              }}
            >
              Login
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
