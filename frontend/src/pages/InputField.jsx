import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// eslint-disable-next-line react/prop-types
const InputField = ({
  label,
  icon: Icon,
  type,
  id,
  value,
  onChange,
  placeholder,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className=" absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
          {Icon && (
            <Icon size={18} className="text-gray-400" aria-hidden="true" />
          )}
        </div>
        <input
          type={showPassword ? "text" : type}
          id={id}
          required
          value={value}
          onChange={onChange}
          className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500  sm:text-sm"
          placeholder={placeholder}
        />

        {type === "password" && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff size={18} className="text-gray-400" />
            ) : (
              <Eye size={18} className="text-gray-400" />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default InputField;
