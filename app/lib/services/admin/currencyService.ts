import axiosInstance from "../../axiosConfig";

export interface CurrencyRate {
  id: string;
  targetCurrency: string;
  closingRate: string;
  ourRate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AddCurrencyRateRequest {
  targetCurrency: string;
  closingRate: number;
  ourRate: number;
}

export interface AddCurrencyRatesRequest {
  rates: AddCurrencyRateRequest[];
}

export interface EditCurrencyRateRequest {
  targetCurrency: string;
  closingRate: number;
  ourRate: number;
}

export interface SyncGSheetResponse {
  success: boolean;
  message: string;
  data?: {
    date: string;
    ratesCount: number;
    rates: Array<{
      targetCurrency: string;
      ourRate: string;
      closingRate: string;
    }>;
  };
}

// Get all currency rates
export const getAllCurrencyRates = async (): Promise<CurrencyRate[]> => {
  try {
    const response = await axiosInstance.get("/admin/currency/get-currencies");
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch currency rates"
      );
    }
  } catch (error) {
    console.error("Error getting currency rates:", error);
    throw error;
  }
};

// Add multiple currency rates
export const addCurrencyRates = async (
  request: AddCurrencyRatesRequest
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post(
      "/admin/currency/add-currency",
      request
    );
    if (response.data.success) {
      return true;
    } else {
      throw new Error(response.data.message || "Failed to add currency rates");
    }
  } catch (error) {
    console.error("Error adding currency rates:", error);
    throw error;
  }
};

// Edit single currency rate
export const editCurrencyRate = async (
  request: EditCurrencyRateRequest
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post(
      "/admin/currency/edit-currency",
      request
    );
    if (response.data.success) {
      return true;
    } else {
      throw new Error(response.data.message || "Failed to edit currency rate");
    }
  } catch (error) {
    console.error("Error editing currency rate:", error);
    throw error;
  }
};

// Sync currency rates from Google Sheet
export const syncCurrencyFromGSheet = async (): Promise<SyncGSheetResponse> => {
  try {
    const response = await axiosInstance.post("/admin/currency/sync-from-gsheet");
    return response.data;
  } catch (error) {
    console.error("Error syncing currency from Google Sheet:", error);
    throw error;
  }
};

// Sync currency rates from Google Sheet
export const syncCurrencyFromGoogleSheet = async (): Promise<{
  date: string;
  ratesCount: number;
  rates: Array<{ targetCurrency: string; ourRate: string; closingRate: string }>;
}> => {
  try {
    const response = await axiosInstance.post("/admin/currency/sync-from-gsheet");
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to sync currency rates from Google Sheet"
      );
    }
  } catch (error) {
    console.error("Error syncing currency rates from Google Sheet:", error);
    throw error;
  }
};

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  {
    code: "USD",
    name: "United States Dollar",
    country: "United States Of America",
  },
  { code: "CAD", name: "Canadian Dollar", country: "Canada" },
  { code: "GBP", name: "British Pound", country: "United Kingdom" },
  { code: "EUR", name: "Euro", country: "European Union" },
  { code: "CHF", name: "Swiss Franc", country: "Switzerland" },
  { code: "AED", name: "UAE Dirham", country: "United Arab Emirates" },
  { code: "JPY", name: "Japanese Yen", country: "Japan" },
  { code: "AUD", name: "Australian Dollar", country: "Australia" },
  { code: "NZD", name: "New Zealand Dollar", country: "New Zealand" },
];
