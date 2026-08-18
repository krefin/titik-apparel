"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, X, User, ShoppingBag, LogOut, KeyRound, ChevronDown } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import LogoutButton from "./logout-button";
import CartBadge from "./cart-badge";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // JIKA ADMIN, SEMBUNYIKAN NAVBAR CUSTOMER
  if (user?.role === "admin") {
    return null;
  }

  const menus = [
    { name: "Beranda", href: "/" },
    { name: "Produk", href: "/products" },
    { name: "Tentang", href: "/tentang" },
    { name: "Kontak", href: "/kontak" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
          Titik<span className="text-blue-600">Apparel</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
          {menus.map((menu) => {
            const isActive =
              pathname === menu.href ||
              (menu.href !== "/" && pathname.startsWith(menu.href));

            return (
              <Link
                key={menu.name}
                href={menu.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {menu.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <CartBadge />

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800 text-xs font-medium focus:outline-none"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {(user.name ?? user.email ?? "U")[0]}
                </div>
                <span className="max-w-[120px] truncate">{user.name ?? user.email}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Custom Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] text-slate-400 font-normal">Login sebagai</p>
                    <p className="text-xs text-slate-900 font-bold truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      router.push("/profile");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" /> Profil Saya
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      router.push("/orders");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-500" /> Pesanan Saya
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      router.push("/profile/security");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Ubah Kata Sandi
                  </button>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                        router.push("/auth/user/login");
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => router.push("/auth/user/login")}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 text-xs font-semibold shadow-md"
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile Navigation Sheet */}
        <div className="flex md:hidden items-center gap-3">
          <CartBadge />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[280px] p-6 bg-white">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-bold">
                  Titik<span className="text-blue-600">Apparel</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2 mt-8">
                {menus.map((menu) => {
                  const isActive = pathname === menu.href;
                  return (
                    <Link
                      key={menu.name}
                      href={menu.href}
                      onClick={() => setOpen(false)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {menu.name}
                    </Link>
                  );
                })}

                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl"
                      >
                        Profil Saya
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl"
                      >
                        Pesanan Saya
                      </Link>
                      <div className="pt-2">
                        <LogoutButton />
                      </div>
                    </>
                  ) : (
                    <Button
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                      onClick={() => {
                        setOpen(false);
                        router.push("/auth/user/login");
                      }}
                    >
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
