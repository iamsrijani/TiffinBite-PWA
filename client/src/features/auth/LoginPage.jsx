import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Phone, UtensilsCrossed, Apple, Pizza, Salad, Soup, Cookie } from 'lucide-react';

export const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useUiStore();
  const loginUser = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(trimmedPhone);
      if (response.success) {
        const { token, user, isNewUser } = response;
        
        // Save token and user in Zustand store & localStorage
        loginUser(token, user);
        
        addToast(
          isNewUser ? 'Welcome! Please configure your profile.' : 'Logged in successfully!',
          'success'
        );

        if (isNewUser) {
          navigate('/register');
        } else {
          // Redirect based on role
          if (user.role === 'admin') {
            navigate('/admin');
          } else if (user.role === 'delivery') {
            navigate('/delivery');
          } else {
            navigate('/');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
      }}
    >
      {/* Visual background decorations */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 153, 51, 0.22) 0%, rgba(255,255,255,0) 70%)',
          top: '-100px',
          left: '-100px',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230, 81, 0, 0.15) 0%, rgba(255,255,255,0) 70%)',
          bottom: '-150px',
          right: '-150px',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, rgba(255,255,255,0) 70%)',
          top: '25%',
          left: '25%',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating UI Elements & Mock Cards */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
        {/* Floating Icons */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', color: 'var(--accent-primary)', opacity: 0.06, animation: 'float-slow-1 8s ease-in-out infinite' }}>
          <Soup size={40} />
        </div>
        <div style={{ position: 'absolute', top: '45%', right: '8%', color: 'var(--accent-primary)', opacity: 0.06, animation: 'float-slow-2 9s ease-in-out infinite' }}>
          <Pizza size={48} />
        </div>
        <div style={{ position: 'absolute', bottom: '10%', left: '6%', color: 'var(--accent-primary)', opacity: 0.06, animation: 'float-slow-3 10s ease-in-out infinite' }}>
          <Salad size={44} />
        </div>
        <div style={{ position: 'absolute', bottom: '8%', right: '5%', color: 'var(--accent-primary)', opacity: 0.06, animation: 'float-slow-1 7s ease-in-out infinite' }}>
          <Cookie size={36} />
        </div>

        {/* Floating Glassmorphic UI Card 1: Customer Rating */}
        <div 
          className="glass" 
          style={{ 
            position: 'absolute', 
            top: '15%', 
            right: '8%', 
            padding: '12px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            fontSize: 'var(--text-xs)', 
            boxShadow: 'var(--shadow-md)',
            animation: 'float-slow-1 12s ease-in-out infinite',
            opacity: 0.9,
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: '22px' }}>⭐</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>4.9/5.0 Stars</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Loved by 1,000+ Customers</div>
          </div>
        </div>

        {/* Floating Glassmorphic UI Card 2: Order Tracker Status */}
        <div 
          className="glass" 
          style={{ 
            position: 'absolute', 
            bottom: '22%', 
            left: '8%', 
            padding: '14px 18px', 
            display: 'flex', 
            flexDirection: 'column',
            gap: '6px', 
            fontSize: 'var(--text-xs)', 
            boxShadow: 'var(--shadow-md)',
            animation: 'float-slow-2 14s ease-in-out infinite',
            opacity: 0.9,
            zIndex: 2,
            width: '210px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <strong style={{ color: 'var(--text-primary)' }}>Out for Delivery</strong>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textAlign: 'left', lineHeight: 1.3 }}>
            Rider is bringing your hot home-style lunch box!
          </div>
        </div>

        {/* Floating Glassmorphic UI Card 3: Today's Choice Preview */}
        <div 
          className="glass" 
          style={{ 
            position: 'absolute', 
            top: '22%', 
            left: '10%', 
            padding: '12px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            fontSize: 'var(--text-xs)', 
            boxShadow: 'var(--shadow-md)',
            animation: 'float-slow-3 13s ease-in-out infinite',
            opacity: 0.9,
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: '24px' }}>🍱</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Today's Tiffin</div>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '10px' }}>Healthy Balanced Meal</div>
          </div>
        </div>

        {/* Floating Glassmorphic UI Card 4: Diet Preferences */}
        <div 
          className="glass" 
          style={{ 
            position: 'absolute', 
            bottom: '15%', 
            right: '10%', 
            padding: '12px 18px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            fontSize: 'var(--text-xs)', 
            boxShadow: 'var(--shadow-md)',
            animation: 'float-slow-1 11s ease-in-out infinite',
            opacity: 0.9,
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: '22px' }}>🌿</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Personalized Diet</div>
            <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '10px' }}>Veg, Non-Veg & Vegan</div>
          </div>
        </div>
      </div>

      <div
        className="auth-card glass fade-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px 32px',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* App Logo */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--accent-glow)',
          }}
        >
          <UtensilsCrossed size={32} color="#fff" />
        </div>

        <h2
          className="gradient-text"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 800,
            margin: '0 0 8px 0',
          }}
        >
          DailyBite
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            margin: '0 0 32px 0',
          }}
        >
          Fresh Home-Style Meals, Delivered Daily
        </p>

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <Input
            id="login-phone"
            label="Phone Number"
            type="tel"
            placeholder="Enter 10-digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            icon={Phone}
            error={error}
            maxLength={10}
            required
            autoFocus
          />

          <Button
            id="btn-login"
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            style={{ marginTop: '24px' }}
          >
            Login / Register
          </Button>
        </form>

        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            marginTop: '24px',
            lineHeight: 1.5,
          }}
        >
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
