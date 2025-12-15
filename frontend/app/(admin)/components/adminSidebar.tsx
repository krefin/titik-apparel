"use client";

import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react";
import SidebarItem from "./sidebarItem";

export default function AdminSidebar({ open }: { open: boolean }) {
  return (
    <aside
      className={`
        bg-black text-white h-screen transition-all duration-300
        ${open ? "w-64" : "w-16"}
        hidden md:flex flex-col
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <span className="font-bold tracking-wide">
          {open ? "TITIK ADMIN" : "TA"}
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 space-y-1">
        <SidebarItem
          open={open}
          href="/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
        />
        <SidebarItem
          open={open}
          href="/dashboard/products"
          icon={<Package size={18} />}
          label="Products"
        />
        <SidebarItem
          open={open}
          href="/dashboard/orders"
          icon={<ShoppingCart size={18} />}
          label="Orders"
        />
        <SidebarItem
          open={open}
          href="/dashboard/users"
          icon={<Users size={18} />}
          label="Users"
        />
      </nav>
    </aside>
  );
}
