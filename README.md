# IITA Cocoa Seed Tracker

An offline-ready Progressive Web App (PWA) for tracking cocoa nursery operations, production, inspection, and distribution.

## Features

- **Offline-First Architecture**: Full functionality without internet connection
- **Automatic Background Sync**: Data syncs automatically when connection is restored
- **Role-Based Access**: Administrator, Project Manager, Extension Officer, Inspector, and Nursery Operator roles
- **Real-time Sync Status**: Visual indicator showing sync status and pending changes
- **Cross-Platform**: Works on desktop, tablet, and mobile devices

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Offline & Sync Features

### How Offline Mode Works

1. **First Visit**: The app downloads and caches all resources (HTML, CSS, JS, images)
2. **Offline Usage**: All features work without internet connection, data is stored locally
3. **Data Changes**: Any adds, edits, or decisions are queued for sync
4. **Automatic Sync**: When connection returns, data syncs automatically in the background

### Background Sync Behavior

**Automatic sync triggers:**
- ✅ Device comes back online (even if app is closed)
- ✅ App is opened and online
- ✅ App comes to foreground (visibility change)

**Manual sync:**
- Click "Sync Now" button in the sync status indicator

### Sync Status Indicator

The bottom-right indicator shows:
- 🌐 **Online & Synced**: All changes uploaded
- ☁️ **Pending**: Number of changes waiting to sync
- 📡 **Offline Mode**: Device is offline
- 🔄 **Syncing**: Upload in progress

### Important Notes

1. **You DO NOT need to open the app** for background sync (on supported browsers)
2. **Data persists** across sessions even when offline
3. **Conflicts**: Last write wins (implement custom conflict resolution in `syncManager.js` if needed)
4. **Server Integration**: Update `processQueue()` in `src/utils/syncManager.js` with your API endpoint

## PWA Installation

### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or: Menu → Install Cocoa Tracker

### Mobile (iOS)
1. Safari → Share button
2. "Add to Home Screen"

### Mobile (Android)
1. Chrome → Menu → "Install app"
2. Or: Banner prompt appears automatically

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool
- **vite-plugin-pwa** - PWA integration
- **Workbox** - Service worker & caching
- **Background Sync API** - Automatic data sync
- **LocalStorage** - Offline data persistence

## Browser Support

### Full Background Sync (automatic sync when offline → online)
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Samsung Internet

### Fallback (sync when app opens)
- ✅ Safari (iOS/macOS)
- ✅ Firefox
- ✅ All other modern browsers

## Development

### File Structure

```
src/
├── components/        # Reusable UI components
│   ├── SyncStatus.jsx # Sync indicator
│   └── ...
├── context/          # React context (state management)
│   └── AppContext.jsx # Main app state + sync integration
├── pages/            # Page components
├── utils/
│   └── syncManager.js # Background sync logic
└── main.jsx          # App entry + sync initialization
```

### Customizing Sync

Edit `src/utils/syncManager.js`:

```javascript
export async function processQueue() {
  const queue = getSyncQueue();
  
  // Replace with your API endpoint
  const response = await fetch('https://your-api.com/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queue),
  });
  
  if (response.ok) {
    clearSyncQueue();
    return { success: true, synced: queue.length };
  }
  
  throw new Error('Sync failed');
}
```

## Testing Offline Mode

1. Open app in browser
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered
4. Go to Network tab → Check "Offline"
5. Refresh page - app should still work
6. Make changes (add/edit records)
7. Uncheck "Offline"
8. Watch sync status indicator - changes sync automatically

## License

MIT

---

Built with ❤️ for IITA Cocoa Operations
