import { useState } from 'react';
import { Plus, Search, Filter, RefreshCw, Download, FileText, ShoppingCart, ClipboardList, PenBox, Printer } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCrud } from '@/hooks/useCrud';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

type DocType = 'FA' | 'PE' | 'CO';
type Estado = 'Todos' | 'Pendiente' | 'Cobrada' | 'Cancelada';

const docTypes = [
  { id: 'FA', label: 'Factura', icon: FileText },
  { id: 'PE', label: 'Pedido', icon: ShoppingCart },
  { id: 'CO', label: 'Cotización', icon: ClipboardList },
];

const FormFields = ({ newFac, setNewFac, clientes, handleSubtotalChange, editingId }: any) => (
  <div className="space-y-3 py-2">
    <div className="grid grid-cols-2 gap-3">
      <div><label className="text-xs text-muted-foreground">Tipo de Documento</label>
        <select className="erp-input w-full mt-1" value={newFac.tipo_doc} onChange={e => setNewFac({...newFac, tipo_doc: e.target.value})}>
          <option value="FA">Factura</option><option value="PE">Pedido</option><option value="CO">Cotización</option>
        </select>
      </div>
      <div><label className="text-xs text-muted-foreground">Fecha</label>
        <input type="date" className="erp-input w-full mt-1" value={newFac.fecha} onChange={e => setNewFac({...newFac, fecha: e.target.value})} />
      </div>
    </div>
    <div><label className="text-xs text-muted-foreground">Cliente</label>
      <select className="erp-input w-full mt-1" value={newFac.cliente_id} onChange={e => setNewFac({...newFac, cliente_id: e.target.value})}>
        <option value="">Consumidor Final</option>
        {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nombre} {c.rnc ? `(${c.rnc})` : ''}</option>)}
      </select>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className="text-xs text-muted-foreground">Tipo de Moneda</label>
        <select className="erp-input w-full mt-1" value={newFac.moneda} onChange={e => setNewFac({...newFac, moneda: e.target.value})}>
          <option value="RD$">RD$</option><option value="USD">US$</option>
        </select>
      </div>
      <div><label className="text-xs text-muted-foreground">Estado</label>
        <select className="erp-input w-full mt-1" value={newFac.estado} onChange={e => setNewFac({...newFac, estado: e.target.value})}>
          <option value="Pendiente">Pendiente</option><option value="Cobrada">Cobrada</option><option value="Cancelada">Cancelada</option>
        </select>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div><label className="text-xs text-muted-foreground">Subtotal *</label>
        <input type="number" className="erp-input w-full mt-1" placeholder="0.00" value={newFac.subtotal || ''} onChange={e => handleSubtotalChange(Number(e.target.value))} />
      </div>
      <div><label className="text-xs text-muted-foreground">ITBIS (18%)</label>
        <input type="number" className="erp-input w-full mt-1 bg-muted/50" value={newFac.itbis.toFixed(2)} readOnly />
      </div>
      <div><label className="text-xs text-muted-foreground font-bold">Total</label>
        <input type="number" className="erp-input w-full mt-1 bg-muted/50 font-bold" value={newFac.total.toFixed(2)} readOnly />
      </div>
    </div>
    <div><label className="text-xs text-muted-foreground">Observaciones</label>
      <textarea className="erp-input w-full mt-1" rows={2} placeholder="Notas adicionales..." value={newFac.observaciones} onChange={e => setNewFac({...newFac, observaciones: e.target.value})} />
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
  
  const { data, loading, add, update, refetch } = useCrud('facturas', '*, cliente:clientes(*)');
  const { data: clientes } = useCrud('clientes');
  const [saving, setSaving] = useState(false);

  const initialFacState = {
    tipo_doc: 'FA',
    fecha: new Date().toISOString().split('T')[0],
    cliente_id: '',
    subtotal: 0,
    itbis: 0,
    impuesto: 0,
    total: 0,
    moneda: 'RD$',
    metodo_pago: 'Contado',
    estado: 'Pendiente',
    observaciones: '',
  };

  const [newFac, setNewFac] = useState(initialFacState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubtotalChange = (subtotal: number) => {
    const itbis = subtotal * 0.18;
    setNewFac(prev => ({ ...prev, subtotal, itbis, impuesto: itbis, total: subtotal + itbis }));
  };

  const handleCreateOrUpdate = async () => {
    if (!newFac.subtotal || newFac.subtotal <= 0) {
      alert('El subtotal debe ser mayor a 0');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await update(editingId, {
          tipo_doc: newFac.tipo_doc,
          fecha: newFac.fecha,
          cliente_id: newFac.cliente_id || null,
          subtotal: newFac.subtotal,
          itbis: newFac.itbis,
          impuesto: newFac.impuesto,
          total: newFac.total,
          moneda: newFac.moneda,
          metodo_pago: newFac.metodo_pago,
          estado: newFac.estado,
          sucursal_id: activeSucursal.id,
        });
        toast.success("Documento actualizado exitosamente");
        setShowEdit(false);
      } else {
        const numero = `FAC-${String(data.length + 1).padStart(9, '0')}`;
        await add({
          numero_factura: numero,
          tipo_doc: newFac.tipo_doc,
          fecha: newFac.fecha,
          cliente_id: newFac.cliente_id || null,
          subtotal: newFac.subtotal,
          itbis: newFac.itbis,
          impuesto: newFac.impuesto,
          total: newFac.total,
          moneda: newFac.moneda,
          metodo_pago: newFac.metodo_pago,
          estado: newFac.estado,
          sucursal_id: activeSucursal.id,
        });
        toast.success("Documento creado exitosamente");
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
      tipo_doc: inv.tipo_doc || 'FA',
      fecha: inv.fecha || new Date().toISOString().split('T')[0],
      cliente_id: inv.cliente_id || '',
      subtotal: inv.subtotal,
      itbis: inv.itbis || 0,
      impuesto: inv.impuesto || 0,
      total: inv.total,
      moneda: inv.moneda || 'RD$',
      metodo_pago: inv.metodo_pago || 'Contado',
      estado: inv.estado || 'Pendiente',
      observaciones: inv.observaciones || '',
    });
    setEditingId(inv.id);
    setShowEdit(true);
  };

  const printPDF = (inv: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const isDoc = inv.tipo_doc === 'FA' ? 'Factura' : inv.tipo_doc === 'PE' ? 'Pedido' : 'Cotización';
    const subtotalStr = formatCurrency(inv.subtotal, inv.moneda);
    const itbisStr = formatCurrency(inv.impuesto, inv.moneda);
    const totalStr = formatCurrency(inv.total, inv.moneda);
    const dateStr = new Date().toLocaleDateString('es-DO');
    const timeStr = new Date().toLocaleTimeString('es-DO');

    printWindow.document.write(`
      <html>
        <head>
          <title>${isDoc} ${inv.numero_factura}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0 0 10px 0; font-size: 24px; text-transform: uppercase; }
            .header p { margin: 5px 0; color: #666; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box { padding: 15px; background: #f9f9f9; border-radius: 8px; }
            .info-box h3 { margin: 0 0 10px 0; font-size: 14px; color: #555; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { text-transform: uppercase; font-size: 12px; color: #666; }
            .text-right { text-align: right; }
            .totals { width: 300px; margin-left: auto; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .totals-row.grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 12px; margin-top: 5px; }
            .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OLYMPUS BILLING SYSTEMS</h1>
            <p>Sucursal: ${activeSucursal?.name || 'Sede Central'}</p>
            <p>RNC: 1-32-45678-9 | Tel: (809) 555-0123</p>
          </div>
          
          <div class="info-grid">
            <div class="info-box">
              <h3>Datos del Cliente</h3>
              <p><strong>Nombre:</strong> ${inv.cliente?.nombre || 'Consumidor Final'}</p>
              ${inv.cliente?.rnc ? `<p><strong>RNC/Cédula:</strong> ${inv.cliente.rnc}</p>` : ''}
              ${inv.cliente?.telefono ? `<p><strong>Teléfono:</strong> ${inv.cliente.telefono}</p>` : ''}
            </div>
            <div class="info-box text-right">
              <h3>Detalles del Documento</h3>
              <p><strong>Tipo:</strong> ${isDoc}</p>
              <p><strong>Número:</strong> ${inv.numero_factura}</p>
              <p><strong>Fecha:</strong> ${inv.fecha}</p>
              <p><strong>Estado:</strong> ${inv.estado}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Servicios / Productos Facturados</td>
                <td class="text-right">${subtotalStr}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${subtotalStr}</span>
            </div>
            <div class="totals-row">
               <span>ITBIS (18%):</span>
               <span>${itbisStr}</span>
            </div>
            <div class="totals-row grand-total">
               <span>TOTAL A PAGAR:</span>
               <span>${totalStr}</span>
            </div>
          </div>

          <div class="footer">
            <p>¡Gracias por preferir Olympus Billing Systems!</p>
            <p>Documento generado el ${dateStr} ${timeStr}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const filtered = data.filter(inv => {
    if (inv.tipo_doc !== activeDocType) return false;
    if (estadoFilter !== 'Todos' && inv.estado !== estadoFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchCliente = inv.cliente?.nombre?.toLowerCase().includes(search);
      const matchNumero = inv.numero_factura?.toLowerCase().includes(search);
      const matchId = inv.id?.toLowerCase().includes(search);
      if (!matchCliente && !matchNumero && !matchId) return false;
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
          <p className="text-xs text-muted-foreground">Sucursal: {activeSucursal.name}</p>
        </div>
        <button className="erp-btn erp-btn-primary" onClick={() => { setNewFac(initialFacState); setEditingId(null); setShowNew(true); }}>
          <Plus size={14} /> Nuevo Documento
        </button>
      </div>

      <Dialog open={showNew || showEdit} onOpenChange={(open) => { if(!open) { setShowNew(false); setShowEdit(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{showEdit ? 'Editar Documento' : 'Nuevo Documento'}</DialogTitle></DialogHeader>
          <FormFields 
            newFac={newFac} 
            setNewFac={setNewFac} 
            clientes={clientes} 
            handleSubtotalChange={handleSubtotalChange} 
            editingId={editingId} 
          />
          <DialogFooter>
            <button className="erp-btn erp-btn-secondary" onClick={() => { setShowNew(false); setShowEdit(false); }}>Cancelar</button>
            <button className="erp-btn erp-btn-primary" onClick={handleCreateOrUpdate} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex gap-4 flex-col md:flex-row">
        {/* Left panel - doc types */}
        <div className="w-full md:w-48 space-y-3 flex-shrink-0">
          <div className="erp-card p-3">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Tipos de Documentos</h4>
            <div className="space-y-1">
              {docTypes.map(dt => {
                const count = data.filter(d => d.tipo_doc === dt.id).length;
                return (
                  <button key={dt.id} onClick={() => setActiveDocType(dt.id as DocType)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                      activeDocType === dt.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                    }`}>
                    <dt.icon size={14} />
                    <span>{dt.label}</span>
                    <span className="ml-auto text-muted-foreground">({count})</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="erp-card p-3">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Filtros</h4>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-muted-foreground">Estado</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(['Todos', 'Pendiente', 'Cobrada', 'Cancelada'] as Estado[]).map(e => (
                    <button key={e} onClick={() => setEstadoFilter(e)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        estadoFilter === e ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Rango de Tiempo</label>
                <div className="flex flex-col gap-1 mt-1">
                  <input type="date" className="erp-input text-[10px] w-full" />
                  <input type="date" className="erp-input text-[10px] w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main table */}
        <div className="flex-1 erp-card min-w-0">
          <div className="flex items-center flex-wrap gap-2 px-3 py-2 border-b border-border">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Buscar por número o cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="erp-input w-full pl-7 text-xs py-1" />
            </div>
            <button className="erp-btn erp-btn-secondary text-xs"><Filter size={12} /> Filtros</button>
            <button className="erp-btn erp-btn-secondary text-xs" onClick={() => refetch()}><RefreshCw size={12} /> Refrescar</button>
            <button className="erp-btn erp-btn-secondary text-xs"><Download size={12} /> Exportar</button>
          </div>

          <div className="overflow-auto min-h-[400px]">
             {loading ? (
                <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                  Cargando documentos...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                  No se encontraron documentos
                </div>
              ) : (
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>SUC</th><th>Número</th><th>Emisión</th><th>Hora</th>
                      <th>Cliente</th><th>MON</th><th className="text-right">Total</th><th>Estado</th><th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(inv => (
                      <tr key={inv.id} className="hover:bg-muted/30">
                        <td className="text-center">01</td>
                        <td className="font-medium">{inv.numero_factura}</td>
                        <td>{inv.fecha}</td>
                        <td className="text-muted-foreground text-xs">{new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                        <td>{inv.cliente?.nombre || 'Consumidor Final'}</td>
                        <td>{inv.moneda}</td>
                        <td className="text-right font-medium">{formatCurrency(inv.total, inv.moneda)}</td>
                        <td>
                          <span className={`erp-badge ${inv.estado === 'Cobrada' ? 'erp-badge-active' : inv.estado === 'Pendiente' ? 'erp-badge-pending' : 'erp-badge-cancelled'}`}>{inv.estado}</span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEdit(inv)} className="p-1.5 text-muted-foreground hover:bg-muted rounded" title="Editar">
                              <PenBox size={14} />
                            </button>
                            <button onClick={() => printPDF(inv)} className="p-1.5 text-muted-foreground hover:bg-muted rounded" title="Imprimir PDF">
                              <Printer size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>

          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-xs text-muted-foreground">
            <span>Registros: {filtered.length} de {data.filter(d => d.tipo_doc === activeDocType).length}</span>
            <div className="flex gap-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-erp-success" /> Cobradas ({data.filter(i => i.estado === 'Cobrada' && i.tipo_doc === activeDocType).length})</span>
              <span className="flex items-center gap-1 ml-3"><span className="w-2 h-2 rounded-full bg-erp-warning" /> Pendientes ({data.filter(i => i.estado === 'Pendiente' && i.tipo_doc === activeDocType).length})</span>
              <span className="flex items-center gap-1 ml-3"><span className="w-2 h-2 rounded-full bg-erp-danger" /> Canceladas ({data.filter(i => i.estado === 'Cancelada' && i.tipo_doc === activeDocType).length})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
