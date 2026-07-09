importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC-zp6C5EAahOzsLi3gumVPUuMBzE2RJAw",
  authDomain: "tiffinbite-36e1e.firebaseapp.com",
  projectId: "tiffinbite-36e1e",
  storageBucket: "tiffinbite-36e1e.firebasestorage.app",
  messagingSenderId: "79001192135",
  appId: "1:79001192135:web:80acf97497e50de83360e2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png'
  });
});
