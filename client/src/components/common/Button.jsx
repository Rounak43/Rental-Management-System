import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
