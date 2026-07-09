import React from 'react';

export const LoadingSkeleton = ({ type = 'text', count = 1, className = '', id }) => {
  const renderSkeleton = (index) => {
    const baseStyle = {
      display: 'inline-block',
      width: '100%',
      backgroundColor: 'var(--bg-glass)',
      borderRadius: 'var(--radius-sm)',
    };

    switch (type) {
      case 'circle':
        return (
          <div
            key={index}
            className="skeleton skeleton--circle"
            style={{
              ...baseStyle,
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
            }}
          />
        );
      case 'card':
        return (
          <div
            key={index}
            className="skeleton skeleton--card glass"
            style={{
              ...baseStyle,
              height: '200px',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
            }}
          >
            <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '12px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <div className="skeleton" style={{ width: '80%', height: '24px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <div className="skeleton" style={{ width: '100%', height: '80px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
          </div>
        );
      case 'text':
      default:
        return (
          <div
            key={index}
            className="skeleton skeleton--text"
            style={{
              ...baseStyle,
              height: '16px',
              margin: '6px 0',
            }}
          />
        );
    }
  };

  return (
    <div id={id} className={`skeleton-list ${className}`}>
      {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
    </div>
  );
};

export default LoadingSkeleton;
