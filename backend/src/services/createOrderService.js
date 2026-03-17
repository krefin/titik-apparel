import DanaPkg from "dana-node";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const Dana = DanaPkg.default || DanaPkg;

/**
 * Generate waktu expiry dengan timezone GMT+7
 */
function generateValidUpTo(minutes = 60) {
  const date = new Date(Date.now() + minutes * 60000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutesStr = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutesStr}:${seconds}+07:00`;
}

class DanaService {
  constructor() {
    this.dana = new Dana({
      partnerId: process.env.X_PARTNER_ID,
      privateKey: process.env.PRIVATE_KEY,
      origin: process.env.ORIGIN,
      env: process.env.ENV || "sandbox",
    });
  }

  async createOrder(amount) {
    const partnerReferenceNo = uuidv4();

    const request = {
      merchantId: process.env.MERCHANT_ID,

      partnerReferenceNo,

      amount: {
        value: amount.toFixed(2),
        currency: "IDR",
      },

      validUpTo: generateValidUpTo(),

      externalStoreId:
        process.env.EXTERNAL_SHOP_ID || "default_external_store",

      payOptionDetails: [
        {
          payMethod: "VIRTUAL_ACCOUNT",
          payOption: "VIRTUAL_ACCOUNT_BRI",
          transAmount: {
            value: amount.toFixed(2),
            currency: "IDR",
          },
        },
      ],

      urlParams: [
        {
          type: "NOTIFICATION",
          url: `${process.env.BASE_URL}/finish-payment`,
          isDeeplink: "N",
        },
        {
          type: "PAY_RETURN",
          url: `${process.env.BASE_URL}/payment-result`,
          isDeeplink: "N",
        },
      ],

      additionalInfo: {
        mcc: "5311",

        order: {
          orderTitle: "Titik Apparel Order",
          scenario: "API",
          merchantTransType: "ONLINE",

          buyer: {
            externalUserType: "USER_ID",
            externalUserId: "USER123",
          },

          goods: [
            {
              merchantGoodsId: "SKU001",
              name: "Titik Apparel Product",
              category: "APPAREL",
              description: "Titik Apparel Product",
              quantity: "1",
              unit: "PCS",
              price: {
                value: amount.toFixed(2),
                currency: "IDR",
              },
            },
          ],
        },

        envInfo: {
          sourcePlatform: "IPG",
          orderTerminalType: "WEB",
          terminalType: "WEB",
        },
      },
    };

    console.log("===== CREATE ORDER REQUEST =====");
    console.log(JSON.stringify(request, null, 2));

    try {
      const response = await this.dana.paymentGatewayApi.createOrder(request);

      console.log("===== DANA RESPONSE =====");
      console.log(response);

      return response;
    } catch (err) {
      console.error("===== DANA ERROR =====");
      console.error(err.rawResponse || err);
      throw err;
    }
  }
}

export default new DanaService();