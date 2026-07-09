# 🍱 TiffinBite — Daily Tiffin Subscription & Delivery PWA

> A full-stack Progressive Web Application for daily home-style meal subscription and delivery, built for Indian users.

## 📱 What is TiffinBite?

TiffinBite solves the daily problem of affordable, healthy home-cooked food for students and working professionals in Indian cities. Users subscribe to weekly or monthly tiffin plans and get meals delivered automatically — no re-ordering every day.

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library — builds reusable components |
| React Router v7 | Navigation between pages |
| Zustand 5 | State management — stores logged-in user |
| Axios | API calls to backend |
| Vite 6 | Build tool — fast development server |
| vite-plugin-pwa | Generates service worker and PWA features |
| Socket.io-client | Real-time order status updates |
| Firebase | Push notifications |
| Razorpay | Payment gateway |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for server |
| Express 5 | REST API framework |
| MongoDB | NoSQL database |
| Mongoose 9 | MongoDB schema and model management |
| Socket.io | Real-time bidirectional communication |
| node-cron | Scheduled tasks (auto order generation) |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| express-rate-limit | API abuse prevention |
| Multer | File upload handling |
| Razorpay SDK | Payment order creation and verification |

---

## 👥 User Roles

### 1. Customer
- Browse daily menu with nutritional info
- Subscribe to Trial / Weekly / Monthly plans
- Choose Lunch, Dinner, or Both
- Pay via in-app wallet (Razorpay)
- Pause deliveries before 8 PM cutoff
- Track orders in real-time
- Leave ratings and feedback

### 2. Delivery Partner
- View assigned orders for the day
- Get delivery route
- Mark orders as delivered
- Upload photo proof with GPS coordinates

### 3. Admin
- Create and publish daily menus
- View order forecasts
- Manage customers
- Read delivery feedback
- Monitor subscription health via dashboard

---

## 📲 PWA Features

### 1. Web Manifest
**File:** client/public/manifest.webmanifest
Makes the app installable on any device from the browser — no Play Store or App Store needed.

### 2. Service Worker
**File:** client/public/sw.js
Caches files and serves offline page when network fails.

### 3. Push Notifications
**Files:** client/src/firebase.js, client/public/firebase-messaging-sw.js
Sends delivery alerts even when app is closed using Firebase FCM.

### 4. Install Banner
**File:** client/src/components/InstallBanner.jsx
Custom install prompt using PWA's beforeinstallprompt event.

### 5. Offline Page
**File:** client/public/offline.html
Friendly page shown when user has no internet — cached by service worker.

### 6. App Badging
**File:** client/src/hooks/useAppBadge.js
Shows notification count on app icon — only works on installed PWAs.

### 7. Splash Screen
**File:** client/src/App.jsx
Branded loading screen for 2 seconds when app opens.

### 8. Network Status Banner
**File:** client/src/components/NetworkStatus.jsx
Red banner when offline, green when back online.

### 9. Pull to Refresh
**File:** client/src/hooks/usePullToRefresh.js
Pull down gesture to refresh data on mobile.

---

## Caching Strategies (Workbox)
**File:** client/vite.config.js

| Strategy | Used For | How it works |
|---|---|---|
| NetworkFirst | API calls (/api/*) | Tries network first, uses cache if offline |
| CacheFirst | Images (.png, .jpg) | Serves from cache instantly |
| StaleWhileRevalidate | JS/CSS files | Shows cache, updates in background |
| NetworkOnly | Socket.io real-time | Never caches, always live |
| CacheOnly | Offline page | Only serves from cache |

---

## Key Backend Features

### Auto Order Generation
Every night at 12 AM IST, automatically creates next day's orders for all active subscribers using node-cron.

### Real-time Updates
Customer screen updates instantly when delivery partner marks order delivered via Socket.io.

### Razorpay Payments
Real payment gateway for wallet top-up via UPI or card.

---

## How to Run

### Prerequisites
- Node.js v18+ — https://nodejs.org
- MongoDB — https://www.mongodb.com/try/download/community

### On Mac

1. Start MongoDB
```
mongod --dbpath ~/data/db
```

2. Open new terminal in project folder

3. Create .env file
```
cp .env.example server/.env
```

4. Install dependencies
```
npm install
```

5. Seed the database
```
npm run seed
```

6. Run the app
```
npm run dev
```

### On Windows

MongoDB installs as a Windows Service and starts automatically.
Open Command Prompt in project folder and run:

1. Copy .env.example and rename to .env inside server/ folder
2. Fill in the values from .env.example

3. Install dependencies
```
npm install
```

4. Seed the database
```
npm run seed
```

5. Run the app
```
npm run dev
```

Open http://localhost:5173 in your browser.

### Environment Variables
Copy .env.example to server/.env and fill in your values:

PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dailybite
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
OTP_EXPIRY=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
RAZORPAY_KEY_ID=your_razorpay_test_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

### Test Accounts
| Role | Phone |
|---|---|
| Admin | 9999999999 |
| Delivery Partner | 8888888888 |
| Customer | 7777777777 |

OTP appears in the terminal during development.

---

## Project Structure

```
TiffinBite/
├── client/
│   ├── public/
│   │   ├── manifest.webmanifest     <- PWA manifest
│   │   ├── sw.js                    <- Service worker
│   │   ├── offline.html             <- Offline page
│   │   └── firebase-messaging-sw.js <- FCM background handler
│   └── src/
│       ├── components/
│       │   ├── InstallBanner.jsx    <- PWA install prompt
│       │   └── NetworkStatus.jsx   <- Online/offline banner
│       ├── hooks/
│       │   ├── useAppBadge.js      <- App badging API
│       │   └── usePullToRefresh.js <- Pull to refresh
│       ├── features/
│       │   ├── customer/
│       │   ├── delivery/
│       │   └── admin/
│       ├── firebase.js             <- Firebase FCM setup
│       └── App.jsx                 <- Root with splash screen
└── server/
    ├── models/
    ├── routes/
    ├── controllers/
    ├── services/
    │   ├── scheduler.service.js    <- Cron jobs
    │   └── razorpay.service.js     <- Payments
    └── socket/
        └── index.js               <- Socket.io rooms
```
