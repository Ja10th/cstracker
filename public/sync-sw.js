/**
 * Custom Service Worker for Background Sync
 * This handles syncing data when the app comes back online
 */

// Listen for background sync events
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'cocoa-data-sync') {
    event.waitUntil(syncData());
  }
});

/**
 * Sync queued data to the server
 */
async function syncData() {
  try {
    // Get the sync queue from IndexedDB or communicate with the app
    // For now, we'll send a message to all clients to trigger sync
    const clients = await self.clients.matchAll();
    
    for (const client of clients) {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        action: 'PROCESS_QUEUE',
      });
    }
    
    console.log('Background sync completed');
    return Promise.resolve();
  } catch (error) {
    console.error('Background sync failed:', error);
    return Promise.reject(error);
  }
}

// Notify clients when they come online
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_NOW') {
    syncData();
  }
});
