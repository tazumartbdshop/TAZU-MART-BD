import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent Pull-to-Refresh and Elastic Over-Scrolling on Mobile devices
let touchStartClientY = 0;

window.addEventListener('touchstart', (event) => {
  if (event.touches.length === 1) {
    touchStartClientY = event.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchmove', (event) => {
  if (event.touches.length === 1) {
    const currentY = event.touches[0].clientY;
    const dy = currentY - touchStartClientY;
    
    // Get scroll position across different browser agents
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // If the page is scrolled to the absolute top and user is dragging downwards, cancel it
    if (scrollTop <= 0 && dy > 0) {
      if (event.cancelable) {
        event.preventDefault();
      }
    }
  }
}, { passive: false });

// Global Console Error Monitoring
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.message, event.filename, event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
