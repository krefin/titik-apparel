import DanaPkg from "dana-node";
import dotenv from "dotenv";

dotenv.config();

const Dana = DanaPkg.default || DanaPkg;

class DanaService {
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

  async consultPay() {
    const request = {
      merchantId: process.env.MERCHANT_ID || "dummy_merchant",

      amount: {
        value: "10000.00",
        currency: "IDR",
      },

      additionalInfo: {
        productCode: "51051000100000000001",
      },
    };

    const response = await this.getDana().paymentGatewayApi.consultPay(request);
    return response;
  }
}

export default new DanaService();