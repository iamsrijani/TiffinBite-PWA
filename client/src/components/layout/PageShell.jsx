import React from 'react';

export const PageShell = ({ title, subtitle, action, children }) => {
  return (
    <div
      className="page-shell fade-in"
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 0 80px 0', // bottom padding for BottomNav clearance
      }}
    >
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          padding: '0 16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="page-header__action">{action}</div>}
      </div>

      {/* Page Content */}
      <div className="page-content" style={{ padding: '0 16px' }}>
        {children}
      </div>
    </div>
  );
};

export default PageShell;
