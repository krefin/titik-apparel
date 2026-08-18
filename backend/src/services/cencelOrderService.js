import DanaPkg from "dana-node";
import dotenv from "dotenv";

dotenv.config();

const Dana = DanaPkg.default || DanaPkg;

class CancelOrderService {
  getDana() {
    if (!this.dana) {
      this.dana = new Dana({
        partnerId: process.env.X_PARTNER_ID || "dummy_partner_id",
        privateKey: process.env.PRIVATE_KEY || "dummy_private_key",
        origin: process.env.ORIGIN || "http://localhost:4000",
        env: process.env.DANA_ENV || process.env.ENV || "sandbox",
      });
    }
    return this.dana;
  }

  async cancelOrder(partnerReferenceNo, amount) {
    const request = {
      originalPartnerReferenceNo: partnerReferenceNo,

      merchantId: process.env.MERCHANT_ID || "dummy_merchant",

      externalStoreId:
        process.env.EXTERNAL_SHOP_ID || "default_external_store",

      reason: "Customer cancel order",

      amount: {
        value: Number(amount).toFixed(2),
        currency: "IDR",
      },

      additionalInfo: {},
    };

    console.log("===== CANCEL ORDER REQUEST =====");
    console.log(JSON.stringify(request, null, 2));

    try {
      const response = await this.getDana().paymentGatewayApi.cancelOrder(
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