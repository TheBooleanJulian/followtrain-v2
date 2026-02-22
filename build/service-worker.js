// FollowTrain Service Worker - PWA Implementation
// Development mode with extensive debugging

const CACHE_NAME = 'followtrain-v1.0';
const DEBUG_MODE = true;

// Debug logging function
const debugLog = (message, data = null) => {
  if (DEBUG_MODE) {
    console.log('[SW-DEBUG]', message, data);
  }
};

// URLs to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/followtrain-icon.png',
  // Add other critical assets
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  debugLog('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        debugLog('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        debugLog('All resources cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        debugLog('Cache installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  debugLog('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              debugLog('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        debugLog('Service Worker activated');
        return self.clients.claim(); // Take control of all clients
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  debugLog('Fetch request:', {
    url: url.pathname,
    method: request.method,
    destination: request.destination
  });
  
  // Handle different types of requests
  if (request.method === 'GET') {
    // API requests to Supabase
    if (url.hostname.includes('supabase')) {
      event.respondWith(handleAPICall(request));
    } 
    // Static assets
    else if (request.destination === 'document' || 
             request.destination === 'script' || 
             request.destination === 'style' ||
             request.destination === 'image') {
      event.respondWith(handleStaticAsset(request));
    }
    // Other requests
    else {
      event.respondWith(handleOtherRequest(request));
    }
  }
});

// Handle API calls with network-first strategy
const handleAPICall = async (request) => {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      debugLog('API call successful, updating cache', request.url);
      
      // Cache the successful response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      return networkResponse;
    }
  } catch (error) {
    debugLog('API call failed, attempting to serve from cache', error);
  }
  
  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    debugLog('Serving API response from cache', request.url);
    return cachedResponse;
  }
  
  // If no cache, return error response
  debugLog('No cached response available for API call', request.url);
  return new Response(
    JSON.stringify({ 
      error: 'Network error', 
      message: 'Unable to connect to server. Please check your connection.' 
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

// Handle static assets with cache-first strategy
const handleStaticAsset = async (request) => {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    debugLog('Serving static asset from cache', request.url);
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      debugLog('Fetched static asset from network, caching', request.url);
      
      // Cache the response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    debugLog('Failed to fetch static asset', { url: request.url, error });
    
    // Return fallback response for images
    if (request.destination === 'image') {
      return new Response('/followtrain-icon.png', {
        status: 200,
        headers: { 'Content-Type': 'image/png' }
      });
    }
    
    // Return generic error response
    return new Response('Resource unavailable offline', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// Handle other requests with network-first strategy
const handleOtherRequest = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      debugLog('Other request successful', request.url);
      return networkResponse;
    }
  } catch (error) {
    debugLog('Other request failed', { url: request.url, error });
  }
  
  // Return offline response
  return new Response(
    '<html><body><h1>Offline</h1><p>You are currently offline. Please check your connection.</p></body></html>',
    {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    }
  );
};

// Handle background sync for failed requests
self.addEventListener('sync', (event) => {
  debugLog('Background sync event:', event.tag);
  
  if (event.tag === 'sync-train-data') {
    event.waitUntil(syncTrainData());
  }
});

// Sync train data when connection is restored
const syncTrainData = async () => {
  debugLog('Attempting to sync train data...');
  
  try {
    // This would handle syncing any pending operations
    // For now, just log that we're online
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CONNECTION_RESTORED',
        message: 'You are now online'
      });
    });
    
    debugLog('Sync completed successfully');
  } catch (error) {
    debugLog('Sync failed', error);
  }
};

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  debugLog('Push notification received', event.data?.text());
  
  const title = 'FollowTrain';
  const options = {
    body: event.data?.text() || 'New activity in your train',
    icon: '/followtrain-icon.png',
    badge: '/followtrain-icon.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  debugLog('Notification clicked', event.notification);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Message handling from client
self.addEventListener('message', (event) => {
  debugLog('Message received from client:', event.data);
  
  if (event.data && event.data.type === 'GET_DEBUG_INFO') {
    event.ports[0].postMessage({
      type: 'DEBUG_INFO',
      cacheNames: [...caches.keys()],
      debugMode: DEBUG_MODE
    });
  }
});

debugLog('Service Worker loaded and ready');