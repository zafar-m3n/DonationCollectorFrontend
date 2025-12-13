import React, { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import IconComponent from "./Icon";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`w-14 h-8 flex items-center rounded-full px-1 transition-colors duration-300 ${
        isDark ? "bg-gray-700" : "bg-gray-200"
      }`}
      title="Toggle Dark Mode"
    >
      <div
        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <IconComponent icon="lucide:moon" width={18} className="text-gray-800" />
        ) : (
          <IconComponent icon="lucide:sun" width={18} className="text-yellow-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
