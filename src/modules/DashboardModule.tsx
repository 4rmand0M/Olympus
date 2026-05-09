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
  
  // Usamos solo columnas seguras para evitar errores de esquema
  const { data: facturas, loading: loadingFacturas } = useCrud('facturas', 'id, numero_factura, fecha, total, estado, created_at');
  const { data: clientes } = useCrud('clientes', 'id, nombre');
  const { data: productos } = useCrud('productos', 'id, nombre, precio');

  const facturasValidas = facturas.filter(f => f.estado !== 'Cancelada');
  const totalVentas = facturasValidas.reduce((acc, f) => acc + Number(f.total), 0);
  const facturasEmitidas = facturasValidas.length;
  const clientesActivos = clientes.length;
  const porCobrar = facturasValidas.filter(f => f.estado === 'Pendiente').reduce((acc, f) => acc + Number(f.total), 0);

  const metrics = [
    { label: 'Ventas Totales', value: formatCurrency(totalVentas, 'RD$'), icon: DollarSign, color: 'text-primary' },
    { label: 'Facturas Emitidas', value: formatNumber(facturasEmitidas), icon: FileText, color: 'text-primary' },
    { label: 'Clientes Activos', value: formatNumber(clientesActivos), icon: Users, color: 'text-primary' },
    { label: 'Cuentas por Cobrar', value: formatCurrency(porCobrar, 'RD$'), icon: TrendingUp, color: 'text-primary' },
  ];

  // Agregación para gráficos
  const hoy = new Date();
  const diasSemanalesNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const ventasSemana = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    const dayOffset = 6 - Number(i);
    d.setDate(hoy.getDate() - dayOffset);
    const targetDateStr = d.toISOString().split('T')[0];
    
    const totalDia = facturasValidas
      .filter(f => {
         const dateVal = f.fecha || f.created_at || '';
         return dateVal.startsWith(targetDateStr);
      })
      .reduce((acc, f) => acc + Number(f.total), 0);
      
    return { dia: diasSemanalesNombres[d.getDay()], ventas: totalDia };
  });

  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const ventasMensual = Array.from({length: 12}).map((_, i) => {
    const targetStr = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
    const totalMes = facturasValidas
      .filter(f => {
         const dateVal = f.fecha || f.created_at || '';
         return dateVal.startsWith(targetStr);
      })
      .reduce((acc, f) => acc + Number(f.total), 0);
      
    return { mes: mesesNombres[i], ventas: totalMes };
  });

  const groupByEstado = facturas.reduce((acc, f) => {
     const st = f.estado || 'Pendiente';
     acc[st] = (acc[st] || 0) + Number(f.total);
     return acc;
  }, {} as Record<string, number>);
  
  const ventasEstado = Object.entries(groupByEstado)
     .map(([name, value]) => ({ name, value: value as number }))
     .filter(v => v.value > 0);
     
  if (ventasEstado.length === 0) {
     ventasEstado.push({ name: 'Sin datos', value: 1 });
  }
  
  const PIE_COLORS = ['hsl(212, 55%, 20%)', 'hsl(174, 55%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(210, 15%, 70%)'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Resumen general del sistema</p>
        </div>
        <div className="flex items-center gap-2">
           <Calendar size={16} className="text-muted-foreground" />
           <select 
             className="erp-input py-1 text-xs" 
             value={selectedYear} 
             onChange={(e) => setSelectedYear(Number(e.target.value))}
           >
              {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
           </select>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="erp-metric">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <m.icon size={16} className={m.color} />
            </div>
            <div className="text-lg font-heading font-bold">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 erp-card p-4">
          <h3 className="font-heading font-semibold text-sm mb-3">Ventas de la Semana</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ventasSemana}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v, 'RD$'), 'Ventas']} />
              <Bar dataKey="ventas" fill="hsl(212, 55%, 20%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="erp-card p-4">
          <h3 className="font-heading font-semibold text-sm mb-3">Ventas por Estado</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ventasEstado} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" label={(props: any) => `${props.name}`}>
                {ventasEstado.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [formatCurrency(v, 'RD$'), 'Total']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="erp-card p-4">
          <h3 className="font-heading font-semibold text-sm mb-3">Tendencia Mensual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ventasMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v, 'RD$'), 'Ventas']} />
              <Area type="monotone" dataKey="ventas" stroke="hsl(174, 55%, 45%)" fill="hsl(174, 55%, 45%)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 erp-card p-4">
          <h3 className="font-heading font-semibold text-sm mb-3">Últimas Facturas</h3>
          <div className="overflow-auto max-h-[200px]">
            <table className="erp-table">
              <thead>
                <tr><th>Número</th><th>Fecha</th><th className="text-right">Total</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {facturas.slice(0, 5).map(f => (
                  <tr key={f.id}>
                    <td className="font-medium text-xs">{f.numero_factura}</td>
                    <td className="text-xs">{f.fecha}</td>
                    <td className="text-right font-medium text-xs">{formatCurrency(f.total, 'RD$')}</td>
                    <td><span className="erp-badge text-[10px]">{f.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
