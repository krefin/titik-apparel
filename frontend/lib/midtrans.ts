export async function loadMidtransSnap(
  clientKey: string,
  isProduction = false
) {
  if (!clientKey) throw new Error("Missing Midtrans clientKey");

  const attr = `midtrans-snap-${process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}`;
  if (document.querySelector(`script[data-midtrans="${attr}"]`)) return;

  return new Promise<void>((resolve, reject) => {
    const src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.setAttribute("data-midtrans", attr);
    s.setAttribute("data-client-key", clientKey);
    s.onload = () => resolve();
    s.onerror = (e) => reject(new Error("Failed to load Midtrans Snap"));
    document.body.appendChild(s);
  });
}
