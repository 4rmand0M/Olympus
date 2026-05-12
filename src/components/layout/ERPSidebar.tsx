import {
  LayoutDashboard, FileText, Users,
  CreditCard, BarChart3, Settings, UserCog, Truck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const modules = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'facturacion' as const, label: 'Facturación', icon: FileText },
  { id: 'clientes' as const, label: 'Clientes', icon: Users },

  { id: 'cuentas-cobrar' as const, label: 'Cuentas x Cobrar', icon: CreditCard },
  { id: 'reportes' as const, label: 'Reportes', icon: BarChart3 },
  { id: 'proveedores' as const, label: 'Proveedores', icon: Truck, disabled: true },
  { id: 'configuracion' as const, label: 'Configuración', icon: Settings },
  { id: 'usuarios' as const, label: 'Usuarios', icon: UserCog },
];

export const ERPSidebar = () => {
  const { activeModule, setActiveModule, sidebarOpen } = useApp();

  return (
    <aside
      className={`flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 min-h-screen fixed md:relative z-50 left-0 ${
        sidebarOpen ? 'w-56 translate-x-0' : 'w-56 -translate-x-full md:translate-x-0 md:w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-sidebar-border">
        <img src="/Credifacil.svg" alt="Logo" className="h-7 w-7 flex-shrink-0" />
        {sidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="font-heading text-sm font-bold leading-tight text-sidebar-primary">
              CrediFacil
            </h1>
            <span className="text-[10px] text-sidebar-foreground/70 tracking-widest uppercase font-semibold">
              Olympus
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5 px-2">
        {modules.map((mod) => {
          const active = activeModule === mod.id;
          const disabled = 'disabled' in mod && mod.disabled;

          return (
            <button
              key={mod.id}
              onClick={() => !disabled && setActiveModule(mod.id)}
              disabled={disabled}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : disabled
                  ? 'opacity-40 cursor-not-allowed text-sidebar-foreground/50'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
              title={disabled ? `${mod.label} (Próximamente)` : mod.label}
            >
              <mod.icon className="h-4.5 w-4.5 flex-shrink-0" size={18} />
              {sidebarOpen && <span>{mod.label}</span>}
              {sidebarOpen && disabled && <span className="ml-auto text-[8px] uppercase tracking-tighter opacity-50">Off</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-sidebar-border text-[10px] text-sidebar-foreground/50">
        {sidebarOpen && <span>CrediFacil / Olympus v1.0.0</span>}
      </div>
    </aside>
  );
};
