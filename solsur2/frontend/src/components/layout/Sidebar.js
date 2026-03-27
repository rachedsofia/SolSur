import React from 'react';
import { ICONS, Icon } from '../shared';

const LOGO = "data:image/png;base64,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";

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',        icon: ICONS.home },
  { id: 'stock',        label: 'Stock',             icon: ICONS.box },
  { id: 'cargar-stock', label: 'Cargar Stock',      icon: ICONS.upload },
  { id: 'ventas',       label: 'Ventas',            icon: ICONS.cart },
  { id: 'codigos',      label: 'Códigos de Barras', icon: ICONS.barChart },
  { id: 'facturacion',  label: 'Facturación',       icon: ICONS.file },
];

export default function Sidebar({ section, setSection, children }) {
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      <aside style={{ width: 220, background: '#111', borderRight: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '2px 0 20px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>
        
        {/* Logo */}
        <div style={{ padding: '30px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={LOGO}
            alt="SolSur"
            style={{ width: 70, height: 70, objectFit: 'contain', opacity: 0.9, filter: 'invert(1)' }}
          />
          <div style={{ fontSize: 9, letterSpacing: 3, color: '#777', textTransform: 'uppercase', marginTop: 12, fontWeight: 400 }}>
            Sistema de Gestión
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV.map(({ id, label, icon }) => {
            const active = section === id;
            return (
              <button key={id} onClick={() => setSection(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 24px', border: 'none', borderRadius: 0, cursor: 'pointer',
                background: active ? '#222' : 'transparent',
                color: active ? '#fff' : '#888',
                fontWeight: active ? 400 : 300,
                fontSize: 13, letterSpacing: 1, fontFamily: 'inherit',
                transition: 'all 0.25s ease',
                borderLeft: active ? '3px solid #fff' : '3px solid transparent',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = active ? '#fff' : '#aaa'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#fff' : '#888'; }}
              >
                <Icon path={icon} size={15} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Date */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 10, color: '#666', letterSpacing: 1, textTransform: 'capitalize', fontWeight: 300 }}>{today}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
