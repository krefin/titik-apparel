import * as adminStatsService from "../services/adminStatsService.js";

export const getStats = async (req, res) => {
  try {
    const stats = await adminStatsService.getTotalStats();
    return res.json(stats);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching stats" });
  }
};

export const getMonthlySales = async (req, res) => {
  try {
    const sales = await adminStatsService.getMonthlySalesStats();
    return res.json(sales);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching monthly sales" });
  }
};
