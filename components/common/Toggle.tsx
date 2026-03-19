"use client";

import { useState } from "react";

interface ToggleProps {
  isEnabled: boolean;
  onToggle?: (enabled: boolean) => void;
  label?: string;
  description?: string;
}

const Toggle = ({
  isEnabled: initialEnabled = false,
  onToggle,
  label,
  description,
}: ToggleProps) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        {label && (
          <div className="text-sm font-medium text-default">{label}</div>
        )}
        {description && (
          <div className="text-xs text-muted mt-1">{description}</div>
        )}
      </div>
      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          isEnabled ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            isEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;
