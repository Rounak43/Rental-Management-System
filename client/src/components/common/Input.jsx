import React from 'react';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, required = false, ...props }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...props}
      />
    </div>
  );
};

export default Input;
