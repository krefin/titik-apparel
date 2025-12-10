"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  avatarUrl?: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // local form state
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Helper to normalize API responses: support { data: {...} } or raw object
  const normalizePayload = (resData: any) => {
    if (resData == null) return null;
    // If wrapper like { success: true, data: { ... } }
    if (
      typeof resData === "object" &&
      "data" in resData &&
      resData.data != null
    ) {
      return resData.data;
    }
    // otherwise assume resData itself is the user object
    return resData;
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("/api/auth/me", { withCredentials: true });

        // If API returns wrapper { success: false, message: "..." }
        if (res.data?.success === false && res.data?.message) {
          throw new Error(res.data.message);
        }

        const userData = normalizePayload(res.data);
        if (!userData) throw new Error("Data profil kosong.");

        if (!mounted) return;

        setUser(userData);
        setForm({
          name: userData?.name ?? "",
          email: userData?.email ?? "",
          phone: userData?.phone ?? "",
          address: userData?.address ?? "",
          city: userData?.city ?? "",
          postalCode: userData?.postalCode ?? "",
        });
        setAvatarPreview(userData?.avatarUrl ?? null);
      } catch (err: any) {
        console.error("Failed to load profile:", err);

        // If unauthorized, redirect to login (adjust path if needed)
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          router.push("/login");
          return;
        }

        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Terjadi kesalahan saat memuat profil."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Manage avatar preview object URL
  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => {
      URL.revokeObjectURL(url);
      // keep existing preview if set from server until user changes
    };
  }, [avatarFile]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      // optional: validate file size/type here
      setAvatarFile(f);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.email) {
      setError("Nama dan email wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      // Upload avatar if changed
      let avatarUrl = user?.avatarUrl ?? null;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const up = await axios.post("/api/auth/upload-avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

        // Normalize upload response (support { data: { url } } or { url })
        const upData = normalizePayload(up.data) ?? up.data;
        avatarUrl =
          upData?.url ?? upData?.avatarUrl ?? upData?.path ?? avatarUrl;
      }

      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode,
        avatarUrl,
      };

      const res = await axios.put("/api/auth/me", payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data?.success === false && res.data?.message) {
        throw new Error(res.data.message);
      }

      const updated = normalizePayload(res.data) ?? res.data;
      setUser(updated);
      setForm({
        name: updated?.name ?? form.name,
        email: updated?.email ?? form.email,
        phone: updated?.phone ?? form.phone,
        address: updated?.address ?? form.address,
        city: updated?.city ?? form.city,
        postalCode: updated?.postalCode ?? form.postalCode,
      });
      setAvatarFile(null);
      setAvatarPreview(updated?.avatarUrl ?? avatarUrl ?? null);
      setSuccess("Perubahan tersimpan.");
    } catch (err: any) {
      console.error("Save profile failed:", err);

      const status = err?.response?.status;
      if (status === 401) {
        router.push("/login");
        return;
      }

      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Terjadi kesalahan saat menyimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">Memuat profil...</div>
      </main>
    );
  }

  // Safe initial letter: use (user?.name ?? "U").charAt(0)
  const initial = (user?.name ?? "U").charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm p-8">
          <header className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-xl text-slate-500">
                  {initial}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-semibold">{user?.name ?? "-"}</h1>
              <p className="text-sm text-slate-500">{user?.email ?? "-"}</p>
            </div>

            <div className="ml-auto">
              <Link
                href="/orders"
                className="inline-flex items-center px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700"
              >
                Lihat Pesanan
              </Link>
            </div>
          </header>

          <form
            onSubmit={handleSave}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-1 flex flex-col gap-4">
              <label className="text-sm font-medium">Avatar</label>
              <input type="file" accept="image/*" onChange={handleAvatar} />

              <p className="text-sm text-slate-500">
                Format JPG/PNG. Maks 2MB.
              </p>

              <div className="pt-4">
                <Link
                  href="/profile/security"
                  className="text-sm text-sky-600 hover:underline"
                >
                  Ubah kata sandi
                </Link>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Nama
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name ?? ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    value={form.email ?? ""}
                    readOnly
                    className="mt-1 block w-full rounded-md border border-slate-100 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-500"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Telepon
                  </label>
                  <input
                    name="phone"
                    value={form.phone ?? ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Kota
                  </label>
                  <input
                    name="city"
                    value={form.city ?? ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Kode Pos
                  </label>
                  <input
                    name="postalCode"
                    value={form.postalCode ?? ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={form.address ?? ""}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              {error && (
                <div className="mt-4 text-sm text-red-600">{error}</div>
              )}
              {success && (
                <div className="mt-4 text-sm text-green-600">{success}</div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // reset to last saved
                    setForm({
                      name: user?.name,
                      email: user?.email,
                      phone: user?.phone,
                      address: user?.address,
                      city: user?.city,
                      postalCode: user?.postalCode,
                    });
                    setAvatarFile(null);
                    setAvatarPreview(user?.avatarUrl ?? null);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
