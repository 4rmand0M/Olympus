import React, { createContext, useContext, useState, ReactNode } from 'react';

type Module = 'dashboard' | 'facturacion' | 'clientes' | 'productos' | 'inventario' | 'cuentas-cobrar' | 'reportes' | 'configuracion' | 'usuarios';

interface Sucursal {
  id: string;
  name: string;
}

interface AppContextType {
  activeModule: Module;
  setActiveModule: (m: Module) => void;
  activeSucursal: Sucursal;
  setActiveSucursal: (s: Sucursal) => void;
  sucursales: Sucursal[];
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (v: boolean) => void;
  updateSucursal: (id: string, name: string) => void;
  addSucursal: (name: string) => void;
  removeSucursal: (id: string) => void;
}

const initialSucursales: Sucursal[] = [
  { id: '10000000-0000-0000-0000-000000000001', name: 'OLYMPUS S.R.L - SEDE CENTRAL' },
  { id: '10000000-0000-0000-0000-000000000002', name: 'OLYMPUS S.R.L - SUCURSAL NORTE' },
  { id: '10000000-0000-0000-0000-000000000003', name: 'OLYMPUS S.R.L - SUCURSAL SUR' },
];

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [sucursales, setSucursales] = useState(initialSucursales);
  const [activeSucursal, setActiveSucursal] = useState(initialSucursales[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const updateSucursal = (id: string, name: string) => {
    setSucursales(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    if (activeSucursal.id === id) setActiveSucursal({ id, name });
  };

  const addSucursal = (name: string) => {
    const newId = String(Date.now());
    setSucursales(prev => [...prev, { id: newId, name }]);
  };

  const removeSucursal = (id: string) => {
    setSucursales(prev => prev.filter(s => s.id !== id));
    if (activeSucursal.id === id) {
      setSucursales(prev => {
        if (prev.length > 0) setActiveSucursal(prev[0]);
        return prev;
      });
    }
  };

  return (
    <AppContext.Provider value={{
      activeModule, setActiveModule,
      activeSucursal, setActiveSucursal,
      sucursales,
      sidebarOpen, setSidebarOpen,
      rightPanelOpen, setRightPanelOpen,
      updateSucursal, addSucursal, removeSucursal,
    }}>
      {children}
    </AppContext.Provider>
  );
};
