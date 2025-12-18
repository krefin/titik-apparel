"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserResponse } from "@/lib/api/users";

type Props = {
  initial?: Partial<UserResponse>;
  isEdit?: boolean;
  onSubmit: (payload: Partial<UserResponse>) => Promise<void>;
  submitLabel: string;
};

export default function UserForm({
  initial = {},
  isEdit = false,
  onSubmit,
  submitLabel,
}: Props) {
  const [form, setForm] = useState<Partial<UserResponse>>({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    password: initial?.password ?? "",
    role: initial?.role ?? "customer",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    postalCode: initial?.postalCode ?? "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = { ...form };

    if (isEdit) {
      // remove email on edit to avoid updating it
      delete payload.email;
    }

    setLoading(true);
    try {
      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={isEdit}
          required={!isEdit}
          className={isEdit ? "bg-gray-100 cursor-not-allowed" : ""}
        />

        {isEdit && (
          <p className="text-xs text-gray-500">
            Email digunakan sebagai akun login dan tidak dapat diubah
          </p>
        )}
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>

        <Input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
        />

        <Input
          name="postalCode"
          placeholder="Postal Code"
          value={form.postalCode}
          onChange={handleChange}
        />

        <Input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="md:col-span-2"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
