import { Clock, FileText, Users, Package } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const quickActions = [
  { label: 'Nueva Factura', icon: FileText, module: 'facturacion' as const },
  { label: 'Nuevo Cliente', icon: Users, module: 'clientes' as const },
  { label: 'Nuevo Producto', icon: Package, module: 'productos' as const },
];

const recentTasks = [
  { label: 'Factura #000061219', status: 'Activa', time: 'Hace 5 min' },
  { label: 'Pedido #000061218', status: 'Pendiente', time: 'Hace 12 min' },
  { label: 'Cotización #000061217', status: 'Borrador', time: 'Hace 30 min' },
];

import { useCrud } from '@/hooks/useCrud';

export const ERPRightPanel = () => {
  const { rightPanelOpen, setActiveModule } = useApp();
  const { data: activities, loading } = useCrud('actividades');

  return (
    <aside className={`w-56 bg-card border-l border-border flex flex-col min-h-0 fixed md:relative right-0 z-50 md:z-0 h-full transition-transform duration-300 ${
      rightPanelOpen ? 'translate-x-0' : 'translate-x-full hidden'
    }`}>
      <div className="px-3 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accesos Rápidos</h3>
      </div>
      <div className="p-2 space-y-1">
        {quickActions.map(a => (
          <button
            key={a.label}
            onClick={() => setActiveModule(a.module)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors"
          >
            <a.icon size={14} className="text-primary" />
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      <div className="px-3 py-3 border-t border-border mt-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <Clock size={12} /> Tareas Recientes
        </h3>
      </div>
      <div className="p-2 space-y-1 flex-1 overflow-auto">
        {activities.slice(0, 10).map((t: any, i: number) => (
          <div key={t.id || i} className="px-2 py-2 rounded border border-border text-xs space-y-0.5">
            <div className="font-medium">{t.mensaje}</div>
            <div className="flex justify-between text-muted-foreground">
              <span className="erp-badge erp-badge-draft">{t.tipo}</span>
              <span>{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="px-2 py-4 text-center text-[10px] text-muted-foreground">No hay actividad reciente</div>
        )}
      </div>
    </aside>
  );
};
