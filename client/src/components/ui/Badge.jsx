import React from 'react';

export const Badge = ({ variant = 'veg', children, className = '', id, ...rest }) => {
  const classes = [`badge`, `badge--${variant}`, className].filter(Boolean).join(' ');

  return (
    <span id={id} className={classes} {...rest}>
      {children}
    </span>
  );
};

export default Badge;
