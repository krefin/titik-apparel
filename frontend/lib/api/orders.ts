// helper: panggil endpoint PUT /api/orders/:id/status
async function updateOrderStatusApi(orderId: number | string, status: string) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      credentials: "include", // pastikan BE pakai cookie/session, atau gunakan Authorization header
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} - ${text}`);
    }
    const payload = await res.json();
    return payload?.data ?? payload ?? null;
  } catch (err) {
    console.error("updateOrderStatusApi error:", err);
    throw err;
  }
}
