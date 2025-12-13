import React from "react";

const Switch = ({ isOn = false, onToggle = () => {}, label = "" }) => {
  return (
    <div className="flex items-center space-x-3">
      {label && <span className="text-gray-700 dark:text-gray-200 text-sm">{label}</span>}
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only" checked={isOn} onChange={(e) => onToggle(e.target.checked)} />
        <div
          className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out ${
            isOn ? "bg-accent" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white dark:bg-gray-100 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
              isOn ? "translate-x-4" : "translate-x-0"
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default Switch;
