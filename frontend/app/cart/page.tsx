// app/cart/page.tsx
"use client";
import RequireRole from "@/components/require-role";
import CartAndCheckout from "./cart-and-checkout";

export default function CartPage() {
  return (
    <RequireRole role="customer" fallback="/auth/user/login">
      <main>
        <CartAndCheckout />
      </main>
    </RequireRole>
  );
}
