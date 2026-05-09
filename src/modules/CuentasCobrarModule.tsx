import { useState } from 'react';
import { Search, Filter, DollarSign, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency } from '@/lib/utils';

export const CuentasCobrarModule = () => {
  const [filtro, setFiltro] = useState('Todos');
  const [search, setSearch] = useState('');
  const filtros = ['Todos', 'Vigente', 'Vencida', 'Cobrada'];
  const { data: facturas, loading } = useCrud('facturas', 'id, numero_factura, fecha, total, moneda, estado, created_at, cliente:clientes(nombre)');

  const filtered = facturas.filter(f => {
    if (filtro !== 'Todos') {
      if (filtro === 'Cobrada' && f.estado !== 'Cobrada') return false;
      if (filtro === 'Vigente' && f.estado !== 'Pendiente') return false;
      if (filtro === 'Vencida' && f.estado !== 'Vencida') return false;
    }
    if (search) {
      const searchLower = search.toLowerCase();
      const matchCliente = f.cliente?.nombre?.toLowerCase().includes(searchLower);
      const matchNumero = f.numero_factura?.toLowerCase().includes(searchLower);
      const matchId = f.id?.toLowerCase().includes(searchLower);
      if (!matchCliente && !matchNumero && !matchId) return false;
    }
    return true;
  });

  const totalPorCobrar = facturas.filter(f => f.estado !== 'Cobrada').reduce((acc, f) => acc + Number(f.total), 0);
  const vencidas = facturas.filter(f => f.estado === 'Vencida').reduce((acc, f) => acc + Number(f.total), 0);
  const porVencer = facturas.filter(f => f.estado === 'Pendiente').reduce((acc, f) => acc + Number(f.total), 0);
  
  const metrics = [
    { label: 'Total por Cobrar', value: formatCurrency(totalPorCobrar), icon: DollarSign, color: 'text-primary' },
    { label: 'Vencidas', value: formatCurrency(vencidas), icon: AlertTriangle, color: 'text-[hsl(var(--erp-danger))]' },
    { label: 'Por Vencer', value: formatCurrency(porVencer), icon: Clock, color: 'text-[hsl(var(--erp-warning))]' },
    { label: 'Cobradas este Mes', value: formatCurrency(0), icon: CheckCircle2, color: 'text-[hsl(var(--erp-success))]' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold">Cuentas por Cobrar</h2>
        <p className="text-sm text-muted-foreground">Gestión de cobranzas y cuentas pendientes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="erp-metric">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <m.icon size={16} className={m.color} />
            </div>
            <div className="text-lg font-heading font-bold">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="erp-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {filtros.map(f => (
              <button key={f} onClick={() => setFiltro(f)} className={`erp-btn text-xs ${filtro === f ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Buscar cuenta..." className="erp-input pl-8 w-48" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Factura</th>
                <th>Cliente</th>
                <th className="text-right">Monto</th>
                <th className="text-right">Pendiente</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id}>
                  <td className="font-medium">{f.numero_factura}</td>
                  <td>{f.cliente?.nombre || 'Consumidor Final'}</td>
                  <td className="text-right">{formatCurrency(f.total)}</td>
                  <td className="text-right font-medium">{formatCurrency(f.total)}</td>
                  <td>{f.fecha || f.created_at?.split('T')[0]}</td>
                  <td>
                    <span className={`erp-badge ${
                      f.estado === 'Pendiente' ? 'erp-badge-pending' :
                      f.estado === 'Cobrada' ? 'erp-badge-active' : 'erp-badge-cancelled'
                    }`}>{f.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
