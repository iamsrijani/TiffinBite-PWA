import { useState, useEffect } from 'react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      padding: '10px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      background: isOnline ? '#22c55e' : '#ef4444',
      color: 'white',
      transition: 'all 0.3s ease',
    }}>
      {isOnline ? '✅ Back online!' : '❌ You are offline — check your connection'}
    </div>
  );
};

export default NetworkStatus;
