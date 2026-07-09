import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyC-zp6C5EAahOzsLi3gumVPUuMBzE2RJAw",
  authDomain: "tiffinbite-36e1e.firebaseapp.com",
  projectId: "tiffinbite-36e1e",
  storageBucket: "tiffinbite-36e1e.firebasestorage.app",
  messagingSenderId: "79001192135",
  appId: "1:79001192135:web:80acf97497e50de83360e2",
  measurementId: "G-C5W8MKJ13T"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BBNIzTLeSNFmxUfs_U7WSSB1zlhWnRDY6VFSlsJ_pV9tiLm2q3OkvV7eOMjRHWUAxRZlqKoRxwvA8L0pmNozEG0'
      });
      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default messaging;
