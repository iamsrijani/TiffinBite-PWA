import React from 'react';

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  onClick,
  fullWidth = false,
  type = 'button',
  id,
  ...rest
}) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      id={id}
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="btn__spinner"></span>
      ) : (
        <>
          {Icon && <Icon className="btn__icon" size={size === 'sm' ? 14 : 18} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
