import { useState, useEffect, useCallback } from "react";

interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit-logs?page=${page}&limit=50`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.totalPages);
      }
    } catch { console.error("Error al cargar auditoría"); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const getActionColor = (action: string) => {
    if (action.includes("crear") || action.includes("create")) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (action.includes("eliminar") || action.includes("delete")) return "text-red-600 bg-red-50 border-red-200";
    if (action.includes("actualizar") || action.includes("update")) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Auditoría</h1>
        <p className="text-sm text-slate-500">Registro de actividades del sistema</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg p-8 text-center text-slate-500">Cargando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase">Fecha</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase">Usuario</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase">Acción</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase">Entidad</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500">No hay registros de auditoría</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-slate-800">{log.userName}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{log.entity}</td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">{log.entityId || "-"}</td>
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate" title={log.details || ""}>{log.details || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-slate-200">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Anterior</button>
              <span className="px-3 py-1 text-sm text-slate-600">Página {page} de {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Siguiente</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
