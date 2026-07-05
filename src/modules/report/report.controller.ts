import { Request, Response, NextFunction } from "express";
import { getSalesReport, getPurchasesReport, getLowStockReport, getTopSellingReport, getProfitReport, getDailyClose, exportProductsCSV, exportSalesCSV as exportSalesCSVService } from "./report.service";

export const reportController = {
  sales: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        customerId: req.query.customerId as string,
      };
      const report = await getSalesReport(filters);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  purchases: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        supplierId: req.query.supplierId as string,
      };
      const report = await getPurchasesReport(filters);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  lowStock: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await getLowStockReport();
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  topSelling: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const report = await getTopSellingReport(filters);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  profit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const report = await getProfitReport(filters);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  dailyClose: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const report = await getDailyClose(filters);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  exportProductsCSV: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const csv = await exportProductsCSV();
      const filename = `productos_${new Date().toISOString().split("T")[0]}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  exportSalesCSV: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const csv = await exportSalesCSVService(filters);
      const filename = `ventas_${new Date().toISOString().split("T")[0]}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },
};
