import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { Button } from '../../components/ui/Button.jsx';
import { ArrowLeft } from 'lucide-react';

export const OTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUiStore();

  const phone = location.state?.phone || '';
  const mockOtp = location.state?.mockOtp || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  
  const inputRefs = useRef([]);

  // Countdown timer logic
  useEffect(() => {
    if (!phone) {
      navigate('/login');
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [phone, navigate]);

  // Handle digit change
  const handleChange = (index, value) => {
    setError('');
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanValue.slice(-1);
    setOtp(newOtp);

    // Focus next cell
    if (index < 5 && cleanValue) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Submit handler
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authService.verifyOTP(phone, otpCode);
      if (response.success) {
        login(response.token, response.user);
        addToast('Verification Successful!', 'success');

        if (response.isNewUser) {
          navigate('/register');
        } else {
          // Go to respective workspace dashboards
          if (response.user.role === 'admin') {
            navigate('/admin');
          } else if (response.user.role === 'delivery') {
            navigate('/delivery');
          } else {
            navigate('/');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
      addToast(err.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when OTP is fully entered
  useEffect(() => {
    if (otp.join('').length === 6) {
      handleVerify();
    }
  }, [otp]);

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      const response = await authService.sendOTP(phone);
      if (response.success) {
        setTimer(30);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
        addToast(`OTP Resent successfully. ${response.otp ? `(Mock: ${response.otp})` : ''}`, 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
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
        background: 'radial-gradient(circle at 10% 20%, rgba(255, 153, 51, 0.15) 0%, rgba(10, 10, 15, 1) 90%)',
        position: 'relative',
        padding: '20px',
      }}
    >
      <div
        className="auth-card glass fade-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px 32px',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--text-sm)',
            padding: 0,
            marginBottom: '28px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to login</span>
        </button>

        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            margin: '0 0 8px 0',
          }}
        >
          Verify Phone
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            margin: '0 0 32px 0',
            lineHeight: 1.5,
          }}
        >
          We've sent a 6-digit OTP code to <strong style={{ color: 'var(--text-primary)' }}>+91 {phone}</strong>.
        </p>

        <form onSubmit={handleVerify}>
          {/* OTP Input Grid */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-glass)',
                  backgroundColor: 'var(--bg-glass)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 600,
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                  e.target.style.boxShadow = '0 0 8px rgba(255, 153, 51, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-glass)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            ))}
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', margin: '0 0 16px 0' }}>
              {error}
            </p>
          )}

          {mockOtp && (
            <div
              className="glass"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                border: '1px dashed var(--accent-secondary)',
                fontSize: 'var(--text-xs)',
                color: 'var(--accent-secondary)',
                textAlign: 'center',
              }}
            >
              🛠️ Dev Mode: Use OTP <strong style={{ letterSpacing: '1px' }}>{mockOtp}</strong>
            </div>
          )}

          <Button
            id="btn-verify-otp"
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={otp.join('').length < 6}
          >
            Verify & Proceed
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          {timer > 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>
              Resend OTP in <strong style={{ color: 'var(--text-secondary)' }}>{timer}s</strong>
            </span>
          ) : (
            <button
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Resend OTP Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
