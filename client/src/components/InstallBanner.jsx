import { useState, useEffect } from 'react';

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '16px', right: '16px',
      background: '#1a1a2e', border: '1px solid #ff6b35',
      borderRadius: '16px', padding: '16px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      zIndex: 1000, boxShadow: '0 4px 20px rgba(255,107,53,0.3)'
    }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>
          🍱 Install DailyBite
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          Add to home screen for quick access
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setShowBanner(false)} style={{
          background: 'transparent', border: '1px solid #444',
          color: '#888', padding: '8px 12px', borderRadius: '8px',
          fontSize: '12px', cursor: 'pointer'
        }}>Later</button>
        <button onClick={handleInstall} style={{
          background: '#ff6b35', border: 'none',
          color: 'white', padding: '8px 16px', borderRadius: '8px',
          fontSize: '12px', cursor: 'pointer', fontWeight: '600'
        }}>Install</button>
      </div>
    </div>
  );
};

export default InstallBanner;
