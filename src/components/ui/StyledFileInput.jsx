import React, { useRef } from "react";
import Icon from "@/components/ui/Icon";

const StyledFileInput = ({ label, file, filePath, onChange, onRemove, preferredSize = "" }) => {
  const fileInputRef = useRef();

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {label} {preferredSize && <span className="text-gray-400 dark:text-gray-500">({preferredSize})</span>}
      </label>

      <div className="flex border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded overflow-hidden focus-within:border-accent">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 border-none rounded-none"
        >
          Choose File
        </button>

        <div className="flex items-center px-3 py-2 space-x-2 relative bg-white dark:bg-gray-900">
          {!file && !filePath ? (
            <span className="text-gray-500 dark:text-gray-400 text-sm">No file chosen</span>
          ) : file ? (
            <>
              <span className="text-xs truncate max-w-[150px] text-gray-700 dark:text-gray-200">{file.name}</span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              >
                <Icon icon="mdi:close" width="16" />
              </button>
            </>
          ) : (
            <div className="relative">
              <img
                src={filePath}
                alt="Preview"
                className="w-12 h-12 object-cover rounded border border-gray-300 dark:border-gray-600"
              />
              <button type="button" onClick={handleRemove} className="absolute -top-3 -right-2">
                <Icon
                  icon="mdi:close"
                  width="16"
                  className="rounded-full p-0.5 shadow bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                />
              </button>
            </div>
          )}
        </div>

        <input type="file" accept="image/*" ref={fileInputRef} onChange={onChange} className="hidden" />
      </div>
    </div>
  );
};

export default StyledFileInput;
