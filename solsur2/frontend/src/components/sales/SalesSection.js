import React, { useEffect, useState, useCallback } from 'react';
import { saleService, productService } from '../../services/api';
import { PageHeader, Btn, Badge, Table, TR, TD, Spinner, Modal, Input, Select, fmt, fmtDate } from '../shared';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Mercado Pago'];

function SaleForm({ onClose, onSaved }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    client: '', clientCuit: '', productId: '', quantity: 1,
    paymentMethod: 'Efectivo', invoiceStatus: 'Pendiente', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const selectedProduct = products.find(p => p.id === Number(form.productId));

  useEffect(() => { productService.getAll().then(p => setProducts(p.filter(pr => pr.stock > 0))); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const total = selectedProduct ? selectedProduct.salePrice * Number(form.quantity) : 0;

  const handleSubmit = async () => {
    if (!form.client || !form.productId || !form.quantity) { toast.error('Completá todos los campos'); return; }
    setSaving(true);
    try {
      await saleService.create({ ...form, productId: Number(form.productId), quantity: Number(form.quantity) });
      toast.success('Venta registrada');
      onSaved(); onClose();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Registrar Venta" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Input label="Fecha" type="date" value={form.date} onChange={set('date')} />
        <Input label="Cliente" required value={form.client} onChange={set('client')} />
        <Input label="CUIT Cliente" value={form.clientCuit} onChange={set('clientCuit')} placeholder="20-12345678-9" />
      </div>

      <Select label="Producto" required value={form.productId} onChange={set('productId')}>
        <option value="">Seleccionar producto</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name} — {fmt(p.salePrice)} (Stock: {p.stock})</option>
        ))}
      </Select>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px' }}>
        <Input label="Cantidad" required type="number" min="1"
          max={selectedProduct?.stock || 999}
          value={form.quantity} onChange={set('quantity')} />
        <Select label="Forma de Pago" value={form.paymentMethod} onChange={set('paymentMethod')}>
          {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
        </Select>
        <Select label="Estado" value={form.invoiceStatus} onChange={set('invoiceStatus')}>
          <option>Pendiente</option>
          <option>Facturado</option>
        </Select>
      </div>

      {selectedProduct && (
        <div style={{ background: '#f5f5f5', padding: '16px 20px', borderRadius: 2, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: '#999', margin: '0 0 2px' }}>Precio unitario</p>
            <p style={{ fontSize: 14, margin: 0 }}>{fmt(selectedProduct.salePrice)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#999', margin: '0 0 2px' }}>Total de la venta</p>
            <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif', margin: 0 }}>{fmt(total)}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Btn onClick={onClose} variant="secondary">Cancelar</Btn>
        <Btn onClick={handleSubmit} icon="check" disabled={saving}>{saving ? 'Guardando...' : 'Registrar Venta'}</Btn>
      </div>
    </Modal>
  );
}

export default function SalesSection() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [exportStart, setExportStart] = useState(new Date().toISOString().slice(0, 7) + '-01');
  const [exportEnd, setExportEnd] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    saleService.getCurrentMonth()
      .then(setSales)
      .catch(() => toast.error('Error al cargar ventas'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all' ? sales : sales.filter(s => s.invoiceStatus === filter);
  const total = filtered.reduce((sum, s) => sum + Number(s.totalAmount), 0);

  const handleExport = async (type) => {
    setExporting(true);
    try {
      if (type === 'excel') await saleService.exportExcel(exportStart, exportEnd);
      else await saleService.exportPdf(exportStart, exportEnd);
      toast.success('Archivo descargado');
    } catch (err) { toast.error('Error al exportar'); }
    finally { setExporting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta venta? Se repondrá el stock.')) return;
    try {
      await saleService.delete(id);
      toast.success('Venta eliminada');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <PageHeader eyebrow="Ventas" title="Registro de Ventas">
        <Btn onClick={() => setShowForm(true)} icon="plus">Nueva Venta</Btn>
      </PageHeader>

      {/* Export bar */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 2, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666' }}>Exportar</span>
        <input type="date" value={exportStart} onChange={e => setExportStart(e.target.value)}
          style={{ padding: '7px 12px', border: '1px solid #ddd', borderRadius: 2, fontSize: 13, fontFamily: 'inherit' }} />
        <span style={{ color: '#999', fontSize: 12 }}>hasta</span>
        <input type="date" value={exportEnd} onChange={e => setExportEnd(e.target.value)}
          style={{ padding: '7px 12px', border: '1px solid #ddd', borderRadius: 2, fontSize: 13, fontFamily: 'inherit' }} />
        <Btn onClick={() => handleExport('excel')} variant="secondary" icon="download" disabled={exporting}>Excel</Btn>
        <Btn onClick={() => handleExport('pdf')} variant="secondary" icon="file" disabled={exporting}>PDF</Btn>
      </div>

      {/* Filters + Total */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {['all', 'Facturado', 'Pendiente'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', border: '1px solid #ddd', borderRadius: 2, cursor: 'pointer',
            background: filter === f ? '#111' : '#fff', color: filter === f ? '#fff' : '#666',
            fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'inherit',
          }}>{f === 'all' ? 'Todas' : f}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#999' }}>{filtered.length} venta{filtered.length !== 1 ? 's' : ''}</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{fmt(total)}</span>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <Table
          headers={['Fecha', 'Cliente', 'Producto', 'Cant.', 'Precio Unit.', 'Total', 'Forma de Pago', 'Estado', '']}
          isEmpty={filtered.length === 0} emptyMsg="No hay ventas en este período"
        >
          {filtered.map((s, i) => (
            <TR key={s.id} index={i}>
              <TD>{fmtDate(s.date)}</TD>
              <TD><strong>{s.client}</strong></TD>
              <TD>{s.productName}</TD>
              <TD>{s.quantity}</TD>
              <TD style={{ color: '#666' }}>{fmt(s.unitPrice)}</TD>
              <TD><strong>{fmt(s.totalAmount)}</strong></TD>
              <TD>{s.paymentMethod}</TD>
              <TD><Badge text={s.invoiceStatus} type={s.invoiceStatus === 'Facturado' ? 'success' : 'warning'} /></TD>
              <TD>
                <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}>
                  ×
                </button>
              </TD>
            </TR>
          ))}
        </Table>
      )}

      {showForm && <SaleForm onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  );
}
