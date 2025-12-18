"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import UserForm from "@/app/(admin)/dashboard/users/_components/userForm";
import api from "@/lib/axios";
import type { UserResponse } from "@/lib/api/users";
import { updateUserApi } from "@/lib/api/users";

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    (async () => {
      const res = await api.get(`/api/users/${id}`);
      setUser(res.data.data);
    })();
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Edit User</h1>

      <UserForm
        initial={user}
        isEdit
        submitLabel="Update User"
        onSubmit={async (payload) => {
          await updateUserApi(user.id, payload); // EMAIL TIDAK ADA
          router.push("/dashboard/users");
        }}
      />
    </div>
  );
}
