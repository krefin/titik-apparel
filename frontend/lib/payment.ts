import api from "@/lib/axios";
import { getPaymentToken } from "@/lib/api/cart";
import { loadMidtransSnap } from "@/lib/midtrans";
import { getErrorMessage } from "@/lib/errors";

type MidtransResult = {
  transaction_status?: string;
  gross_amount?: string | number;
  [key: string]: unknown;
};

export async function processOrderPayment(
  orderId: number | string,
  onComplete?: () => void
) {
  try {
    const tokenRes = await getPaymentToken(orderId);
    const tokenData = tokenRes?.data ? tokenRes.data : tokenRes;
    const snapToken = tokenData?.token ?? tokenData?.data?.token ?? null;
    const clientKey =
      tokenData?.clientKey ??
      tokenData?.data?.clientKey ??
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??
      null;

    if (!snapToken) {
      alert("Tidak bisa membuat token pembayaran. Hubungi admin.");
      return;
    }
    if (!clientKey) {
      alert("Konfigurasi pembayaran tidak lengkap. Hubungi admin.");
      return;
    }

    await loadMidtransSnap(clientKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snap = (window as any).snap;
    if (!snap || !snap.pay) {
      alert("Gagal memuat modul pembayaran. Coba lagi nanti.");
      return;
    }

    snap.pay(snapToken, {
      onSuccess: (result: MidtransResult) => {
        try {
          void api.post("/api/payment/notification", {
            order_id: String(orderId),
            transaction_status: result.transaction_status ?? "settlement",
            gross_amount: result.gross_amount,
            raw: result,
          });
        } catch {
          /* webhook akan update via Midtrans */
        }
        alert("Pembayaran berhasil. Terima kasih!");
        if (onComplete) onComplete();
        else window.location.reload();
      },
      onPending: (result: MidtransResult) => {
        try {
          void api.post("/api/payment/notification", {
            order_id: String(orderId),
            transaction_status: result.transaction_status ?? "pending",
            gross_amount: result.gross_amount,
            raw: result,
          });
        } catch {
          /* ignore */
        }
        alert("Pembayaran menunggu konfirmasi.");
        if (onComplete) onComplete();
        else window.location.reload();
      },
      onError: (result: MidtransResult) => {
        console.error("MIDTRANS snap.onError:", result);
        alert("Pembayaran gagal. Cek console untuk detail.");
      },
      onClose: () => {
        alert("Pembayaran belum selesai.");
      },
    });
  } catch (err: unknown) {
    console.error("processOrderPayment error:", err);
    alert(getErrorMessage(err, "Gagal memproses pembayaran. Coba lagi."));
  }
}
