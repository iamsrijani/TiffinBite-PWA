import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { User, Mail, Heart, MapPin, ChevronRight, Check } from 'lucide-react';

export const RegisterPage = () => {
  const { setUser } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dietType, setDietType] = useState('veg'); // veg, nonveg, vegan
  const [allergies, setAllergies] = useState('');
  const [spiceLevel, setSpiceLevel] = useState('medium'); // mild, medium, spicy
  
  const [addrLabel, setAddrLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const validateStep1 = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (email && !/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!line1.trim()) errs.line1 = 'Address line 1 is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!pincode.trim() || pincode.length !== 6) errs.pincode = 'Valid 6-digit pincode is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    
    // Parse allergies
    const parsedAllergies = allergies
      ? allergies.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    const payload = {
      name: name.trim(),
      email: email.trim(),
      dietaryPreferences: {
        type: dietType,
        allergies: parsedAllergies,
        spiceLevel,
        calorieTarget: dietType === 'vegan' ? 2200 : 2000,
      },
      address: {
        label: addrLabel,
        line1: line1.trim(),
        line2: line2.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        coordinates: { lat: 28.53, lng: 77.34 } // default coordinates
      }
    };

    try {
      const response = await authService.register(payload);
      if (response.success) {
        setUser(response.data);
        addToast('Registration complete! Welcome aboard.', 'success');
        
        // Redirect based on role (customer standard)
        navigate('/');
      }
    } catch (err) {
      addToast(err.message || 'Failed to complete registration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const dietOptions = [
    { value: 'veg', label: 'Vegetarian', desc: 'No meat or fish' },
    { value: 'nonveg', label: 'Non-Vegetarian', desc: 'Eggs, meat & fish included' },
    { value: 'vegan', label: 'Vegan', desc: 'Plant-based meals only' },
  ];

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
          maxWidth: '450px',
          padding: '40px 32px',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              style={{
                width: '32px',
                height: '6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: num <= step ? 'var(--accent-primary)' : 'var(--bg-glass)',
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, margin: '0 0 4px 0' }}>
          Complete Profile
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 28px 0' }}>
          {step === 1 && "Tell us a bit about yourself"}
          {step === 2 && "Configure your dietary preferences"}
          {step === 3 && "Where should we deliver your meals?"}
        </p>

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              id="reg-name"
              label="Full Name"
              placeholder="e.g., Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              error={errors.name}
              required
            />
            <Input
              id="reg-email"
              label="Email Address (Optional)"
              type="email"
              placeholder="e.g., aarav@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              error={errors.email}
            />

            <Button
              id="reg-next-1"
              variant="primary"
              fullWidth
              onClick={handleNext}
              icon={ChevronRight}
              style={{ marginTop: '16px' }}
            >
              Continue
            </Button>
          </div>
        )}

        {/* STEP 2: Dietary preferences */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Diet type selector */}
            <div>
              <span className="input__label" style={{ display: 'block', marginBottom: '8px' }}>Dietary Profile</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dietOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setDietType(opt.value)}
                    className="glass"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: dietType === opt.value
                        ? '2px solid var(--accent-primary)'
                        : '1px solid var(--border-glass)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      backgroundColor: dietType === opt.value ? 'rgba(255, 153, 51, 0.05)' : 'transparent',
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>{opt.label}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{opt.desc}</p>
                    </div>
                    {dietType === opt.value && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}>
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Spice levels */}
            <div>
              <span className="input__label" style={{ display: 'block', marginBottom: '8px' }}>Spice Preference</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['mild', 'medium', 'spicy'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSpiceLevel(level)}
                    className="glass"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: spiceLevel === level ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      color: spiceLevel === level ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <Input
              id="reg-allergies"
              label="Allergies (comma-separated, optional)"
              placeholder="e.g. peanuts, gluten, dairy"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              icon={Heart}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button variant="secondary" onClick={handleBack} style={{ flex: 1 }}>Back</Button>
              <Button variant="primary" onClick={handleNext} style={{ flex: 1 }} icon={ChevronRight}>Next</Button>
            </div>
          </div>
        )}

        {/* STEP 3: Default address */}
        {step === 3 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Address Type label picker */}
            <div>
              <span className="input__label" style={{ display: 'block', marginBottom: '8px' }}>Save Address As</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Home', 'Work', 'Other'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddrLabel(lbl)}
                    className="glass"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: addrLabel === lbl ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      color: addrLabel === lbl ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <Input
              id="reg-line1"
              label="Address Line 1"
              placeholder="Flat/House No, Building, Street"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              icon={MapPin}
              error={errors.line1}
              required
            />
            <Input
              id="reg-line2"
              label="Address Line 2 (Optional)"
              placeholder="Area, Landmark"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
            />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Input
                id="reg-city"
                label="City"
                placeholder="Noida"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                error={errors.city}
                required
                style={{ flex: 1 }}
              />
              <Input
                id="reg-pincode"
                label="Pincode"
                placeholder="6 digits"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                error={errors.pincode}
                maxLength={6}
                required
                style={{ flex: 1 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={handleBack} disabled={loading} style={{ flex: 1 }}>Back</Button>
              <Button type="submit" variant="primary" loading={loading} style={{ flex: 1 }}>Submit</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
