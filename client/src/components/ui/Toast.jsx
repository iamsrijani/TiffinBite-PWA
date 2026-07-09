import React from 'react';
import { useUiStore } from '../../store/uiStore.js';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const { id, message, type } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#22c55e" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'info':
      default:
        return <Info size={20} color="#3b82f6" />;
    }
  };

  return (
    <div
      className={`toast toast--${type} glass`}
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        minWidth: '280px',
        maxWidth: '350px',
        animation: 'slideUp 0.3s ease-out',
        borderLeft: `4px solid var(--${type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'})`,
      }}
    >
      <div className="toast__icon">{getIcon()}</div>
      <div className="toast__message" style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
        {message}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="toast__close"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastContainer;
