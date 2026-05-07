import { useState } from 'react';
import { Search, Plus, Package, AlertTriangle, PenBox } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { toast } from 'sonner';

export const InventarioModule = () => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'stock' | 'movimientos'>('stock');
  const { data: inventarioData, loading, update: updateProd } = useCrud('productos');
  const { data: movimientos, add: addMov, update: updateMov } = useCrud('movimientos_inventario');
  const [showMov, setShowMov] = useState(false);
  const [showEditProd, setShowEditProd] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newMov, setNewMov] = useState({ producto_id: '', tipo: 'Entrada', cantidad: 0, referencia: '' });
  const [editingMovId, setEditingMovId] = useState<string | null>(null);
  
  const [editingProd, setEditingProd] = useState({ id: '', stock: 0, min_stock: 10 });

  const lowStock = inventarioData.filter(i => i.stock < (i.min_stock || 10));
  const filtered = inventarioData.filter(i => {
    const searchLower = search.toLowerCase();
    return (
      i.nombre?.toLowerCase().includes(searchLower) || 
      i.codigo?.toLowerCase().includes(searchLower) ||
      i.id?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddOrUpdateMov = async () => {
    if (!newMov.producto_id || newMov.cantidad <= 0) {
      alert('Selecciona un producto y una cantidad válida');
      return;
    }
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
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar movimiento");
    }
    setSaving(false);
  };

  const handleUpdateProdStock = async () => {
    setSaving(true);
    try {
      await updateProd(editingProd.id, {
        stock: editingProd.stock,
        min_stock: editingProd.min_stock
      });
      toast.success("Niveles de inventario actualizados");
      setShowEditProd(false);
    } catch (e) {
      console.error(e);
      toast.error("Error al actualizar inventario");
    }
    setSaving(false);
  };

  const openEditMov = (m: any) => {
    setNewMov({
      producto_id: m.producto_id,
      tipo: m.tipo,
      cantidad: m.cantidad,
      referencia: m.referencia || ''
    });
    setEditingMovId(m.id);
    setShowMov(true);
  };

  const openEditProdStock = (p: any) => {
    setEditingProd({
      id: p.id,
      stock: p.stock,
      min_stock: p.min_stock || 10
    });
    setShowEditProd(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold flex items-center gap-2">
          <Package size={20} className="text-primary" /> Inventario
        </h2>
        <button className="erp-btn erp-btn-primary" onClick={() => { setNewMov({ producto_id: '', tipo: 'Entrada', cantidad: 0, referencia: '' }); setEditingMovId(null); setShowMov(true); }}>
          <Plus size={14} /> Registrar Movimiento
        </button>
      </div>

      {/* Dialog Registro/Edición de movimiento */}
      <Dialog open={showMov} onOpenChange={setShowMov}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingMovId ? 'Editar Movimiento' : 'Registrar Movimiento'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><label className="text-xs text-muted-foreground">Producto *</label>
              <select className="erp-input w-full mt-1" value={newMov.producto_id} onChange={e => setNewMov({...newMov, producto_id: e.target.value})}>
                <option value="">Seleccionar producto...</option>
                {inventarioData.map(p => <option key={p.id} value={p.id}>{p.codigo} — {p.nombre}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Tipo</label>
                <select className="erp-input w-full mt-1" value={newMov.tipo} onChange={e => setNewMov({...newMov, tipo: e.target.value})}>
                  <option value="Entrada">Entrada</option><option value="Salida">Salida</option>
                </select>
              </div>
              <div><label className="text-xs text-muted-foreground">Cantidad *</label>
                <input type="number" min="1" className="erp-input w-full mt-1" placeholder="0" value={newMov.cantidad || ''} onChange={e => setNewMov({...newMov, cantidad: Number(e.target.value)})} />
              </div>
            </div>
            <div><label className="text-xs text-muted-foreground">Referencia (Factura, Compra, etc.)</label>
              <input className="erp-input w-full mt-1" placeholder="FAC-000061219" value={newMov.referencia} onChange={e => setNewMov({...newMov, referencia: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <button className="erp-btn erp-btn-secondary" onClick={() => setShowMov(false)}>Cancelar</button>
            <button className="erp-btn erp-btn-primary" onClick={handleAddOrUpdateMov} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modificación Stock de Producto */}
      <Dialog open={showEditProd} onOpenChange={setShowEditProd}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Ajustar Inventario</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><label className="text-xs text-muted-foreground">Stock Actual</label>
              <input type="number" className="erp-input w-full mt-1" value={editingProd.stock} onChange={e => setEditingProd({...editingProd, stock: Number(e.target.value)})} />
            </div>
            <div><label className="text-xs text-muted-foreground">Stock Mínimo (Alerta)</label>
              <input type="number" className="erp-input w-full mt-1" value={editingProd.min_stock} onChange={e => setEditingProd({...editingProd, min_stock: Number(e.target.value)})} />
            </div>
          </div>
          <DialogFooter>
            <button className="erp-btn erp-btn-secondary" onClick={() => setShowEditProd(false)}>Cancelar</button>
            <button className="erp-btn erp-btn-primary" onClick={handleUpdateProdStock} disabled={saving}>{saving ? 'Guardando...' : 'Aplicar'}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-2 bg-erp-warning/10 border border-erp-warning/30 rounded px-3 py-2 text-xs">
          <AlertTriangle size={14} className="text-erp-warning" />
          <span><strong>{lowStock.length} productos</strong> por debajo del stock mínimo</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button onClick={() => setTab('stock')} className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${tab === 'stock' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Stock Actual
        </button>
        <button onClick={() => setTab('movimientos')} className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${tab === 'movimientos' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Movimientos ({movimientos.length})
        </button>
      </div>

      {tab === 'stock' ? (
        <div className="erp-card">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="erp-input w-full pl-7 text-xs py-1" />
            </div>
          </div>
          <div className="overflow-auto min-h-[300px]">
            {loading ? (
               <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">Cargando inventario...</div>
            ) : (
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="text-right">Stock</th>
                    <th className="text-right">Mín.</th>
                    <th className="text-right">Costo Unit.</th>
                    <th className="text-right">Valor Total</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(i => {
                    const low = i.stock < (i.min_stock || 10);
                    const costoSimulado = Number(i.precio || 0) * 0.7;
                    return (
                      <tr key={i.id} className="hover:bg-muted/30">
                        <td className="font-medium">{i.codigo}</td>
                        <td>{i.nombre}</td>
                        <td className="text-muted-foreground">{i.categoria}</td>
                        <td className={`text-right font-medium ${low ? 'text-erp-danger' : ''}`}>{i.stock}</td>
                        <td className="text-right text-muted-foreground">{i.min_stock || 10}</td>
                        <td className="text-right">RD$ {costoSimulado.toLocaleString('es-DO', { maximumFractionDigits: 2 })}</td>
                        <td className="text-right font-medium">RD$ {(i.stock * costoSimulado).toLocaleString('es-DO', { maximumFractionDigits: 2 })}</td>
                        <td>
                          <span className={`erp-badge ${low ? 'erp-badge-cancelled' : 'erp-badge-active'}`}>
                            {low ? 'Bajo' : 'OK'}
                          </span>
                        </td>
                        <td className="text-center">
                           <button onClick={() => openEditProdStock(i)} className="p-1.5 text-muted-foreground hover:bg-muted rounded" title="Ajustar">
                             <PenBox size={14} />
                           </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="erp-card">
          <div className="overflow-auto min-h-[300px]">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Producto</th>
                  <th className="text-right">Cantidad</th>
                  <th>Referencia</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted-foreground py-6">No hay movimientos registrados aún. Usa "Registrar Movimiento" para agregar uno.</td></tr>
                ) : (
                  movimientos.map((m: any) => {
                    const prod = inventarioData.find(p => p.id === m.producto_id);
                    return (
                      <tr key={m.id} className="hover:bg-muted/30">
                        <td>{new Date(m.created_at).toLocaleDateString('es-DO')}</td>
                        <td>
                          <span className={`erp-badge ${m.tipo === 'Entrada' ? 'erp-badge-active' : 'erp-badge-pending'}`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td>{prod?.nombre || m.producto_id?.slice(0, 8)}</td>
                        <td className="text-right font-medium">{m.cantidad}</td>
                        <td className="text-muted-foreground">{m.referencia || '—'}</td>
                        <td className="text-center">
                           <button onClick={() => openEditMov(m)} className="p-1.5 text-muted-foreground hover:bg-muted rounded" title="Editar">
                             <PenBox size={14} />
                           </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
