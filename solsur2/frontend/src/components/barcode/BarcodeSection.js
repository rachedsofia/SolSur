import React, { useEffect, useState, useRef, useCallback } from 'react';
import { productService, saleService } from '../../services/api';
import { PageHeader, Btn, Badge, Table, TR, TD, Spinner, Modal, Input, Select, fmt, fmtDate, ICONS, Icon } from '../shared';
import toast from 'react-hot-toast';
// Logo embebido para etiquetas SVG
const LOGO_B64 = "data:image/png;base64,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";


// ═══════════════════════════════════════════════════════════════
// CODE128-B BARCODE ENGINE — no external libs needed
// ═══════════════════════════════════════════════════════════════
const C128_VALS = {
  ' ':0,'!':1,'"':2,'#':3,'$':4,'%':5,'&':6,"'":7,'(':8,')':9,'*':10,
  '+':11,',':12,'-':13,'.':14,'/':15,'0':16,'1':17,'2':18,'3':19,'4':20,
  '5':21,'6':22,'7':23,'8':24,'9':25,':':26,';':27,'<':28,'=':29,'>':30,
  '?':31,'@':32,'A':33,'B':34,'C':35,'D':36,'E':37,'F':38,'G':39,'H':40,
  'I':41,'J':42,'K':43,'L':44,'M':45,'N':46,'O':47,'P':48,'Q':49,'R':50,
  'S':51,'T':52,'U':53,'V':54,'W':55,'X':56,'Y':57,'Z':58,'[':59,'\\':60,
  ']':61,'^':62,'_':63,'`':64,'a':65,'b':66,'c':67,'d':68,'e':69,'f':70,
  'g':71,'h':72,'i':73,'j':74,'k':75,'l':76,'m':77,'n':78,'o':79,'p':80,
  'q':81,'r':82,'s':83,'t':84,'u':85,'v':86,'w':87,'x':88,'y':89,'z':90,
  '{':91,'|':92,'}':93,'~':94
};
const C128_PAT = [
  '11011001100','11001101100','11001100110','10010011000','10010001100','10001001100',
  '10011001000','10011000100','10001100100','11001001000','11001000100','11000100100',
  '10110011100','10011011100','10011001110','10111001100','10011101100','10011100110',
  '11001110010','11001011100','11001001110','11011100100','11001110100','11101101110',
  '11101001100','11100101100','11100100110','11101100100','11100110100','11100110010',
  '11011011000','11011000110','11000110110','10100011000','10001011000','10001000110',
  '10110001000','10001101000','10001100010','11010001000','11000101000','11000100010',
  '10110111000','10110001110','10001101110','10111011000','10111000110','10001110110',
  '11101110110','11010001110','11000101110','11011101000','11011100010','11011101110',
  '11101011000','11101000110','11100010110','11101101000','11101100010','11100011010',
  '11101111010','11001000010','11110001010','10100110000','10100001100','10010110000',
  '10010000110','10000101100','10000100110','10110010000','10110000100','10011010000',
  '10011000010','10000110100','10000110010','11000010010','11001010000','11110111010',
  '11000010100','10001111010','10100111100','10010111100','10010011110','10111100100',
  '10011110100','10011110010','11110100100','11110010100','11110010010','11011011110',
  '11011110110','11110110110','10101111000','10100011110','10001011110','10111101000',
  '10111100010','11110101000','11110100010','10111011110','10111101110','11101011110',
  '11110101110','11010000100','11010010000','11011100',   '1100011101011'
];

function encodeBarcode(text) {
  const START_B = 104, STOP = 106;
  const clean = text.replace(/[^\x20-\x7E]/g, '').substring(0, 20);
  let codes = [START_B], checksum = START_B;
  for (let i = 0; i < clean.length; i++) {
    const v = C128_VALS[clean[i]];
    if (v !== undefined) { codes.push(v); checksum += v * (i + 1); }
  }
  codes.push(checksum % 103);
  codes.push(STOP);
  return codes.map(c => C128_PAT[c] || '').join('') + '11';
}

