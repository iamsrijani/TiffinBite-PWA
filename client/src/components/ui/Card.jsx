import React from 'react';

export const Card = ({
  className = '',
  interactive = false,
  highlight = false,
  children,
  onClick,
  id,
  ...rest
}) => {
  const classes = [
    'card',
    interactive ? 'card--interactive' : '',
    highlight ? 'card--highlight' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id={id} className={classes} onClick={onClick} {...rest}>
      {children}
    </div>
  );
};

export default Card;
