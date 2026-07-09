import React, { useEffect, useState } from 'react';
import InstallBanner from './components/InstallBanner.jsx';
import NetworkStatus from './components/NetworkStatus.jsx';
import { requestNotificationPermission } from './firebase';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';

// Auth Pages
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';

// Customer Pages
import Home from './features/customer/Home.jsx';
import Menu from './features/customer/Menu.jsx';
import Subscriptions from './features/customer/Subscriptions.jsx';
import Orders from './features/customer/Orders.jsx';
import Wallet from './features/customer/Wallet.jsx';
import Profile from './features/customer/Profile.jsx';

// Delivery Pages
import DeliveryDashboard from './features/delivery/DeliveryDashboard.jsx';
import DeliveryRoute from './features/delivery/DeliveryRoute.jsx';

// Admin Pages
import Dashboard from './features/admin/Dashboard.jsx';
import MenuManager from './features/admin/MenuManager.jsx';
import OrderForecast from './features/admin/OrderForecast.jsx';
import CustomerManager from './features/admin/CustomerManager.jsx';
import FeedbackView from './features/admin/FeedbackView.jsx';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      requestNotificationPermission();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  if (showSplash) return (
    <div style={{
      position:'fixed',inset:0,background:'#0a0a0f',
      display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',zIndex:9999
    }}>
      <div style={{fontSize:'64px',marginBottom:'16px'}}>🍱</div>
      <div style={{fontSize:'28px',fontWeight:'600',color:'#ff6b35'}}>DailyBite</div>
      <div style={{fontSize:'14px',color:'#888',marginTop:'8px'}}>Fresh Home-Style Meals</div>
      <div style={{marginTop:'32px',width:'40px',height:'4px',background:'#333',borderRadius:'2px',overflow:'hidden'}}>
        <div style={{width:'100%',height:'100%',background:'#ff6b35',animation:'load 2s linear'}}></div>
      </div>
    </div>
  );


  return (
    <>
    <InstallBanner />
    <NetworkStatus />
    <BrowserRouter>
      <Routes>
        
        {/* Main Secured Router Wrapper */}
        <Route element={<AppLayout />}>
          
          {/* Public Auth routes (secure redirects handled in layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer paths */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />

          {/* Delivery partner paths */}
          <Route path="/delivery" element={<DeliveryDashboard />} />
          <Route path="/delivery/route" element={<DeliveryRoute />} />

          {/* Admin workspace paths */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/menu" element={<MenuManager />} />
          <Route path="/admin/forecast" element={<OrderForecast />} />
          <Route path="/admin/customers" element={<CustomerManager />} />
          <Route path="/admin/feedback" element={<FeedbackView />} />

        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
// InstallBanner added at bottom - ignore this line
