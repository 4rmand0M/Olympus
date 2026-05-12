import { useState } from 'react';
import { Building2, Receipt, Printer, Bell, Database, Globe, MapPin, Pencil, Check, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const sections = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'sucursales', label: 'Sucursales', icon: MapPin },
  { id: 'facturacion', label: 'Facturación', icon: Receipt },
  { id: 'impresion', label: 'Impresión', icon: Printer },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'sistema', label: 'Sistema', icon: Database },
  { id: 'regional', label: 'Regional', icon: Globe },
];

export const ConfiguracionModule = () => {
  const [active, setActive] = useState('empresa');
  const { sucursales, updateSucursal, addSucursal, removeSucursal } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddSucursal, setShowAddSucursal] = useState(false);
  const [newSucursalName, setNewSucursalName] = useState('');

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateSucursal(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleAddSucursal = () => {
    if (newSucursalName.trim()) {
      addSucursal(newSucursalName.trim());
      setNewSucursalName('');
      setShowAddSucursal(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl font-bold">Configuración</h2>
        <p className="text-sm text-muted-foreground">Ajustes generales del sistema</p>
      </div>

      <div className="flex gap-4">
        <div className="w-48 space-y-1 flex-shrink-0">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                active === s.id ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted'
              }`}>
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 erp-card p-5">
          {active === 'empresa' && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Datos de la Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Nombre Comercial</label><input className="erp-input w-full mt-1" defaultValue="OLYMPUS S.R.L" /></div>
                <div><label className="text-xs text-muted-foreground">RNC</label><input className="erp-input w-full mt-1" defaultValue="130-45678-9" /></div>
                <div><label className="text-xs text-muted-foreground">Dirección</label><input className="erp-input w-full mt-1" defaultValue="Av. 27 de Febrero #123, Santo Domingo" /></div>
                <div><label className="text-xs text-muted-foreground">Teléfono</label><input className="erp-input w-full mt-1" defaultValue="(809) 555-1234" /></div>
                <div><label className="text-xs text-muted-foreground">Email</label><input className="erp-input w-full mt-1" defaultValue="info@olympus.com.do" /></div>
                <div><label className="text-xs text-muted-foreground">Sitio Web</label><input className="erp-input w-full mt-1" defaultValue="www.olympus.com.do" /></div>
              </div>
              <button className="erp-btn erp-btn-primary mt-2">Guardar Cambios</button>
            </div>
          )}

          {active === 'sucursales' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold">Gestión de Sucursales</h3>
                <button className="erp-btn erp-btn-primary" onClick={() => setShowAddSucursal(true)}>
                  <MapPin size={14} /> Nueva Sucursal
                </button>
              </div>
              <div className="space-y-2">
                {sucursales.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded border border-border bg-muted/30">
                    <MapPin size={16} className="text-primary flex-shrink-0" />
                    {editingId === s.id ? (
                      <>
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="erp-input flex-1"
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && saveEdit()}
                        />
                        <button onClick={saveEdit} className="erp-btn erp-btn-primary text-xs"><Check size={14} /></button>
                        <button onClick={() => setEditingId(null)} className="erp-btn erp-btn-secondary text-xs"><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium">{s.name}</span>
                        <button onClick={() => startEdit(s.id, s.name)} className="erp-btn erp-btn-secondary text-xs">
                          <Pencil size={12} /> Editar
                        </button>
                        {sucursales.length > 1 && (
                          <button onClick={() => removeSucursal(s.id)} className="erp-btn text-xs text-destructive hover:bg-destructive/10">
                            <X size={12} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <Dialog open={showAddSucursal} onOpenChange={setShowAddSucursal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nueva Sucursal</DialogTitle>
                    <DialogDescription>Añada una nueva ubicación física para su empresa.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Nombre de la Sucursal</label>
                      <input value={newSucursalName} onChange={e => setNewSucursalName(e.target.value)} className="erp-input w-full mt-1" placeholder="Ej: OLYMPUS S.R.L - SUCURSAL ESTE" />
                    </div>
                  </div>
                  <DialogFooter>
                    <button className="erp-btn erp-btn-secondary" onClick={() => setShowAddSucursal(false)}>Cancelar</button>
                    <button className="erp-btn erp-btn-primary" onClick={handleAddSucursal}>Agregar</button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {active === 'facturacion' && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Configuración de Facturación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Serie de Factura</label><input className="erp-input w-full mt-1" defaultValue="B01" /></div>
                <div><label className="text-xs text-muted-foreground">Secuencia Actual</label><input className="erp-input w-full mt-1" defaultValue="000061220" /></div>
                <div><label className="text-xs text-muted-foreground">ITBIS (%)</label><input className="erp-input w-full mt-1" defaultValue="18" type="number" /></div>
                <div><label className="text-xs text-muted-foreground">Días de Crédito por Defecto</label><input className="erp-input w-full mt-1" defaultValue="30" type="number" /></div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="autoprint" defaultChecked className="rounded border-input" />
                <label htmlFor="autoprint" className="text-sm">Imprimir factura automáticamente al guardar</label>
              </div>
              <button className="erp-btn erp-btn-primary mt-2">Guardar Cambios</button>
            </div>
          )}
          {active === 'impresion' && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Configuración de Impresión</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Formato de Factura</label>
                  <select className="erp-input w-full mt-1"><option>Carta (8.5 x 11)</option><option>Media Carta</option><option>Ticket (80mm)</option></select>
                </div>
                <div><label className="text-xs text-muted-foreground">Impresora Predeterminada</label>
                  <select className="erp-input w-full mt-1"><option>Impresora PDF</option><option>EPSON TM-T20III</option></select>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="logo" defaultChecked className="rounded border-input" />
                <label htmlFor="logo" className="text-sm">Incluir logo en factura</label>
              </div>
              <button className="erp-btn erp-btn-primary mt-2">Guardar Cambios</button>
            </div>
          )}
          {active === 'notificaciones' && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Notificaciones</h3>
              {['Facturas vencidas', 'Nuevos pedidos', 'Pagos recibidos'].map(n => (
                <div key={n} className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">{n}</span>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </div>
              ))}
              <button className="erp-btn erp-btn-primary mt-2">Guardar Cambios</button>
            </div>
          )}
          {active === 'sistema' && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Respaldo Automático</label>
                  <select className="erp-input w-full mt-1"><option>Diario</option><option>Semanal</option><option>Mensual</option></select>
                </div>
                <div><label className="text-xs text-muted-foreground">Retención de Logs</label>
                  <select className="erp-input w-full mt-1"><option>30 días</option><option>60 días</option><option>90 días</option></select>
                </div>
              </div>
              <button className="erp-btn erp-btn-primary mt-2">Guardar Cambios</button>
            </div>
          )}
          {active === 'regional' && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Configuración Regional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Moneda</label>
                  <select className="erp-input w-full mt-1">
                    <option value="RD$">RD$ - Peso Dominicano</option>
                    <option value="USD">US$ - Dólar</option>
                  </select>
                </div>
                <div><label className="text-xs text-muted-foreground">Formato de Fecha</label>
                  <select className="erp-input w-full mt-1"><option>DD-MM-YYYY</option><option>MM-DD-YYYY</option><option>YYYY-MM-DD</option></select>
                </div>
                <div><label className="text-xs text-muted-foreground">Zona Horaria</label>
                  <select className="erp-input w-full mt-1"><option>America/Santo_Domingo (AST)</option></select>
                </div>
                <div><label className="text-xs text-muted-foreground">Idioma</label>
                  <select className="erp-input w-full mt-1"><option>Español</option><option>English</option></select>
                </div>
              </div>
              <button className="erp-btn erp-btn-primary mt-2">Guardar Cambios</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
