import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  id,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        id={id}
        className={`modal modal--${size} glass`}
        style={{
          width: '100%',
          maxWidth: size === 'sm' ? '400px' : size === 'lg' ? '700px' : '500px',
          animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-glass)',
        }}>
          {title && <h3 className="modal__title" style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>{title}</h3>}
          <button
            onClick={onClose}
            className="modal__close"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal__body" style={{
          padding: '20px',
          overflowY: 'auto',
          maxHeight: '70vh',
        }}>
          {children}
        </div>

        {footer && (
          <div className="modal__footer" style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
