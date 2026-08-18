import DanaPkg from "dana-node";
import dotenv from "dotenv";

dotenv.config();

const Dana = DanaPkg.default || DanaPkg;

class DanaService {
  constructor() {
    this.dana = new Dana({
      partnerId: process.env.X_PARTNER_ID || "",
      privateKey: process.env.PRIVATE_KEY || "",
      origin: process.env.ORIGIN || "",
      env: process.env.ENV || "sandbox",
    });
  }

  async consultPay() {
  const request = {
    merchantId: process.env.MERCHANT_ID,

    amount: {
      value: "10000.00",
      currency: "IDR"
    },

    additionalInfo: {
      productCode: "51051000100000000001"
    }
  };

  const response = await this.dana.paymentGatewayApi.consultPay(request);

  return response;
}
}

export default new DanaService();