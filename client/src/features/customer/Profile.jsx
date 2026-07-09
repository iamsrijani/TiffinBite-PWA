import React, { useEffect, useState } from 'react';
import { authService } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { User, Mail, Settings, Plus, MapPin, Trash2, Heart, Check } from 'lucide-react';

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { addToast } = useUiStore();

  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Form Profile States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dietType, setDietType] = useState('veg');
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [allergies, setAllergies] = useState('');

  // Form Address States
  const [addrLabel, setAddrLabel] = useState('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setDietType(user.dietaryPreferences?.type || 'veg');
      setSpiceLevel(user.dietaryPreferences?.spiceLevel || 'medium');
      setAllergies(user.dietaryPreferences?.allergies?.join(', ') || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const parsedAllergies = allergies
      ? allergies.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    const payload = {
      name: name.trim(),
      email: email.trim(),
      dietaryPreferences: {
        type: dietType,
        spiceLevel,
        allergies: parsedAllergies,
        calorieTarget: user?.dietaryPreferences?.calorieTarget || 2000,
      },
    };

    try {
      const response = await authService.updateProfile(payload);
      if (response.success) {
        setUser(response.data);
        addToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Profile update failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!line1.trim() || !city.trim() || !pincode.trim()) {
      addToast('Please fill all required address fields.', 'warning');
      return;
    }

    if (pincode.trim().length !== 6) {
      addToast('Pincode must be 6 digits.', 'warning');
      return;
    }

    setSavingAddress(true);
    const newAddress = {
      label: addrLabel,
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      coordinates: { lat: 28.53, lng: 77.34 }
    };

    try {
      const updatedAddresses = [...(user.addresses || []), newAddress];
      const response = await authService.updateProfile({ addresses: updatedAddresses });
      if (response.success) {
        setUser(response.data);
        addToast('New address added successfully!', 'success');
        
        // Reset states
        setLine1('');
        setLine2('');
        setCity('');
        setPincode('');
        setShowAddressModal(false);
      }
    } catch (err) {
      addToast(err.message || 'Failed to save address.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Delete this address?')) return;

    try {
      const updatedAddresses = user.addresses.filter((addr) => addr._id !== addrId);
      const response = await authService.updateProfile({ addresses: updatedAddresses });
      if (response.success) {
        setUser(response.data);
        addToast('Address deleted.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete address.', 'error');
    }
  };

  return (
    <PageShell
      title="Profile Settings"
      subtitle="Customize your dietary preferences, spice choices, and addresses"
    >
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Profile Info & Diet preferences */}
        <div style={{ flex: 1.5, minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <Card className="glass" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <Avatar name={user?.name} size="lg" />
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 600 }}>{user?.name || 'DailyBite Member'}</h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>+91 {user?.phone}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                id="prof-name"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />
              
              <Input
                id="prof-email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              {/* Diet preferences */}
              <div>
                <span className="input__label" style={{ display: 'block', marginBottom: '8px' }}>Diet Type</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['veg', 'nonveg', 'vegan'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDietType(type)}
                      className="glass"
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: dietType === type ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                        color: dietType === type ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: 600,
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: 'var(--text-xs)',
                        textTransform: 'capitalize'
                      }}
                    >
                      {type}
                    </button>
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
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: spiceLevel === level ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                        color: spiceLevel === level ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: 600,
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: 'var(--text-xs)',
                        textTransform: 'capitalize'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                id="prof-allergies"
                label="Allergies (comma-separated)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                icon={Heart}
              />

              <Button
                id="btn-save-profile"
                type="submit"
                variant="primary"
                loading={loading}
                style={{ marginTop: '8px' }}
              >
                Save Profile Updates
              </Button>

            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN: Address management */}
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <Card className="glass" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>Delivery Addresses</h4>
              <Button
                variant="ghost"
                size="xs"
                icon={Plus}
                onClick={() => setShowAddressModal(true)}
              >
                Add New
              </Button>
            </div>

            {user?.addresses?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {user.addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="glass"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-glass)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        {addr.label}
                      </span>
                      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {addr.line1}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {addr.city} - {addr.pincode}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--error)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                No addresses saved. Add one to checkout subscriptions!
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* NEW ADDRESS MODAL */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add Delivery Address"
      >
        <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Label pickers */}
          <div>
            <span className="input__label" style={{ display: 'block', marginBottom: '8px' }}>Label</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Home', 'Work', 'Other'].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setAddrLabel(lbl)}
                  className="glass"
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: addrLabel === lbl ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    color: addrLabel === lbl ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <Input
            id="addr-line1"
            label="Address Line 1"
            placeholder="e.g. Flat 402, Lotus Building"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            icon={MapPin}
            required
          />
          <Input
            id="addr-line2"
            label="Address Line 2 (Optional)"
            placeholder="e.g. Sector 100, Landmark"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <Input
              id="addr-city"
              label="City"
              placeholder="Noida"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <Input
              id="addr-pincode"
              label="Pincode"
              placeholder="e.g. 201301"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              style={{ flex: 1 }}
            />
          </div>

          <Button
            id="btn-save-address"
            type="submit"
            variant="primary"
            fullWidth
            loading={savingAddress}
          >
            Save Address
          </Button>
        </form>
      </Modal>

    </PageShell>
  );
};

export default Profile;
