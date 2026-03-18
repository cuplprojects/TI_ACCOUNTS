"use client";

import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import VariationOptionInput, { VariationOption } from "./VariationOptionInput";
import VariantMatrix, { Variant } from "./VariantMatrix";

// Generate a random ID for new options/variants
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

interface VariationManagerProps {
  initialPrice: number;
  initialSku: string;
  initialHasVariations?: boolean;
  initialVariationOptions?: VariationOption[];
  initialVariants?: Variant[];
  disabled?: boolean;
  onVariationsChange: (
    hasVariations: boolean,
    options: VariationOption[],
    variants: Variant[]
  ) => void;
}

const VariationManager: React.FC<VariationManagerProps> = ({
  initialPrice,
  initialSku,
  initialHasVariations = false,
  initialVariationOptions = [],
  initialVariants = [],
  disabled = false,
  onVariationsChange,
}) => {
  const [hasVariations, setHasVariations] = useState(initialHasVariations);
  const [variationOptions, setVariationOptions] = useState<VariationOption[]>(
    initialVariationOptions
  );
  const [variants, setVariants] = useState<Variant[]>(initialVariants);

  // Use a ref to prevent infinite loops in the update cycle
  const isInitialMount = useRef(true);
  const prevOptionsLength = useRef(0);
  const prevVariantsLength = useRef(0);
  const hasInitialized = useRef(false);
  const originalVariants = useRef<Variant[]>([]);
  const prevInitialDataRef = useRef<string>("");

  // Update state when initial props change (for loading existing products)
  // Only run this effect when we have meaningful initial data and haven't initialized yet
  useEffect(() => {
    // Create a stable key from initial data to detect actual changes
    const currentInitialData = JSON.stringify({
      initialHasVariations,
      initialVariationOptions,
      initialVariants,
    });

    // Skip if data hasn't actually changed
    if (prevInitialDataRef.current === currentInitialData) {
      return;
    }
    prevInitialDataRef.current = currentInitialData;

    if (
      initialHasVariations ||
      initialVariationOptions.length > 0 ||
      initialVariants.length > 0
    ) {
      setHasVariations(initialHasVariations);
      setVariationOptions(initialVariationOptions);

      // For existing variants, ensure they are marked as enabled and have proper data
      const processedVariants = initialVariants.map((variant) => ({
        ...variant,
        enabled: true, // Existing variants should be enabled
        region_of_origin: variant.region_of_origin || "India", // Ensure region_of_origin is set
      }));

      // Store original variants for later reference
      originalVariants.current = processedVariants;
      setVariants(processedVariants);
      hasInitialized.current = true;
    }
  }, []);

  // Add a new variation option
  const addVariationOption = () => {
    const newOption: VariationOption = {
      id: generateId(),
      name: "",
      values: [],
    };

    setVariationOptions([...variationOptions, newOption]);
  };

  // Remove a variation option by ID
  const removeVariationOption = (optionId: string) => {
    const updatedOptions = variationOptions.filter(
      (option) => option.id !== optionId
    );
    setVariationOptions(updatedOptions);
  };

  // Update a variation option
  const updateVariationOption = (updatedOption: VariationOption) => {
    const updatedOptions = variationOptions.map((option) =>
      option.id === updatedOption.id ? updatedOption : option
    );

    setVariationOptions(updatedOptions);
  };

  // Generate all possible combinations when options change
  // This should work for both new variants and when editing existing ones
  useEffect(() => {
    if (variationOptions.length === 0 || !hasVariations) {
      if (variants.length > 0) {
        setVariants([]);
      }
      return;
    }

    // Check if all options have values
    const allOptionsHaveValues = variationOptions.every(
      (option) => option.name.trim() !== "" && option.values.length > 0
    );

    if (!allOptionsHaveValues) {
      return;
    }

    // Generate all possible combinations
    // Start with first option's values
    let combinations: { [key: string]: string }[] =
      variationOptions[0].values.map((value) => ({
        [variationOptions[0].name]: value,
      }));

    // Add remaining options
    for (let i = 1; i < variationOptions.length; i++) {
      const option = variationOptions[i];
      const newCombinations: { [key: string]: string }[] = [];

      // For each existing combination, add each new option value
      combinations.forEach((combo) => {
        option.values.forEach((value) => {
          newCombinations.push({
            ...combo,
            [option.name]: value,
          });
        });
      });

      combinations = newCombinations;
    }

    // Helper function to check if two option_values objects match
    const optionValuesMatch = (
      combo1: { [key: string]: string },
      combo2: { [key: string]: string }
    ) => {
      return JSON.stringify(combo1) === JSON.stringify(combo2);
    };

    // Convert to variant objects, merging with existing variant data if available
    const generatedVariants: Variant[] = combinations.map((combo) => {
      // Try to find an existing variant that matches this combination
      const existingVariant = variants.find(
        (v) => v.option_values && optionValuesMatch(v.option_values, combo)
      );

      if (existingVariant) {
        // Use existing variant data but ensure it has the current combination and is enabled
        return {
          ...existingVariant,
          option_values: combo, // Ensure combo is up to date
          enabled: true, // Existing variants should always be enabled
        };
      } else {
        // Create new variant with default values
        const price = 0;
        const costPerItem = 0;
        const profit = price - costPerItem;
        const margin = price > 0 ? (profit / price) * 100 : 0;

        return {
          id: generateId(),
          option_values: combo,
          title: "",
          description: "",
          short_description: "",
          page_title: "",
          page_description: "",
          page_url: "",
          type: "",
          brand: "",
          status: "active" as "active" | "draft" | "inactive",
          physical_product: true,
          margin_contribution: 0,
          image_urls: [],
          images: [],
          price: price,
          compare_price: 0,
          cost_per_item: costPerItem,
          is_tracking_inventory: true,
          stock_qty: 0,
          sell_out_of_stock: false,
          sku: "",
          barcode: "",
          has_barcode: false,
          weight: 0,
          length: 0,
          breadth: 0,
          height: 0,
          region_of_origin: "India",
          hs_code: "",
          gst_percent: 18,
          profit: profit,
          margin: margin,
          enabled: true,
          seller_id: "",
          tags: [],
          collections: [],
        };
      }
    });

    // Only update state if the variants are different
    if (JSON.stringify(generatedVariants) !== JSON.stringify(variants)) {
      isInternalUpdateRef.current = true;
      setVariants(generatedVariants);
    }
  }, [variationOptions, hasVariations, initialPrice, initialSku]);

  // Handle changes to variants
  const handleVariantsChange = (updatedVariants: Variant[]) => {
    setVariants(updatedVariants);
  };

  // Use a ref to track if we're in an internal update cycle
  const isInternalUpdateRef = useRef(false);
  const onVariationsChangeRef = useRef(onVariationsChange);

  // Update the ref whenever the callback changes
  useEffect(() => {
    onVariationsChangeRef.current = onVariationsChange;
  }, [onVariationsChange]);

  // Notify parent component when variations change, but avoid unnecessary updates
  useEffect(() => {
    // Skip the effect on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevOptionsLength.current = variationOptions.length;
      prevVariantsLength.current = variants.length;
      return;
    }

    // Skip if this is an internal update from variant generation
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    // Always notify parent of changes to ensure state sync
    onVariationsChangeRef.current(hasVariations, variationOptions, variants);

    // Update the refs
    prevOptionsLength.current = variationOptions.length;
    prevVariantsLength.current = variants.length;
  }, [hasVariations, variationOptions, variants]);

  // Toggle variations on/off
  const toggleVariations = () => {
    const newValue = !hasVariations;
    setHasVariations(newValue);

    // If turning variations on and no options exist, add an initial one
    if (newValue && variationOptions.length === 0) {
      addVariationOption();
    }
    // If turning variations off, clear all variant data
    else if (!newValue) {
      setVariationOptions([]);
      setVariants([]);
      // Immediately notify parent component about the change
      onVariationsChange(false, [], []);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
      <h3 className="text-black title-4-semibold mb-4">Variants</h3>

      {/* Toggle for enabling variations */}
      <div className="flex items-center mb-6">
        <div className="flex items-center">
          <input
            id="has-variations"
            type="checkbox"
            checked={hasVariations}
            onChange={toggleVariations}
            disabled={disabled}
            className="w-4 h-4 text-primary bg-gray-100 rounded border-gray-300 focus:ring-primary"
          />
          <label htmlFor="has-variations" className="ml-2 small text-gray-700">
            This product has multiple options, like different sizes or colors
          </label>
        </div>
      </div>

      {/* Variation options section */}
      {hasVariations && (
        <div className="mb-6 space-y-4">
          <h4 className="title-5-semibold">Options</h4>

          {variationOptions.map((option) => (
            <VariationOptionInput
              key={option.id}
              option={option}
              onChange={updateVariationOption}
              onDelete={() => removeVariationOption(option.id)}
              isOnly={variationOptions.length === 1}
              disabled={disabled}
            />
          ))}

          {!disabled && (
            <button
              onClick={addVariationOption}
              className="flex items-center text-primary hover:text-primary-dark"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              <span className="small">Add another option</span>
            </button>
          )}
        </div>
      )}

      {/* Variants table */}
      {hasVariations && variants.length > 0 && (
        <div className="mt-6">
          <h4 className="title-5-semibold mb-4">Variants</h4>
          <VariantMatrix
            variants={variants}
            optionNames={variationOptions.map((opt) => opt.name)}
            onChange={handleVariantsChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default VariationManager;