// Renders barcode as inline SVG
function Barcode({ value, width = 200, height = 60, showText = true, color = '#111' }) {
  const pattern = encodeBarcode(value);
  const mw = Math.max(1, Math.floor(width / pattern.length));
  const bars = [];
  let x = 0, i = 0;
  while (i < pattern.length) {
    const bit = pattern[i];
    let run = 1;
    while (i + run < pattern.length && pattern[i + run] === bit) run++;
    if (bit === '1') bars.push(
      <rect key={x} x={x} y={0} width={mw * run} height={showText ? height - 16 : height} fill={color} />
    );
    x += mw * run; i += run;
  }
  const totalW = x;
  return (
    <svg width={totalW} height={height} viewBox={`0 0 ${totalW} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={totalW} height={height} fill="white" />
      {bars}
      {showText && (
        <text x={totalW / 2} y={height - 2} textAnchor="middle"
          fontSize="10" fontFamily="monospace" fill={color} letterSpacing="1.5">{value}</text>
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// LABEL MODAL — genera etiqueta descargable SVG / imprimible
// ═══════════════════════════════════════════════════════════════
function LabelModal({ product, onClose }) {
  const [copies, setCopies] = useState(1);
  const [size, setSize] = useState('standard');

  const SIZES = {
    standard: { w: 280, h: 145, name: 'Estándar  7×3.6 cm' },
    small:    { w: 210, h: 110, name: 'Pequeña   5.3×2.8 cm' },
    large:    { w: 360, h: 180, name: 'Grande    9×4.5 cm' },
  };
  const s = SIZES[size];
  const code = product.code.replace(/[^\x20-\x7E]/g, '').trim();

  function buildSVG(w, h) {
    const pattern = encodeBarcode(code);
    const mw = Math.max(1, Math.floor((w - 24) / pattern.length));
    let bars = '', bx = 0, bi = 0;
    while (bi < pattern.length) {
      const bit = pattern[bi]; let run = 1;
      while (bi + run < pattern.length && pattern[bi + run] === bit) run++;
      if (bit === '1') bars += `<rect x="${bx}" y="0" width="${mw*run}" height="${Math.round(h*0.35)}" fill="#111"/>`;
      bx += mw * run; bi += run;
    }
    const bw = bx;
    const bLeft = Math.round((w - bw) / 2);
    const price = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(product.salePrice);
    const sub = [product.size && `T: ${product.size}`, product.color].filter(Boolean).join(' · ');
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="white" stroke="#ccc" stroke-width="1.2" stroke-dasharray="5,3" rx="2"/>
  <line x1="0" y1="${Math.round(h*0.22)}" x2="${w}" y2="${Math.round(h*0.22)}" stroke="#eee" stroke-width="1"/>
  <image href="${LOGO_B64}" x="${Math.round(w/2) - Math.round(h*0.12)}" y="4" width="${Math.round(h*0.24)}" height="${Math.round(h*0.24)}"/>
  <text x="${w/2}" y="${Math.round(h*0.33)}" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(h*0.09)}" font-weight="700" fill="#222">${product.name.substring(0,28)}</text>
  <text x="${w/2}" y="${Math.round(h*0.43)}" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(h*0.07)}" fill="#888">${sub}</text>
  <text x="${w/2}" y="${Math.round(h*0.575)}" text-anchor="middle" font-family="Georgia,serif" font-size="${Math.round(h*0.15)}" font-weight="bold" fill="#111">${price}</text>
  <g transform="translate(${bLeft}, ${Math.round(h*0.62)})">
    <rect width="${bw}" height="${Math.round(h*0.38)}" fill="white"/>
    ${bars}
    <text x="${bw/2}" y="${Math.round(h*0.38)-2}" text-anchor="middle" font-family="monospace" font-size="${Math.round(h*0.07)}" letter-spacing="2" fill="#111">${code}</text>
  </g>
</svg>`;
  }

  const downloadSVG = () => {
    const allLabels = Array(copies).fill(null).map(() => buildSVG(s.w, s.h));
    const cols = Math.min(copies, 4);
    const rows = Math.ceil(copies / cols);
    const gap = 10;
    const totalW = cols * s.w + (cols - 1) * gap + 20;
    const totalH = rows * s.h + (rows - 1) * gap + 20;
    let placements = '';
    allLabels.forEach((_, idx) => {
      const col = idx % cols, row = Math.floor(idx / cols);
      const x = 10 + col * (s.w + gap), y = 10 + row * (s.h + gap);
      placements += `<g transform="translate(${x},${y})">${buildSVG(s.w, s.h)}</g>`;
    });
    const sheet = `<svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${totalW}" height="${totalH}" fill="#f5f5f3"/>
  ${placements}
</svg>`;
    const blob = new Blob([sheet], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `etiqueta-${code}-x${copies}.svg`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`${copies} etiqueta${copies > 1 ? 's' : ''} descargada${copies > 1 ? 's' : ''}`);
  };

  const printLabels = () => {
    const items = Array(copies).fill(null).map(() => buildSVG(s.w, s.h)).join('');
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Etiquetas ${code}</title>
      <style>body{margin:10px;background:#fff;} .grid{display:flex;flex-wrap:wrap;gap:8px;}
      @page{margin:10mm;} @media print{.grid{gap:4px;}}</style></head>
      <body><div class="grid">${Array(copies).fill(null).map(() =>
        `<div style="display:inline-block">${buildSVG(s.w, s.h)}</div>`
      ).join('')}</div>
      <script>window.onload=()=>{window.print();}</script></body></html>`);
    win.document.close();
  };

  const previewSVG = buildSVG(s.w, s.h);

  return (
    <Modal title={`Etiqueta — ${product.name}`} onClose={onClose} width="660px">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Tamaño de etiqueta</label>
          <select value={size} onChange={e => setSize(e.target.value)} style={selectStyle}>
            {Object.entries(SIZES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Cantidad de copias</label>
          <input type="number" min={1} max={100} value={copies}
            onChange={e => setCopies(Math.max(1, Math.min(100, Number(e.target.value))))}
            style={selectStyle} />
        </div>
      </div>

      {/* Preview */}
      <div style={{ background: '#f5f5f3', border: '1px solid #e8e8e8', borderRadius: 2, padding: 24, marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#999', margin: 0 }}>Vista previa</p>
        <div dangerouslySetInnerHTML={{ __html: previewSVG }} />
      </div>

      <div style={{ background: '#f0f4ff', border: '1px solid #b0c4f0', borderRadius: 2, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: '#2040a0' }}>
        <strong>Código:</strong> {code} — Compatible con lectores Code128 / EAN / USB.
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Btn onClick={onClose} variant="secondary">Cancelar</Btn>
        <Btn onClick={downloadSVG} icon="download" variant="secondary">Descargar SVG</Btn>
        <Btn onClick={printLabels} icon="file">
          Imprimir {copies > 1 ? `${copies} etiquetas` : 'etiqueta'}
        </Btn>
      </div>
    </Modal>
  );
}

const labelStyle = { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 6 };
const selectStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 2, fontSize: 14, fontFamily: 'inherit', outline: 'none' };

// ═══════════════════════════════════════════════════════════════
// QUICK SALE MODAL — escáner o teclado
// ═══════════════════════════════════════════════════════════════
const PAYMENTS = ['Efectivo','Transferencia','Tarjeta de Débito','Tarjeta de Crédito','Mercado Pago'];

function QuickSaleModal({ onClose, onSaved }) {
  const [code, setCode] = useState('');
  const [product, setProduct] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ client: '', clientCuit: '', quantity: 1, paymentMethod: 'Efectivo' });
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const search = async () => {
    if (!code.trim()) return;
    setSearching(true); setProduct(null);
    try {
      const all = await productService.getAll(code.trim());
      const found = all.find(p => p.code.toLowerCase() === code.trim().toLowerCase());
      if (found) { setProduct(found); toast.success(`✓ ${found.name}`); }
      else toast.error('Código no encontrado');
    } catch { toast.error('Error de conexión'); }
    finally { setSearching(false); }
  };

  const confirm = async () => {
    if (!product) return;
    if (!form.client.trim()) { toast.error('Ingresá el nombre del cliente'); return; }
    if (product.stock < form.quantity) { toast.error(`Stock insuficiente (${product.stock} disponibles)`); return; }
    setSaving(true);
    try {
      await saleService.create({ ...form, productId: product.id, quantity: Number(form.quantity) });
      toast.success('Venta registrada');
      onSaved(); onClose();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const total = product ? product.salePrice * form.quantity : 0;

  return (
    <Modal title="Venta Rápida por Código de Barras" onClose={onClose} width="560px">
      {/* Scanner zone */}
      <div style={{ background: '#0a0a0a', borderRadius: 2, padding: 20, marginBottom: 20 }}>
        <p style={{ margin: '0 0 10px', fontSize: 10, letterSpacing: 2, color: '#444', textTransform: 'uppercase' }}>
          Escaneá o escribí el código y presioná Enter
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input ref={inputRef} value={code} onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="SS-001"
            style={{ flex: 1, padding: '12px 16px', background: '#161616', border: '1px solid #2a2a2a',
              borderRadius: 2, color: '#fff', fontSize: 20, fontFamily: 'monospace', letterSpacing: 3, outline: 'none' }} />
          <button onClick={search} disabled={searching}
            style={{ padding: '0 20px', background: '#fff', color: '#111', border: 'none',
              borderRadius: 2, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase', fontFamily: 'inherit' }}>
            {searching ? '...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Product card */}
      {product && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #b7d9b7', background: '#f0faf0', borderRadius: 2,
            padding: '12px 18px', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 10, color: '#2d6a2d', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 4px' }}>✓ Encontrado</p>
              <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>{product.name}</p>
              <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{product.code} · Stock: {product.stock} ud.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Barcode value={product.code} width={120} height={36} showText={false} />
              <p style={{ fontSize: 18, fontFamily: 'Georgia,serif', fontWeight: 700, margin: '4px 0 0' }}>{fmt(product.salePrice)}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0 14px' }}>
            <Input label="Cliente *" value={form.client} onChange={e => setForm(f => ({...f, client: e.target.value}))} placeholder="Nombre del cliente" />
            <Input label="Cantidad" type="number" min={1} max={product.stock} value={form.quantity} onChange={e => setForm(f => ({...f, quantity: Number(e.target.value)}))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Input label="CUIT (opcional)" value={form.clientCuit} onChange={e => setForm(f => ({...f, clientCuit: e.target.value}))} />
            <Select label="Forma de Pago" value={form.paymentMethod} onChange={e => setForm(f => ({...f, paymentMethod: e.target.value}))}>
              {PAYMENTS.map(m => <option key={m}>{m}</option>)}
            </Select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#111', color: '#fff', borderRadius: 2, padding: '14px 20px', margin: '16px 0' }}>
            <span style={{ fontSize: 11, color: '#555', letterSpacing: 1.5, textTransform: 'uppercase' }}>Total a cobrar</span>
            <span style={{ fontSize: 28, fontFamily: 'Georgia,serif', fontWeight: 700 }}>{fmt(total)}</span>
          </div>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Btn onClick={onClose} variant="secondary">Cancelar</Btn>
        {product && <Btn onClick={confirm} disabled={saving} size="lg" icon="check">{saving ? 'Guardando...' : 'Confirmar Venta'}</Btn>}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function BarcodeSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [labelProduct, setLabelProduct] = useState(null);
  const [showQuickSale, setShowQuickSale] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setProducts(await productService.getAll(search)); }
    catch { toast.error('Error cargando productos'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader eyebrow="Etiquetas" title="Códigos de Barras">
        <Btn onClick={() => setShowQuickSale(true)} icon="cart" size="lg">Venta Rápida</Btn>
      </PageHeader>

      {/* Hero banner */}
      <div style={{ background: '#111', borderRadius: 2, padding: '22px 28px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: 2, color: '#444', textTransform: 'uppercase', margin: '0 0 6px' }}>Escáner integrado</p>
          <p style={{ color: '#ccc', margin: 0, fontSize: 14 }}>Escaneá un código de barras para registrar una venta al instante — o ingresalo manualmente</p>
        </div>
        <Btn onClick={() => setShowQuickSale(true)} variant="secondary" icon="barChart">Abrir escáner</Btn>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 2, marginBottom: 16,
        display: 'flex', alignItems: 'center', padding: '10px 16px', gap: 10 }}>
        <Icon path={ICONS.search} size={16} style={{ color: '#bbb', flexShrink: 0 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..."
          style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', fontFamily: 'inherit', background: 'transparent' }} />
      </div>

      {loading ? <Spinner /> : (
        <Table headers={['Código', 'Vista previa', 'Producto', 'Precio', 'Stock', 'Acciones']}
          isEmpty={products.length === 0} emptyMsg="No hay productos cargados">
          {products.map((p, i) => (
            <TR key={p.id} index={i}>
              <TD><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#f5f5f3',
                padding: '3px 8px', borderRadius: 2, color: '#666' }}>{p.code}</span></TD>
              <TD>
                <Barcode value={p.code.replace(/[^\x20-\x7E]/g, '').trim()} width={140} height={34} showText={false} />
              </TD>
              <TD>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{[p.category, p.size, p.color].filter(Boolean).join(' · ')}</div>
              </TD>
              <TD><strong style={{ fontFamily: 'Georgia,serif' }}>{fmt(p.salePrice)}</strong></TD>
              <TD>
                <Badge text={`${p.stock} uds`} type={p.stock === 0 ? 'danger' : p.stock <= 3 ? 'warning' : 'success'} />
              </TD>
              <TD>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn onClick={() => setLabelProduct(p)} size="sm" icon="download" variant="secondary">Etiqueta</Btn>
                  <Btn onClick={() => setShowQuickSale(true)} size="sm" icon="cart" variant="ghost">Vender</Btn>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      )}

      {labelProduct && <LabelModal product={labelProduct} onClose={() => setLabelProduct(null)} />}
      {showQuickSale && <QuickSaleModal onClose={() => setShowQuickSale(false)} onSaved={load} />}
    </div>
  );
}