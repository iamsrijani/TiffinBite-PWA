import React from 'react';

export const Avatar = ({ src, name = '', size = 'md', className = '', id, ...rest }) => {
  const classes = [`avatar`, `avatar--${size}`, className].filter(Boolean).join(' ');

  const getInitials = (userName) => {
    if (!userName) return '?';
    return userName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div id={id} className={classes} {...rest}>
      {src ? (
        <img src={src} alt={name || 'User Avatar'} className="avatar__img" />
      ) : (
        <div className="avatar__fallback">{getInitials(name)}</div>
      )}
    </div>
  );
};

export default Avatar;
