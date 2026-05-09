import { useState } from 'react';
import { Plus, Search, PenBox } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export const ProductosModule = () => {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialProduct = { codigo: '', nombre: '', categoria: 'Electrodomésticos', unidad: 'UNIDAD', precio: 0, stock: 0 };
  const [newProduct, setNewProduct] = useState(initialProduct);

  const { data, loading, add, update } = useCrud('productos');
  
  const filtered = data.filter(p => {
    const searchLower = search.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(searchLower) || 
      p.codigo?.toLowerCase().includes(searchLower) ||
      p.id?.toLowerCase().includes(searchLower)
    );
  });

  const handleSave = async () => {
    if (!newProduct.nombre || !newProduct.codigo) return;
    try {
      if (editingId) {
        await update(editingId, newProduct);
        setShowEdit(false);
        toast.success("Producto modificado");
      } else {
        await add(newProduct);
        setShowNew(false);
        toast.success("Producto creado");
      }
      setEditingId(null);
      setNewProduct(initialProduct);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar producto");
    }
  };

  const openEdit = (prod: any) => {
    setNewProduct({
      codigo: prod.codigo,
      nombre: prod.nombre,
      categoria: prod.categoria || 'Electrodomésticos',
      unidad: prod.unidad || 'UNIDAD',
      precio: prod.precio || 0,
      stock: prod.stock || 0
    });
    setEditingId(prod.id);
    setShowEdit(true);
  };

const FormFields = ({ newProduct, setNewProduct, editingId }: any) => (
  <div className="space-y-3 py-2">
    <div className="grid grid-cols-2 gap-3">
      <div><label className="text-xs text-muted-foreground">Código *</label><input className="erp-input w-full mt-1" placeholder="PRO-XXXX" value={newProduct.codigo} onChange={e => setNewProduct({...newProduct, codigo: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Nombre *</label><input className="erp-input w-full mt-1" placeholder="Descripción del producto" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} /></div>
      <div><label className="text-xs text-muted-foreground">Categoría</label>
        <select className="erp-input w-full mt-1" value={newProduct.categoria} onChange={e => setNewProduct({...newProduct, categoria: e.target.value})}>
          <option>Electrodomésticos</option><option>Limpieza</option><option>Alimentos</option><option>Ferretería</option>
        </select>
      </div>
      <div><label className="text-xs text-muted-foreground">Unidad</label>
        <select className="erp-input w-full mt-1" value={newProduct.unidad} onChange={e => setNewProduct({...newProduct, unidad: e.target.value})}>
          <option>UNIDAD</option><option>SACO</option><option>CAJA</option><option>GALÓN</option>
        </select>
      </div>
      <div><label className="text-xs text-muted-foreground">Precio (RD$)</label><input type="number" className="erp-input w-full mt-1" placeholder="0.00" value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: Number(e.target.value)})} /></div>
      <div><label className="text-xs text-muted-foreground">{editingId ? 'Stock Actual' : 'Stock Inicial'}</label><input type="number" className="erp-input w-full mt-1" placeholder="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} /></div>
    </div>
  </div>
);

export const ProductosModule = () => {

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Productos y Servicios</h2>
        <button className="erp-btn erp-btn-primary" onClick={() => { setNewProduct(initialProduct); setEditingId(null); setShowNew(true); }}><Plus size={14} /> Nuevo Producto</button>
      </div>

      <Dialog open={showNew || showEdit} onOpenChange={(open) => { if(!open){ setShowNew(false); setShowEdit(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{showEdit ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle></DialogHeader>
          <FormFields newProduct={newProduct} setNewProduct={setNewProduct} editingId={editingId} />
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
             <input placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="erp-input w-full pl-7 text-xs py-1" />
          </div>
        </div>
        <div className="overflow-auto min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">Cargando productos...</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr><th>Código</th><th>Descripción</th><th>Categoría</th><th>Unidad</th><th className="text-right">Precio</th><th className="text-right">Stock</th><th className="text-center">Acciones</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="font-medium">{p.codigo}</td>
                    <td>{p.nombre}</td>
                    <td className="text-muted-foreground">{p.categoria}</td>
                    <td>{p.unidad}</td>
                    <td className="text-right font-medium">{formatCurrency(p.precio)}</td>
                    <td className="text-right"><span className={Number(p.stock) < 10 ? 'text-erp-danger font-medium' : ''}>{p.stock}</span></td>
                    <td className="text-center">
                       <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:bg-muted rounded" title="Editar">
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
