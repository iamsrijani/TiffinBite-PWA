import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Phone, UtensilsCrossed } from 'lucide-react';

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
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
      }}
    >
      {/* Visual background decorations */}
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 153, 51, 0.15) 0%, rgba(255,255,255,0) 70%)',
          top: '-50px',
          left: '-50px',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230, 81, 0, 0.1) 0%, rgba(255,255,255,0) 70%)',
          bottom: '-100px',
          right: '-100px',
          filter: 'blur(50px)',
        }}
      />

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
