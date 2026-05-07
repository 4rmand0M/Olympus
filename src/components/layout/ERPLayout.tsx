import { ERPSidebar } from './ERPSidebar';
import { ERPTopBar } from './ERPTopBar';
import { ERPRightPanel } from './ERPRightPanel';
import { AppProvider, useApp } from '@/context/AppContext';
import { DashboardModule } from '@/modules/DashboardModule';
import { FacturacionModule } from '@/modules/FacturacionModule';
import { ClientesModule } from '@/modules/ClientesModule';
import { ProductosModule } from '@/modules/ProductosModule';
import { InventarioModule } from '@/modules/InventarioModule';
import { CuentasCobrarModule } from '@/modules/CuentasCobrarModule';
import { ReportesModule } from '@/modules/ReportesModule';
import { ConfiguracionModule } from '@/modules/ConfiguracionModule';
import { UsuariosModule } from '@/modules/UsuariosModule';

const ModuleRouter = () => {
  const { activeModule } = useApp();

  const modules: Record<string, React.ReactNode> = {
    dashboard: <DashboardModule />,
    facturacion: <FacturacionModule />,
    clientes: <ClientesModule />,
    productos: <ProductosModule />,
    inventario: <InventarioModule />,
    'cuentas-cobrar': <CuentasCobrarModule />,
    reportes: <ReportesModule />,
    configuracion: <ConfiguracionModule />,
    usuarios: <UsuariosModule />,
  };

  return <>{modules[activeModule] || <DashboardModule />}</>;
};

const AppContent = () => {
  const { sidebarOpen, setSidebarOpen, rightPanelOpen, setRightPanelOpen } = useApp();
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Right Panel Overlay */}
      {rightPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setRightPanelOpen(false)}
        />
      )}

      <ERPSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ERPTopBar />
        <div className="flex flex-1 min-h-0 relative">
          <main className="flex-1 overflow-auto p-4 animate-fade-in">
            <ModuleRouter />
          </main>
          <ERPRightPanel />
        </div>
      </div>
    </div>
  );
};

export const ERPLayout = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};
