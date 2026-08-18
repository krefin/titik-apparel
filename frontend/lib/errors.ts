type ApiError = {
  response?: { status?: number; data?: { message?: string } };
  message?: string;
};

export function getErrorMessage(err: unknown, fallback = "Terjadi kesalahan"): string {
  if (err && typeof err === "object") {
    const apiErr = err as ApiError;
    if (apiErr.response?.data?.message) return apiErr.response.data.message;
    if (err instanceof Error && err.message) return err.message;
  }
  if (typeof err === "string") return err;
  return fallback;
}

export function getErrorStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "response" in err) {
    return (err as ApiError).response?.status;
  }
  return undefined;
}
