import { useState } from 'react';
import { Plus, Search, Filter, RefreshCw, Download, FileText, ShoppingCart, ClipboardList, PenBox, Printer } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { toast } from 'sonner';

type DocType = 'FA' | 'PE' | 'CO';
type Estado = 'Todos' | 'Pendiente' | 'Cobrada' | 'Cancelada';

const docTypes = [
  { id: 'FA', label: 'Factura', icon: FileText },
  { id: 'PE', label: 'Pedido', icon: ShoppingCart },
  { id: 'CO', label: 'Cotización', icon: ClipboardList },
];

const FormFields = ({ newFac, setNewFac, clientes, handleSubtotalChange }: any) => (
  <div className="space-y-3 py-2">
    <div className="grid grid-cols-2 gap-3">
      <div><label className="text-xs text-muted-foreground">Fecha</label>
        <input type="date" className="erp-input w-full mt-1" value={newFac.fecha} onChange={e => setNewFac({...newFac, fecha: e.target.value})} />
      </div>
      <div><label className="text-xs text-muted-foreground">Estado</label>
        <select className="erp-input w-full mt-1" value={newFac.estado} onChange={e => setNewFac({...newFac, estado: e.target.value})}>
          <option value="Pendiente">Pendiente</option><option value="Cobrada">Cobrada</option><option value="Cancelada">Cancelada</option>
        </select>
      </div>
    </div>
    <div><label className="text-xs text-muted-foreground">Cliente</label>
      <select className="erp-input w-full mt-1" value={newFac.cliente_id} onChange={e => setNewFac({...newFac, cliente_id: e.target.value})}>
        <option value="">Consumidor Final</option>
        {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nombre} {c.rnc ? `(${c.rnc})` : ''}</option>)}
      </select>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div><label className="text-xs text-muted-foreground">Subtotal *</label>
        <input type="number" className="erp-input w-full mt-1" placeholder="0.00" value={newFac.subtotal || ''} onChange={e => handleSubtotalChange(Number(e.target.value))} />
      </div>
      <div><label className="text-xs text-muted-foreground">Impuesto (18%)</label>
        <input type="number" className="erp-input w-full mt-1 bg-muted/50" value={(newFac.impuesto || 0).toFixed(2)} readOnly />
      </div>
      <div><label className="text-xs text-muted-foreground font-bold">Total</label>
        <input type="number" className="erp-input w-full mt-1 bg-muted/50 font-bold" value={(newFac.total || 0).toFixed(2)} readOnly />
      </div>
    </div>
  </div>
);

