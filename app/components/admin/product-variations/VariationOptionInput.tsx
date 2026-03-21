"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";

export interface VariationOption {
  id: string;
  name: string;
  values: string[];
}

interface VariationOptionInputProps {
  option: VariationOption;
  onChange: (updatedOption: VariationOption) => void;
  onDelete: () => void;
  isOnly: boolean; // Whether this is the only option (can't delete if true)
  disabled?: boolean;
}

const VariationOptionInput: React.FC<VariationOptionInputProps> = ({
  option,
  onChange,
  onDelete,
  isOnly,
  disabled = false,
}) => {
  const [newValue, setNewValue] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...option,
      name: e.target.value,
    });
  };

  const handleAddValue = () => {
    if (newValue.trim() === "") return;

    const updatedOption = {
      ...option,
      values: [...option.values, newValue.trim()],
    };

    onChange(updatedOption);
    setNewValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddValue();
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    const updatedOption = {
      ...option,
      values: option.values.filter((value) => value !== valueToRemove),
    };

    onChange(updatedOption);
  };

  return (
    <div
      className="mb-6 p-6 rounded-lg shadow-sm custom-border-1"
      style={{ backgroundColor: "white" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <label className="block text-black title-4-semibold mb-2">
            Option name
          </label>
          <div className="input-option flex items-center">
            <input
              type="text"
              value={option.name}
              onChange={handleNameChange}
              placeholder="Color, Size, Material, Style..."
              className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80 rounded-md"
              disabled={disabled}
            />
            {!isOnly && !disabled && (
              <button
                onClick={onDelete}
                type="button"
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-black title-4-semibold mb-2">
          Option values
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {option.values.map((value) => (
            <div
              key={value}
              className="flex items-center justify-center bg-blue-50 text-primary px-3 py-1 rounded-full"
            >
              <span className="mr-1 xsmall">{value}</span>
              {!disabled && (
                <button
                  onClick={() => handleRemoveValue(value)}
                  type="button"
                  className="text-primary hover:text-red-500"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {!disabled && (
          <div className="flex">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter an option value..."
              className="flex-1 p-2 small focus:outline-none custom-border-3 bg-blue-80 rounded-l-md"
            />
            <button
              onClick={handleAddValue}
              type="button"
              className="px-3 bg-primary text-white rounded-r-md"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        )}
        <p className="text-gray-500 xxsmall mt-1">
          Press Enter to add each option value
        </p>
      </div>
    </div>
  );
};

export default VariationOptionInput;
