import React, { useEffect, useState, useCallback } from 'react';
import { invoiceService, saleService } from '../../services/api';
import axios from 'axios';
import { PageHeader, Btn, Badge, Table, TR, TD, Spinner, Modal, Input, Select, Textarea, fmt, fmtDate, ICONS, Icon } from '../shared';
import toast from 'react-hot-toast';

const INVOICE_TYPES = ['Factura A', 'Factura B', 'Factura C', 'Nota de Débito A', 'Nota de Crédito A'];
const CONDICIONES_IVA = ['Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final'];
const IVA_RATES = [{ label: '21%', value: '21' }, { label: '10.5%', value: '10.5' }, { label: '27%', value: '27' }, { label: 'Exento', value: '0' }];

const EMPTY_FORM = {
  invoiceType: 'Factura A', puntoVenta: '0001', numero: '',
  razonSocial: '', cuit: '', domicilio: '', condicionIva: 'Responsable Inscripto',
  concepto: 'Productos', montoNeto: '', alicuotaIva: '21', fechaVencimiento: '', observaciones: '', saleId: '',
};

function InvoiceForm({ onClose, onSaved, pendingSales }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const montoNeto = Number(form.montoNeto) || 0;
  const alicuotaIva = Number(form.alicuotaIva) || 0;
  const montoIva = montoNeto * alicuotaIva / 100;
  const total = montoNeto + montoIva;

  // Auto-fill from sale
  const handleSaleSelect = (e) => {
    const saleId = e.target.value;
    setForm(f => ({ ...f, saleId }));
    if (saleId) {
      const sale = pendingSales.find(s => s.id === Number(saleId));
      if (sale) {
        setForm(f => ({
          ...f, saleId,
          razonSocial: sale.client,
          cuit: sale.clientCuit || '',
          montoNeto: (sale.totalAmount / 1.21).toFixed(2),
          concepto: sale.productName,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.montoNeto) { toast.error('Ingresá el monto neto'); return; }
    setSaving(true);
    try {
      await invoiceService.create({
        ...form,
        montoNeto: Number(form.montoNeto),
        alicuotaIva: Number(form.alicuotaIva),
        saleId: form.saleId ? Number(form.saleId) : null,
        fechaVencimiento: form.fechaVencimiento || null,
      });
      toast.success('Comprobante creado');
      onSaved(); onClose();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="Nuevo Comprobante" onClose={onClose} width="760px">
      {/* Link to pending sale */}
      {pendingSales.length > 0 && (
        <div style={{ marginBottom: 20, padding: 14, background: '#f5f5f5', borderRadius: 2 }}>
          <Select label="Vincular a venta pendiente (opcional)" value={form.saleId} onChange={handleSaleSelect}>
            <option value="">Comprobante manual</option>
            {pendingSales.map(s => (
              <option key={s.id} value={s.id}>{fmtDate(s.date)} — {s.client} — {s.productName} — {fmt(s.totalAmount)}</option>
            ))}
          </Select>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px' }}>
        <Select label="Tipo de Comprobante" value={form.invoiceType} onChange={set('invoiceType')}>
          {INVOICE_TYPES.map(t => <option key={t}>{t}</option>)}
        </Select>
        <Input label="Punto de Venta" value={form.puntoVenta} onChange={set('puntoVenta')} />
        <Input label="Número" value={form.numero} onChange={set('numero')} placeholder="00000001" />
      </div>

      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 18, marginBottom: 8 }}>
        <h4 style={{ fontSize: 9, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', margin: '0 0 14px' }}>Datos del Receptor</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Input label="Razón Social" value={form.razonSocial} onChange={set('razonSocial')} />
          <Input label="CUIT" value={form.cuit} onChange={set('cuit')} placeholder="20-12345678-9" />
          <Input label="Domicilio" value={form.domicilio} onChange={set('domicilio')} />
          <Select label="Condición frente al IVA" value={form.condicionIva} onChange={set('condicionIva')}>
            {CONDICIONES_IVA.map(c => <option key={c}>{c}</option>)}
          </Select>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 18, marginBottom: 8 }}>
        <h4 style={{ fontSize: 9, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', margin: '0 0 14px' }}>Importes</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0 20px' }}>
          <Input label="Concepto" value={form.concepto} onChange={set('concepto')} />
          <Input label="Monto Neto ($)" required type="number" value={form.montoNeto} onChange={set('montoNeto')} />
          <Select label="Alícuota IVA" value={form.alicuotaIva} onChange={set('alicuotaIva')}>
            {IVA_RATES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
        </div>
        <Input label="Fecha de Vencimiento de Pago" type="date" value={form.fechaVencimiento} onChange={set('fechaVencimiento')} />
        <Textarea label="Observaciones" value={form.observaciones} onChange={set('observaciones')} />
      </div>

      {/* Totals preview */}
      <div style={{ background: '#111', color: '#fff', borderRadius: 2, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#666' }}>Subtotal Neto</span>
          <span>{fmt(montoNeto)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: '#666' }}>IVA {form.alicuotaIva}%</span>
          <span>{fmt(montoIva)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #222' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>TOTAL</span>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{fmt(total)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Btn onClick={onClose} variant="secondary">Cancelar</Btn>
        <Btn onClick={handleSubmit} icon="check" disabled={saving}>{saving ? 'Guardando...' : 'Crear Comprobante'}</Btn>
      </div>
    </Modal>
  );
}

export default function InvoiceSection() {
  const [invoices, setInvoices] = useState([]);
  const [pendingSales, setPendingSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [afipStatus, setAfipStatus] = useState(null);

  const handleExport = async (type) => {
    setExporting(true);
    try {
      if (type === 'excel') await invoiceService.exportExcel();
      else await invoiceService.exportPdf();
      toast.success(`Facturas exportadas en ${type.toUpperCase()}`);
    } catch { toast.error('Error al exportar'); }
    finally { setExporting(false); }
  };

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      invoiceService.getAll(),
      saleService.getAll(),
    ]).then(([invs, sales]) => {
      setInvoices(invs);
      setPendingSales(sales.filter(s => s.invoiceStatus === 'Pendiente'));
    }).catch(() => toast.error('Error al cargar datos'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/afip/estado')
      .then(r => setAfipStatus(r.data))
      .catch(() => setAfipStatus(null));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este comprobante?')) return;
    try { await invoiceService.delete(id); toast.success('Eliminado'); load(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <PageHeader eyebrow="Facturación" title="Comprobantes">
        <Btn onClick={() => handleExport('excel')} disabled={exporting} variant="secondary" icon="download" size="sm">Excel</Btn>
        <Btn onClick={() => handleExport('pdf')} disabled={exporting} variant="secondary" icon="file" size="sm">PDF</Btn>
        <Btn onClick={() => setShowForm(true)} icon="plus">Nuevo Comprobante</Btn>
      </PageHeader>

      {pendingSales.length > 0 && (
        <div style={{ background: '#fffbf0', border: '1px solid #f0d070', borderRadius: 2, padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon path={ICONS.alert} size={15} />
          <span style={{ fontSize: 12, color: '#7a5f00' }}>
            Tenés <strong>{pendingSales.length}</strong> venta{pendingSales.length !== 1 ? 's' : ''} pendiente{pendingSales.length !== 1 ? 's' : ''} de facturación
          </span>
          <Btn onClick={() => setShowForm(true)} variant="secondary" size="sm">Facturar ahora</Btn>
        </div>
      )}

      {loading ? <Spinner /> : (
        <Table
          headers={['Tipo', 'Nº Comprobante', 'Receptor', 'Neto', 'IVA', 'Total', 'CAE', 'Estado', '']}
          isEmpty={invoices.length === 0} emptyMsg="No hay comprobantes registrados"
        >
          {invoices.map((inv, i) => (
            <TR key={inv.id} index={i}>
              <TD><span style={{ fontSize: 12, fontWeight: 600 }}>{inv.invoiceType}</span></TD>
              <TD><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{inv.puntoVenta}-{inv.numero || '—'}</span></TD>
              <TD>{inv.razonSocial || '—'}</TD>
              <TD style={{ color: '#666' }}>{fmt(inv.montoNeto)}</TD>
              <TD style={{ color: '#666' }}>{fmt(inv.montoIva)}</TD>
              <TD><strong>{fmt(inv.total)}</strong></TD>
              <TD>
                {inv.cae
                  ? <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#2d6a2d' }}>{inv.cae}</span>
                  : <span style={{ fontSize: 11, color: '#bbb' }}>Sin CAE</span>
                }
              </TD>
              <TD>
                <Badge
                  text={inv.status}
                  type={inv.status === 'Emitida' ? 'success' : inv.status === 'Anulada' ? 'danger' : 'warning'}
                />
              </TD>
              <TD>
                <button onClick={() => handleDelete(inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}>×</button>
              </TD>
            </TR>
          ))}
        </Table>
      )}

      {/* AFIP link */}
      <div style={{ marginTop: 24, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 2, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>Emisión oficial AFIP</p>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Para emitir comprobantes con validez legal, accedé al portal de AFIP</p>
        </div>
        <a href="https://www.afip.gob.ar/fe/qr/" target="_blank" rel="noopener noreferrer"
          style={{ background: '#111', color: '#fff', padding: '10px 20px', borderRadius: 2, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon path={ICONS.send} size={13} />
          Ir a AFIP
        </a>
      </div>

      {showForm && <InvoiceForm onClose={() => setShowForm(false)} onSaved={load} pendingSales={pendingSales} />}
    </div>
  );
}
