"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { getCart } from "@/lib/api/cart";
import { useSocketContext } from "@/app/providers/SocketProvider";

export default function CartBadge() {
  const [count, setCount] = useState(0);
  const { cartUpdateTick } = useSocketContext();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await getCart();
        if (!mounted) return;
        setCount(data.length);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [cartUpdateTick]);

  return (
    <Link
      href="/cart"
      className="relative text-slate-700 hover:text-blue-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
      aria-label="View Cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white shadow-md animate-in zoom-in duration-200">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
