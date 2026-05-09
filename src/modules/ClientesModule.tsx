import { useState } from 'react';
import { Plus, Search, PenBox } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const FormFields = ({ newClient, setNewClient, editingId }: any) => (
  <div className="space-y-3 py-2">
    <div className="grid grid-cols-2 gap-3">
      <div><label className="text-xs text-muted-foreground">Nombre *</label><input className="erp-input w-full mt-1" value={newClient.nombre} onChange={e => setNewClient({...newClient, nombre: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">RNC</label><input className="erp-input w-full mt-1" value={newClient.rnc} onChange={e => setNewClient({...newClient, rnc: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Teléfono</label><input className="erp-input w-full mt-1" value={newClient.telefono} onChange={e => setNewClient({...newClient, telefono: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Dirección</label><input className="erp-input w-full mt-1" value={newClient.direccion} onChange={e => setNewClient({...newClient, direccion: e.target.value})} /></div>
    </div>
  </div>
);

export const ClientesModule = () => {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialClient = { nombre: '', rnc: '', telefono: '', direccion: '', estado: 'Activo', balance: 0 };
  const [newClient, setNewClient] = useState(initialClient);

  // Eliminamos 'ciudad' y otras columnas problemáticas
  const { data, loading, add, update } = useCrud('clientes', 'id, nombre, rnc, telefono, direccion, estado, balance, created_at');

  const filtered = data.filter(c => c.nombre?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!newClient.nombre) return;
    try {
      if (editingId) {
        await update(editingId, newClient);
        setShowEdit(false);
      } else {
        await add(newClient);
        setShowNew(false);
      }
      setEditingId(null);
      setNewClient(initialClient);
    } catch (e) { console.error(e); }
  };

  const openEdit = (client: any) => {
    setNewClient({
      nombre: client.nombre,
      rnc: client.rnc || '',
      telefono: client.telefono || '',
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
        <button className="erp-btn erp-btn-primary" onClick={() => { setNewClient(initialClient); setEditingId(null); setShowNew(true); }}><Plus size={14} /> Nuevo</button>
      </div>

      <Dialog open={showNew || showEdit} onOpenChange={(open) => { if (!open) { setShowNew(false); setShowEdit(false); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cliente</DialogTitle><DialogDescription>Ingrese detalles</DialogDescription></DialogHeader>
          <FormFields newClient={newClient} setNewClient={setNewClient} editingId={editingId} />
          <DialogFooter>
            <button className="erp-btn erp-btn-primary" onClick={handleSave}>Guardar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="erp-card">
        <div className="px-3 py-2 border-b border-border">
          <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="erp-input w-full text-xs py-1" />
        </div>
        <div className="overflow-auto">
          <table className="erp-table">
            <thead>
              <tr><th>Código</th><th>Nombre</th><th>RNC</th><th>Teléfono</th><th className="text-right">Balance</th><th>Estado</th><th className="text-center">Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="font-medium">{c.id.slice(0, 8)}</td>
                  <td>{c.nombre}</td>
                  <td>{c.rnc}</td>
                  <td>{c.telefono}</td>
                  <td className="text-right">{formatCurrency(c.balance || 0)}</td>
                  <td><span className="erp-badge">{c.estado}</span></td>
                  <td className="text-center"><button onClick={() => openEdit(c)}><PenBox size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
