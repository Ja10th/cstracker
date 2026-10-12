/**
 * Sync Manager - Handles background sync and queue management
 */

const SYNC_QUEUE_KEY = 'cocoa_sync_queue';
const LAST_SYNC_KEY = 'cocoa_last_sync';

/**
 * Add an action to the sync queue
 */
export function queueSync(action) {
  try {
    const queue = getSyncQueue();
    queue.push({
      ...action,
      timestamp: Date.now(),
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    
    // Request background sync if available
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('cocoa-data-sync');
      }).catch((err) => {
        console.log('Background sync registration failed:', err);
      });
    } else {
      // Fallback: try to sync immediately if online
      if (navigator.onLine) {
        processQueue();
      }
    }
  } catch (error) {
    console.error('Failed to queue sync:', error);
  }
}

/**
 * Get the current sync queue
 */
export function getSyncQueue() {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear the sync queue
 */
export function clearSyncQueue() {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to clear sync queue:', error);
  }
}

/**
 * Process the sync queue (send to server)
 * For now, this is a placeholder - you'll implement actual API calls here
 */
export async function processQueue() {
  const queue = getSyncQueue();
  
  if (queue.length === 0) {
    return { success: true, synced: 0 };
  }

  try {
    // TODO: Replace this with your actual API endpoint
    // Example: await fetch('/api/sync', { method: 'POST', body: JSON.stringify(queue) });
    
    // For now, just log the queue (simulate sync)
    console.log('Processing sync queue:', queue);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear queue after successful sync
    clearSyncQueue();
    
    return { success: true, synced: queue.length };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSync() {
  try {
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Check if there are pending syncs
 */
export function hasPendingSync() {
  return getSyncQueue().length > 0;
}

/**
 * Initialize sync listeners
 */
export function initSyncListeners() {
  // Listen for online event
  window.addEventListener('online', () => {
    console.log('Connection restored, processing sync queue...');
    processQueue();
  });

  // Listen for visibility change (app comes to foreground)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && navigator.onLine && hasPendingSync()) {
      console.log('App visible and online, processing sync queue...');
      processQueue();
    }
  });
}
