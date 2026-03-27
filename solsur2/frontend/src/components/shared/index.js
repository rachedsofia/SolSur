import React from 'react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const COLORS = {
  black: '#1a1a1a',
  darkGray: '#4a4a4a',
  midGray: '#777777',
  lightGray: '#aaaaaa',
  border: 'rgba(0,0,0,0.06)',
  borderLight: 'rgba(0,0,0,0.03)',
  bg: '#fafafa',
  white: '#ffffff',
  success: { bg: '#f2fcf2', text: '#2d6a2d', border: 'rgba(45, 106, 45, 0.2)' },
  warning: { bg: '#fefcf2', text: '#7a5f00', border: 'rgba(122, 95, 0, 0.2)' },
  danger: { bg: '#fdf2f2', text: '#8a2020', border: 'rgba(138, 32, 32, 0.2)' },
  info: { bg: '#f2f6ff', text: '#2040a0', border: 'rgba(32, 64, 160, 0.2)' },
};

// ─── ICON ─────────────────────────────────────────────────────────────────────
export const Icon = ({ path, size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={path} />
  </svg>
);

export const ICONS = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  box: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
  cart: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  plus: "M12 5v14 M5 12h14",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6 M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2",
  check: "M20 6L9 17l-5-5",
  alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  x: "M18 6L6 18 M6 6l12 12",
  dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  package: "M16.5 9.4l-9-5.19 M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  send: "M22 2L11 13 M22 2L15 22 8 13 2 9l20-7z",
  barChart: "M12 20V10 M18 20V4 M6 20v-4",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  spinner: "M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83",
};

// ─── FORMATTERS ──────────────────────────────────────────────────────────────
export const fmt = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);

export const fmtDate = (d) => {
  if (!d) return '-';
  return new Date(d + 'T12:00:00').toLocaleDateString('es-AR');
};

// ─── BADGE ───────────────────────────────────────────────────────────────────
export const Badge = ({ text, type = 'info' }) => {
  const styles = {
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    info: COLORS.info,
  };
  const s = styles[type];
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
      padding: '4px 10px', borderRadius: 4, fontWeight: 400, whiteSpace: 'nowrap',
    }}>{text}</span>
  );
};

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, variant = 'primary', size = 'md', icon, disabled, type = 'button' }) => {
  const variants = {
    primary: { background: '#1a1a1a', color: '#fff', border: '1px solid #1a1a1a' },
    secondary: { background: '#fff', color: '#1a1a1a', border: '1px solid rgba(0,0,0,0.1)' },
    ghost: { background: 'transparent', color: '#666', border: '1px solid transparent' },
    danger: { background: '#fff', color: '#8a2020', border: '1px solid rgba(138, 32, 32, 0.2)' },
    success: { background: '#fff', color: '#1a5c2a', border: '1px solid rgba(26, 92, 42, 0.2)' },
  };
  const sizes = {
    sm: { padding: '6px 16px', fontSize: 11 },
    md: { padding: '10px 24px', fontSize: 12 },
    lg: { padding: '14px 32px', fontSize: 13 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...variants[variant], ...sizes[size],
      borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer',
      letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'inherit',
      fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 10,
      opacity: disabled ? 0.5 : 1, transition: 'all 0.25s ease',
      boxShadow: (variant === 'primary' && !disabled) ? '0 4px 14px rgba(0,0,0,0.1)' : 'none',
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; if (variant === 'secondary') e.currentTarget.style.borderColor = '#1a1a1a'; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.transform = 'none'; if (variant === 'secondary') e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; } }}
    >
      {icon && <Icon path={ICONS[icon]} size={15} />}
      {children}
    </button>
  );
};

// ─── INPUT ───────────────────────────────────────────────────────────────────
export const Field = ({ label, error, required, children, style = {} }) => (
  <div style={{ marginBottom: 16, ...style }}>
    {label && (
      <label style={{ display: 'block', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8, fontWeight: 500 }}>
        {label}{required && <span style={{ color: '#8a2020' }}> *</span>}
      </label>
    )}
    {children}
    {error && <p style={{ fontSize: 11, color: '#8a2020', marginTop: 4 }}>{error}</p>}
  </div>
);

