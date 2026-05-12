import { Search, Bell, ChevronDown, Menu, PanelRightOpen, PanelRightClose, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCrud } from '@/hooks/useCrud';


export const ERPTopBar = () => {
  const { activeSucursal, sucursales, setActiveSucursal, sidebarOpen, setSidebarOpen, rightPanelOpen, setRightPanelOpen } = useApp();
  const { user, profile, signOut } = useAuth();
  const [sucursalDropdown, setSucursalDropdown] = useState(false);
  
  const { data: notifications, loading: loadingNotifs } = useCrud('notificaciones');
  const [notifList, setNotifList] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (notifications) {
      setNotifList(notifications);
    }
  }, [notifications]);

  const unreadCount = notifList.filter(n => !n.leido).length;

  const markAllRead = () => {
    setNotifList(prev => prev.map(n => ({ ...n, leido: true })));
  };

  const markRead = (id: string) => {
    setNotifList(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
  };

  const displayName = user?.user_metadata?.full_name || profile?.full_name || 'Usuario';

  const initials = displayName
    ? displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'US';

  return (
    <header className="h-12 bg-topbar border-b border-topbar-border flex items-center px-3 gap-3 z-20 relative">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded hover:bg-muted">
        <Menu size={18} className="text-topbar-foreground" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          ref={searchInputRef}
          placeholder="Buscar en CrediFacil (Ctrl + B)" 
          className="erp-input w-full pl-8 py-1 text-xs" 
        />
      </div>

      <div className="flex-1" />

      {/* Sucursal */}
      <div className="relative">
        <button onClick={() => setSucursalDropdown(!sucursalDropdown)} className="erp-btn erp-btn-secondary text-xs gap-1">
          <span className="max-w-40 truncate">{activeSucursal.name}</span>
          <ChevronDown size={14} />
        </button>
        {sucursalDropdown && (
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-64 z-50">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Cambio de Sucursal</div>
            {sucursales.map(s => (
              <button key={s.id} onClick={() => { setActiveSucursal(s); setSucursalDropdown(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${s.id === activeSucursal.id ? 'bg-primary/10 text-primary font-medium' : ''}`}>
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1.5 rounded hover:bg-muted relative">
            <Bell size={18} className="text-topbar-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[hsl(var(--erp-danger))] text-[9px] text-white flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <h4 className="font-heading font-semibold text-sm">Notificaciones</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-primary hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-auto">
            {notifList.map(n => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${!n.leido ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {!n.leido && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                  <div className={!n.leido ? '' : 'ml-4'}>
                    <div className="text-xs font-medium">{n.titulo}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{n.descripcion}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Right panel toggle */}
      <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-1.5 rounded hover:bg-muted">
        {rightPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
      </button>

      {/* User */}
      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        <span className="text-xs font-medium hidden md:inline">{displayName}</span>
        <button onClick={signOut} className="p-1 rounded hover:bg-muted" title="Cerrar sesión">
          <LogOut size={14} className="text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};
