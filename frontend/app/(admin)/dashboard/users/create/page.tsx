"use client";

import { useRouter } from "next/navigation";
import UserForm from "@/app/(admin)/dashboard/users/_components/userForm";
import { createUserApi } from "@/lib/api/users";

export default function CreateUserPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Add User</h1>

      <UserForm
        submitLabel="Create User"
        onSubmit={async (payload) => {
          await createUserApi(payload); // EMAIL ADA
          router.push("/dashboard/users");
        }}
      />
    </div>
  );
}
