import React from 'react';
import { ICONS, Icon } from '../shared';

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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f3', fontFamily: "'Gill Sans','Optima','Century Gothic',sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #e8e8e8',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, letterSpacing: 5, color: '#111', textTransform: 'uppercase' }}>SolSur</div>
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', marginTop: 3 }}>Sistema de Gestión</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV.map(({ id, label, icon }) => {
            const active = section === id;
            return (
              <button key={id} onClick={() => setSection(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 24px', border: 'none', borderRadius: 0, cursor: 'pointer',
                background: active ? '#111' : 'transparent',
                color: active ? '#fff' : '#666',
                fontSize: 12, letterSpacing: 0.5, fontFamily: 'inherit',
                transition: 'all 0.12s',
                borderLeft: active ? '3px solid #fff' : '3px solid transparent',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f3'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon path={icon} size={15} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Date */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 10, color: '#ccc', letterSpacing: 0.5, textTransform: 'capitalize' }}>{today}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: '36px 40px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
