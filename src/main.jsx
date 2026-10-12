import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { initSyncListeners } from './utils/syncManager.js'

// Initialize sync listeners for automatic background sync
initSyncListeners();

// Listen for messages from service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'BACKGROUND_SYNC') {
      // Service worker is asking us to process the queue
      import('./utils/syncManager.js').then((module) => {
        module.processQueue();
      });
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
