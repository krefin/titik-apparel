import danaService from "../services/createOrderService.js";

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const result = await danaService.createOrder(amount);

    res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("CreateOrder Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      dana: error.rawResponse || null
    });
  }
};