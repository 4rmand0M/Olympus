import { useState } from 'react';
import { Plus, Search, PenBox } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const FormFields = ({ newProduct, setNewProduct, editingId }: any) => (
  <div className="space-y-3 py-2">
    <div className="grid grid-cols-2 gap-3">
      <div><label className="text-xs text-muted-foreground">Código *</label><input className="erp-input w-full mt-1" placeholder="PRO-XXXX" value={newProduct.codigo} onChange={e => setNewProduct({...newProduct, codigo: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Nombre *</label><input className="erp-input w-full mt-1" placeholder="Descripción" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Precio (RD$)</label><input type="number" className="erp-input w-full mt-1" value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: Number(e.target.value)})} /></div>
      <div><label className="text-xs text-muted-foreground">Stock</label><input type="number" className="erp-input w-full mt-1" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} /></div>
    </div>
  </div>
);

export const ProductosModule = () => {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialProduct = { codigo: '', nombre: '', precio: 0, stock: 0 };
  const [newProduct, setNewProduct] = useState(initialProduct);

  // Eliminamos 'unidad' y otras columnas problemáticas de la consulta
  const { data, loading, add, update } = useCrud('productos', 'id, codigo, nombre, precio, stock, created_at');
  
  const filtered = data.filter(p => p.nombre?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!newProduct.nombre || !newProduct.codigo) return;
    try {
      if (editingId) {
        await update(editingId, newProduct);
        setShowEdit(false);
      } else {
        await add(newProduct);
        setShowNew(false);
      }
      setEditingId(null);
      setNewProduct(initialProduct);
    } catch (e) { console.error(e); }
  };

  const openEdit = (prod: any) => {
    setNewProduct({
      codigo: prod.codigo,
      nombre: prod.nombre,
      precio: prod.precio || 0,
      stock: prod.stock || 0
    });
    setEditingId(prod.id);
    setShowEdit(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Productos</h2>
        <button className="erp-btn erp-btn-primary" onClick={() => { setNewProduct(initialProduct); setEditingId(null); setShowNew(true); }}><Plus size={14} /> Nuevo</button>
      </div>

      <Dialog open={showNew || showEdit} onOpenChange={(open) => { if(!open){ setShowNew(false); setShowEdit(false); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Producto</DialogTitle><DialogDescription>Ingrese detalles</DialogDescription></DialogHeader>
          <FormFields newProduct={newProduct} setNewProduct={setNewProduct} editingId={editingId} />
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
              <tr><th>Código</th><th>Descripción</th><th className="text-right">Precio</th><th className="text-right">Stock</th><th className="text-center">Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="font-medium">{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td className="text-right">{formatCurrency(p.precio)}</td>
                  <td className="text-right">{p.stock}</td>
                  <td className="text-center"><button onClick={() => openEdit(p)}><PenBox size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
