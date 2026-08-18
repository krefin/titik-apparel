import queryPaymentService from "../services/queryPaymentService.js";

export const queryPayment = async (req, res) => {
  try {
    const { partnerReferenceNo, amount } = req.body;

    const response = await queryPaymentService.queryPayment(
      partnerReferenceNo,
      amount
    );

    res.json({
      success: true,
      message: "Query Payment Success",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      dana: error.rawResponse || null,
    });
  }
};