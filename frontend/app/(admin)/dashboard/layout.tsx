"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
  Users,
  Store,
  ShieldCheck,
} from "lucide-react";
import AdminSidebar from "../components/adminSidebar";
import AdminTopbar from "../components/adminTopBar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import RequireRole from "@/components/require-role";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/products", label: "Produk", icon: <Package size={18} /> },
  { href: "/dashboard/orders", label: "Pesanan", icon: <ShoppingCart size={18} /> },
  { href: "/dashboard/users", label: "Pengguna", icon: <Users size={18} /> },
];

function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] bg-slate-950 text-white border-r border-slate-800 p-0">
        <SheetHeader className="p-4 border-b border-slate-800 text-left">
          <SheetTitle className="text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
              T
            </div>
            <span className="font-extrabold tracking-wide">TITIK ADMIN</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="p-4 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors",
                  active ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "text-slate-400"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800 mt-2">
            <Link
              href="/"
              target="_blank"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              <Store size={18} />
              Lihat Toko Publik
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <RequireRole role="admin">
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {/* Sidebar */}
        <AdminSidebar open={sidebarOpen} />

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <AdminTopbar
            sidebarOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            mobileNav={<MobileNav />}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
