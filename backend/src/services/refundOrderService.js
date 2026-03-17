import DanaPkg from "dana-node";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const Dana = DanaPkg.default || DanaPkg;

function generateRefundTime() {
  const now = new Date();

  const jakarta = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );

  const yyyy = jakarta.getFullYear();
  const mm = String(jakarta.getMonth() + 1).padStart(2, "0");
  const dd = String(jakarta.getDate()).padStart(2, "0");

  const hh = String(jakarta.getHours()).padStart(2, "0");
  const mi = String(jakarta.getMinutes()).padStart(2, "0");
  const ss = String(jakarta.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+07:00`;
}

class RefundOrderService {

  constructor() {
    this.dana = new Dana({
      partnerId: process.env.X_PARTNER_ID,
      privateKey: process.env.PRIVATE_KEY,
      origin: process.env.ORIGIN,
      env: process.env.DANA_ENV || "sandbox"
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async refundOrder(partnerReferenceNo, originalReferenceNo, amount) {

    if (!partnerReferenceNo) {
      throw new Error("partnerReferenceNo is required");
    }

    if (!originalReferenceNo) {
      throw new Error("originalReferenceNo is required");
    }

    if (!amount) {
      throw new Error("amount is required");
    }

    const refundAmount = Number(amount).toFixed(2);

    const request = {

      merchantId: process.env.MERCHANT_ID,

      originalPartnerReferenceNo: partnerReferenceNo,

      originalReferenceNo: originalReferenceNo,

      partnerRefundNo: uuidv4(),

      refundAmount: {
        value: refundAmount,
        currency: "IDR"
      },

      externalStoreId: process.env.EXTERNAL_SHOP_ID,

      reason: "Customer refund",

      additionalInfo: {

        refundAppliedTime: generateRefundTime(),

        actorType: "MERCHANT",

        asyncRefund: "false",

        refundOptionBill: [
          {
            payMethod: "BALANCE",
            transAmount: {
              value: refundAmount,
              currency: "IDR"
            }
          }
        ]

      }
    };

    console.log("===== REFUND ORDER REQUEST =====");
    console.log(JSON.stringify(request, null, 2));

    try {

      console.log("Waiting settlement (15s)...");
      await this.delay(15000);

      const response = await this.dana.paymentGatewayApi.refundOrder(request);

      console.log("===== REFUND ORDER RESPONSE =====");
      console.log(JSON.stringify(response, null, 2));

      return response;

    } catch (err) {

      const error = err.rawResponse || err;

      console.error("===== REFUND ORDER ERROR =====");
      console.error(error);

      /**
       * Retry sesuai guideline DANA
       */
      if (error?.responseCode === "5005801" || error?.responseCode === "2025800") {

        console.log("Retry refund in 5 seconds...");

        await this.delay(5000);

        const retryResponse = await this.dana.paymentGatewayApi.refundOrder(request);

        console.log("===== RETRY RESPONSE =====");
        console.log(JSON.stringify(retryResponse, null, 2));

        return retryResponse;
      }

      throw err;
    }
  }
}

export default new RefundOrderService();