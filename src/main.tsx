import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  // Prevent cross-origin third-party script errors from crashing/blocking the application in iframe environment
  window.addEventListener('error', (event) => {
    const isScriptError = event.message === 'Script error.' || event.message?.includes('Script error');
    const isGoogleMapsError = event.filename?.includes('maps.googleapis.com') || event.filename?.includes('google') || !event.filename;
    if (isScriptError || isGoogleMapsError) {
      console.warn('Intercepted third-party script error safely:', event.message, 'from', event.filename);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Handle case where some browsers fire old-style window.onerror
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const messageStr = String(message);
    const sourceStr = String(source || '');
    if (
      messageStr === 'Script error.' ||
      messageStr.includes('Script error') ||
      sourceStr.includes('maps.googleapis.com') ||
      sourceStr.includes('google') ||
      !sourceStr
    ) {
      console.warn('Intercepted window.onerror third-party script error safely:', message, 'from', source);
      return true; // Suppress error propagation
    }
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '');
    if (reasonStr.includes('Google Maps') || reasonStr.includes('maps.googleapis.com')) {
      console.warn('Intercepted unhandled maps rejection safely:', event.reason);
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
