import refundService from "../services/refundOrderService.js";

export const refundOrder = async (req, res) => {

  try {

    const { partnerReferenceNo, originalReferenceNo, amount } = req.body;

    if (!partnerReferenceNo || !originalReferenceNo || !amount) {
      return res.status(400).json({
        success: false,
        message: "partnerReferenceNo, originalReferenceNo and amount are required"
      });
    }

    const response = await refundService.refundOrder(
      partnerReferenceNo,
      originalReferenceNo,
      amount
    );

    res.json({
      success: true,
      data: response
    });

  } catch (error) {

    console.error("Refund API Error:", error.rawResponse || error);

    res.status(500).json({
      success: false,
      message: "[DANA SDK Error]",
      error: error.rawResponse || error
    });

  }

};