const inputStyle = {
  width: '100%', padding: '12px 16px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 4,
  fontSize: 14, fontFamily: 'inherit', fontWeight: 400, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.25s', background: '#fff', color: '#0d0d0d'
};

export const Input = ({ label, error, required, ...props }) => (
  <Field label={label} error={error} required={required}>
    <input {...props} style={{ ...inputStyle, borderColor: error ? '#f0b0b0' : '#ddd', ...props.style }} />
  </Field>
);

export const Select = ({ label, error, required, children, ...props }) => (
  <Field label={label} error={error} required={required}>
    <select {...props} style={{ ...inputStyle, background: '#fff', borderColor: error ? '#f0b0b0' : '#ddd', ...props.style }}>
      {children}
    </select>
  </Field>
);

export const Textarea = ({ label, error, required, ...props }) => (
  <Field label={label} error={error} required={required}>
    <textarea {...props} style={{ ...inputStyle, resize: 'vertical', minHeight: 80, borderColor: error ? '#f0b0b0' : '#ddd', ...props.style }} />
  </Field>
);

// ─── MODAL ───────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, width = '680px' }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(10px)', padding: 16,
  }}>
    <div style={{
      background: '#fff', borderRadius: 6, width: `min(${width}, 95vw)`,
      maxHeight: '92vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.4)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 36px', borderBottom: '1px solid rgba(0,0,0,0.04)', position: 'sticky', top: 0, background: '#fff', zIndex: 1,
      }}>
        <h2 style={{ margin: 0, fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 400 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#222'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>
          <Icon path={ICONS.x} size={22} />
        </button>
      </div>
      <div style={{ padding: '32px 36px' }}>{children}</div>
    </div>
  </div>
);

// ─── STAT CARD ───────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, icon, accent = '#1a1a1a' }) => (
  <div style={{
    background: '#fff', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 6,
    padding: '30px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden'
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent, opacity: 0.15 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: 2.5, color: '#777', textTransform: 'uppercase', margin: '0 0 14px', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 500, color: '#0d0d0d', margin: '0 0 6px' }}>{value}</p>
        <p style={{ fontSize: 11, color: '#666', margin: 0, fontWeight: 400 }}>{sub}</p>
      </div>
      <div style={{ color: 'rgba(0,0,0,0.08)' }}><Icon path={ICONS[icon]} size={32} /></div>
    </div>
  </div>
);

// ─── LOADING ─────────────────────────────────────────────────────────────────
export const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#ccc' }}>
    <div style={{
      width: 32, height: 32, border: '2px solid #e8e8e8', borderTopColor: '#111',
      borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export const Empty = ({ message = 'No hay datos disponibles' }) => (
  <div style={{ textAlign: 'center', padding: '60px 24px', color: '#bbb' }}>
    <Icon path={ICONS.box} size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
    <p style={{ margin: 0, fontSize: 14 }}>{message}</p>
  </div>
);

// ─── PAGE HEADER ─────────────────────────────────────────────────────────────
export const PageHeader = ({ eyebrow, title, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
    <div>
      {eyebrow && <h2 style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#777', margin: '0 0 8px', fontWeight: 500 }}>{eyebrow}</h2>}
      <h1 style={{ fontSize: 32, fontWeight: 600, margin: 0, color: '#0d0d0d' }}>{title}</h1>
    </div>
    {children && <div style={{ display: 'flex', gap: 12 }}>{children}</div>}
  </div>
);

// ─── TABLE ───────────────────────────────────────────────────────────────────
export const Table = ({ headers, children, isEmpty, emptyMsg }) => (
  <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#fafafa', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: '16px', textAlign: 'left', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
    {isEmpty && <Empty message={emptyMsg} />}
  </div>
);

export const TR = ({ children, index }) => (
  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', background: 'transparent', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    {children}
  </tr>
);

export const TD = ({ children, style = {} }) => (
  <td style={{ padding: '16px', fontSize: 13, color: '#444', fontWeight: 400, ...style }}>{children}</td>
);
