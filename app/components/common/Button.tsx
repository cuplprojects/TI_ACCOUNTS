import React from "react";
import { cn } from "@/app/lib/utils";

type ButtonProps = {
  variant?: "primary" | "secondary";
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  onClick,
  className = "",
  children,
  type = "button",
  fullWidth = false,
  disabled = false,
  icon,
}) => {
  const baseStyles =
    "py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2";

  const variantStyles = {
    primary: "bg-primary text-white hover:bg-opacity-90",
    secondary: "border border-secondary text-default hover:bg-gray-bg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        fullWidth ? "w-full" : "",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
    >
      {icon && icon}
      {children}
    </button>
  );
};

export default Button;
