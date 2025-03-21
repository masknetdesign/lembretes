
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.description,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: self.location.origin
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Boleto'
      }
    ],
    requireInteraction: true // Force the notification to remain until user interacts with it
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Send message to all clients that notification was clicked
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_CLICKED',
        tag: event.notification.tag
      });
    });
  });
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
