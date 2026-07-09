import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, TrendingUp, Users, MessageSquare, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/menu', label: 'Menu Manager', icon: CalendarDays },
    { to: '/admin/forecast', label: 'Order Forecast', icon: TrendingUp },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/feedback', label: 'Feedback View', icon: MessageSquare },
  ];

  return (
    <aside
      className="sidebar glass"
      style={{
        width: '260px',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border-glass)',
        backgroundColor: 'var(--bg-secondary)',
        zIndex: 95,
      }}
    >
      {/* Sidebar Header / Brand */}
      <div
        style={{
          height: '64px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-glass)',
        }}
      >
        <span
          className="gradient-text"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xl)',
            fontWeight: 800,
          }}
        >
          🍱 DailyBite Admin
        </span>
      </div>

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-glass)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 600 : 500,
                transition: 'all var(--transition-fast) ease',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {user.name || 'Kitchen Admin'}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--error)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
            }}
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
