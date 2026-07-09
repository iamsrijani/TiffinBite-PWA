import React from 'react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  id,
}) => {
  return (
    <div
      id={id}
      className="empty-state glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
        borderRadius: 'var(--radius-lg)',
        marginTop: '20px',
      }}
    >
      {Icon && (
        <div
          className="empty-state__icon-container"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--accent-primary)',
          }}
        >
          <Icon size={32} />
        </div>
      )}
      <h3
        className="empty-state__title"
        style={{
          margin: '0 0 8px 0',
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-lg)',
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h3>
      <p
        className="empty-state__description"
        style={{
          margin: '0 0 24px 0',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          maxWidth: '320px',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
