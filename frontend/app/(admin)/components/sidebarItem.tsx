"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SidebarItem({
  href,
  icon,
  label,
  open,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative",
        isActive
          ? "bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-white border border-sky-500/30 shadow-sm"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
      )}
    >
      {/* Active Left Indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-400 rounded-r-full shadow-sm" />
      )}
      <span className={cn("transition-transform group-hover:scale-110", isActive ? "text-sky-400" : "text-slate-400")}>
        {icon}
      </span>
      {open && <span className="tracking-wide">{label}</span>}
    </Link>
  );
}
