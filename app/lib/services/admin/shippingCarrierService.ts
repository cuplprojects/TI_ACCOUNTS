// Admin Shipping Carrier Service
// Provides utilities for managing and retrieving shipping carrier information

// Store with lowercase keys for easy matching
const CARRIERS_DATA = {
  aramex: {
    name: "Aramex International",
    days: "7-14",
  },
  dhl: {
    name: "DHL Express",
    days: "4-7",
  },
  shipglobaldirect: {
    name: "ShipGlobal Direct",
    days: "7-14",
  },
  shipglobalpremium: {
    name: "ShipGlobal Premium",
    days: "3-7",
  },
  shipglobalpremumdpd: {
    name: "ShipGlobal Premium DPD",
    days: "3-5",
  },
  fedex: {
    name: "FedEx",
    days: "2-5",
  },
  ups: {
    name: "UPS",
    days: "2-5",
  },
  usps: {
    name: "USPS",
    days: "5-7",
  },
  bluedart: {
    name: "Blue Dart",
    days: "2-3",
  },
};

export const SHIPPING_CARRIERS = Object.entries(CARRIERS_DATA).reduce(
  (acc, [key, value]) => {
    acc[key as keyof typeof CARRIERS_DATA] = {
      ...value,
      id: key,
    };
    return acc;
  },
  {} as Record<string, { name: string; days: string; id: string }>
);

export type ShippingCarrierId = keyof typeof CARRIERS_DATA;

export interface ShippingCarrier {
  name: string;
  days: string;
  id: string;
}

/**
 * Get full shipping carrier details by ID
 * @param id - The carrier ID (any case)
 * @returns Carrier details or null if not found
 */
export const getShippingCarrierById = (
  id: string | undefined
): ShippingCarrier | null => {
  if (!id) return null;
  const lowerCaseId = id.toLowerCase();
  const carrier = CARRIERS_DATA[lowerCaseId as ShippingCarrierId];
  return carrier ? { ...carrier, id: lowerCaseId } : null;
};

/**
 * Get carrier name by ID
 * @param id - The carrier ID (any case)
 * @returns Carrier name or empty string if not found
 */
export const getCarrierName = (id: string | undefined): string => {
  if (!id) return "";
  const carrier = getShippingCarrierById(id);
  return carrier?.name || "";
};

/**
 * Get all available carriers
 * @returns Array of all shipping carriers
 */
export const getAllCarriers = (): ShippingCarrier[] => {
  return Object.values(SHIPPING_CARRIERS);
};

/**
 * Get carrier names as a formatted list
 * @returns Newline-separated list of carrier names
 */
export const getCarrierNamesList = (): string => {
  return getAllCarriers()
    .map((carrier) => carrier.name)
    .join("\n");
};

/**
 * Format carrier ID for display (uppercase)
 * @param id - The carrier ID (any case)
 * @returns Formatted carrier name
 */
export const formatCarrierDisplay = (id: string | undefined): string => {
  const name = getCarrierName(id);
  return name.toUpperCase();
};
