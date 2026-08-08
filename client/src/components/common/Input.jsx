import React from 'react';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, required = false, error, ...props }) => {
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
        className={error ? 'input-error' : ''}
        {...props}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
};

export default Input;
