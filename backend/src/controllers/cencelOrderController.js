import cancelOrderService from "../services/cencelOrderService.js";

export const cancelOrder = async (req, res) => {
  try {
    const { partnerReferenceNo, amount } = req.body;

    const response = await cancelOrderService.cancelOrder(
      partnerReferenceNo,
      amount
    );

    res.json({
      success: true,
      message: "Cancel Order Success",
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