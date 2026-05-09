import { useState } from 'react';
import { 
  DollarSign, FileText, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency, formatNumber } from '@/lib/utils';

export const DashboardModule = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Eliminamos 'moneda' de la consulta
  const { data: facturas, loading: loadingFacturas } = useCrud('facturas', 'id, numero_factura, fecha, total, estado, created_at');
  const { data: clientes } = useCrud('clientes', 'id, nombre');
  const { data: productos } = useCrud('productos', 'id, nombre, precio');

  const facturasValidas = facturas.filter(f => f.estado !== 'Cancelada');
  const totalVentas = facturasValidas.reduce((acc, f) => acc + Number(f.total), 0);
  const facturasEmitidas = facturasValidas.length;
  const clientesActivos = clientes.length;
  const porCobrar = facturasValidas.filter(f => f.estado === 'Pendiente').reduce((acc, f) => acc + Number(f.total), 0);

  const metrics = [
    { label: 'Ventas Totales', value: formatCurrency(totalVentas, 'RD$'), icon: DollarSign },
    { label: 'Facturas Emitidas', value: formatNumber(facturasEmitidas), icon: FileText },
    { label: 'Clientes Activos', value: formatNumber(clientesActivos), icon: Users },
    { label: 'Cuentas por Cobrar', value: formatCurrency(porCobrar, 'RD$'), icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Resumen general</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="erp-metric">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <m.icon size={16} className="text-primary" />
            </div>
            <div className="text-lg font-heading font-bold">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="erp-card p-4">
        <h3 className="font-heading font-semibold text-sm mb-3">Ventas Recientes</h3>
        <div className="overflow-auto">
          <table className="erp-table">
            <thead>
              <tr><th>Número</th><th>Fecha</th><th className="text-right">Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {facturas.slice(0, 5).map(f => (
                <tr key={f.id}>
                  <td className="font-medium">{f.numero_factura}</td>
                  <td>{f.fecha}</td>
                  <td className="text-right font-medium">{formatCurrency(f.total, 'RD$')}</td>
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
