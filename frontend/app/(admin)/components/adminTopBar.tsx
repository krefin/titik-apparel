"use client";

import { Menu, ExternalLink, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthProvider";
import LogoutButton from "@/components/logout-button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminTopbar({
  sidebarOpen,
  toggleSidebar,
  mobileNav,
}: {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mobileNav?: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-2xs">
      <div className="flex items-center gap-3">
        {mobileNav}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:inline-flex text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
            Dashboard Admin
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* View Storefront Quick Button */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span>Ke Toko</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* User Badge & Profile */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline">
              {user?.name ?? "Admin"}
            </span>
          </Link>

          {user ? (
            <LogoutButton />
          ) : (
            <Button
              size="sm"
              onClick={() => router.push("/auth/user/login")}
              className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
