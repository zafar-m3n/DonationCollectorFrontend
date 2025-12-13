import React from "react";
import Icon from "@/components/ui/Icon";

const Badge = ({ text, color = "blue", size = "md", icon = null, rounded = "rounded" }) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900",
    red: "bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900",
    green: "bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-900",
  };

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} ${colorClasses[color]} ${rounded} font-medium capitalize`}
    >
      {icon && <Icon icon={icon} className="me-2 h-4 w-4" />}
      {text}
    </span>
  );
};

export default Badge;
