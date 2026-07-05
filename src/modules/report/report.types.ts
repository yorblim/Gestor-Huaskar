export type SalesReportItem = {
  id: string;
  date: string;
  customerName?: string;
  total: number;
  paymentMethod: string;
  status: string;
};

export type PurchasesReportItem = {
  id: string;
  date: string;
  supplierName: string;
  total: number;
  status: string;
  itemsCount: number;
};

export type LowStockItem = {
  id: string;
  code: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
};

export type TopSellingItem = {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
};

export type ReportFilters = {
  startDate?: string;
  endDate?: string;
  supplierId?: string;
  customerId?: string;
  productId?: string;
};

export type SalesReportResponse = {
  items: SalesReportItem[];
  summary: {
    totalSales: number;
    totalRevenue: number;
    averageTicket: number;
  };
};

export type PurchasesReportResponse = {
  items: PurchasesReportItem[];
  summary: {
    totalPurchases: number;
    totalAmount: number;
  };
};

export type LowStockReportResponse = {
  items: LowStockItem[];
  count: number;
};

export type TopSellingReportResponse = {
  items: TopSellingItem[];
  summary: {
    totalItemsSold: number;
    totalRevenue: number;
  };
};

export type ProfitReportItem = {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
};

export type ProfitReportResponse = {
  items: ProfitReportItem[];
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageMargin: number;
  };
};

export type DailyCloseItem = {
  date: string;
  cash: number;
  card: number;
  yape: number;
  plin: number;
  total: number;
  count: number;
};

export type DailyCloseResponse = {
  items: DailyCloseItem[];
  summary: {
    totalRevenue: number;
    totalSales: number;
    byMethod: Record<string, number>;
  };
};
