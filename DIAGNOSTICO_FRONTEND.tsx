// 🔍 DIAGNÓSTICO DE ERRORES - Añade esto al main.tsx temporalmente

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Log initial
console.log('✅ main.tsx loaded');
console.log('📦 App component:', App);

// Error handler
window.addEventListener('error', (event) => {
  console.error('❌ Error capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rechazada:', event.reason);
});

const rootElement = document.getElementById('root');
console.log('🌳 Root element:', rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('✅ React mounted successfully');
} else {
  console.error('❌ Root element not found!');
}
