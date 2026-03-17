import DanaPkg from "dana-node";
import dotenv from "dotenv";

dotenv.config();

const Dana = DanaPkg.default || DanaPkg;

class CancelOrderService {
  constructor() {
    this.dana = new Dana({
      partnerId: process.env.X_PARTNER_ID,
      privateKey: process.env.PRIVATE_KEY,
      origin: process.env.ORIGIN,
      env: process.env.ENV || "sandbox",
    });
  }

  async cancelOrder(partnerReferenceNo, amount) {
    const request = {
      originalPartnerReferenceNo: partnerReferenceNo,

      merchantId: process.env.MERCHANT_ID,

      externalStoreId:
        process.env.EXTERNAL_SHOP_ID || "default_external_store",

      reason: "Customer cancel order",

      amount: {
        value: amount.toFixed(2),
        currency: "IDR",
      },

      additionalInfo: {},
    };

    console.log("===== CANCEL ORDER REQUEST =====");
    console.log(JSON.stringify(request, null, 2));

    try {
      const response = await this.dana.paymentGatewayApi.cancelOrder(
        request
      );

      console.log("===== CANCEL ORDER RESPONSE =====");
      console.log(response);

      return response;
    } catch (err) {
      console.error("===== CANCEL ORDER ERROR =====");
      console.error(err.rawResponse || err);
      throw err;
    }
  }
}

export default new CancelOrderService();