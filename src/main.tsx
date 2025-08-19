import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import App from '@/app/App';

// Initialize internationalization
import '@/lib/i18n';

// Initialize title polyfill for browser compatibility
import { initializeTitlePolyfill } from '@/utils/titlePolyfill';

// Initialize title polyfill before React app starts
initializeTitlePolyfill({
  logWarnings: import.meta.env.DEV,
  useAutomaticFallback: true,
});

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error('Root element not found!');
}
