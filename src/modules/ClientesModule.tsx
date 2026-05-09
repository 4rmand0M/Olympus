import { useState } from 'react';
import { Plus, Search, PenBox } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const FormFields = ({ newClient, setNewClient, editingId }: any) => (
  <div className="space-y-3 py-2">
    <div className="grid grid-cols-2 gap-3">
      <div><label className="text-xs text-muted-foreground bg-bac">Nombre / Razón Social *</label><input className="erp-input w-full mt-1" placeholder="Ej: Empresa SRL" value={newClient.nombre} onChange={e => setNewClient({...newClient, nombre: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">RNC / Cédula</label><input className="erp-input w-full mt-1" placeholder="000000000000" value={newClient.rnc} onChange={e => setNewClient({...newClient, rnc: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Teléfono</label><input className="erp-input w-full mt-1" placeholder="809-000-0000" value={newClient.telefono} onChange={e => setNewClient({...newClient, telefono: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Email</label><input className="erp-input w-full mt-1" type="email" placeholder="email@ejemplo.com" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Ciudad</label><input className="erp-input w-full mt-1" placeholder="Santo Domingo" value={newClient.ciudad} onChange={e => setNewClient({...newClient, ciudad: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Dirección</label><input className="erp-input w-full mt-1" placeholder="Calle, Sector" value={newClient.direccion} onChange={e => setNewClient({...newClient, direccion: e.target.value})} /></div>
      {editingId && (
        <>
          <div><label className="text-xs text-muted-foreground">Estado</label>
            <select className="erp-input w-full mt-1" value={newClient.estado} onChange={e => setNewClient({...newClient, estado: e.target.value})}>
              <option value="Activo">Activo</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          <div><label className="text-xs text-muted-foreground">Balance</label><input className="erp-input w-full mt-1" type="number" placeholder="0.00" value={newClient.balance} onChange={e => setNewClient({...newClient, balance: Number(e.target.value)})} /></div>
        </>
      )}
    </div>
  </div>
);

export const ClientesModule = () => {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialClient = { nombre: '', rnc: '', telefono: '', email: '', ciudad: '', direccion: '', estado: 'Activo', balance: 0 };
  const [newClient, setNewClient] = useState(initialClient);

  const { data, loading, add, update } = useCrud('clientes');

  const filtered = data.filter(c => {
    const searchLower = search.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(searchLower) || 
      c.rnc?.includes(searchLower) ||
      c.id?.toLowerCase().includes(searchLower)
    );
  });

  const handleSave = async () => {
    if (!newClient.nombre) return;
    try {
      if (editingId) {
        await update(editingId, newClient);
        setShowEdit(false);
        toast.success("Cliente actualizado");
      } else {
        await add(newClient);
        setShowNew(false);
        toast.success("Cliente guardado");
      }
      setEditingId(null);
      setNewClient(initialClient);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar cliente");
    }
  };

  const openEdit = (client: any) => {
    setNewClient({
      nombre: client.nombre,
      rnc: client.rnc || '',
      telefono: client.telefono || '',
      email: client.email || '',
      ciudad: client.ciudad || '',
      direccion: client.direccion || '',
      estado: client.estado || 'Activo',
      balance: client.balance || 0
    });
    setEditingId(client.id);
    setShowEdit(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Clientes</h2>
        <button className="erp-btn erp-btn-primary" onClick={() => { setNewClient(initialClient); setEditingId(null); setShowNew(true); }}><Plus size={14} /> Nuevo Cliente</button>
      </div>

      <Dialog open={showNew || showEdit} onOpenChange={(open) => { if (!open) { setShowNew(false); setShowEdit(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{showEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle></DialogHeader>
          <FormFields newClient={newClient} setNewClient={setNewClient} editingId={editingId} />
          <DialogFooter>
            <button className="erp-btn erp-btn-secondary" onClick={() => { setShowNew(false); setShowEdit(false); }}>Cancelar</button>
            <button className="erp-btn erp-btn-primary" onClick={handleSave}>Guardar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="erp-card">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar por nombre o RNC..." value={search} onChange={e => setSearch(e.target.value)} className="erp-input w-full pl-7 text-xs py-1" />
          </div>
        </div>
        <div className="overflow-auto min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">Cargando clientes...</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr><th>Código</th><th>Nombre / Razón Social</th><th>RNC / Cédula</th><th>Teléfono</th><th>Ciudad</th><th className="text-right">Balance</th><th>Estado</th><th className="text-center">Acciones</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="font-medium">{c.id.slice(0, 8)}</td>
                    <td>{c.nombre}</td>
                    <td className="text-muted-foreground">{c.rnc}</td>
                    <td className="text-muted-foreground">{c.telefono}</td>
                    <td>{c.ciudad}</td>
                    <td className="text-right font-medium">{formatCurrency(c.balance || 0)}</td>
                    <td><span className={`erp-badge ${c.estado === 'Activo' ? 'erp-badge-active' : 'erp-badge-cancelled'}`}>{c.estado}</span></td>
                    <td className="text-center">
                       <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:bg-muted rounded" title="Editar">
                         <PenBox size={14} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
