import { useState } from 'react';
import { Search, DollarSign, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency, formatDate } from '@/lib/utils';

export const CuentasCobrarModule = () => {
  const [filtro, setFiltro] = useState('Todos');
  const [search, setSearch] = useState('');
  
  // Eliminamos 'moneda' de la consulta
  const { data: facturas, loading } = useCrud('facturas', 'id, numero_factura, fecha, total, estado, created_at');

  const filtered = facturas.filter(f => {
    if (filtro !== 'Todos') {
      if (filtro === 'Cobrada' && f.estado !== 'Cobrada') return false;
      if (filtro === 'Vigente' && f.estado !== 'Pendiente') return false;
    }
    return f.numero_factura?.toLowerCase().includes(search.toLowerCase());
  });

  const totalPorCobrar = facturas.filter(f => f.estado !== 'Cobrada').reduce((acc, f) => acc + Number(f.total), 0);
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold">Cuentas por Cobrar</h2>
        <p className="text-sm text-muted-foreground">Gestión de cobranzas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="erp-metric">
          <span className="text-xs text-muted-foreground">Total por Cobrar</span>
          <div className="text-lg font-heading font-bold">{formatCurrency(totalPorCobrar, 'RD$')}</div>
        </div>
      </div>

      <div className="erp-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
           <input type="text" placeholder="Buscar..." className="erp-input w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="overflow-auto">
          <table className="erp-table">
            <thead>
              <tr><th>Factura</th><th className="text-right">Monto</th><th>Fecha</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td className="font-medium">{f.numero_factura}</td>
                  <td className="text-right font-medium">{formatCurrency(f.total, 'RD$')}</td>
                  <td>{formatDate(f.fecha || f.created_at)}</td>
                  <td><span className="erp-badge">{f.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
