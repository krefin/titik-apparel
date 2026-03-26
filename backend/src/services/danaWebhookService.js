import dotenv from "dotenv";

dotenv.config();

class DanaWebhookService {
  constructor() {
    // kalau nanti mau dipakai (misal verify partnerId)
    this.partnerId = process.env.X_PARTNER_ID;
  }

  async handleFinishNotify(req, res) {
    console.log("===== FINISH NOTIFY REQUEST =====");

    try {
      const headers = req.headers;
      const body = req.body;

      console.log("Headers:");
      console.log(JSON.stringify(headers, null, 2));

      console.log("Body:");
      console.log(JSON.stringify(body, null, 2));

      const {
        originalPartnerReferenceNo,
        originalReferenceNo,
        merchantId,
        amount,
        latestTransactionStatus,
        transactionStatusDesc,
        createdTime,
        finishedTime,
        additionalInfo,
      } = body;

      // 🔍 Validasi basic
      if (!originalPartnerReferenceNo || !originalReferenceNo) {
        return res.status(400).json({
          responseCode: "4000001",
          responseMessage: "Invalid Request",
        });
      }

      // 🔗 Mapping order
      const orderId = originalPartnerReferenceNo;

      console.log("===== PROCESS ORDER =====");
      console.log("Order ID:", orderId);
      console.log("DANA Ref:", originalReferenceNo);
      console.log("Amount:", amount?.value, amount?.currency);
      console.log("Status:", latestTransactionStatus);

      /**
       * 💾 SIMULASI UPDATE DB
       * (ganti sesuai database lu)
       */
      if (latestTransactionStatus === "00") {
        console.log("✅ PAYMENT SUCCESS");

        // contoh:
        // await Order.update({
        //   status: "PAID",
        //   paidAt: finishedTime,
        // });

      } else if (latestTransactionStatus === "05") {
        console.log("❌ PAYMENT EXPIRED");

        // await Order.update({
        //   status: "EXPIRED",
        // });

      } else {
        console.log("⚠️ UNKNOWN STATUS:", latestTransactionStatus);
      }

      // ✅ response wajib ke DANA
      return res.status(200).json({
        responseCode: "2000000",
        responseMessage: "Success",
      });

    } catch (err) {
      console.error("===== WEBHOOK ERROR =====");
      console.error(err);

      return res.status(500).json({
        responseCode: "5000000",
        responseMessage: "Internal Server Error",
      });
    }
  }
}

export default new DanaWebhookService();