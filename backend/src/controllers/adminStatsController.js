import * as adminStatsService from "../services/adminStatsService.js";

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminStatsService.getTotalStats();
    return res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getMonthlySales = async (req, res, next) => {
  try {
    const sales = await adminStatsService.getMonthlySalesStats();
    return res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};
