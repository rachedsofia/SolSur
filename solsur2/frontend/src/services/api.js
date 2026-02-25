import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.message || 'Error de conexión con el servidor';
    return Promise.reject(new Error(msg));
  }
);

function download(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  a.remove(); window.URL.revokeObjectURL(url);
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productService = {
  getAll: (search = '') => API.get(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`).then(r => r.data),
  getById: (id) => API.get(`/products/${id}`).then(r => r.data),
  getLowStock: (t = 3) => API.get(`/products/low-stock?threshold=${t}`).then(r => r.data),
  create: (data) => API.post('/products', data).then(r => r.data),
  update: (id, data) => API.put(`/products/${id}`, data).then(r => r.data),
  delete: (id) => API.delete(`/products/${id}`).then(r => r.data),
};

// ─── SALES ────────────────────────────────────────────────────────────────────
export const saleService = {
  getAll: (start, end) => {
    const q = start && end ? `?start=${start}&end=${end}` : '';
    return API.get(`/sales${q}`).then(r => r.data);
  },
  getCurrentMonth: () => API.get('/sales/current-month').then(r => r.data),
  getById: (id) => API.get(`/sales/${id}`).then(r => r.data),
  create: (data) => API.post('/sales', data).then(r => r.data),
  updateStatus: (id, status) => API.patch(`/sales/${id}/status`, { status }).then(r => r.data),
  delete: (id) => API.delete(`/sales/${id}`).then(r => r.data),

  exportExcel: async (start, end) => {
    const r = await API.get(`/sales/export/excel?start=${start}&end=${end}`, { responseType: 'blob' });
    download(new Blob([r.data]), 'ventas_solsur.xlsx');
  },
  exportPdf: async (start, end) => {
    const r = await API.get(`/sales/export/pdf?start=${start}&end=${end}`, { responseType: 'blob' });
    download(new Blob([r.data], { type: 'application/pdf' }), 'ventas_solsur.pdf');
  },
};

// ─── INVOICES ─────────────────────────────────────────────────────────────────
export const invoiceService = {
  getAll: () => API.get('/invoices').then(r => r.data),
  getById: (id) => API.get(`/invoices/${id}`).then(r => r.data),
  create: (data) => API.post('/invoices', data).then(r => r.data),
  updateStatus: (id, status) => API.patch(`/invoices/${id}/status`, { status }).then(r => r.data),
  delete: (id) => API.delete(`/invoices/${id}`).then(r => r.data),

  exportExcel: async () => {
    const r = await API.get('/invoices/export/excel', { responseType: 'blob' });
    download(new Blob([r.data]), 'facturas_solsur.xlsx');
  },
  exportPdf: async () => {
    const r = await API.get('/invoices/export/pdf', { responseType: 'blob' });
    download(new Blob([r.data], { type: 'application/pdf' }), 'facturas_solsur.pdf');
  },
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () => API.get('/dashboard/stats').then(r => r.data),
};
