import { useState } from "react";
import "./FormInput.css";

export const FormInput = ({
  label,
  errMes,
  required,
  placeholder,
  value,
  pattern,
  type,
  nameRef,
  name,
  onChange,
  eyeOpen,
  eyeClose,
}) => {
  const [focus, setFocus] = useState(false);
  const handleFocus = () => {
    setFocus(true);
  };
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  return (
    <div className="allInput">
      <label>{label}</label>
      <input
        className={`each-input ${focus && "focused"}`}
        value={value}
        required={required}
        name={name}
        autoComplete="off"
        type={showPassword ? "text" : type}
        onChange={onChange}
        placeholder={placeholder}
        onBlur={handleFocus}
        onFocus={() => name === "confirmPassword" && setFocus(true)}
      />
      <span>{errMes}</span>

      <div className="icon" onClick={togglePasswordVisibility}>
        {showPassword ? eyeOpen : eyeClose}
      </div>
    </div>
  );
};