export const FacturacionModule = () => {
  const { activeSucursal } = useApp();
  const [activeDocType, setActiveDocType] = useState<DocType>('FA');
  const [estadoFilter, setEstadoFilter] = useState<Estado>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  // Eliminamos 'moneda' y 'tipo_doc' de la consulta ya que el error dice que no existen
  const { data, loading, add, update, refetch } = useCrud('facturas', 'id, numero_factura, fecha, subtotal, impuesto, total, estado, created_at');
  const { data: clientes } = useCrud('clientes', 'id, nombre, rnc');
  const [saving, setSaving] = useState(false);

  const initialFacState = {
    fecha: new Date().toISOString().split('T')[0],
    cliente_id: '',
    subtotal: 0,
    impuesto: 0,
    total: 0,
    estado: 'Pendiente',
  };

  const [newFac, setNewFac] = useState(initialFacState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubtotalChange = (subtotal: number) => {
    const impuesto = subtotal * 0.18;
    setNewFac(prev => ({ ...prev, subtotal, impuesto, total: subtotal + impuesto }));
  };

  const handleCreateOrUpdate = async () => {
    if (!newFac.subtotal || newFac.subtotal <= 0) return;
    setSaving(true);
    try {
      if (editingId) {
        await update(editingId, {
          fecha: newFac.fecha,
          cliente_id: newFac.cliente_id || null,
          subtotal: newFac.subtotal,
          impuesto: newFac.impuesto,
          total: newFac.total,
          estado: newFac.estado,
        });
        toast.success("Documento actualizado");
        setShowEdit(false);
      } else {
        const numero = `FAC-${String(data.length + 1).padStart(9, '0')}`;
        await add({
          numero_factura: numero,
          fecha: newFac.fecha,
          cliente_id: newFac.cliente_id || null,
          subtotal: newFac.subtotal,
          impuesto: newFac.impuesto,
          total: newFac.total,
          estado: newFac.estado,
        });
        toast.success("Documento creado");
        setShowNew(false);
      }
      setNewFac(initialFacState);
      setEditingId(null);
      refetch();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const openEdit = (inv: any) => {
    setNewFac({
      fecha: inv.fecha || new Date().toISOString().split('T')[0],
      cliente_id: inv.cliente_id || '',
      subtotal: inv.subtotal,
      impuesto: inv.impuesto || 0,
      total: inv.total,
      estado: inv.estado || 'Pendiente',
    });
    setEditingId(inv.id);
    setShowEdit(true);
  };

  const printPDF = (inv: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const subtotalStr = formatCurrency(inv.subtotal, 'RD$');
    const itbisStr = formatCurrency(inv.impuesto, 'RD$');
    const totalStr = formatCurrency(inv.total, 'RD$');
    const dateStr = formatDate(new Date());
    const timeStr = formatTime(new Date());

    printWindow.document.write(`
      <html>
        <head><title>Factura ${inv.numero_factura}</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="color: #1f4296;">CREDIFACIL</h1>
          <p style="font-size: 10px; color: #666; margin-top: -10px;">Plataforma de Facturación — Olympus ERP</p>
          <p>Factura: ${inv.numero_factura}</p>
          <p>Fecha: ${inv.fecha}</p>
          <hr/>
          <p>Subtotal: ${subtotalStr}</p>
          <p>Impuesto: ${itbisStr}</p>
          <h3>Total: ${totalStr}</h3>
          <p>Generado: ${dateStr} ${timeStr}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filtered = data.filter(inv => {
    if (estadoFilter !== 'Todos' && inv.estado !== estadoFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!inv.numero_factura?.toLowerCase().includes(search)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Facturación
          </h2>
        </div>
        <button className="erp-btn erp-btn-primary" onClick={() => { setNewFac(initialFacState); setEditingId(null); setShowNew(true); }}>
          <Plus size={14} /> Nueva Factura
        </button>
      </div>

      <Dialog open={showNew || showEdit} onOpenChange={(open) => { if(!open) { setShowNew(false); setShowEdit(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{showEdit ? 'Editar Factura' : 'Nueva Factura'}</DialogTitle>
            <DialogDescription>Complete los datos del documento abajo.</DialogDescription>
          </DialogHeader>
          <FormFields newFac={newFac} setNewFac={setNewFac} clientes={clientes} handleSubtotalChange={handleSubtotalChange} />
          <DialogFooter>
            <button className="erp-btn erp-btn-secondary" onClick={() => { setShowNew(false); setShowEdit(false); }}>Cancelar</button>
            <button className="erp-btn erp-btn-primary" onClick={handleCreateOrUpdate} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="erp-card">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar número..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="erp-input w-full pl-7 text-xs py-1" />
          </div>
          <div className="flex gap-1">
            {(['Todos', 'Pendiente', 'Cobrada'] as Estado[]).map(e => (
              <button key={e} onClick={() => setEstadoFilter(e)} className={`px-2 py-0.5 rounded text-[10px] ${estadoFilter === e ? 'bg-primary text-white' : 'bg-muted'}`}>{e}</button>
            ))}
          </div>
        </div>

        <div className="overflow-auto min-h-[400px]">
          <table className="erp-table">
            <thead>
              <tr><th>Número</th><th>Fecha</th><th>Total</th><th>Estado</th><th className="text-center">Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td className="font-medium">{inv.numero_factura}</td>
                  <td>{inv.fecha}</td>
                  <td className="font-medium">{formatCurrency(inv.total, 'RD$')}</td>
                  <td><span className="erp-badge">{inv.estado}</span></td>
                  <td className="text-center flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(inv)} className="p-1"><PenBox size={14}/></button>
                    <button onClick={() => printPDF(inv)} className="p-1"><Printer size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
