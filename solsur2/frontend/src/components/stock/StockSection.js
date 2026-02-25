import React, { useEffect, useState, useCallback } from 'react';
import { productService } from '../../services/api';
import { PageHeader, Btn, Badge, Table, TR, TD, Spinner, Modal, Input, Select, Textarea, fmt, ICONS, Icon } from '../shared';
import toast from 'react-hot-toast';

const CATEGORIES = ['Vestidos', 'Camisas', 'Pantalones', 'Sacos', 'Tops', 'Accesorios', 'Faldas'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

function ProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    code: '', name: '', category: '', size: '', color: '', stock: '',
    costPrice: '', salePrice: '', description: '',
    hasPromotion: false, promotionType: '%', promotionDiscount: '',
    ...product,
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setN = (k) => (e) => setForm(f => ({ ...f, [k]: Number(e.target.value) }));
  const setBool = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.checked }));

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.salePrice || !form.stock) {
      toast.error('Completá los campos obligatorios'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        stock: Number(form.stock),
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        salePrice: Number(form.salePrice),
        promotionDiscount: form.promotionDiscount ? Number(form.promotionDiscount) : null,
      };
      if (product?.id) {
        await productService.update(product.id, payload);
        toast.success('Producto actualizado');
      } else {
        await productService.create(payload);
        toast.success('Producto creado');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={product?.id ? 'Editar Producto' : 'Nuevo Producto'} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Input label="Código" required value={form.code} onChange={set('code')} placeholder="SS-001" />
        <Input label="Nombre" required value={form.name} onChange={set('name')} />
        <Select label="Categoría" value={form.category} onChange={set('category')}>
          <option value="">Seleccionar</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </Select>
        <Select label="Talle" value={form.size} onChange={set('size')}>
          <option value="">Seleccionar</option>
          {SIZES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Input label="Color" value={form.color} onChange={set('color')} />
        <Input label="Stock" required type="number" min="0" value={form.stock} onChange={setN('stock')} />
        <Input label="Precio de Costo ($)" type="number" value={form.costPrice} onChange={setN('costPrice')} />
        <Input label="Precio de Venta ($)" required type="number" value={form.salePrice} onChange={setN('salePrice')} />
      </div>
      <Textarea label="Descripción" value={form.description} onChange={set('description')} />

      <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 2, padding: 16, marginBottom: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.hasPromotion} onChange={setBool('hasPromotion')} />
          <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#666' }}>Agregar Promoción</span>
        </label>
        {form.hasPromotion && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginTop: 14 }}>
            <Select label="Tipo" value={form.promotionType} onChange={set('promotionType')}>
              <option value="%">Descuento %</option>
              <option value="2x1">2 × 1</option>
              <option value="Precio especial">Precio especial</option>
            </Select>
            {form.promotionType !== '2x1' && (
              <Input label="Descuento %" type="number" min="1" max="100" value={form.promotionDiscount} onChange={setN('promotionDiscount')} />
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Btn onClick={onClose} variant="secondary">Cancelar</Btn>
        <Btn onClick={handleSubmit} icon="check" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
      </div>
    </Modal>
  );
}

export default function StockSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    productService.getAll(search)
      .then(setProducts)
      .catch(() => toast.error('Error al cargar productos'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await productService.delete(id);
      toast.success('Producto eliminado');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <PageHeader eyebrow="Inventario" title="Stock de Productos">
        <Btn onClick={() => setShowForm(true)} icon="plus">Nuevo Producto</Btn>
      </PageHeader>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 2, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10 }}>
          <Icon path={ICONS.search} size={16} style={{ color: '#bbb', flexShrink: 0 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código o categoría..."
            style={{ border: 'none', outline: 'none', fontSize: 14, width: '100%', fontFamily: 'inherit', background: 'transparent' }}
          />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <Table
          headers={['Código', 'Producto', 'Categoría', 'Talle', 'Color', 'Stock', 'Precio Costo', 'Precio Venta', 'Promoción', 'Acciones']}
          isEmpty={products.length === 0} emptyMsg="No se encontraron productos"
        >
          {products.map((p, i) => (
            <TR key={p.id} index={i}>
              <TD><span style={{ fontSize: 11, fontFamily: 'monospace', color: '#999' }}>{p.code}</span></TD>
              <TD>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{p.description}</div>}
              </TD>
              <TD>{p.category}</TD>
              <TD>{p.size}</TD>
              <TD>{p.color}</TD>
              <TD>
                <Badge
                  text={`${p.stock} uds`}
                  type={p.stock === 0 ? 'danger' : p.stock <= 3 ? 'warning' : 'success'}
                />
              </TD>
              <TD style={{ color: '#888' }}>{p.costPrice ? fmt(p.costPrice) : '—'}</TD>
              <TD><strong>{fmt(p.salePrice)}</strong></TD>
              <TD>
                {p.hasPromotion
                  ? <Badge text={p.promotionType === '2x1' ? '2×1' : `-${p.promotionDiscount}%`} type="info" />
                  : <span style={{ color: '#ccc', fontSize: 12 }}>—</span>}
              </TD>
              <TD>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditProduct(p); setShowForm(true); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 4 }}>
                    <Icon path={ICONS.edit} size={15} />
                  </button>
                  <button onClick={() => handleDelete(p.id, p.name)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a2020', padding: 4 }}>
                    <Icon path={ICONS.trash} size={15} />
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      )}

      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSaved={load}
        />
      )}
    </div>
  );
}
