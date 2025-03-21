
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
    sound: '/notification-sound.mp3',
    data: {
      url: self.location.origin
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Boleto'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
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
