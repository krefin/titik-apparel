import DanaPkg from "dana-node";
import dotenv from "dotenv";

dotenv.config();

const Dana = DanaPkg.default || DanaPkg;

/**
 * Generate waktu GMT+7
 */
function generateTransactionDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
}

class QueryPaymentService {
  constructor() {
    this.dana = new Dana({
      partnerId: process.env.X_PARTNER_ID,
      privateKey: process.env.PRIVATE_KEY,
      origin: process.env.ORIGIN,
      env: process.env.ENV || "sandbox",
    });
  }

  async queryPayment(partnerReferenceNo, amount) {
    const request = {
      originalPartnerReferenceNo: partnerReferenceNo,

      serviceCode: "54",

      transactionDate: generateTransactionDate(),

      amount: {
        value: amount.toFixed(2),
        currency: "IDR",
      },

      merchantId: process.env.MERCHANT_ID,

      externalStoreId:
        process.env.EXTERNAL_SHOP_ID || "default_external_store",

      additionalInfo: {},
    };

    console.log("===== QUERY PAYMENT REQUEST =====");
    console.log(JSON.stringify(request, null, 2));

    try {
      const response = await this.dana.paymentGatewayApi.queryPayment(
        request
      );

      console.log("===== QUERY PAYMENT RESPONSE =====");
      console.log(response);

      return response;
    } catch (err) {
      console.error("===== QUERY PAYMENT ERROR =====");
      console.error(err.rawResponse || err);
      throw err;
    }
  }
}

export default new QueryPaymentService();