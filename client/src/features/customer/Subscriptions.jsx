import React, { useEffect, useState } from 'react';
import { subscriptionService, walletService, authService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Calendar as CalendarIcon, Info, Pause, Play, Trash2, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';
import { format, addDays, isAfter, isBefore, startOfDay, parse } from 'date-fns';

export const Subscriptions = () => {
  const { user, checkAuth } = useAuthStore();
  const { addToast } = useUiStore();
  
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [wallet, setWallet] = useState(null);
  
  // Modal states
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [selectedSubToPause, setSelectedSubToPause] = useState(null);
  
  // Checkout states
  const [selectedPlan, setSelectedPlan] = useState(null); // trial, weekly, monthly
  const [mealType, setMealType] = useState('lunch'); // lunch, dinner, both
  const [dietType, setDietType] = useState('veg'); // veg, nonveg, vegan
  const [selectedAddress, setSelectedAddress] = useState('');
  const [startDate, setStartDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [purchasing, setPurchasing] = useState(false);

  // Pause sub states
  const [pauseDate, setPauseDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

  const plans = [
    { id: 'trial', name: 'Trial Plan', duration: '3 Meals', price: 33000, desc: 'Perfect to test our service & taste.' },
    { id: 'weekly', name: 'Weekly Plan', duration: '7 Meals', price: 77000, desc: 'Great for week-long office lunches.' },
    { id: 'monthly', name: 'Monthly Plan', duration: '30 Meals', price: 300000, desc: 'Maximum savings & fully managed health.' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const subRes = await subscriptionService.getMy();
      if (subRes.success) setSubscriptions(subRes.data);

      const walletRes = await walletService.get();
      if (walletRes.success) setWallet(walletRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to fetch details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    if (user?.addresses?.length > 0) {
      setSelectedAddress(user.addresses[0]._id);
    }
    setShowCheckout(true);
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      addToast('Please select a delivery address.', 'warning');
      return;
    }

    // Double check wallet balance
    const cost = selectedPlan.price;
if (wallet.balance < cost) {
  addToast('Insufficient wallet balance. Please add funds first.', 'error');
  return;
}
    setPurchasing(true);
    try {
      const payload = {
  plan: selectedPlan.id,
  mealType,
  dietType,
  addressId: selectedAddress,
  startDate: new Date(startDate),
};

      const response = await subscriptionService.create(payload);
      if (response.success) {
        addToast('Subscription purchased successfully!', 'success');
        setShowCheckout(false);
        fetchData();
        checkAuth(); // update user info (balance, subscriptions)
      }
    } catch (err) {
      addToast(err.message || 'Subscription failed.', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const checkCutoffForDate = (dateToCheck) => {
    // 8:00 PM cutoff rule
    const targetDate = startOfDay(new Date(dateToCheck));
    const tomorrow = startOfDay(addDays(new Date(), 1));
    
    // If target date is tomorrow, check if current time is past 8 PM (20:00) IST
    if (targetDate.getTime() === tomorrow.getTime()) {
      const now = new Date();
      if (now.getHours() >= 20) {
        return false; // Violates cutoff
      }
    }
    return true; // Safe
  };

  const handlePauseDate = async (e) => {
    e.preventDefault();
    const date = new Date(pauseDate);
    
    // 1. Validation check
    if (!checkCutoffForDate(date)) {
      addToast("Cannot pause tomorrow's meal after 8:00 PM cutoff.", 'error');
      return;
    }

    try {
      const response = await subscriptionService.pause(selectedSubToPause._id, [date]);
      if (response.success) {
        addToast(`Paused delivery for ${format(date, 'do MMMM')}`, 'success');
        setShowPauseModal(false);
        fetchData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to pause.', 'error');
    }
  };

  const handleResumeDate = async (subId, dateStr) => {
    const date = new Date(dateStr);
    
    // 1. Validation check
    if (!checkCutoffForDate(date)) {
      addToast("Cannot resume tomorrow's meal after 8:00 PM cutoff.", 'error');
      return;
    }

    try {
      const response = await subscriptionService.resume(subId, [date]);
      if (response.success) {
        addToast(`Resumed delivery for ${format(date, 'do MMMM')}`, 'success');
        fetchData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to resume.', 'error');
    }
  };

  const handleCancelSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to cancel? Prorated refund for remaining meals will be credited to your wallet.')) {
      return;
    }

    try {
      const response = await subscriptionService.cancel(id);
      if (response.success) {
        addToast('Subscription cancelled. Refund credited to wallet!', 'success');
        fetchData();
        checkAuth();
      }
    } catch (err) {
      addToast(err.message || 'Cancellation failed.', 'error');
    }
  };

  if (loading) {
    return (
      <PageShell title="My Subscriptions">
        <LoadingSkeleton type="card" count={2} />
      </PageShell>
    );
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  return (
    <PageShell
      title="My Subscriptions"
      subtitle="Manage your active meals, pause deliveries, or purchase new plans"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* SECTION 1: Active Plans */}
        <div>
          <h3 style={{ margin: '0 0 14px 0', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>
            Active Subscription Plans
          </h3>

          {activeSubscriptions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeSubscriptions.map((sub) => (
                <Card key={sub._id} className="glass" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Badge variant="veg" style={{ textTransform: 'capitalize' }}>{sub.plan} Plan</Badge>
                        <Badge variant="vegan">{sub.mealType.toUpperCase()}</Badge>
                      </div>
                      
                      <h4 style={{ margin: '4px 0', fontSize: 'var(--text-md)', fontWeight: 600 }}>
                        {sub.dietType.toUpperCase()} Daily Food Plan
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        Delivery: {sub.deliveryAddress.line1}, {sub.deliveryAddress.city}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Validity: {format(new Date(sub.startDate), 'MMM dd')} - {format(new Date(sub.endDate), 'MMM dd')}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-secondary)', fontWeight: 600 }}>
                        {sub.mealsRemaining} / {sub.totalMeals} meals remaining
                      </span>
                    </div>
                  </div>

                  {/* Paused dates strip */}
                  {sub.pausedDates?.length > 0 && (
                    <div style={{ marginTop: '16px', backgroundColor: 'rgba(245,158,11,0.05)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <Info size={14} /> Paused Delivery Dates (click to resume):
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {sub.pausedDates.map((dateStr) => (
                          <button
                            key={dateStr}
                            onClick={() => handleResumeDate(sub._id, dateStr)}
                            className="btn btn--xs btn--outline"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}
                          >
                            <Play size={10} fill="currentColor" />
                            {format(new Date(dateStr), 'MMM dd')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions bar */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Pause}
                      onClick={() => {
                        setSelectedSubToPause(sub);
                        setShowPauseModal(true);
                      }}
                    >
                      Pause Delivery
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      style={{ color: 'var(--error)' }}
                      onClick={() => handleCancelSubscription(sub._id)}
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="glass" style={{ padding: '24px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                You have no active subscription plan. Purchase a plan below to get started.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 2: Available Plans */}
        <div>
          <h3 style={{ margin: '0 0 14px 0', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>
            Choose a Meal Subscription Plan
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plans.map((plan) => (
              <Card key={plan.id} className="glass card--interactive" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 700 }}>{plan.name}</h4>
                      <Badge variant="glass">{plan.duration}</Badge>
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                      {plan.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      ₹{(plan.price / 100).toFixed(2)}
                    </span>
                    <Button variant="primary" size="sm" onClick={() => handleOpenCheckout(plan)}>
                      Subscribe
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* CHECKOUT MODAL */}
      <Modal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title="Meal Setup & Checkout"
      >
        {selectedPlan && (
          <form onSubmit={handleCreateSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Plan Info Summary */}
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Selected Plan:</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <strong style={{ fontSize: 'var(--text-sm)' }}>{selectedPlan.name} ({selectedPlan.duration})</strong>
                <strong style={{ color: 'var(--accent-primary)', fontSize: 'var(--text-md)' }}>₹{(selectedPlan.price / 100).toFixed(2)}</strong>
              </div>
            </div>

            {/* Meal Type selection */}
            <div>
              <span className="input__label" style={{ display: 'block', marginBottom: '6px' }}>Meal Schedule</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['lunch', 'dinner', 'both'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className="glass"
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      border: mealType === type ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      color: mealType === type ? 'var(--accent-primary)' : 'var(--text-secondary)',
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

            {/* Diet type */}
            <div>
              <span className="input__label" style={{ display: 'block', marginBottom: '6px' }}>Diet preference</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['veg', 'nonveg', 'vegan'].map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setDietType(diet)}
                    className="glass"
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      border: dietType === diet ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      color: dietType === diet ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            {/* Address picker */}
            <div>
              <span className="input__label" style={{ display: 'block', marginBottom: '6px' }}>Delivery Address</span>
              {user?.addresses?.length > 0 ? (
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="" disabled>Select address</option>
                  {user.addresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.label}: {addr.line1}, {addr.city} ({addr.pincode})
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--error)' }}>
                  No addresses found. Add one in Profile page first!
                </div>
              )}
            </div>

            {/* Start Date */}
            <Input
              id="sub-start-date"
              label="Subscription Start Date"
              type="date"
              value={startDate}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              onChange={(e) => setStartDate(e.target.value)}
            />

            {/* Cutoff Disclaimer */}
            <div style={{ display: 'flex', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
              <ShieldAlert size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                <strong>8:00 PM CUTOFF:</strong> You can pause or resume daily deliveries anytime. However, pauses for tomorrow's meal must be submitted before 8 PM tonight.
              </p>
            </div>

            {/* Balance check */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Wallet Balance: ₹{wallet?.balanceInRupees || '0.00'}
              </span>
              {wallet && wallet.balance < selectedPlan.price && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', fontWeight: 600 }}>
                  Insufficient Balance!
                </span>
              )}
            </div>

            <Button
              id="btn-confirm-checkout"
              type="submit"
              variant="primary"
              fullWidth
              loading={purchasing}
              disabled={!selectedAddress || (wallet && wallet.balance < selectedPlan.price)}
            >
              Pay via Wallet Balance
            </Button>
          </form>
        )}
      </Modal>

      {/* PAUSE MODAL */}
      <Modal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        title="Schedule Pause"
      >
        {selectedSubToPause && (
          <form onSubmit={handlePauseDate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Choose a date to pause meal delivery. Remainder meals will be credited/carried forward automatically.
            </p>

            <Input
              id="pause-date-input"
              label="Select Date"
              type="date"
              value={pauseDate}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              max={format(new Date(selectedSubToPause.endDate), 'yyyy-MM-dd')}
              onChange={(e) => setPauseDate(e.target.value)}
              required
            />

            <div style={{ display: 'flex', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
              <Info size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                If you select tomorrow ({format(addDays(new Date(), 1), 'do MMM')}), you must submit this pause before <strong>8:00 PM today</strong>.
              </span>
            </div>

            <Button
              id="btn-confirm-pause"
              type="submit"
              variant="primary"
              fullWidth
            >
              Confirm Pause
            </Button>
          </form>
        )}
      </Modal>
    </PageShell>
  );
};

export default Subscriptions;
