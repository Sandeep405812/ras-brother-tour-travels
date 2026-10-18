import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Automatically route API, uploads, and brand assets to Render backend when deployed
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.'));

const BACKEND_URL = 'https://ras-brother-tour-travels.onrender.com';

if (!isLocalhost && typeof window !== 'undefined') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads') || input.startsWith('/brand')) {
        return originalFetch(`${BACKEND_URL}${input}`, init);
      }
    } else if (input instanceof Request) {
      try {
        const parsed = new URL(input.url);
        if (parsed.pathname.startsWith('/api') && parsed.origin === window.location.origin) {
          const newRequest = new Request(`${BACKEND_URL}${parsed.pathname}${parsed.search}`, input);
          return originalFetch(newRequest);
        }
      } catch (e) {
        // Fallback
      }
    }
    return originalFetch(input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

