import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { Avatar } from '../ui/Avatar.jsx';
import { Bell, LogOut, User as UserIcon, Wallet, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Order Delivered', message: 'Tiffin delivered successfully at home address.', time: '10 mins ago', read: false },
    { id: 2, title: 'Kitchen Dispatch', message: 'Raju Rider is on the way with your lunch box.', time: '1 hour ago', read: false },
    { id: 3, title: 'Wallet Refunded', message: '₹120.00 refund credited for paused delivery.', time: 'Yesterday', read: true },
    { id: 4, title: 'Welcome to DailyBite', message: 'Set up your dietary preferences to personalize your tiffins.', time: '2 days ago', read: true },
  ]);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleWalletClick = () => {
    setDropdownOpen(false);
    navigate('/wallet');
  };

  return (
    <header
      className="navbar glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-glass)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Brand logo */}
      <Link
        to="/"
        className="navbar__logo"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
        }}
      >
        <span
          className="gradient-text"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xl)',
            fontWeight: 800,
            letterSpacing: '-0.5px',
          }}
        >
          🍱 DailyBite
        </span>
      </Link>

      {/* User Actions */}
      <div
        className="navbar__actions"
        style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
      >
        {user && user.role !== 'admin' && (
          <Link
            to="/wallet"
            className="navbar__wallet-shortcut"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-glass)',
              color: 'var(--accent-primary)',
              textDecoration: 'none',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
            }}
          >
            <Wallet size={16} />
            <span>Wallet</span>
          </Link>
        )}

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className="navbar__notifications"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: '50%',
                }}
              />
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 99,
                }}
                onClick={() => setNotificationsOpen(false)}
              />
              <div
                className="dropdown-menu glass"
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: '-60px',
                  width: '280px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glass)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 100,
                  animation: 'fadeIn 0.2s ease-out',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Notifications</span>
                  {notifications.some(n => !n.read) && (
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: notif.read ? 'transparent' : 'rgba(255,153,51,0.05)',
                          borderLeft: notif.read ? 'none' : '3px solid var(--accent-primary)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                          <span style={{ fontWeight: 600, fontSize: '11px', color: 'var(--text-primary)' }}>{notif.title}</span>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{notif.time}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                          {notif.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {user ? (
          <div className="navbar__profile-dropdown-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar src={user.avatar} name={user.name} size="sm" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99,
                  }}
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  className="dropdown-menu glass"
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '200px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    zIndex: 100,
                    animation: 'fadeIn 0.2s ease-out',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid var(--border-glass)',
                      marginBottom: '6px',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {user.name || 'DailyBite Member'}
                    </p>
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {user.phone}
                    </p>
                  </div>

                  {user.role !== 'admin' && (
                    <>
                      <button
                        onClick={handleProfileClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'none',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: 'var(--text-sm)',
                          textAlign: 'left',
                        }}
                      >
                        <UserIcon size={16} />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={handleWalletClick}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'none',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: 'var(--text-sm)',
                          textAlign: 'left',
                        }}
                      >
                        <Wallet size={16} />
                        <span>Wallet</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--error)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              color: 'var(--accent-primary)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
            }}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
