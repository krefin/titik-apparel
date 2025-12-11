import api from "../axios";

export type ImageUploadResponse = {
  id: number;
  url: string;
  path: string;
  createdAt: string;
  updatedAt: string;
};

export async function uploadImageApi(
  file: File,
  userId: string
): Promise<ImageUploadResponse> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", userId); // kirim userId
    const res = await api.post("/api/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
}
