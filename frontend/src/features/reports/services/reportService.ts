import { API_URL } from "../../../api";
import type {
  SalesReportResponse,
  PurchasesReportResponse,
  LowStockReportResponse,
  TopSellingReportResponse,
  ProfitReportResponse,
  DailyCloseResponse,
  ReportFilters,
} from "../types/report";

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  error?: string;
};

async function parseReportResponse<T>(response: Response, defaultMessage: string): Promise<T> {
  const rawBody = await response.text();
  let payload: unknown = null;

  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
  }

  const envelope: ApiEnvelope<T> | null =
    payload && typeof payload === "object" ? (payload as ApiEnvelope<T>) : null;

  if (!response.ok) {
    const backendMessage = envelope?.message || envelope?.error;
    const details = import.meta.env.DEV
      ? ` (status ${response.status}${backendMessage ? `: ${backendMessage}` : ""})`
      : "";

    throw new Error(`${defaultMessage}${details}`);
  }

  if (!envelope?.data) {
    const details = import.meta.env.DEV ? `: ${rawBody || "respuesta vacía"}` : "";
    throw new Error(`Respuesta inválida del reporte${details}`);
  }

  return envelope.data;
}

async function fetchReport<T>(url: string, defaultMessage: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" });
  return parseReportResponse<T>(response, defaultMessage);
}

export const reportService = {
  async getSalesReport(filters: ReportFilters): Promise<SalesReportResponse> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.customerId) params.append("customerId", filters.customerId);
    return fetchReport<SalesReportResponse>(`${API_URL}/reports/sales?${params}`, "Error al obtener reporte de ventas");
  },

  async getPurchasesReport(filters: ReportFilters): Promise<PurchasesReportResponse> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.supplierId) params.append("supplierId", filters.supplierId);
    return fetchReport<PurchasesReportResponse>(`${API_URL}/reports/purchases?${params}`, "Error al obtener reporte de compras");
  },

  async getLowStockReport(): Promise<LowStockReportResponse> {
    return fetchReport<LowStockReportResponse>(`${API_URL}/reports/low-stock`, "Error al obtener reporte de stock bajo");
  },

  async getTopSellingReport(filters: ReportFilters): Promise<TopSellingReportResponse> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    return fetchReport<TopSellingReportResponse>(`${API_URL}/reports/top-selling?${params}`, "Error al obtener reporte de más vendidos");
  },

  async getProfitReport(filters: ReportFilters): Promise<ProfitReportResponse> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    return fetchReport<ProfitReportResponse>(`${API_URL}/reports/profit?${params}`, "Error al obtener reporte de ganancias");
  },

  async getDailyClose(filters: ReportFilters): Promise<DailyCloseResponse> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    return fetchReport<DailyCloseResponse>(`${API_URL}/reports/daily-close?${params}`, "Error al obtener cierre diario");
  },
};
