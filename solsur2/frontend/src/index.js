import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global base styles
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Jost', 'Optima', 'Century Gothic', sans-serif;
    font-weight: 400;
    background: #fafafa;
    color: #0d0d0d;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  input, select, textarea, button { font-family: inherit; font-weight: 400; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #d0d0d0; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
