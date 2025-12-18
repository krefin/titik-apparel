import api from "@/lib/axios";

export type UserResponse = {
  id: number;
  email: string;
  name: string;
  password: string;
  address: string;
  city: string;
  postalCode: string;
  role: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getUsersApi(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const res = await api.get("/api/users", { params });
  return res.data; // { data: UserResponse[], total: number }
}

export async function createUserApi(payload: Partial<UserResponse>) {
  const res = await api.post("/api/auth/register", payload);
  return res.data;
}

export async function updateUserApi(
  userId: number | string,
  payload: Partial<UserResponse>
) {
  const res = await api.put(`/api/users/${userId}`, payload);
  return res.data;
}

export async function deleteUserApi(userId: number | string) {
  const res = await api.delete(`/api/users/${userId}`);
  return res.data;
}
