// components/navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import LogoutButton from "./logout-button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const menus = [
    { name: "Home", href: "/" },
    { name: "Produk", href: "/products" },
    { name: "Tentang", href: "/tentang" },
    { name: "Kontak", href: "/kontak" },
  ];

  const handleLogin = () => {
    router.push("/auth/user/login");
  };

  return (
    <nav className="px-8 flex items-center justify-between p-4 shadow-sm border-b bg-white sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-gray-800">
        Titik<span className="text-blue-600">Apparel</span>
      </Link>

      <div className="hidden md:flex gap-6">
        {menus.map((menu) => (
          <Link
            key={menu.name}
            href={menu.href}
            className="text-gray-600 hover:text-blue-600 transition-color"
          >
            {menu.name}
          </Link>
        ))}
      </div>

      <div className="hidden md:block">
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/cart" className="text-gray-700 text-lg">
              <ShoppingCart />
            </Link>
            <span className="text-sm text-gray-700">
              {user.name ?? user.email}
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/cart" className="text-gray-700 text-lg">
              <ShoppingCart />
            </Link>
            <Button variant="default" onClick={handleLogin}>
              Login
            </Button>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </SheetTrigger>

          {/* <-- tambahkan header/title di sini */}
          <SheetContent side="right" className="w-[250px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4 mt-8 mx-3">
              {menus.map((menu) => (
                <Link
                  key={menu.name}
                  href={menu.href}
                  className="text-gray-700 text-lg"
                  onClick={() => setOpen(false)}
                >
                  {menu.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href="/cart" className="text-gray-700 text-lg">
                    <ShoppingCart />
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/cart" className="text-gray-700 text-lg">
                    <ShoppingCart />
                  </Link>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setOpen(false);
                      handleLogin();
                    }}
                  >
                    Login
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
