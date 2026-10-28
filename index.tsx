
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global error handlers to catch mobile-specific crashes
window.addEventListener('error', (e) => {
  document.body.innerHTML += `<div style="background:red;color:white;padding:10px;z-index:9999;position:fixed;top:0;left:0;width:100%;font-family:sans-serif;font-size:12px;">
    <strong>JS Error:</strong> ${e.message}<br/>
    <small>${e.filename}:${e.lineno}</small>
  </div>`;
});

window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML += `<div style="background:orange;color:black;padding:10px;z-index:9999;position:fixed;bottom:0;left:0;width:100%;font-family:sans-serif;font-size:12px;">
    <strong>Promise Error:</strong> ${e.reason}
  </div>`;
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
