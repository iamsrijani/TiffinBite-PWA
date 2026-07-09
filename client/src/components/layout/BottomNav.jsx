import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, CreditCard, ShoppingBag, User, Truck, MapPin, History } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export const BottomNav = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  // Render different tabs based on role
  const isDelivery = user.role === 'delivery';

  const customerTabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/menu', label: 'Menu', icon: Calendar },
    { to: '/subscriptions', label: 'My Plan', icon: CreditCard },
    { to: '/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const deliveryTabs = [
    { to: '/delivery', label: 'Dashboard', icon: Home },
    { to: '/delivery/route', label: 'My Routes', icon: MapPin },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const tabs = isDelivery ? deliveryTabs : customerTabs;

  return (
    <nav
      className="bottom-nav glass"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 90,
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(30px)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              flex: 1,
              height: '100%',
              fontSize: '10px',
              fontWeight: isActive ? 600 : 500,
              transition: 'color var(--transition-fast) ease',
            })}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
