import api from "../axios";

export type userResponse = {
  id: number;
  email: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  role: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export async function updateUserApi(
  userId: number | string,
  payload: Partial<userResponse>
) {
  try {
    const res = await api.put(`/api/users/${userId}`, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
}
