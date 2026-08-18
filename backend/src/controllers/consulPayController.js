import danaService from "../services/consultPayServices.js";

export const consultPay = async (req, res) => {
  try {
    const result = await danaService.consultPay();

    res.status(200).json({
      success: true,
      message: "Consult Pay Success",
      data: result
    });

  } catch (error) {
    console.error("ConsultPay Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};