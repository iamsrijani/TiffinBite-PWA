import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  id,
  className = '',
  ...rest
}) => {
  const containerClass = `input-container ${className}`;
  const inputClass = [
    'input',
    error ? 'input--error' : '',
    Icon ? 'input--with-icon' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      {label && (
        <label htmlFor={id} className="input__label">
          {label}
        </label>
      )}
      <div className="input-wrapper" style={{ position: 'relative' }}>
        {Icon && (
          <Icon
            className="input__icon-left"
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }}
          />
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={inputClass}
          style={Icon ? { paddingLeft: '40px' } : undefined}
          {...rest}
        />
      </div>
      {error && <span className="input__error-msg">{error}</span>}
    </div>
  );
};

export default Input;
