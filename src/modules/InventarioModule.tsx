import { useState } from 'react';
import { Search, Plus, Package, AlertTriangle, PenBox } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export const InventarioModule = () => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'stock' | 'movimientos'>('stock');
  
  // Usamos columnas explícitas para evitar errores de esquema
  const { data: inventarioData, loading, update: updateProd } = useCrud('productos', 'id, codigo, nombre, precio, stock, created_at');
  const { data: movimientos, add: addMov, update: updateMov } = useCrud('movimientos_inventario', 'id, producto_id, tipo, cantidad, referencia, created_at');
  
  const [showMov, setShowMov] = useState(false);
  const [showEditProd, setShowEditProd] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newMov, setNewMov] = useState({ producto_id: '', tipo: 'Entrada', cantidad: 0, referencia: '' });
  const [editingMovId, setEditingMovId] = useState<string | null>(null);
  const [editingProd, setEditingProd] = useState({ id: '', stock: 0, min_stock: 10 });

  const lowStock = inventarioData.filter(i => i.stock < 10);
  const filtered = inventarioData.filter(i => {
    const searchLower = search.toLowerCase();
    return (
      i.nombre?.toLowerCase().includes(searchLower) || 
      i.codigo?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddOrUpdateMov = async () => {
    if (!newMov.producto_id || newMov.cantidad <= 0) return;
    setSaving(true);
    try {
      if (editingMovId) {
        await updateMov(editingMovId, {
          producto_id: newMov.producto_id,
          tipo: newMov.tipo,
          cantidad: newMov.cantidad,
          referencia: newMov.referencia || null,
        });
        toast.success("Movimiento actualizado");
      } else {
        await addMov({
          producto_id: newMov.producto_id,
          tipo: newMov.tipo,
          cantidad: newMov.cantidad,
          referencia: newMov.referencia || null,
        });
        toast.success("Movimiento registrado");
      }
      setShowMov(false);
      setEditingMovId(null);
      setNewMov({ producto_id: '', tipo: 'Entrada', cantidad: 0, referencia: '' });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleUpdateProdStock = async () => {
    setSaving(true);
    try {
      await updateProd(editingProd.id, { stock: editingProd.stock });
      toast.success("Inventario actualizado");
      setShowEditProd(false);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const openEditMov = (m: any) => {
    setNewMov({ producto_id: m.producto_id, tipo: m.tipo, cantidad: m.cantidad, referencia: m.referencia || '' });
    setEditingMovId(m.id);
    setShowMov(true);
  };

  const openEditProdStock = (p: any) => {
    setEditingProd({ id: p.id, stock: p.stock, min_stock: 10 });
    setShowEditProd(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Inventario</h2>
        <button className="erp-btn erp-btn-primary" onClick={() => setShowMov(true)}><Plus size={14} /> Movimiento</button>
      </div>

      <Dialog open={showMov} onOpenChange={setShowMov}>
        <DialogContent>
          <DialogHeader><DialogTitle>Movimiento</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <select className="erp-input w-full mt-1" value={newMov.producto_id} onChange={e => setNewMov({...newMov, producto_id: e.target.value})}>
              <option value="">Seleccionar producto...</option>
              {inventarioData.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <input type="number" className="erp-input w-full mt-1" placeholder="Cantidad" value={newMov.cantidad || ''} onChange={e => setNewMov({...newMov, cantidad: Number(e.target.value)})} />
          </div>
          <DialogFooter><button className="erp-btn erp-btn-primary" onClick={handleAddOrUpdateMov}>Guardar</button></DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="erp-card">
        <div className="flex gap-2 p-2">
           <button onClick={() => setTab('stock')} className={`px-3 py-1 text-sm ${tab === 'stock' ? 'bg-primary text-white' : 'bg-muted'}`}>Stock</button>
           <button onClick={() => setTab('movimientos')} className={`px-3 py-1 text-sm ${tab === 'movimientos' ? 'bg-primary text-white' : 'bg-muted'}`}>Movimientos</button>
        </div>
        <div className="overflow-auto min-h-[300px]">
          {tab === 'stock' ? (
            <table className="erp-table">
              <thead><tr><th>Código</th><th>Producto</th><th className="text-right">Stock</th><th className="text-center">Ajustar</th></tr></thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id}>
                    <td>{i.codigo}</td>
                    <td>{i.nombre}</td>
                    <td className="text-right">{i.stock}</td>
                    <td className="text-center"><button onClick={() => openEditProdStock(i)}><PenBox size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="erp-table">
              <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th className="text-right">Cantidad</th></tr></thead>
              <tbody>
                {movimientos.map((m: any) => (
                  <tr key={m.id}>
                    <td>{formatDate(m.created_at)}</td>
                    <td>{m.tipo}</td>
                    <td>{inventarioData.find(p => p.id === m.producto_id)?.nombre || '—'}</td>
                    <td className="text-right">{m.cantidad}</td>
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
