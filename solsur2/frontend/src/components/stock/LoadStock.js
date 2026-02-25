import React, { useState } from 'react';
import { productService } from '../../services/api';
import { PageHeader, Btn, Input, Select, Textarea, fmt, ICONS, Icon } from '../shared';
import toast from 'react-hot-toast';

const CATEGORIES = ['Vestidos', 'Camisas', 'Pantalones', 'Sacos', 'Tops', 'Accesorios', 'Faldas'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'];

const EMPTY = {
  code: '', name: '', category: '', size: '', color: '',
  stock: '', costPrice: '', salePrice: '', description: '',
  hasPromotion: false, promotionType: '%', promotionDiscount: '',
};

export default function LoadStock() {
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setBool = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.checked }));

  const margin = form.costPrice && form.salePrice
    ? (((Number(form.salePrice) - Number(form.costPrice)) / Number(form.costPrice)) * 100).toFixed(0)
    : null;

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.salePrice || form.stock === '') {
      toast.error('Completá código, nombre, precio y stock'); return;
    }
    setSaving(true);
    try {
      await productService.create({
        ...form,
        stock: Number(form.stock),
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        salePrice: Number(form.salePrice),
        promotionDiscount: form.promotionDiscount ? Number(form.promotionDiscount) : null,
      });
      toast.success('Producto cargado al stock');
      setForm({ ...EMPTY });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Inventario" title="Cargar Nuevo Stock" />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Form */}
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 2, padding: 32 }}>
          <h3 style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#bbb', margin: '0 0 24px' }}>Información del Producto</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Input label="Código" required value={form.code} onChange={set('code')} placeholder="SS-006" />
            <Input label="Nombre" required value={form.name} onChange={set('name')} />
            <Select label="Categoría" value={form.category} onChange={set('category')}>
              <option value="">Seleccionar</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Talle" value={form.size} onChange={set('size')}>
              <option value="">Seleccionar</option>
              {SIZES.map(s => <option key={s}>{s}</option>)}
            </Select>
            <Input label="Color" value={form.color} onChange={set('color')} placeholder="Negro, Blanco, Beige..." />
            <Input label="Cantidad en Stock" required type="number" min="0" value={form.stock} onChange={set('stock')} />
            <Input label="Precio de Costo ($)" type="number" value={form.costPrice} onChange={set('costPrice')} />
            <Input label="Precio de Venta ($)" required type="number" value={form.salePrice} onChange={set('salePrice')} />
          </div>

          <Textarea
            label="Descripción / Detalle"
            value={form.description} onChange={set('description')}
            placeholder="Material, características, observaciones..."
            style={{ minHeight: 80 }}
          />

          {/* Promotion */}
          <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 2, padding: 18, marginBottom: 28 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: form.hasPromotion ? 16 : 0 }}>
              <input type="checkbox" checked={form.hasPromotion} onChange={setBool('hasPromotion')} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                <Icon path={ICONS.tag} size={14} />
                <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' }}>Agregar Promoción</span>
              </div>
            </label>
            {form.hasPromotion && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <Select label="Tipo" value={form.promotionType} onChange={set('promotionType')}>
                  <option value="%">Descuento Porcentual (%)</option>
                  <option value="2x1">2 × 1</option>
                  <option value="Precio especial">Precio Especial</option>
                </Select>
                {form.promotionType !== '2x1' && (
                  <Input label="Descuento %" type="number" min="1" max="100" value={form.promotionDiscount} onChange={set('promotionDiscount')} placeholder="20" />
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Btn onClick={() => setForm({ ...EMPTY })} variant="secondary">Limpiar</Btn>
            <Btn onClick={handleSubmit} icon="upload" size="lg" disabled={saving}>
              {saving ? 'Guardando...' : 'Cargar al Stock'}
            </Btn>
          </div>
        </div>

        {/* Preview Panel */}
        <div>
          <div style={{ background: '#111', color: '#fff', borderRadius: 2, padding: 28, marginBottom: 16 }}>
            <p style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#555', margin: '0 0 20px' }}>Vista Previa</p>
            <p style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>Código</p>
            <p style={{ fontSize: 15, fontFamily: 'monospace', margin: '0 0 16px', color: '#aaa' }}>{form.code || '—'}</p>
            <p style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>Producto</p>
            <p style={{ fontSize: 22, fontFamily: 'Georgia, serif', fontWeight: 600, margin: '0 0 8px', lineHeight: 1.2 }}>{form.name || '—'}</p>
            {(form.category || form.size) && (
              <p style={{ fontSize: 12, color: '#666', margin: '0 0 20px' }}>
                {[form.category, form.size, form.color].filter(Boolean).join(' · ')}
              </p>
            )}

            <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#555' }}>Precio de venta</span>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                  {fmt(Number(form.salePrice) || 0)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#555' }}>Stock inicial</span>
                <span style={{ fontSize: 14 }}>{form.stock || 0} unidades</span>
              </div>
              {margin && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#555' }}>Margen</span>
                  <span style={{ fontSize: 14, color: Number(margin) > 0 ? '#7eca7e' : '#e07070', fontWeight: 700 }}>
                    {margin}%
                  </span>
                </div>
              )}
            </div>

            {form.hasPromotion && (
              <div style={{ marginTop: 18, background: '#1a1a1a', borderRadius: 2, padding: 12 }}>
                <p style={{ fontSize: 9, letterSpacing: 1.5, color: '#555', textTransform: 'uppercase', margin: '0 0 4px' }}>Promoción activa</p>
                <p style={{ fontSize: 16, color: '#f0d070', fontWeight: 700, margin: 0 }}>
                  {form.promotionType === '2x1' ? '2 × 1' : form.promotionDiscount ? `-${form.promotionDiscount}%` : form.promotionType}
                </p>
              </div>
            )}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 2, padding: 20 }}>
            <p style={{ fontSize: 10, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', margin: '0 0 8px' }}>Tip</p>
            <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, margin: 0 }}>
              El código debe ser único. Al cargar el stock, el producto quedará disponible para ventas inmediatamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
