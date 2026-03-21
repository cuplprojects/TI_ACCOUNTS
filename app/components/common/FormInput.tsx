import React from "react";

interface FormInputProps {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  infoIcon?: boolean;
  disabled?: boolean;
}

const FormInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  infoIcon = false,
  disabled = false,
}: FormInputProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <label className="text-sm text-muted">{label}</label>
        {infoIcon && (
          <div className="ml-2 text-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 border border-secondary rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
};

export default FormInput;
