// components/register-form.tsx
"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/errors";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    telephone: "",
    city: "",
    postalCode: "",
    address: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", form);
      if (!res.data?.success) {
        throw new Error(res.data?.message ?? "Registration failed");
      }
      router.push("/auth/user/login");
    } catch (error: unknown) {
      setErr(getErrorMessage(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={update("name")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={form.email}
                  onChange={update("email")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={update("password")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="telephone">Telephone</FieldLabel>
                <Input
                  id="telephone"
                  placeholder="08xxxxxxxxxx"
                  value={form.telephone}
                  onChange={update("telephone")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={form.address}
                  onChange={update("address")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  placeholder="City"
                  value={form.city}
                  onChange={update("city")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="postalCode">Postal code</FieldLabel>
                <Input
                  id="postalCode"
                  placeholder="12345"
                  value={form.postalCode}
                  onChange={update("postalCode")}
                />
              </Field>

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>

                {err && <p className="text-sm text-red-600 mt-2">{err}</p>}

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link
                    href="/auth/user/login"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Login
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
