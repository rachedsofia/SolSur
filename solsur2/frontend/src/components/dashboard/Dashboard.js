import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { dashboardService } from '../../services/api';
import { StatCard, Badge, Spinner, fmt, fmtDate, ICONS, Icon, PageHeader } from '../shared';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(() => toast.error('Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return null;

  const maxVal = Math.max(Number(stats.totalSales), Number(stats.totalPurchases));
  const salesPct = maxVal > 0 ? (Number(stats.totalSales) / maxVal) * 100 : 0;
  const purchasesPct = maxVal > 0 ? (Number(stats.totalPurchases) / maxVal) * 100 : 0;

  const chartData = stats.monthlySales || [];

  return (
    <div>
      <PageHeader eyebrow="Dashboard" title="Resumen del Mes" />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Ventas del Mes" value={fmt(stats.totalSales)} sub="IVA incluido" icon="trending" accent="#111" />
        <StatCard label="Ventas sin IVA" value={fmt(stats.totalSalesNoIva)} sub={`IVA: ${fmt(Number(stats.totalSales) - Number(stats.totalSalesNoIva))}`} icon="dollar" accent="#444" />
        <StatCard label="Pendiente de Cobro" value={fmt(stats.pendingAmount)} sub="sin facturar" icon="alert" accent="#c89b00" />
        <StatCard label="Unidades Vendidas" value={stats.totalUnitsSold || 0} sub="unidades este mes" icon="package" accent="#2d6a2d" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
        {/* Monthly Chart */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 6, padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#999', margin: '0 0 32px', fontWeight: 500 }}>Ventas Mensuales {new Date().getFullYear()}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#aaa', fontWeight: 300 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [fmt(v), 'Ventas']}
                contentStyle={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 6, fontSize: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.05)', fontWeight: 300 }}
                cursor={{ fill: '#fafafa' }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === new Date().getMonth() ? '#2c2c2c' : '#f0f0f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ventas vs Compras */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 6, padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#999', margin: '0 0 32px', fontWeight: 500 }}>Ventas vs. Compras</h3>
          {[
            { label: 'Ventas', value: stats.totalSales, pct: salesPct, color: '#2c2c2c' },
            { label: 'Compras', value: stats.totalPurchases, pct: purchasesPct, color: '#e0e0e0' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', fontWeight: 400 }}>{item.label}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{fmt(item.value)}</span>
              </div>
              <div style={{ background: '#fafafa', height: 4, borderRadius: 2 }}>
                <div style={{ width: `${item.pct}%`, background: item.color, height: '100%', borderRadius: 2, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 28, padding: '20px 0 0', borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#777', fontWeight: 400 }}>Margen bruto</span>
            <span style={{
              fontSize: 18, fontWeight: 600,
              color: Number(stats.grossMargin) >= 0 ? '#2d6a2d' : '#8a2020'
            }}>{fmt(stats.grossMargin)}</span>
          </div>

          {/* Payment methods */}
          {stats.paymentStats?.length > 0 && (
            <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <h4 style={{ fontSize: 9, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', margin: '0 0 10px' }}>Formas de Pago</h4>
              {stats.paymentStats.map(p => (
                <div key={p.method} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: '#666' }}>{p.method}</span>
                  <span style={{ fontWeight: 500 }}>{fmt(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 6, padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#999', margin: '0 0 24px', fontWeight: 500 }}>Últimas Ventas</h3>
          {(stats.recentSales || []).map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: '#111' }}>{s.client}</p>
                <p style={{ fontSize: 12, color: '#aaa', margin: '4px 0 0', fontWeight: 400 }}>{s.productName} · {fmtDate(s.date)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Badge text={s.invoiceStatus} type={s.invoiceStatus === 'Facturado' ? 'success' : 'warning'} />
                <span style={{ fontSize: 15, fontWeight: 500, color: '#222' }}>{fmt(s.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div>
          {stats.lowStockCount > 0 && (
            <div style={{ background: '#fefcf2', border: '1px solid rgba(122, 95, 0, 0.2)', borderRadius: 6, padding: '24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Icon path={ICONS.alert} size={18} />
                <span style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 400, color: '#7a5f00' }}>Stock Bajo</span>
              </div>
              <p style={{ fontSize: 13, color: '#7a5f00', margin: 0, fontWeight: 300 }}>
                <strong style={{ fontWeight: 500 }}>{stats.lowStockCount}</strong> producto{stats.lowStockCount !== 1 ? 's' : ''} con stock bajo
              </p>
            </div>
          )}
          {stats.outOfStockCount > 0 && (
            <div style={{ background: '#fdf2f2', border: '1px solid rgba(138, 32, 32, 0.2)', borderRadius: 6, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Icon path={ICONS.alert} size={18} />
                <span style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 400, color: '#8a2020' }}>Sin Stock</span>
              </div>
              <p style={{ fontSize: 13, color: '#8a2020', margin: 0, fontWeight: 300 }}>
                <strong style={{ fontWeight: 500 }}>{stats.outOfStockCount}</strong> producto{stats.outOfStockCount !== 1 ? 's' : ''} sin stock
              </p>
            </div>
          )}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 6, padding: '32px', marginTop: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <p style={{ fontSize: 11, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', margin: '0 0 16px', fontWeight: 500 }}>Catálogo</p>
            <p style={{ fontSize: 42, fontWeight: 500, margin: '0 0 8px', color: '#111' }}>{stats.totalProducts}</p>
            <p style={{ fontSize: 12, color: '#999', margin: 0, fontWeight: 400 }}>productos registrados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
