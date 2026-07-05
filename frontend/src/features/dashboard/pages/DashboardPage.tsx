import { useEffect, useState } from "react";
import { productService } from "../../products/services/productService";
import { saleService } from "../../sales/services/saleService";
import { customerService } from "../../customers/services/customerService";
import type { Product } from "../../products/types/product";
import type { Sale } from "../../sales/types/sale";
import type { Customer } from "../../customers/types/customer";

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, salesData, customersData] = await Promise.all([
          productService.getAll(),
          saleService.getAll(),
          customerService.getAll(),
        ]);
        setProducts(productsData.data);
        setSales(salesData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeSales = sales.filter((s) => s.status === "active");
  const today = new Date().toISOString().split("T")[0];
  const todaySales = activeSales.filter((sale) => sale.createdAt.startsWith(today));
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalRevenue = activeSales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const recentSales = [...activeSales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Calcular productos más vendidos
  const productSales = new Map<string, number>();
  activeSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const current = productSales.get(item.productId) || 0;
      productSales.set(item.productId, current + item.quantity);
    });
  });

  const topSellingProducts = Array.from(productSales.entries())
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      return product ? { product, quantity } : null;
    })
    .filter((item): item is { product: Product; quantity: number } => item !== null)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-base">💰</span>
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">Hoy</span>
          </div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Ventas del Día</p>
          <p className="text-2xl font-bold text-slate-900">S/. {todayRevenue.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">{todaySales.length} ventas</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-base">📦</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Total Productos</p>
          <p className="text-2xl font-bold text-slate-900">{products.length}</p>
          <p className="text-xs text-slate-500 mt-1">En inventario</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-base">👥</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Clientes Activos</p>
          <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
          <p className="text-xs text-slate-500 mt-1">Registrados</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-base">⚠️</span>
            </div>
            {lowStockProducts.length > 0 && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Alerta</span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Stock Bajo</p>
          <p className="text-2xl font-bold text-slate-900">{lowStockProducts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Requieren atención</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center border-b border-slate-100 pb-2">
            <span className="mr-2 text-base">📊</span>
            Resumen de Ventas
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-700">Total Ventas</p>
                <p className="text-xs text-slate-500">Transacciones</p>
              </div>
              <span className="text-lg font-bold text-slate-900">{activeSales.length}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-700">Ingresos Totales</p>
                <p className="text-xs text-slate-500">Acumulado</p>
              </div>
              <span className="text-lg font-bold text-emerald-600">S/. {totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-700">Promedio por Venta</p>
                <p className="text-xs text-slate-500">Ticket promedio</p>
              </div>
              <span className="text-lg font-bold text-slate-900">
                S/. {activeSales.length > 0 ? (totalRevenue / activeSales.length).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center border-b border-slate-100 pb-2">
            <span className="mr-2 text-base">🕐</span>
            Últimas 5 Ventas
          </h3>
          <div className="space-y-2">
            {recentSales.length === 0 ? (
              <p className="text-slate-500 text-center py-6 text-sm">No hay ventas registradas</p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-base font-bold text-slate-900">S/. {sale.total.toFixed(2)}</p>
                      <span className="text-xs text-slate-600">
                        {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Venta #{sale.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-700 bg-white px-2 py-1 rounded-full border border-slate-200">
                      {sale.items.length} items
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center">
            <span className="mr-2 text-base">📉</span>
            Productos con Stock Bajo
          </h3>
          {lowStockProducts.length > 0 && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
              {lowStockProducts.length} alertas
            </span>
          )}
        </div>
        {lowStockProducts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">No hay productos con stock bajo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="p-2.5 bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors">
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-sm font-semibold text-slate-900 truncate flex-1">{product.name}</p>
                  <span className="text-red-600 text-xs ml-2">⚠️</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-red-600">Stock: {product.stock}</p>
                  <p className="text-xs text-slate-600">Mín: {product.minStock}</p>
                </div>
                <p className="text-xs text-slate-600 mt-1">S/. {product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center">
            <span className="mr-2 text-base">🏆</span>
            Productos Más Vendidos
          </h3>
          {topSellingProducts.length > 0 && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
              Top 5
            </span>
          )}
        </div>
        {topSellingProducts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">No hay ventas registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            {topSellingProducts.map((item, index) => (
              <div key={item.product.id} className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 truncate flex-1">{item.product.name}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-emerald-600">{item.quantity} vendidos</p>
                  <p className="text-xs text-slate-600">S/. {item.product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
