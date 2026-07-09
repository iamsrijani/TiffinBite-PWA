import useAppBadge from '../../hooks/useAppBadge.js';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { orderService, subscriptionService, walletService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { 
  Calendar, Wallet, Flame, ShieldAlert, CheckCircle, 
  Clock, ArrowRight, Play, Pause, Star, MessageSquare 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

export const Home = () => {
  useAppBadge(1);
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [todayOrder, setTodayOrder] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [upcomingMenu, setUpcomingMenu] = useState([]);

  // Socket connection for live order updates
  useEffect(() => {
    if (!user) return;

    const socket = io();
    socket.emit('joinRoom', { userId: user._id });

    socket.on('orderStatusUpdate', (data) => {
      if (todayOrder && todayOrder._id === data.orderId) {
        setTodayOrder((prev) => ({ ...prev, status: data.status }));
        addToast(`Order updated: ${data.status.replace(/_/g, ' ')}`, 'info');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, todayOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Today's Order
      try {
        const orderRes = await orderService.getTodays();
        if (orderRes.success && orderRes.data) {
          setTodayOrder(orderRes.data);
        }
      } catch (err) {
        console.warn('No order today or error fetching order');
      }

      // 2. Fetch Subscription details
      try {
        const subRes = await subscriptionService.getMy();
        if (subRes.success && subRes.data) {
          // Find first active subscription
          const active = subRes.data.find((s) => s.status === 'active');
          setActiveSub(active || null);
        }
      } catch (err) {
        console.warn('Error fetching subscription');
      }

      // 3. Fetch Wallet balance
      try {
        const walletRes = await walletService.get();
        if (walletRes.success) {
          setWalletBalance(walletRes.data.balanceInRupees ?? 0);
        }
      } catch (err) {
        console.warn('Error fetching wallet balance');
      }

      // 4. Fetch upcoming week menu
      try {
        // Fetch menus using general endpoint
        const dateStr = new Date().toISOString().split('T')[0];
        // Populate upcoming scroll with mock items or fetched list
        setUpcomingMenu([
          { day: 'Tomorrow', name: 'Paneer Butter Masala Combo', cal: 680, category: 'veg' },
          { day: 'Friday', name: 'Chicken Curry & Basmati Rice', cal: 720, category: 'nonveg' },
          { day: 'Saturday', name: 'Tofu Bhurji & Brown Rice', cal: 490, category: 'vegan' },
          { day: 'Sunday', name: 'Methi Thepla & Dum Aloo', cal: 520, category: 'veg' },
        ]);
      } catch (err) {
        console.warn('Error fetching upcoming menu');
      }

    } catch (err) {
      addToast('Failed to load dashboard statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getOrderStatusLabel = (status) => {
    switch (status) {
      case 'scheduled':
        return { label: 'Scheduled', color: 'info', icon: Clock };
      case 'preparing':
        return { label: 'Preparing in Kitchen', color: 'warning', icon: Flame };
      case 'out_for_delivery':
        return { label: 'Out for Delivery', color: 'warning', icon: Clock };
      case 'delivered':
        return { label: 'Delivered', color: 'success', icon: CheckCircle };
      case 'cancelled':
      default:
        return { label: 'Cancelled', color: 'error', icon: ShieldAlert };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <LoadingSkeleton type="text" count={2} />
        <br />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  return (
    <div className="home-dashboard fade-in" style={{ padding: '16px 16px 80px 16px' }}>
      {/* Welcome Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
            {getGreeting()}, {user?.name || 'DailyBite Member'}!
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Your nutrition is sorted for the day.
          </p>
        </div>
      </div>

      {/* Grid Layout for Main Dashboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Wallet & Quick Stats */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Card className="glass" style={{ flex: 1, minWidth: '240px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Wallet Balance</span>
                <h3 style={{ margin: '8px 0', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                  ₹{parseFloat(walletBalance).toFixed(2)}
                </h3>
              </div>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,153,51,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--accent-primary)'
              }}>
                <Wallet size={20} />
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              fullWidth 
              style={{ marginTop: '12px' }}
              onClick={() => navigate('/wallet')}
            >
              Add Money
            </Button>
          </Card>

          {/* Active Sub Indicator */}
          {activeSub ? (
            <Card className="glass" style={{ flex: 1, minWidth: '240px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <Badge variant="status-active">Active Plan</Badge>
                  <h4 style={{ margin: '6px 0 0 0', textTransform: 'capitalize', fontSize: 'var(--text-sm)' }}>
                    {activeSub.plan} Plan ({activeSub.mealType})
                  </h4>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Ends {new Date(activeSub.endDate).toLocaleDateString()}
                </div>
              </div>
              
              {/* Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Progress: {activeSub.mealsDelivered} / {activeSub.totalMeals} meals</span>
                <span>{activeSub.progress}%</span>
              </div>
              <div className="progress-bar" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden', height: '8px' }}>
                <div 
                  className="progress-bar__fill" 
                  style={{ 
                    width: `${activeSub.progress}%`, 
                    height: '100%', 
                    background: 'var(--accent-gradient)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/subscriptions')}
                  style={{ flex: 1, fontSize: 'var(--text-xs)' }}
                >
                  Manage Subscription
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="glass" style={{ 
              flex: 1, 
              minWidth: '240px', 
              padding: '20px', 
              border: '1px dashed var(--accent-primary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <Calendar size={32} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: 0 }}>No Active Subscription</h4>
              <p style={{ margin: '4px 0 12px 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Subscribe to get daily home-cooked meals delivered.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/subscriptions')}>
                View Subscription Plans
              </Button>
            </Card>
          )}
        </div>

        {/* TODAY'S MEAL CARD */}
        <div style={{ marginTop: '10px' }}>
          <h3 style={{ margin: '0 0 14px 0', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>
            Today's Tiffin Box
          </h3>
          
          {todayOrder ? (
            <Card className="card--highlight glass" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Badge variant={todayOrder.mealType === 'lunch' ? 'veg' : 'vegan'}>
                      {todayOrder.mealType?.toUpperCase() || 'MEAL'}
                    </Badge>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      Assigned to {todayOrder.deliveryAddress?.label || 'customer'}
                    </span>
                  </div>
                  
                  {todayOrder.menu ? (
                    <>
                      <h4 style={{ margin: '4px 0 8px 0', fontSize: 'var(--text-md)', fontWeight: 600 }}>
                        {todayOrder.menu.items?.[0]?.name || 'Delicious Tiffin Meal'}
                      </h4>
                      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: '500px' }}>
                        {todayOrder.menu.items?.[0]?.description || 'A healthy balance of home-cooked proteins and carbohydrates.'}
                      </p>
                    </>
                  ) : (
                    <h4 style={{ margin: '4px 0 8px 0', fontSize: 'var(--text-md)', fontWeight: 600 }}>
                      Healthy Balanced Meal
                    </h4>
                  )}
                </div>

                {/* Live Status indicator */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  {(() => {
                    const statusConfig = getOrderStatusLabel(todayOrder.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <>
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          color: `var(--${statusConfig.color})`, 
                          fontWeight: 600,
                          fontSize: 'var(--text-sm)'
                        }}>
                          <StatusIcon size={16} />
                          {statusConfig.label}
                        </span>
                        <Link to={`/orders`} style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                          Track Order →
                        </Link>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Card>
          ) : (
            <div className="glass" style={{ padding: '24px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <Clock size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                No meals scheduled for today.
              </p>
            </div>
          )}
        </div>

        {/* UPCOMING MEALS PREVIEW */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>
              Upcoming Week Preview
            </h3>
            <Link to="/menu" style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Full Menu</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="horizontal-scroll" style={{ 
            display: 'flex', 
            gap: '16px', 
            overflowX: 'auto', 
            paddingBottom: '8px',
            scrollbarWidth: 'none' 
          }}>
            {upcomingMenu.map((item, idx) => (
              <Card key={idx} className="glass" style={{ 
                minWidth: '220px', 
                width: '220px', 
                padding: '16px', 
                flexShrink: 0 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-secondary)' }}>{item.day}</span>
                  <Badge variant={item.category || 'glass'}>{item.category?.toUpperCase() || 'OTHER'}</Badge>
                </div>
                <h5 style={{ margin: '4px 0 8px 0', fontSize: 'var(--text-xs)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <Flame size={12} />
                  <span>{item.cal} Calories</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
