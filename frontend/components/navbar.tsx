"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menus = [
    { name: "Home", href: "/" },
    { name: "Produk", href: "/produk" },
    { name: "Tentang", href: "/tentang" },
    { name: "Kontak", href: "/kontak" },
  ];

  return (
    <nav className="px-8 flex items-center justify-between p-4 shadow-sm border-b bg-white sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-gray-800">
        Titik<span className="text-blue-600">Apparel</span>
      </Link>

      {/* Menu untuk desktop */}
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

      {/* Tombol login contoh */}
      <div className="hidden md:block">
        <Button variant="default">Login</Button>
      </div>

      {/* Menu mobile (Sheet Drawer) */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px]">
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
              <Button className="mt-4">Login</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
