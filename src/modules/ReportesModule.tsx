import { useState } from 'react';
import { useCrud } from '@/hooks/useCrud';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['hsl(212, 55%, 20%)', 'hsl(174, 55%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(210, 15%, 70%)'];

export const ReportesModule = () => {
  const [tab, setTab] = useState<'graficos' | 'reportes'>('graficos');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: facturas, loading } = useCrud('facturas', 'id, fecha, total, estado, created_at');


  // Agregación para gráficos
  const hoy = new Date();
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const facturasValidas = facturas.filter(f => f.estado !== 'Cancelada');

  const ventasMensuales = Array.from({length: 12}).map((_, i) => {
    const targetStr = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
    
    const totalMes = facturasValidas
      .filter(f => {
         const dateVal = f.fecha || f.created_at || '';
         return dateVal.startsWith(targetStr);
      })
      .reduce((acc, f) => acc + Number(f.total), 0);
      
    return { mes: mesesNombres[i], ventas: totalMes };
  });

  const cobranzas = Array.from({length: 12}).map((_, i) => {
    const targetStr = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
    
    const pagado = facturasValidas
      .filter(f => {
         const dateVal = f.fecha || f.created_at || '';
         return dateVal.startsWith(targetStr) && f.estado === 'Cobrada';
      })
      .reduce((acc, f) => acc + Number(f.total), 0);
      
    const pendiente = facturasValidas
      .filter(f => {
         const dateVal = f.fecha || f.created_at || '';
         return dateVal.startsWith(targetStr) && f.estado === 'Pendiente';
      })
      .reduce((acc, f) => acc + Number(f.total), 0);
      
    return { mes: mesesNombres[i], cobrado: pagado, pendiente };
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
  
  const reportes = [
    { nombre: 'Ventas por Período', descripcion: 'Resumen de ventas por rango de fechas', tipo: 'Ventas' },
    { nombre: 'Cuentas por Cobrar', descripcion: 'Estado de cuentas pendientes y vencidas', tipo: 'Cobranza' },
    { nombre: 'Top Clientes', descripcion: 'Clientes con mayor volumen de compras', tipo: 'Ventas' },
    { nombre: 'Facturas Canceladas', descripcion: 'Registro de facturas anuladas', tipo: 'Ventas' },
  ];

  const handleDownload = (name: string) => {
    alert(`Generando reporte: ${name}\nPor favor espere unos segundos.`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold">Reportes</h2>
        <p className="text-sm text-muted-foreground">Análisis y reportes del sistema</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => setTab('graficos')} className={`erp-btn ${tab === 'graficos' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
            <TrendingUp size={14} /> Gráficos
          </button>
          <button onClick={() => setTab('reportes')} className={`erp-btn ${tab === 'reportes' ? 'erp-btn-primary' : 'erp-btn-secondary'}`}>
            <FileText size={14} /> Reportes
          </button>
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


      {tab === 'graficos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="erp-card p-4">
            <h3 className="font-heading font-semibold text-sm mb-3">Ventas Mensuales</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Ventas']} />
                <Bar dataKey="ventas" fill="hsl(212, 55%, 20%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="erp-card p-4">
            <h3 className="font-heading font-semibold text-sm mb-3">Ventas por Estado</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={ventasEstado} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={(props: any) => `${props.name} ${props.value > 1 ? `(${(props.value/1000).toFixed(0)}K)` : ''}`}>
                  {ventasEstado.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'Total']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="erp-card p-4 lg:col-span-2">
            <h3 className="font-heading font-semibold text-sm mb-3">Cobranzas vs Pendiente</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={cobranzas}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v)]} />
                <Line type="monotone" dataKey="cobrado" stroke="hsl(145, 60%, 42%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pendiente" stroke="hsl(0, 72%, 55%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportes.map(r => (
            <div key={r.nombre} className="erp-card p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <FileText size={18} className="text-primary mt-0.5" />
                <span className="erp-badge erp-badge-draft">{r.tipo}</span>
              </div>
              <h4 className="font-heading font-semibold text-sm">{r.nombre}</h4>
              <p className="text-xs text-muted-foreground flex-1">{r.descripcion}</p>
              <button className="erp-btn erp-btn-secondary text-xs self-start mt-1" onClick={() => handleDownload(r.nombre)}>
                <Download size={12} /> Generar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
