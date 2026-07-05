import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface PurchaseSuggestion {
  productId: string;
  productName: string;
  productCode: string;
  currentStock: number;
  minStock: number;
  suggestedQuantity: number;
}

export function PurchaseSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<PurchaseSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/purchase-suggestions", { credentials: "include" });
        const data = await res.json();
        if (data.success) setSuggestions(data.data);
      } catch (err) {
        console.error("Error al cargar sugerencias");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateOrder = (productId: string) => {
    navigate(`/purchases?productId=${productId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900">Sugerencias de Compra</h1>
      </div>

      {loading ? (
        <p className="text-slate-500 text-center py-8 text-sm">Cargando sugerencias...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Todo en orden</h3>
              <p className="text-sm text-slate-500 mb-4 text-center">No hay productos que requieran reabastecimiento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Producto</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Código</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Stock Actual</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Stock Mínimo</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Sugerido</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.map((s) => (
                    <tr
                      key={s.productId}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        s.currentStock === 0 ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-slate-800">{s.productName}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{s.productCode}</td>
                      <td className={`py-3 px-4 text-right text-sm font-semibold ${
                        s.currentStock === 0 ? "text-red-600" : "text-slate-900"
                      }`}>
                        {s.currentStock}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-slate-600">{s.minStock}</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-orange-600">{s.suggestedQuantity}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleCreateOrder(s.productId)}
                          className="px-2.5 py-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg border border-orange-200 transition-colors"
                        >
                          Crear Orden de Compra
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
