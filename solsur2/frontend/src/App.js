import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import StockSection from './components/stock/StockSection';
import LoadStock from './components/stock/LoadStock';
import SalesSection from './components/sales/SalesSection';
import BarcodeSection from './components/barcode/BarcodeSection';
import InvoiceSection from './components/invoice/InvoiceSection';

const SECTIONS = {
  dashboard:    Dashboard,
  stock:        StockSection,
  'cargar-stock': LoadStock,
  ventas:       SalesSection,
  codigos:      BarcodeSection,
  facturacion:  InvoiceSection,
};

export default function App() {
  const [section, setSection] = useState('dashboard');
  const ActiveSection = SECTIONS[section];

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        duration: 3500,
        style: {
          fontFamily: "'Jost', 'Optima', sans-serif",
          fontWeight: 300,
          fontSize: 13, borderRadius: 2, border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          background: '#fff',
          color: '#2c2c2c'
        },
        success: { iconTheme: { primary: '#2d6a2d', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#8a2020', secondary: '#fff' } },
      }} />
      <Layout section={section} setSection={setSection}>
        <ActiveSection />
      </Layout>
    </>
  );
}
