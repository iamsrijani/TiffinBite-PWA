import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import Navbar from './Navbar.jsx';
import BottomNav from './BottomNav.jsx';
import Sidebar from './Sidebar.jsx';
import ToastContainer from '../ui/Toast.jsx';
import LoadingSkeleton from '../ui/LoadingSkeleton.jsx';

export const AppLayout = () => {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { theme } = useUiStore();
  const location = useLocation();

  // Sync theme to root HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Run auth check on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          padding: '40px',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-xl)',
            color: 'var(--accent-primary)',
            fontWeight: 700,
            marginBottom: '20px',
            fontFamily: 'var(--font-heading)',
          }}
        >
          🍱 DailyBite
        </span>
        <LoadingSkeleton type="card" count={1} style={{ width: '100%', maxWidth: '400px' }} />
      </div>
    );
  }

  // If not authenticated and trying to access private routes, redirect to login
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some((route) => location.pathname.startsWith(route));

  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but profile is incomplete (no name), force them to register page
  if (isAuthenticated && !user?.name && location.pathname !== '/register') {
    return <Navigate to="/register" replace />;
  }

  // Redirect authenticated user to appropriate dashboard if at login / register
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    if (!user?.name) {
      if (location.pathname === '/login') {
        return <Navigate to="/register" replace />;
      }
    } else {
      if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (user?.role === 'delivery') {
        return <Navigate to="/delivery" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  // Prevent customer from visiting admin routes
  if (isAuthenticated && location.pathname.startsWith('/admin') && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Prevent customer/admin from visiting delivery routes (except admin who can view everything)
  if (
    isAuthenticated &&
    location.pathname.startsWith('/delivery') &&
    user?.role !== 'delivery' &&
    user?.role !== 'admin'
  ) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div
      className="app-container"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: isAdmin ? 'row' : 'column',
      }}
    >
      {/* Admin Layout */}
      {isAdmin ? (
        <>
          <Sidebar />
          <div
            className="admin-main"
            style={{
              flex: 1,
              marginLeft: '260px', // Matches sidebar width
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <Navbar />
            <main style={{ flex: 1, padding: '20px' }}>
              <Outlet />
            </main>
          </div>
        </>
      ) : (
        /* Customer & Delivery Layout */
        <>
          {!isPublicRoute && <Navbar />}
          <main style={{ flex: 1, position: 'relative' }}>
            <Outlet />
          </main>
          {!isPublicRoute && <BottomNav />}
        </>
      )}

      {/* Global Alerts Container */}
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
