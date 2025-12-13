import React, { useState } from "react";
import Icon from "@/components/ui/Icon";

const TextInput = ({ label, type = "text", placeholder = "", error, className = "", ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label && <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">{label}</label>}

      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          className={`w-full bg-white dark:bg-gray-900 border rounded px-3 py-2 text-gray-800 dark:text-gray-200 
            placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:border-accent transition 
            ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"} ${className}`}
          {...rest}
        />

        {isPassword && (
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-700 dark:text-gray-300"
          >
            <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} width={20} />
          </span>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default TextInput;
