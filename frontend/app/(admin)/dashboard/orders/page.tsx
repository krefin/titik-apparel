"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllOrdersApi, type Order } from "@/lib/api/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LIMIT = 7;
const DEBOUNCE_MS = 400;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const totalPages = Math.ceil(total / LIMIT);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, total } = await getAllOrdersApi({
        page,
        limit: LIMIT,
        search: debouncedSearch, // 🔥 kirim search
      });

      setOrders(data);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 DEBOUNCE SEARCH (IDENTIK DENGAN PRODUCTS)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1); // reset ke page 1 saat search berubah
      setDebouncedSearch(search.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [search]);

  // 🔥 FETCH SAAT PAGE / SEARCH BERUBAH
  useEffect(() => {
    fetchOrders();
  }, [page, debouncedSearch]);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
      </div>

      {/* SEARCH */}
      <div className="flex max-w-sm">
        <Input
          placeholder="Search order (ID / User ID / Status)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 border-b">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">User ID</th>
              <th className="p-3 text-left">Total Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Detail</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-neutral-50">
                {/* ORDER ID */}
                <td className="p-3 font-medium">#{order.id}</td>

                {/* USER ID */}
                <td className="p-3">{order.userId}</td>

                {/* TOTAL PRICE */}
                <td className="p-3">
                  Rp {order.totalPrice.toLocaleString("id-ID")}
                </td>

                {/* STATUS */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      order.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                {/* DETAIL */}
                <td className="p-3 text-right">
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Button size="sm" variant="outline">
                      Detail
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
