import dotenv from "dotenv";

dotenv.config();

class DanaWebhookService {
  async handleFinishNotify(req, res) {
    console.log("===== FINISH NOTIFY =====");

    try {
      /**
       * 🔍 BASIC DEBUG
       */
      console.log("METHOD:", req.method);
      console.log("PATH:", req.path);
      console.log("IS BUFFER:", Buffer.isBuffer(req.body));

      /**
       * ❗ VALIDASI BODY
       */
      if (!Buffer.isBuffer(req.body)) {
        return res.status(400).json({
          responseCode: "4000001",
          responseMessage: "Invalid body",
        });
      }

      /**
       * 🔧 NORMALIZE HEADER
       */
      const headers = Object.fromEntries(
        Object.entries(req.headers).map(([k, v]) => [
          k.toLowerCase(),
          Array.isArray(v) ? v[0] : v,
        ])
      );

      /**
       * 🔐 VALIDASI HEADER WAJIB
       */
      if (!headers["x-signature"] || !headers["x-timestamp"]) {
        console.error("❌ Missing signature/timestamp");

        return res.status(400).json({
          responseCode: "4000001",
          responseMessage: "Missing signature",
        });
      }

      /**
       * 🔐 VALIDASI PARTNER
       */
      if (headers["x-partner-id"] !== process.env.X_PARTNER_ID) {
        console.error("❌ Invalid partner");

        return res.status(403).json({
          responseCode: "4030001",
          responseMessage: "Unauthorized",
        });
      }

      /**
       * 🔐 VALIDASI TIMESTAMP (ANTI REPLAY ATTACK)
       */
      const requestTime = new Date(headers["x-timestamp"]).getTime();
      const now = Date.now();

      const MAX_DIFF = 5 * 60 * 1000; // 5 menit

      if (Math.abs(now - requestTime) > MAX_DIFF) {
        console.error("❌ Timestamp expired");

        return res.status(400).json({
          responseCode: "4000001",
          responseMessage: "Timestamp expired",
        });
      }

      /**
       * ✅ PARSE BODY
       */
      const bodyString = req.body.toString();
      const data = JSON.parse(bodyString);

      console.log("===== DATA =====");
      console.log("ORDER:", data.originalPartnerReferenceNo);
      console.log("STATUS:", data.latestTransactionStatus);

      /**
       * 🔍 VALIDASI FIELD WAJIB
       */
      if (!data.originalPartnerReferenceNo || !data.originalReferenceNo) {
        return res.status(400).json({
          responseCode: "4000001",
          responseMessage: "Invalid payload",
        });
      }

      /**
       * 💾 HANDLE STATUS
       */
      switch (data.latestTransactionStatus) {
        case "00":
          console.log("✅ PAYMENT SUCCESS");

          // TODO:
          // await prisma.order.update({
          //   where: { id: data.originalPartnerReferenceNo },
          //   data: {
          //     status: "PAID",
          //     paidAt: data.finishedTime,
          //   },
          // });

          break;

        case "05":
          console.log("❌ PAYMENT EXPIRED");
          break;

        default:
          console.log("⚠️ UNKNOWN STATUS:", data.latestTransactionStatus);
      }

      /**
       * ✅ RESPONSE WAJIB KE DANA
       */
      return res.status(200).json({
        responseCode: "2000000",
        responseMessage: "Success",
      });

    } catch (err) {
      console.error("===== ERROR =====");
      console.error(err);

      return res.status(500).json({
        responseCode: "5000000",
        responseMessage: "Internal Server Error",
      });
    }
  }
}

export default new DanaWebhookService();