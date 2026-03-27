import dotenv from "dotenv";
import { WebhookParser } from "dana-node/webhook/v1";

dotenv.config();

/**
 * 🔐 Format public key jadi PEM
 */
function formatPublicKey(key) {
  if (!key) {
    throw new Error("DANA_PUBLIC_KEY is missing");
  }

  // ubah \n string jadi newline asli
  let formatted = key.replace(/\\n/g, "\n").trim();

  // kalau belum ada BEGIN/END, bungkus
  if (!formatted.includes("BEGIN PUBLIC KEY")) {
    formatted = `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
  }

  return formatted;
}

class DanaWebhookService {
  async handleFinishNotify(req, res) {
    console.log("===== DANA FINISH NOTIFY =====");

    try {
      /**
       * 🔐 FORMAT PUBLIC KEY (AUTO FIX)
       */
      const publicKey = formatPublicKey(process.env.DANA_PUBLIC_KEY);

      const parser = new WebhookParser(publicKey);

      /**
       * ❗ VALIDASI RAW BODY
       */
      if (!Buffer.isBuffer(req.body)) {
        console.error("❌ Body bukan RAW Buffer");

        return res.status(400).json({
          responseCode: "4000001",
          responseMessage: "Invalid body",
        });
      }

      const bodyString = req.body.toString();

      /**
       * 🔍 DEBUG WAJIB (hapus kalau udah stabil)
       */
      console.log("PATH:", req.path);
      console.log("METHOD:", req.method);
      console.log("HAS SIGNATURE:", !!req.headers["x-signature"]);
      console.log("HAS TIMESTAMP:", !!req.headers["x-timestamp"]);

      /**
       * 🔐 VERIFY + PARSE
       */
      const data = parser.parseWebhook(
        req.method,
        req.path,      // ⚠️ HARUS /v1.0/debit/notify
        req.headers,
        bodyString
      );

      /**
       * ✅ VERIFIED
       */
      console.log("✅ VERIFIED SUCCESS");
      console.log("ORDER:", data.originalPartnerReferenceNo);
      console.log("STATUS:", data.latestTransactionStatus);

      /**
       * 💾 HANDLE STATUS
       */
      switch (data.latestTransactionStatus) {
        case "00":
          console.log("✅ PAYMENT SUCCESS");
          break;

        case "05":
          console.log("❌ PAYMENT EXPIRED");
          break;

        default:
          console.log("⚠️ UNKNOWN STATUS:", data.latestTransactionStatus);
      }

      /**
       * ✅ RESPONSE KE DANA
       */
      return res.status(200).json({
        responseCode: "2005600",
        responseMessage: "Success",
      });

    } catch (err) {
      console.error("❌ VERIFICATION FAILED");
      console.error("MESSAGE:", err.message);

      return res.status(500).json({
        responseCode: "5005601",
        responseMessage: "Internal Server Error",
      });
    }
  }
}

export default new DanaWebhookService();