// app/profile/security/page.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RequireRole from "@/components/require-role";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setErr("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/api/auth/password", {
        currentPassword,
        newPassword,
      });
      if (!res.data?.success) {
        throw new Error(res.data?.message ?? "Gagal mengubah password");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(res.data?.message ?? "Password berhasil diubah.");
    } catch (error: unknown) {
      setErr(getErrorMessage(error, "Gagal mengubah password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ubah Kata Sandi</CardTitle>
          <CardDescription>
            Masukkan kata sandi saat ini dan kata sandi baru Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="currentPassword">
                  Kata sandi saat ini
                </FieldLabel>
                <Input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="newPassword">Kata sandi baru</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Konfirmasi kata sandi baru
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
                </Button>

                {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
                {success && (
                  <p className="text-sm text-green-600 mt-2">{success}</p>
                )}

                <FieldDescription>
                  <Link
                    href="/profile"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Kembali ke profil
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <RequireRole role="customer">
      <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <section className="container mx-auto px-6 py-12">
          <ChangePasswordForm />
        </section>
      </main>
    </RequireRole>
  );
}
