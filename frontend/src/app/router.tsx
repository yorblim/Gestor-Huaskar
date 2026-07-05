import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ProductsPage } from "../features/products/pages/ProductsPage";
import { SalesPage } from "../features/sales/pages/SalesPage";
import { CustomersPage } from "../features/customers/pages/CustomersPage";
import { ReportsPage } from "../features/reports/pages/ReportsPage";
import { InventoryPage } from "../features/inventory/pages/InventoryPage";
import { SuppliersPage } from "../features/suppliers/pages/SuppliersPage";
import { PurchasesPage } from "../features/purchases/pages/PurchasesPage";
import { UsersPage } from "../features/users/pages/UsersPage";
import { AuditLogsPage } from "../features/audit/pages/AuditLogsPage";
import { CategoriesPage } from "../features/categories/pages/CategoriesPage";
import { ImportPage } from "../features/imports/pages/ImportPage";
import { CashRegisterPage } from "../features/cashregister/pages/CashRegisterPage";
import { PurchaseSuggestionsPage } from "../features/purchasesuggestions/pages/PurchaseSuggestionsPage";
import { BatchesPage } from "../features/batches/pages/BatchesPage";
import { NotFoundPage } from "../features/notfound/pages/NotFoundPage";
import { AdminLayout } from "../components/layout/AdminLayout";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "sales", element: <SalesPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "suppliers", element: <SuppliersPage /> },
      { path: "purchases", element: <PurchasesPage /> },
      { path: "cash-register", element: <CashRegisterPage /> },
      { path: "purchase-suggestions", element: <PurchaseSuggestionsPage /> },
      { path: "batches", element: <BatchesPage /> },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "users", element: <UsersPage /> },
      { path: "audit-logs", element: <AuditLogsPage /> },
      { path: "import", element: <ImportPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
