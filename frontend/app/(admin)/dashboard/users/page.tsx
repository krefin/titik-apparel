"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUsersApi, deleteUserApi, type UserResponse } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";

const LIMIT = 8;
const DEBOUNCE_MS = 400;

function formatDate(dt?: string) {
  if (!dt) return "-";
  try {
    return format(new Date(dt), "dd MMM yyyy", { locale: idLocale });
  } catch {
    return dt;
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, total } = await getUsersApi({
        page,
        limit: LIMIT,
        search: debouncedSearch,
      });

      setUsers(data);
      setTotal(total);
    } catch (err) {
      console.error("fetch users error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  async function handleDelete(id: number, name: string) {
    const ok = confirm(`Hapus pengguna "${name}"?`);
    if (!ok) return;

    try {
      await deleteUserApi(id);
      fetchUsers();
    } catch (err) {
      alert("Gagal menghapus pengguna.");
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Kelola Pengguna
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar pengguna terdaftar dan manajemen hak akses admin.
            </p>
          </div>
        </div>

        <Link href="/dashboard/users/create">
          <Button className="rounded-xl text-xs font-bold gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-md">
            <Plus className="w-4 h-4" /> Tambah User
          </Button>
        </Link>
      </div>

      {/* Toolbar: Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nama / email / role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total: <span className="text-slate-900 dark:text-white font-extrabold">{total} User</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Pengguna</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Tanggal Didaftarkan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    Memuat daftar pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isAdmin = (u.role || "").toLowerCase() === "admin";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isAdmin
                              ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}>
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>

                      {/* Role Pill */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                            isAdmin
                              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                              : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                          }`}
                        >
                          {isAdmin ? <ShieldCheck className="w-3 h-3 text-sky-500" /> : <UserIcon className="w-3 h-3" />}
                          {u.role ? u.role.toUpperCase() : "CUSTOMER"}
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="p-4 text-slate-500 font-medium">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/dashboard/users/${u.id}/edit`}>
                            <Button size="sm" variant="outline" className="text-xs font-bold gap-1 rounded-xl">
                              <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(u.id, u.name)}
                            className="text-xs font-bold gap-1 rounded-xl bg-rose-600 hover:bg-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500 font-medium">
            Halaman <span className="font-bold text-slate-900 dark:text-white">{page}</span> dari{" "}
            <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl text-xs font-bold gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl text-xs font-bold gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
