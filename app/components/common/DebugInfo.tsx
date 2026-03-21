"use client";

import { useState, useEffect } from "react";
import {
  getCurrentSeller,
  checkFirstLoginStatus,
  clearAllSellerData,
} from "@/app/lib/services/seller/authService";

interface DebugInfoState {
  seller: { name: string; id: string; email: string } | null;
  isFirstLogin: boolean;
  authToken: string;
  userRole: string | null;
  firstLoginFlag: string | null;
  authResponse: string;
  timestamp: string;
}

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfoState>({
    seller: null,
    isFirstLogin: false,
    authToken: "Not found",
    userRole: null,
    firstLoginFlag: null,
    authResponse: "Not found",
    timestamp: "",
  });

  const refreshDebugInfo = () => {
    const seller = getCurrentSeller();
    const isFirstLogin = checkFirstLoginStatus();
    const authToken = localStorage.getItem("auth_token");
    const userRole = localStorage.getItem("user_role");
    const firstLoginFlag = localStorage.getItem("seller_first_login");
    const authResponse = sessionStorage.getItem("auth_response");
    const userData = localStorage.getItem("ezmart_user");

    setDebugInfo({
      seller,
      isFirstLogin,
      authToken: authToken ? "Present" : "Not found",
      userRole,
      firstLoginFlag,
      authResponse: authResponse ? "Present" : "Not found",
      timestamp: new Date().toLocaleTimeString(),
    });

    // Log additional debug info to console
    console.log("Debug Info:", {
      seller,
      isFirstLogin,
      authToken: authToken ? "Present" : "Not found",
      userRole,
      firstLoginFlag,
      userData: userData ? "Present" : "Not found",
      authResponse: authResponse ? "Present" : "Not found",
    });
  };

  useEffect(() => {
    refreshDebugInfo();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>
          <strong>Seller:</strong>{" "}
          {debugInfo.seller ? debugInfo.seller.name : "None"}
        </div>
        <div>
          <strong>Is First Login:</strong>{" "}
          {debugInfo.isFirstLogin ? "Yes" : "No"}
        </div>
        <div>
          <strong>Auth Token:</strong> {debugInfo.authToken}
        </div>
        <div>
          <strong>User Role:</strong> {debugInfo.userRole || "None"}
        </div>
        <div>
          <strong>First Login Flag:</strong>{" "}
          {debugInfo.firstLoginFlag || "None"}
        </div>
        <div>
          <strong>Auth Response:</strong> {debugInfo.authResponse}
        </div>
        <div>
          <strong>Last Updated:</strong> {debugInfo.timestamp}
        </div>
      </div>
      <div className="mt-2 space-x-2">
        <button
          onClick={refreshDebugInfo}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Refresh
        </button>
        <button
          onClick={clearAllSellerData}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
