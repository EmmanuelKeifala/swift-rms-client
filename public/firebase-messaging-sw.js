// Firebase Cloud Messaging Service Worker
// This handles push notifications when the app is in the background

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase config - these are public keys, safe to include here
// They must match your .env values
const firebaseConfig = {
  // These will be populated when the app registers the service worker
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// Listen for config message from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    Object.assign(firebaseConfig, event.data.config);
    initializeFirebase();
  }
});

let isInitialized = false;

function initializeFirebase() {
  if (isInitialized || !firebaseConfig.apiKey) return;
  
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();
    
    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[SW] Background message received:', payload);
      
      const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || '',
        icon: '/next.svg',
        badge: '/next.svg',
        tag: payload.data?.referralId || 'notification-' + Date.now(),
        data: payload.data,
        requireInteraction: payload.data?.priority === 'HIGH' || payload.data?.priority === 'CRITICAL',
      };
      
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
    
    isInitialized = true;
    console.log('[SW] Firebase initialized successfully');
  } catch (error) {
    console.error('[SW] Firebase initialization failed:', error);
  }
}

// Try to initialize on load (in case config was already sent)
self.addEventListener('activate', () => {
  console.log('[SW] Service worker activated');
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  let url = '/';
  
  if (data.referralId) {
    url = `/referrals/${data.referralId}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (client.navigate) {
            client.navigate(url);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle push events directly (fallback)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);
  
  if (event.data) {
    try {
      const payload = event.data.json();
      const title = payload.notification?.title || payload.data?.title || 'Notification';
      const options = {
        body: payload.notification?.body || payload.data?.body || '',
        icon: '/next.svg',
        badge: '/next.svg',
        data: payload.data,
      };
      
      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (e) {
      console.error('[SW] Failed to parse push data:', e);
    }
  }
});
