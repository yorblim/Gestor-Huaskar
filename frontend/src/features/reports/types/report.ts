export interface SalesReportItem {
  id: string;
  date: string;
  customerName?: string;
  total: number;
  paymentMethod: string;
  status: string;
}

export interface PurchasesReportItem {
  id: string;
  date: string;
  supplierName: string;
  total: number;
  status: string;
  itemsCount: number;
}

export interface LowStockItem {
  id: string;
  code: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
}

export interface TopSellingItem {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  supplierId?: string;
  customerId?: string;
  productId?: string;
}

export interface SalesReportResponse {
  items: SalesReportItem[];
  summary: {
    totalSales: number;
    totalRevenue: number;
    averageTicket: number;
  };
}

export interface PurchasesReportResponse {
  items: PurchasesReportItem[];
  summary: {
    totalPurchases: number;
    totalAmount: number;
  };
}

export interface LowStockReportResponse {
  items: LowStockItem[];
  count: number;
}

export interface TopSellingReportResponse {
  items: TopSellingItem[];
  summary: {
    totalItemsSold: number;
    totalRevenue: number;
  };
}

export interface ProfitItem {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface ProfitReportResponse {
  items: ProfitItem[];
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    averageMargin: number;
  };
}

export interface DailyCloseItem {
  date: string;
  cash: number;
  card: number;
  yape: number;
  plin: number;
  total: number;
  count: number;
}

export interface DailyCloseResponse {
  items: DailyCloseItem[];
  summary: {
    totalRevenue: number;
    totalSales: number;
    byMethod: Record<string, number>;
  };
}
