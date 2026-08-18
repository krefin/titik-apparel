"use client";

import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Store, ShieldCheck } from "lucide-react";
import SidebarItem from "./sidebarItem";
import { useAuth } from "@/app/providers/AuthProvider";

export default function AdminSidebar({ open }: { open: boolean }) {
  const { user } = useAuth();

  return (
    <aside
      className={`
        bg-slate-950 text-white h-screen sticky top-0 transition-all duration-300
        ${open ? "w-64" : "w-20"}
        hidden md:flex flex-col border-r border-slate-800/80 shadow-2xl z-30
      `}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md shrink-0">
          T
        </div>
        {open && (
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent truncate">
              TITIK APPAREL
            </span>
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin Portal
            </span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-none">
        <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
          {open ? "Menu Utama" : "•••"}
        </div>
        <SidebarItem
          open={open}
          href="/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Overview"
        />
        <SidebarItem
          open={open}
          href="/dashboard/products"
          icon={<Package size={18} />}
          label="Produk"
        />
        <SidebarItem
          open={open}
          href="/dashboard/orders"
          icon={<ShoppingCart size={18} />}
          label="Pesanan"
        />
        <SidebarItem
          open={open}
          href="/dashboard/users"
          icon={<Users size={18} />}
          label="Pengguna"
        />

        <div className="pt-4 px-2 py-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
          {open ? "Toko & Client" : "•••"}
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors group"
        >
          <Store className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          {open && <span>Lihat Toko Publik</span>}
        </Link>
      </nav>

      {/* Admin User Footer Snippet */}
      {open && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-200 truncate">
                {user?.name ?? "Administrator"}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email ?? "admin@titikapparel.com"}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
